import { AddOn, PriceBreakdown, QuantityTier } from "@/types";
import { WHATSAPP_NUMBER } from "./constants";

/**
 * Quantity tier discounts:
 * - 100 pcs: 0% discount
 * - 250 pcs: 0% discount
 * - 500+ pcs: 10% discount
 */
export function getQuantityDiscount(quantity: number): number {
  if (quantity >= 500) return 10;
  return 0;
}

/**
 * Calculate the full price breakdown for a card order.
 *
 * Formula: (Base Price × Quantity) + (Add-on Prices × Quantity) - Discount
 */
export function calculatePrice(
  basePrice: number,
  quantity: QuantityTier | number,
  selectedAddOns: AddOn[] = []
): PriceBreakdown {
  const discountPercent = getQuantityDiscount(quantity);

  // Base subtotal
  const subtotal = basePrice * quantity;

  // Add-ons total (per card, multiplied by quantity)
  const addOnsPerCard = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
  const addOnsTotal = addOnsPerCard * quantity;

  // Discount applies to entire order (base + add-ons)
  const grossTotal = subtotal + addOnsTotal;
  const discount = Math.round((grossTotal * discountPercent) / 100);
  const total = grossTotal - discount;

  return {
    basePrice,
    quantity,
    subtotal,
    discount,
    discountPercent,
    addOnsTotal,
    selectedAddOns,
    total,
  };
}

/**
 * Format a PKR price with commas
 */
export function formatPKR(amount: number): string {
  return `PKR ${amount.toLocaleString("en-PK")}`;
}

/**
 * Build a WhatsApp order message
 */
export function buildWhatsAppMessage(
  cardName: string,
  quantity: number,
  total: number,
  selectedAddOns: AddOn[] = [],
  source?: string
): string {
  let message = `Hi Shahi Bulawa! I'd like to place an order:\n\n`;
  message += `📋 *Card:* ${cardName}\n`;
  message += `📦 *Quantity:* ${quantity} pcs\n`;

  if (selectedAddOns.length > 0) {
    message += `✨ *Add-ons:* ${selectedAddOns.map((a) => a.name).join(", ")}\n`;
  }

  message += `💰 *Total:* ${formatPKR(total)}\n\n`;
  message += `Please confirm availability and delivery timeline. Thank you!`;

  if (source) {
    message += `\n\n— via shahibulawa.com (${source})`;
  }

  return message;
}

export function getWhatsAppLink(
  cardName: string,
  quantity: number,
  total: number,
  selectedAddOns: AddOn[] = [],
  phoneNumber: string = WHATSAPP_NUMBER,
  source?: string
): string {
  const message = buildWhatsAppMessage(cardName, quantity, total, selectedAddOns, source);
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}
