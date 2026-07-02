import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import { computeOrderPricing, OrderPricingError } from "@/lib/server/orderPricing";
import {
  normalizePromoCode,
  computePromoDiscount,
  checkPromo,
  redeemPromo,
  releasePromoRedemption,
  PROMO_ERROR_MESSAGES,
} from "@/lib/server/promo";

function generateOrderId(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `PGM-${num}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    const required = [
      "card_slug", "card_name", "quantity", "base_price", "total",
    ];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // content is no longer required — collected via WhatsApp after order
    if (!body.customization?.main_event) {
      return NextResponse.json(
        { success: false, error: "Customization details are required (main_event)" },
        { status: 400 }
      );
    }

    if (!body.customer?.name || !body.customer?.whatsapp || !body.customer?.area) {
      return NextResponse.json(
        { success: false, error: "Customer details are required (name, whatsapp, area)" },
        { status: 400 }
      );
    }

    if (body.payment?.method !== "full" && body.payment?.method !== "deposit") {
      return NextResponse.json(
        { success: false, error: "Payment method is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Recompute all pricing from the database — client-supplied prices and
    // totals are never trusted (they can be tampered with via direct API calls).
    const addonEvents: { event_type: string; quantity: number }[] = Array.isArray(
      body.customization?.addon_events
    )
      ? body.customization.addon_events.map((e: { event_type: string; quantity: number }) => ({
          event_type: String(e.event_type),
          quantity: Number(e.quantity),
        }))
      : [];

    let pricing;
    try {
      pricing = await computeOrderPricing({
        card_slug: String(body.card_slug),
        quantity: Number(body.quantity),
        add_on_names: Array.isArray(body.add_ons)
          ? body.add_ons.map((a: { name: string }) => String(a.name))
          : [],
        addon_events: addonEvents,
      });
    } catch (err) {
      if (err instanceof OrderPricingError) {
        return NextResponse.json({ success: false, error: err.message }, { status: 400 });
      }
      throw err;
    }

    const { card, resolvedAddOns, innerCardPrice, grossTotal, quantityDiscount } = pricing;

    // Promo redemption: all eligibility checks + usage increment happen in a
    // single atomic update, so a capped code can never be oversubscribed by
    // concurrent orders. On any later failure we release the redemption.
    let promoCode: string | null = null;
    let promoDiscount = 0;
    if (body.promo_code) {
      promoCode = normalizePromoCode(body.promo_code);
      if (!promoCode) {
        return NextResponse.json(
          { success: false, error_code: "PROMO_INVALID", error: PROMO_ERROR_MESSAGES.PROMO_INVALID },
          { status: 409 }
        );
      }

      const promo = await redeemPromo(promoCode, grossTotal);
      if (!promo) {
        // Categorize the failure for the client (read-only, no increment)
        const check = await checkPromo(promoCode, grossTotal);
        const failure = check.ok
          ? { reason: "PROMO_INVALID" as const, error: PROMO_ERROR_MESSAGES.PROMO_INVALID }
          : check;
        return NextResponse.json(
          { success: false, error_code: failure.reason, error: failure.error },
          { status: 409 }
        );
      }
      promoDiscount = computePromoDiscount(promo, grossTotal);
    }

    // Best one wins: promo vs quantity discount, never both.
    let discount: { source: "promo" | "quantity"; code?: string; amount: number } | null = null;
    if (promoCode && promoDiscount > 0 && promoDiscount >= quantityDiscount) {
      discount = { source: "promo", code: promoCode, amount: promoDiscount };
    } else {
      if (promoCode) {
        // Quantity discount won (or promo discount was 0) — hand the use back.
        await releasePromoRedemption(promoCode);
        promoCode = null;
      }
      if (quantityDiscount > 0) {
        discount = { source: "quantity", amount: quantityDiscount };
      }
    }

    const finalTotal = grossTotal - (discount?.amount ?? 0);
    const amountDue =
      body.payment.method === "deposit" ? Math.ceil(finalTotal / 2) : finalTotal;

    // Consistency check: the customer must have seen the exact total we are
    // about to store. A mismatch means stale prices (or tampering) — reject
    // rather than silently charging a different amount.
    if (Number(body.total) !== finalTotal) {
      if (promoCode) await releasePromoRedemption(promoCode);
      return NextResponse.json(
        {
          success: false,
          error_code: "TOTAL_MISMATCH",
          error: "Prices have changed. Please refresh the page and try again.",
        },
        { status: 400 }
      );
    }

    try {
      // Generate unique order ID (retry if collision)
      let orderId = generateOrderId();
      let retries = 5;
      while (retries > 0) {
        const existing = await Order.findOne({ order_id: orderId }).lean();
        if (!existing) break;
        orderId = generateOrderId();
        retries--;
      }

      const order = await Order.create({
        order_id: orderId,
        card_slug: card.slug,
        card_name: card.name,
        quantity: Number(body.quantity),
        base_price: card.base_price,
        add_ons: resolvedAddOns,
        subtotal_before_discount: grossTotal,
        ...(discount ? { discount } : {}),
        total: finalTotal,
        customization: {
          main_event: body.customization.main_event,
          addon_events: addonEvents.map((e) => ({
            ...e,
            price_per_card: innerCardPrice,
          })),
        },
        customer: {
          name: body.customer.name,
          whatsapp: body.customer.whatsapp,
          area: body.customer.area,
          address: body.customer.address || '',
        },
        payment: {
          method: body.payment.method,
          amount_due: amountDue,
          receipt_url: body.payment.receipt_url || "",
          status: body.payment.receipt_url ? "confirmed" : "pending_payment",
        },
      });

      return NextResponse.json(
        { success: true, data: { order_id: order.order_id } },
        { status: 201 }
      );
    } catch (err) {
      // Order creation failed after the promo was redeemed — hand the use
      // back. Worst case (this release also fails) the cap is under-used,
      // never over-used.
      if (promoCode) await releasePromoRedemption(promoCode);
      throw err;
    }
  } catch (error: unknown) {
    console.error("Error creating order:", error);
    const message = error instanceof Error ? error.message : "Failed to create order";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// GET /api/orders — list all orders (for admin)
export async function GET() {
  try {
    await connectToDatabase();
    const orders = await Order.find({}).sort({ created_at: -1 }).lean();
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 });
  }
}
