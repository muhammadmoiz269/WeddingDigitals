import Card, { ICard } from "@/lib/models/Card";
import { calculatePrice, calculateAddonEventPrice } from "@/lib/pricing";
import { AddOn } from "@/types";

const MAX_QUANTITY = 10000;

export type OrderPricingErrorCode =
  | "CARD_NOT_FOUND"
  | "INVALID_ADDON"
  | "INVALID_QUANTITY";

export class OrderPricingError extends Error {
  code: OrderPricingErrorCode;

  constructor(code: OrderPricingErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "OrderPricingError";
  }
}

export interface OrderPricingInput {
  card_slug: string;
  quantity: number;
  /** Names of selected add-ons — prices are always resolved from the Card document */
  add_on_names: string[];
  addon_events: { event_type: string; quantity: number }[];
}

export interface ServerPricing {
  card: ICard;
  resolvedAddOns: { name: string; price: number }[];
  innerCardPrice: number;
  /** Total before any discount */
  grossTotal: number;
  /** Quantity-tier discount amount (currently always 0 — see getQuantityDiscount) */
  quantityDiscount: number;
}

/**
 * Recomputes an order's pricing entirely from the database.
 * This is the single server-side price authority: client-supplied prices and
 * totals must never be trusted — resolve everything from the Card document
 * and the same pure formulas used by the checkout UI (src/lib/pricing.ts).
 */
export async function computeOrderPricing(input: OrderPricingInput): Promise<ServerPricing> {
  const quantity = Number(input.quantity);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
    throw new OrderPricingError(
      "INVALID_QUANTITY",
      `Quantity must be between 1 and ${MAX_QUANTITY.toLocaleString()}.`
    );
  }

  const card = await Card.findOne({ slug: input.card_slug }).lean<ICard>();
  if (!card) {
    throw new OrderPricingError("CARD_NOT_FOUND", "Card not found");
  }

  const cardAddOns = Array.isArray(card.add_ons) ? card.add_ons : [];
  const resolvedAddOns = (input.add_on_names || []).map((name) => {
    const match = cardAddOns.find((a) => a.name === name);
    if (!match) {
      throw new OrderPricingError("INVALID_ADDON", `Unknown add-on: ${name}`);
    }
    return { name: match.name, price: match.price };
  });

  const addOnsForCalc: AddOn[] = resolvedAddOns.map((a) => ({
    id: a.name.toLowerCase().replace(/\s+/g, "-"),
    name: a.name,
    price: a.price,
    description: "",
  }));

  const breakdown = calculatePrice(card.base_price, quantity, addOnsForCalc);

  const innerCardPrice = card.inner_card_price ?? 0;
  let addonEventsTotal = 0;
  for (const evt of input.addon_events || []) {
    const qty = Number(evt.quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QUANTITY) {
      throw new OrderPricingError(
        "INVALID_QUANTITY",
        `Additional card quantity must be between 1 and ${MAX_QUANTITY.toLocaleString()}.`
      );
    }
    addonEventsTotal += calculateAddonEventPrice(innerCardPrice, qty);
  }

  return {
    card,
    resolvedAddOns,
    innerCardPrice,
    grossTotal: breakdown.subtotal + breakdown.addOnsTotal + addonEventsTotal,
    quantityDiscount: breakdown.discount,
  };
}
