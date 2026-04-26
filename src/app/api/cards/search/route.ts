import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Card from "@/lib/models/Card";

// ─── GET /api/cards/search?q=... ─────────────────────────────────────────────
// Full-text search on name & description. Returns matches + suggestions.

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();

    if (!q) {
      return NextResponse.json({ success: true, results: [], suggestions: [] });
    }

    await connectToDatabase();

    // Escape regex special chars for safe matching
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");

    // Search on name and description
    const results = await Card.find({
      $or: [{ name: regex }, { description: regex }],
    })
      .sort({ is_bestseller: -1, created_at: -1 })
      .limit(20)
      .lean();

    // Build suggestions from ALL cards (lightweight — just names + slugs)
    // Show cards that don't match the query as suggestions
    let suggestions: { name: string; slug: string; category: string; base_price: number; image: string | null }[] = [];

    if (results.length < 4) {
      // If few/no matches, suggest bestsellers or newest cards
      const suggestionDocs = await Card.find({
        slug: { $nin: results.map((r) => r.slug) },
      })
        .sort({ is_bestseller: -1, created_at: -1 })
        .limit(6)
        .lean();

      suggestions = suggestionDocs.map((c) => ({
        name: c.name,
        slug: c.slug,
        category: c.category,
        base_price: c.base_price,
        image: c.images?.[0] ?? null,
      }));
    }

    return NextResponse.json({
      success: true,
      results,
      suggestions,
      query: q,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { success: false, error: "Search failed" },
      { status: 500 }
    );
  }
}
