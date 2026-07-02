import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import PromoCode from "@/lib/models/PromoCode";
import { requireAdmin } from "@/lib/adminAuth";
import {
  normalizePromoCode,
  parsePromoFields,
  isDuplicateKeyError,
} from "@/lib/server/promo";

// ─── PUT /api/promo-codes/[id] ────────────────────────────────────────────────

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    const body = await request.json();

    const update: Record<string, unknown> = { ...parsePromoFields(body) };

    // Allow renaming the code, with the same normalization as create
    if (body.code !== undefined) {
      const code = normalizePromoCode(body.code);
      if (!code) {
        return NextResponse.json(
          { success: false, error: "Code must be 3-32 characters (letters, numbers, _ or -)" },
          { status: 400 }
        );
      }
      update.code = code;
    }

    await connectToDatabase();
    const updated = await PromoCode.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Promo code not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    if (isDuplicateKeyError(error)) {
      return NextResponse.json(
        { success: false, error: "A code with this name already exists" },
        { status: 400 }
      );
    }
    console.error("Error updating promo code:", error);
    const message = error instanceof Error ? error.message : "Failed to update promo code";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

// ─── DELETE /api/promo-codes/[id] ─────────────────────────────────────────────

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;

    await connectToDatabase();
    const deleted = await PromoCode.findByIdAndDelete(id).lean();

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Promo code not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: `Promo code '${deleted.code}' deleted` });
  } catch (error: unknown) {
    console.error("Error deleting promo code:", error);
    const message = error instanceof Error ? error.message : "Failed to delete promo code";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
