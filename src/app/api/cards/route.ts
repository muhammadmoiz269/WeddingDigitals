import { NextResponse } from "next/server";
import { cardProducts } from "@/data/cardProducts";

// GET /api/cards — Return all cards (with optional category filter)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    let results = cardProducts;

    if (category && category !== "All") {
      results = cardProducts.filter((p) => p.category === category);
    }

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("Error fetching cards:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch cards" },
      { status: 500 }
    );
  }
}
