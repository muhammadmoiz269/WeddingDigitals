import PromoCode, { IPromoCode, PROMO_CODE_PATTERN } from "@/lib/models/PromoCode";
import { formatPKR } from "@/lib/pricing";

export type PromoFailure =
  | "PROMO_INVALID"
  | "PROMO_EXPIRED"
  | "PROMO_EXHAUSTED"
  | "PROMO_MIN_ORDER";

export const PROMO_ERROR_MESSAGES: Record<PromoFailure, string> = {
  PROMO_INVALID: "Invalid promo code",
  PROMO_EXPIRED: "This promo code has expired",
  PROMO_EXHAUSTED: "This promo code is no longer available",
  PROMO_MIN_ORDER: "This code requires a minimum order amount",
};

export type PromoCheckResult =
  | { ok: true; promo: IPromoCode; discount: number }
  | { ok: false; reason: PromoFailure; error: string; min_order_amount?: number };

/**
 * Normalizes raw user input into a canonical promo code, or null if it can't
 * possibly be one. Cheap guard that runs before any DB lookup.
 */
export function normalizePromoCode(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const code = raw.trim().toUpperCase();
  return PROMO_CODE_PATTERN.test(code) ? code : null;
}

/**
 * Discount amount for a promo against a gross order total.
 * Shared by the validate (preview) endpoint and order creation so the two can
 * never disagree on rounding.
 */
export function computePromoDiscount(
  promo: Pick<IPromoCode, "type" | "value">,
  grossTotal: number
): number {
  if (promo.type === "percent") {
    return Math.round((grossTotal * promo.value) / 100);
  }
  return Math.min(promo.value, grossTotal);
}

/**
 * Read-only eligibility check (no usage increment). Used by the preview
 * endpoint and to categorize atomic-redemption failures at order time.
 *
 * Anti-enumeration: a nonexistent code and a deactivated code both return the
 * identical PROMO_INVALID error.
 */
export async function checkPromo(code: string, grossTotal: number): Promise<PromoCheckResult> {
  const promo = await PromoCode.findOne({ code });

  if (!promo || !promo.active) {
    return { ok: false, reason: "PROMO_INVALID", error: PROMO_ERROR_MESSAGES.PROMO_INVALID };
  }

  const now = new Date();
  if ((promo.valid_from && promo.valid_from > now) || (promo.valid_until && promo.valid_until < now)) {
    return { ok: false, reason: "PROMO_EXPIRED", error: PROMO_ERROR_MESSAGES.PROMO_EXPIRED };
  }

  if (promo.usage_limit !== null && promo.usage_count >= promo.usage_limit) {
    return { ok: false, reason: "PROMO_EXHAUSTED", error: PROMO_ERROR_MESSAGES.PROMO_EXHAUSTED };
  }

  if (grossTotal < promo.min_order_amount) {
    return {
      ok: false,
      reason: "PROMO_MIN_ORDER",
      error: `This code requires a minimum order of ${formatPKR(promo.min_order_amount)}`,
      min_order_amount: promo.min_order_amount,
    };
  }

  return { ok: true, promo, discount: computePromoDiscount(promo, grossTotal) };
}

/**
 * Atomically redeems a promo: every eligibility condition lives inside the
 * filter, so the check and the usage increment are a single document
 * operation — N concurrent orders can never push usage_count past the cap.
 * Returns the redeemed promo, or null if any condition failed (use
 * checkPromo() to find out which one for error messaging).
 */
export async function redeemPromo(code: string, grossTotal: number): Promise<IPromoCode | null> {
  const now = new Date();
  return PromoCode.findOneAndUpdate(
    {
      code,
      active: true,
      min_order_amount: { $lte: grossTotal },
      $and: [
        { $or: [{ valid_from: null }, { valid_from: { $lte: now } }] },
        { $or: [{ valid_until: null }, { valid_until: { $gte: now } }] },
        { $or: [{ usage_limit: null }, { $expr: { $lt: ["$usage_count", "$usage_limit"] } }] },
      ],
    },
    { $inc: { usage_count: 1 } },
    { new: true }
  );
}

export function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: number }).code === 11000
  );
}

/**
 * Whitelisted, coerced and validated fields from an admin create/update
 * payload. usage_count is never accepted. Throws Error with a user-facing
 * message on invalid input (cross-field rules are checked here because
 * Mongoose update validators don't get document context on findByIdAndUpdate).
 */
export function parsePromoFields(body: Record<string, unknown>) {
  const type = body.type;
  if (type !== "percent" && type !== "fixed") {
    throw new Error("Discount type must be 'percent' or 'fixed'");
  }

  const value = Number(body.value);
  if (!Number.isFinite(value) || value < 1) {
    throw new Error("Discount value must be at least 1");
  }
  if (type === "percent" && value > 100) {
    throw new Error("Percentage discount cannot exceed 100");
  }

  const min_order_amount =
    body.min_order_amount === "" || body.min_order_amount == null
      ? 0
      : Number(body.min_order_amount);
  if (!Number.isFinite(min_order_amount) || min_order_amount < 0) {
    throw new Error("Minimum order amount cannot be negative");
  }

  const usage_limit =
    body.usage_limit === "" || body.usage_limit == null ? null : Number(body.usage_limit);
  if (usage_limit !== null && (!Number.isInteger(usage_limit) || usage_limit < 1)) {
    throw new Error("Usage limit must be a whole number of at least 1");
  }

  const valid_from = body.valid_from ? new Date(String(body.valid_from)) : null;
  const valid_until = body.valid_until ? new Date(String(body.valid_until)) : null;
  if ((valid_from && isNaN(valid_from.getTime())) || (valid_until && isNaN(valid_until.getTime()))) {
    throw new Error("Invalid date");
  }
  if (valid_from && valid_until && valid_until <= valid_from) {
    throw new Error("Expiry date must be after the start date");
  }

  return {
    type,
    value,
    min_order_amount,
    usage_limit,
    valid_from,
    valid_until,
    active: body.active === undefined ? true : Boolean(body.active),
  };
}

/**
 * Compensating action for redeemPromo — used when the order fails after a
 * successful redemption. Best-effort: if this itself fails, the cap is
 * under-used (safe direction), never over-used.
 */
export async function releasePromoRedemption(code: string): Promise<void> {
  try {
    await PromoCode.updateOne({ code, usage_count: { $gt: 0 } }, { $inc: { usage_count: -1 } });
  } catch (err) {
    console.error(`Failed to release promo redemption for ${code}:`, err);
  }
}
