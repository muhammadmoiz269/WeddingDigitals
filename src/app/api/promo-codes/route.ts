import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import PromoCode from "@/lib/models/PromoCode";
import { requireAdmin } from "@/lib/adminAuth";
import {
  normalizePromoCode,
  parsePromoFields,
  isDuplicateKeyError,
} from "@/lib/server/promo";

// ─── GET /api/promo-codes ─────────────────────────────────────────────────────
// Admin-only: the list would leak every valid code.

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    await connectToDatabase();
    const codes = await PromoCode.find({}).sort({ created_at: -1 }).lean();
    return NextResponse.json({ success: true, data: codes });
  } catch (error) {
    console.error("Error fetching promo codes:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch promo codes" },
      { status: 500 }
    );
  }
}

// ─── POST /api/promo-codes ────────────────────────────────────────────────────

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();

    const code = normalizePromoCode(body.code);
    if (!code) {
      return NextResponse.json(
        { success: false, error: "Code must be 3-32 characters (letters, numbers, _ or -)" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const created = await PromoCode.create({ code, ...parsePromoFields(body) });
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: unknown) {
    if (isDuplicateKeyError(error)) {
      return NextResponse.json(
        { success: false, error: "A code with this name already exists" },
        { status: 400 }
      );
    }
    console.error("Error creating promo code:", error);
    const message = error instanceof Error ? error.message : "Failed to create promo code";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
