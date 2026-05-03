import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Card from "@/lib/models/Card";

// ─── GET /api/cards/[slug] ────────────────────────────────────────────────────

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    await connectToDatabase();
    const card = await Card.findOne({ slug }).lean();

    if (!card) {
      return NextResponse.json(
        { success: false, error: "Card not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: card });
  } catch (error) {
    console.error("Error fetching card:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch card" },
      { status: 500 }
    );
  }
}

// ─── PUT /api/cards/[slug] ────────────────────────────────────────────────────

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    if (!body.name || !body.base_price || !body.category || !body.description) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // If the slug is being changed, verify the new slug is unique
    const newSlug = body.slug ? String(body.slug).toLowerCase().trim() : slug;
    if (newSlug !== slug) {
      const existing = await Card.findOne({ slug: newSlug }).lean();
      if (existing) {
        return NextResponse.json(
          { success: false, error: `Slug "${newSlug}" is already in use` },
          { status: 409 }
        );
      }
    }

    const updateData = {
      name: body.name,
      slug: newSlug,
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
      meta_title: body.meta_title ?? "",
      meta_description: body.meta_description ?? "",
      image_alt_text: body.image_alt_text ?? "",
    };

    const updated = await Card.findOneAndUpdate(
      { slug },
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Card not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    console.error("Error updating card:", error);
    const message = error instanceof Error ? error.message : "Failed to update card";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// ─── DELETE /api/cards/[slug] ─────────────────────────────────────────────────

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    await connectToDatabase();
    const deleted = await Card.findOneAndDelete({ slug }).lean();

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Card not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: `Card '${slug}' deleted` });
  } catch (error: unknown) {
    console.error("Error deleting card:", error);
    const message = error instanceof Error ? error.message : "Failed to delete card";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
