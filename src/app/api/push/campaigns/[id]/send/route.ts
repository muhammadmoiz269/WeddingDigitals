import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import PushCampaign from "@/lib/models/PushCampaign";
import PushSubscription from "@/lib/models/PushSubscription";
import { requireAdmin } from "@/lib/adminAuth";
import { sendPushCampaign } from "@/workflows/push-campaign";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    await connectToDatabase();

    const campaign = await PushCampaign.findById(id);
    if (!campaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }
    if (campaign.status === "sending") {
      return NextResponse.json(
        { success: false, error: "Campaign is already being sent" },
        { status: 409 }
      );
    }
    if (campaign.status === "sent") {
      return NextResponse.json(
        { success: false, error: "Campaign has already been sent" },
        { status: 409 }
      );
    }

    // Count the target audience
    const segmentQuery: Record<string, unknown> = { status: "active" };
    if (campaign.segment?.activeWithinDays != null) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - campaign.segment.activeWithinDays);
      segmentQuery.last_seen = { $gte: cutoff };
    }
    const targetCount = await PushSubscription.countDocuments(segmentQuery);

    // Mark as sending
    await PushCampaign.findByIdAndUpdate(id, {
      $set: { status: "sending", target_count: targetCount },
    });

    try {
      await sendPushCampaign({ campaignId: id });
    } catch (startErr: unknown) {
      await PushCampaign.findByIdAndUpdate(id, { $set: { status: "draft" } });
      console.error("[send-campaign] Failed to send campaign:", startErr);
      const msg = startErr instanceof Error ? startErr.message : "Failed to send campaign";
      return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: { campaignId: id, targetCount },
    });
  } catch (error: unknown) {
    console.error("Error sending campaign:", error);
    const message =
      error instanceof Error ? error.message : "Failed to send campaign";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
