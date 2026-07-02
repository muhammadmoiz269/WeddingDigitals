import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { computeOrderPricing, OrderPricingError } from "@/lib/server/orderPricing";
import { normalizePromoCode, checkPromo, PROMO_ERROR_MESSAGES } from "@/lib/server/promo";

/**
 * POST /api/promo/validate — discount preview for the checkout UI.
 *
 * Read-only: never increments usage. The order subtotal is recomputed
 * server-side from the card slug + quantities — the body carries no prices.
 * Error messages are deliberately generic (nonexistent and deactivated codes
 * are indistinguishable) so the endpoint can't be used to enumerate codes.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Cheap shape check before any DB work
    const code = normalizePromoCode(body.code);
    if (!code) {
      return NextResponse.json(
        { success: false, error_code: "PROMO_INVALID", error: PROMO_ERROR_MESSAGES.PROMO_INVALID },
        { status: 400 }
      );
    }

    if (!body.card_slug || !body.quantity) {
      return NextResponse.json(
        { success: false, error_code: "INVALID_INPUT", error: "Missing card or quantity" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    let pricing;
    try {
      pricing = await computeOrderPricing({
        card_slug: String(body.card_slug),
        quantity: Number(body.quantity),
        add_on_names: Array.isArray(body.add_on_names) ? body.add_on_names.map(String) : [],
        addon_events: Array.isArray(body.addon_events)
          ? body.addon_events.map((e: { event_type: string; quantity: number }) => ({
              event_type: String(e.event_type),
              quantity: Number(e.quantity),
            }))
          : [],
      });
    } catch (err) {
      if (err instanceof OrderPricingError) {
        return NextResponse.json(
          { success: false, error_code: "INVALID_INPUT", error: err.message },
          { status: 400 }
        );
      }
      throw err;
    }

    const check = await checkPromo(code, pricing.grossTotal);
    if (!check.ok) {
      return NextResponse.json(
        {
          success: false,
          error_code: check.reason,
          error: check.error,
          ...(check.min_order_amount !== undefined
            ? { min_order_amount: check.min_order_amount }
            : {}),
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        code,
        type: check.promo.type,
        value: check.promo.value,
        discount_amount: check.discount,
        gross_total: pricing.grossTotal,
        new_total: pricing.grossTotal - check.discount,
      },
    });
  } catch (error) {
    console.error("Error validating promo code:", error);
    return NextResponse.json(
      { success: false, error: "Failed to validate promo code" },
      { status: 500 }
    );
  }
}
