import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import PushCampaign from "@/lib/models/PushCampaign";
import PushDelivery from "@/lib/models/PushDelivery";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    await connectToDatabase();
    const campaigns = await PushCampaign.find({})
      .sort({ created_at: -1 })
      .lean();

    if (campaigns.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Derive delivered/opened counts from PushDelivery — the deduped source of truth
    const campaignIds = campaigns.map((c) => c._id);
    const deliveryStats = await PushDelivery.aggregate([
      { $match: { campaign: { $in: campaignIds } } },
      {
        $group: {
          _id: "$campaign",
          delivered_count: { $sum: { $cond: ["$delivered", 1, 0] } },
          opened_count: { $sum: { $cond: ["$opened", 1, 0] } },
        },
      },
    ]);

    const statsById: Record<string, { delivered_count: number; opened_count: number }> = {};
    for (const row of deliveryStats) {
      statsById[String(row._id)] = {
        delivered_count: row.delivered_count,
        opened_count: row.opened_count,
      };
    }

    const data = campaigns.map((c) => {
      const stats = statsById[String(c._id)] ?? { delivered_count: 0, opened_count: 0 };
      return { ...c, ...stats };
    });

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error("Error fetching campaigns:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch campaigns";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();
    const { heading, description, bannerImageUrl, iconUrl, ctaLabel, ctaUrl, segment } =
      body ?? {};

    if (!heading?.trim()) {
      return NextResponse.json(
        { success: false, error: "heading is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const campaign = await PushCampaign.create({
      heading: heading.trim(),
      description: description?.trim() ?? "",
      bannerImageUrl: bannerImageUrl?.trim() ?? "",
      iconUrl: iconUrl?.trim() ?? "",
      ctaLabel: ctaLabel?.trim() || "View Now",
      // Default to "/" so openWindow never gets an empty string
      ctaUrl: ctaUrl?.trim() || "/",
      segment: {
        activeWithinDays: segment?.activeWithinDays ?? null,
      },
      status: "draft",
    });

    return NextResponse.json({ success: true, data: campaign }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating campaign:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create campaign";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
