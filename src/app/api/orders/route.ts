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
import { start } from "workflow/api";
import { sendOrderNotification } from "@/workflows/order-notification";

function generateOrderId(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `PGM-${num}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // ── Admin custom-order path ─────────────────────────────────────────────
    // Bypasses catalog pricing, promo logic, and the TOTAL_MISMATCH check.
    // Triggered by setting `custom: true` in the request body (admin-only UI).
    if (body.custom === true) {
      // Validate required fields for a manual order
      if (!body.card_name || typeof body.card_name !== "string") {
        return NextResponse.json({ success: false, error: "card_name is required" }, { status: 400 });
      }
      const qty = Number(body.quantity);
      if (!qty || qty < 1) {
        return NextResponse.json({ success: false, error: "quantity must be ≥ 1" }, { status: 400 });
      }
      const total = Number(body.total);
      if (isNaN(total) || total < 0) {
        return NextResponse.json({ success: false, error: "total must be ≥ 0" }, { status: 400 });
      }
      if (!body.customization?.main_event) {
        return NextResponse.json({ success: false, error: "customization.main_event is required" }, { status: 400 });
      }
      if (!body.customer?.name || !body.customer?.whatsapp || (!body.customer?.city && !body.customer?.area)) {
        return NextResponse.json({ success: false, error: "customer name, whatsapp, and city are required" }, { status: 400 });
      }
      if (body.payment?.method !== "full" && body.payment?.method !== "deposit") {
        return NextResponse.json({ success: false, error: "payment.method must be 'full' or 'deposit'" }, { status: 400 });
      }

      await connectToDatabase();

      // Derive slug from card name; fall back to "custom"
      const cardSlug = (body.card_name as string)
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "") || "custom";

      const basePrice = Math.round(total / qty);

      // Amount due: use client value if valid, otherwise derive from method
      const clientAmountDue = Number(body.payment?.amount_due);
      const amountDue =
        !isNaN(clientAmountDue) && clientAmountDue >= 0
          ? clientAmountDue
          : body.payment.method === "deposit"
          ? Math.ceil(total / 2)
          : total;

      const paymentStatus = body.payment?.status ?? "pending_payment";

      // Generate unique order ID using the same retry logic as the catalog path
      let orderId = generateOrderId();
      let retries = 5;
      while (retries > 0) {
        const existing = await Order.findOne({ order_id: orderId }).lean();
        if (!existing) break;
        orderId = generateOrderId();
        retries--;
      }

      const addonEvents: { event_type: string; quantity: number }[] = Array.isArray(
        body.customization?.addon_events
      )
        ? body.customization.addon_events
            .map((e: { event_type: string; quantity: number }) => ({
              event_type: String(e.event_type),
              quantity: Number(e.quantity),
            }))
            .filter((e: { event_type: string; quantity: number }) => e.event_type && e.quantity > 0)
        : [];

      const discountAmount = Math.max(0, Number(body.discount_amount) || 0);
      const subtotalBeforeDiscount = discountAmount > 0 ? total + discountAmount : total;

      const order = await Order.create({
        order_id: orderId,
        card_slug: cardSlug,
        card_name: (body.card_name as string).trim(),
        quantity: qty,
        base_price: basePrice,
        add_ons: [],
        subtotal_before_discount: subtotalBeforeDiscount,
        ...(discountAmount > 0 ? { discount: { source: "quantity", amount: discountAmount } } : {}),
        total,
        customization: {
          main_event: body.customization.main_event,
          addon_events: addonEvents,
        },
        customer: {
          name: (body.customer.name as string).trim(),
          whatsapp: (body.customer.whatsapp as string).trim(),
          city: body.customer.city || body.customer.area || "",
          area: body.customer.area || body.customer.city || "",
          address: body.customer.address || "",
        },
        payment: {
          method: body.payment.method,
          amount_due: amountDue,
          receipt_url: body.payment?.receipt_url || "",
          status: paymentStatus,
        },
        note: body.note || "",
      });

      return NextResponse.json(
        { success: true, data: { order_id: order.order_id } },
        { status: 201 }
      );
    }
    // ── End custom-order path ───────────────────────────────────────────────

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

    if (!body.customer?.name || !body.customer?.whatsapp || (!body.customer?.city && !body.customer?.area)) {
      return NextResponse.json(
        { success: false, error: "Customer details are required (name, whatsapp, city)" },
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
          city: body.customer.city || body.customer.area || '',
          area: body.customer.area || body.customer.city || '',
          address: body.customer.address || '',
        },
        payment: {
          method: body.payment.method,
          amount_due: amountDue,
          receipt_url: body.payment.receipt_url || "",
          status: body.payment.receipt_url ? "confirmed" : "pending_payment",
        },
      });

      try {
        start(sendOrderNotification, [{
          order_id: String(order.order_id),
          card_name: String(order.card_name),
          quantity: Number(order.quantity),
          total: Number(order.total),
          main_event: String(order.customization.main_event),
          customer_name: String(order.customer.name),
          customer_whatsapp: String(order.customer.whatsapp),
          customer_city: String(order.customer.city || ""),
          customer_address: String(order.customer.address || ""),
          payment_method: String(order.payment.method),
          amount_due: Number(order.payment.amount_due),
          payment_status: String(order.payment.status),
        }]).catch((e: unknown) => console.error("order notification enqueue failed:", e));
      } catch (e) {
        console.error("order notification enqueue failed:", e);
      }

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
