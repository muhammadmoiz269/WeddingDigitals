import { NextResponse } from "next/server";
import { getCardBySlug } from "@/data/cardProducts";

// GET /api/cards/[slug] — Return a single card by slug
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const card = getCardBySlug(slug);

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
