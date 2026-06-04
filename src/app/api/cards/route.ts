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

/** Map the client-side SortValue to a MongoDB sort spec. */
function buildMongoSort(sort: string): Record<string, 1 | -1> {
  switch (sort) {
    case "best-selling": return { is_bestseller: -1, created_at: -1 };
    case "price-asc":    return { base_price: 1 };
    case "price-desc":   return { base_price: -1 };
    case "newest":       return { created_at: -1 };
    case "name-asc":     return { name: 1 };
    case "name-desc":    return { name: -1 };
    case "featured":
    default:             return { is_bestseller: -1, is_new: -1, created_at: -1 };
  }
}

// ─── GET /api/cards ──────────────────────────────────────────────────────────
// Returns cards from MongoDB with optional ?category=, ?sort=, ?page=, ?limit=.

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const event    = searchParams.get("event");
    const sort     = searchParams.get("sort") ?? "featured";
    const page     = searchParams.get("page");
    const limit    = searchParams.get("limit");

    await connectToDatabase();

    // Build the filter query — category and event are mutually exclusive in
    // practice but we support both independently for flexibility.
    let query: Record<string, unknown> = {};
    if (category && category !== "All") query = { ...query, category };
    if (event) query = { ...query, events: event };

    const mongoSort = buildMongoSort(sort);

    // If pagination params are provided, paginate
    if (page && limit) {
      const pageNum  = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 12));
      const skip     = (pageNum - 1) * limitNum;

      const [cards, total] = await Promise.all([
        Card.find(query).sort(mongoSort).skip(skip).limit(limitNum).lean(),
        Card.countDocuments(query),
      ]);

      return NextResponse.json({
        success: true,
        data: cards,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        source: "db",
      });
    }

    // No pagination — return all (backward-compatible, e.g. admin)
    const cards = await Card.find(query).sort(mongoSort).lean();
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
      original_price: (body.original_price !== null && body.original_price !== undefined && body.original_price !== "")
        ? Number(body.original_price) : undefined,
      inner_card_price: (body.inner_card_price !== null && body.inner_card_price !== undefined && body.inner_card_price !== "")
        ? Number(body.inner_card_price) : undefined,
      category: body.category,
      description: body.description,
      images: Array.isArray(body.images) ? body.images.filter(Boolean) : [],
      short_video_url: body.short_video_url || undefined,
      is_new: Boolean(body.is_new),
      is_bestseller: Boolean(body.is_bestseller),
      min_order: Number(body.min_order) || 50,
      add_ons: Array.isArray(body.add_ons) ? body.add_ons : [],
      meta_title: body.meta_title ?? "",
      meta_description: body.meta_description ?? "",
      image_alt_text: body.image_alt_text ?? "",
    });

    return NextResponse.json({ success: true, data: card }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating card:", error);
    const message = error instanceof Error ? error.message : "Failed to create card";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
