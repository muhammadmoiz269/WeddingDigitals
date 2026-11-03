import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import PushCampaign from "@/lib/models/PushCampaign";
import PushDelivery from "@/lib/models/PushDelivery";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    await connectToDatabase();

    const campaign = await PushCampaign.findById(id).lean();
    if (!campaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Derive counts from PushDelivery — the deduped source of truth
    const [deliveryStats] = await PushDelivery.aggregate([
      { $match: { campaign: campaign._id } },
      {
        $group: {
          _id: null,
          delivered_count: { $sum: { $cond: ["$delivered", 1, 0] } },
          opened_count: { $sum: { $cond: ["$opened", 1, 0] } },
        },
      },
    ]);

    const delivered_count = deliveryStats?.delivered_count ?? 0;
    const opened_count = deliveryStats?.opened_count ?? 0;
    const openRate =
      delivered_count > 0
        ? Math.round((opened_count / delivered_count) * 1000) / 10
        : 0;

    // Per-device delivery rows, joined with subscription metadata
    const deliveries = await PushDelivery.find({ campaign: campaign._id })
      .populate("subscription", "deviceType os browser pushEnabled language timezone subscribed_page referrer geo last_seen status")
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        campaign: {
          ...campaign,
          delivered_count,
          opened_count,
        },
        stats: {
          target: campaign.target_count,
          delivered: delivered_count,
          opened: opened_count,
          openRate,
        },
        deliveries,
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching campaign:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch campaign";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
