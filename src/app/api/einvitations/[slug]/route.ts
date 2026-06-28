import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectToDatabase from "@/lib/mongodb";
import EInvitation from "@/lib/models/EInvitation";
import Admin from "@/lib/models/Admin";

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function requireAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) return false;
  await connectToDatabase();
  const admin = await Admin.findOne({ session_token: token }).lean();
  return !!admin;
}

// ─── GET /api/einvitations/[slug] ─────────────────────────────────────────────
// Public — used by the customer-facing /invite/[slug] page.

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    await connectToDatabase();
    const invitation = await EInvitation.findOne({ slug }).lean();

    if (!invitation) {
      return NextResponse.json(
        { success: false, error: "Invitation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: invitation });
  } catch (error) {
    console.error("Error fetching invitation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch invitation" },
      { status: 500 }
    );
  }
}

// ─── PUT /api/einvitations/[slug] ─────────────────────────────────────────────
// Admin-only. Accepts a partial body — only provided fields are updated.

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const authed = await requireAdmin();
    if (!authed) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const body = await request.json();

    await connectToDatabase();

    const updated = await EInvitation.findOneAndUpdate(
      { slug },
      { $set: body },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Invitation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    console.error("Error updating invitation:", error);
    const message = error instanceof Error ? error.message : "Failed to update invitation";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// ─── DELETE /api/einvitations/[slug] ──────────────────────────────────────────
// Admin-only.

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const authed = await requireAdmin();
    if (!authed) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;

    await connectToDatabase();
    const deleted = await EInvitation.findOneAndDelete({ slug }).lean();

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Invitation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: `Invitation '${slug}' deleted` });
  } catch (error: unknown) {
    console.error("Error deleting invitation:", error);
    const message = error instanceof Error ? error.message : "Failed to delete invitation";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
