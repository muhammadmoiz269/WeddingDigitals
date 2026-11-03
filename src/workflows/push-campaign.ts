import webpush from "web-push";
import connectToDatabase from "@/lib/mongodb";
import PushSubscription from "@/lib/models/PushSubscription";
import PushCampaign from "@/lib/models/PushCampaign";
import PushDelivery from "@/lib/models/PushDelivery";

export interface PushCampaignPayload {
  campaignId: string;
}

export async function sendPushCampaign(payload: PushCampaignPayload) {
  await broadcastCampaign(payload);
}

async function broadcastCampaign(payload: PushCampaignPayload) {

  const { campaignId } = payload;

  await connectToDatabase();

  // Configure VAPID — must be done before any send call
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const notifyEmail = process.env.NOTIFY_EMAIL_TO;
  if (!publicKey || !privateKey || !notifyEmail) {
    console.error("[push-campaign] Missing VAPID env vars — reverting campaign to draft");
    await PushCampaign.findByIdAndUpdate(campaignId, { $set: { status: "draft" } });
    return;
  }
  webpush.setVapidDetails(`mailto:${notifyEmail}`, publicKey, privateKey);

  const campaign = await PushCampaign.findById(campaignId).lean();
  if (!campaign) {
    // Nothing to update — the doc was deleted after the send was queued.
    console.error("[push-campaign] Campaign not found, skipping:", campaignId);
    return;
  }

  // Build the query for the target segment
  const query: Record<string, unknown> = { status: "active" };
  if (campaign.segment?.activeWithinDays != null) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - campaign.segment.activeWithinDays);
    query.last_seen = { $gte: cutoff };
  }

  const subscriptions = await PushSubscription.find(query).lean();

  const notificationPayload = JSON.stringify({
    campaignId,
    heading: campaign.heading,
    description: campaign.description,
    bannerImageUrl: campaign.bannerImageUrl,
    iconUrl: campaign.iconUrl,
    ctaUrl: campaign.ctaUrl,
    ctaLabel: campaign.ctaLabel,
  });

  let deliveredCount = 0;
  const pruned: string[] = [];

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
        },
        notificationPayload,
        { TTL: 86400 } // 24-hour TTL
      );

      // Mark as delivered
      await PushDelivery.findOneAndUpdate(
        { campaign: campaign._id, subscription: sub._id },
        {
          $set: { delivered: true, delivered_at: new Date() },
          $setOnInsert: { opened: false },
        },
        { upsert: true }
      );
      deliveredCount++;
    } catch (err: unknown) {
      const statusCode =
        err && typeof err === "object" && "statusCode" in err
          ? (err as { statusCode: number }).statusCode
          : null;

      if (statusCode === 410 || statusCode === 404) {
        // Browser revoked the subscription — auto-prune
        pruned.push(sub.endpoint);
        await PushSubscription.deleteOne({ _id: sub._id });
      } else {
        const errObj = err && typeof err === "object" ? err as Record<string, unknown> : {};
        console.error(
          "[push-campaign] Send error for",
          sub.endpoint,
          "statusCode:", errObj.statusCode ?? "n/a",
          "body:", errObj.body ?? "n/a",
          err
        );
      }
    }
  }

  // Finalise campaign — delivered_count/opened_count are derived from PushDelivery at read time
  await PushCampaign.findByIdAndUpdate(campaignId, {
    $set: {
      status: "sent",
      sent_at: new Date(),
    },
  });

  if (pruned.length) {
    console.log(
      `[push-campaign] Auto-pruned ${pruned.length} expired subscriptions`
    );
  }
  console.log(
    `[push-campaign] Campaign ${campaignId} sent: ${deliveredCount}/${subscriptions.length} delivered`
  );
}
