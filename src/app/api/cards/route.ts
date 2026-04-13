import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Card from "@/lib/models/Card";

// ─── Helpers ────────────────────────────────────────────────────────────────

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─── GET /api/cards ──────────────────────────────────────────────────────────
// Returns all cards from MongoDB (with optional ?category= filter).

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    await connectToDatabase();

    const query = category && category !== "All" ? { category } : {};
    const cards = await Card.find(query).sort({ created_at: -1 }).lean();

    return NextResponse.json({ success: true, data: cards, source: "db" });
  } catch (error) {
    console.error("Error fetching cards:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch cards from database" },
      { status: 500 }
    );
  }
}

// ─── POST /api/cards ─────────────────────────────────────────────────────────
// Creates a new card. Body: CardProduct JSON.

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Basic validation
    if (!body.name || !body.base_price || !body.category || !body.description) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, base_price, category, description" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Auto-generate slug if not provided, and ensure uniqueness
    let slug = body.slug ? String(body.slug).toLowerCase().trim() : generateSlug(body.name);

    // Check slug uniqueness; append suffix if needed
    const existing = await Card.findOne({ slug }).lean();
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const card = await Card.create({
      name: body.name,
      slug,
      card_code: body.card_code || undefined,
      base_price: Number(body.base_price),
      original_price: body.original_price ? Number(body.original_price) : undefined,
      category: body.category,
      description: body.description,
      images: Array.isArray(body.images) ? body.images.filter(Boolean) : [],
      short_video_url: body.short_video_url || undefined,
      is_new: Boolean(body.is_new),
      is_bestseller: Boolean(body.is_bestseller),
      min_order: Number(body.min_order) || 50,
      add_ons: Array.isArray(body.add_ons) ? body.add_ons : [],
    });

    return NextResponse.json({ success: true, data: card }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating card:", error);
    const message = error instanceof Error ? error.message : "Failed to create card";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
