import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectToDatabase from "@/lib/mongodb";
import EInvitation from "@/lib/models/EInvitation";
import Admin from "@/lib/models/Admin";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function requireAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) return false;
  await connectToDatabase();
  const admin = await Admin.findOne({ session_token: token }).lean();
  return !!admin;
}

// ─── GET /api/einvitations ────────────────────────────────────────────────────
// Returns all invitations sorted by createdAt desc (admin list).

export async function GET() {
  try {
    await connectToDatabase();
    const invitations = await EInvitation.find({})
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ success: true, data: invitations });
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch invitations" },
      { status: 500 }
    );
  }
}

// ─── POST /api/einvitations ───────────────────────────────────────────────────
// Creates a new invitation. Body: EInvitation JSON.

export async function POST(request: Request) {
  try {
    const authed = await requireAdmin();
    if (!authed) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (
      !body.couple?.groom_name ||
      !body.couple?.bride_name ||
      !body.couple?.event_title ||
      !body.couple?.seal_initials ||
      !body.couple?.monogram ||
      !body.wedding_at
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: couple details and wedding_at" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Derive slug from provided value or from couple names
    let slug = body.slug
      ? String(body.slug).toLowerCase().trim()
      : generateSlug(`${body.couple.groom_name}-${body.couple.bride_name}`);

    // Uniqueness collision retry — up to 3 attempts
    let attempts = 0;
    while (attempts < 3) {
      const existing = await EInvitation.findOne({ slug }).lean();
      if (!existing) break;
      slug = attempts === 0 ? `${slug}-${Date.now()}` : `${slug}-${attempts}`;
      attempts++;
    }
    if (attempts === 3) {
      return NextResponse.json(
        { success: false, error: "Could not generate a unique slug. Please provide one manually." },
        { status: 409 }
      );
    }

    const invitation = await EInvitation.create({
      couple: body.couple,
      slug,
      wedding_at: new Date(body.wedding_at),
      venue: body.venue ?? {},
      media: body.media ?? {},
      rsvp_contacts: Array.isArray(body.rsvp_contacts) ? body.rsvp_contacts : [],
      schedule: Array.isArray(body.schedule) ? body.schedule : [],
      faqs: Array.isArray(body.faqs) ? body.faqs : [],
      status: body.status ?? "draft",
    });

    return NextResponse.json({ success: true, data: invitation }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating invitation:", error);
    const message = error instanceof Error ? error.message : "Failed to create invitation";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
