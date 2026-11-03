import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import PushSubscription from "@/lib/models/PushSubscription";
import PushCampaign from "@/lib/models/PushCampaign";
import PushDelivery from "@/lib/models/PushDelivery";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { campaignId, endpoint, type } = body ?? {};

    if (!campaignId || !endpoint || !["delivered", "opened"].includes(type)) {
      return NextResponse.json(
        { success: false, error: "campaignId, endpoint, and type ('delivered'|'opened') are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const [sub, campaign] = await Promise.all([
      PushSubscription.findOne({ endpoint }).lean(),
      PushCampaign.findById(campaignId).lean(),
    ]);

    if (!sub || !campaign) {
      // Silently ignore stale tracking pings
      return NextResponse.json({ success: true });
    }

    if (type === "delivered") {
      // Upsert the delivery record — campaign counts are derived from PushDelivery at read time
      await PushDelivery.findOneAndUpdate(
        { campaign: campaign._id, subscription: sub._id },
        {
          $set: { delivered: true, delivered_at: new Date() },
          $setOnInsert: { opened: false },
        },
        { upsert: true }
      );
    } else if (type === "opened") {
      // Only count the first open per device per campaign (opened: false guard dedupes)
      const result = await PushDelivery.findOneAndUpdate(
        { campaign: campaign._id, subscription: sub._id, opened: false },
        { $set: { opened: true, opened_at: new Date() } }
      );
      if (result) {
        // Update per-subscription engagement counters (independent engagement metric)
        await PushSubscription.findByIdAndUpdate(sub._id, {
          $inc: { opened_count: 1 },
          $set: { last_opened: new Date() },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error in /api/push/track:", error);
    const message =
      error instanceof Error ? error.message : "Failed to record tracking";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
