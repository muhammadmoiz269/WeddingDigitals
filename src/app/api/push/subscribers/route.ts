import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import PushSubscription from "@/lib/models/PushSubscription";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const activeWithinDays = searchParams.get("activeWithinDays");

    await connectToDatabase();

    const now = new Date();

    const cutoff = (days: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() - days);
      return d;
    };

    const [total, active7, active30, active60, active90] = await Promise.all([
      PushSubscription.countDocuments({ status: "active" }),
      PushSubscription.countDocuments({ status: "active", last_seen: { $gte: cutoff(7) } }),
      PushSubscription.countDocuments({ status: "active", last_seen: { $gte: cutoff(30) } }),
      PushSubscription.countDocuments({ status: "active", last_seen: { $gte: cutoff(60) } }),
      PushSubscription.countDocuments({ status: "active", last_seen: { $gte: cutoff(90) } }),
    ]);

    // Country breakdown (top 10)
    const byCountry = await PushSubscription.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: "$geo.country", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Device type breakdown
    const byDevice = await PushSubscription.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: "$deviceType", count: { $sum: 1 } } },
    ]);

    // OS breakdown
    const byOS = await PushSubscription.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: { $ifNull: ["$os", "Unknown"] }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Browser breakdown
    const byBrowser = await PushSubscription.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: { $ifNull: ["$browser", "Unknown"] }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Estimated reach for a given segment (used by compose form)
    let segmentReach: number | null = null;
    if (activeWithinDays) {
      const days = parseInt(activeWithinDays, 10);
      if (!isNaN(days) && days > 0) {
        segmentReach = await PushSubscription.countDocuments({
          status: "active",
          last_seen: { $gte: cutoff(days) },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        total,
        active7,
        active30,
        active60,
        active90,
        byCountry,
        byDevice,
        byOS,
        byBrowser,
        ...(segmentReach !== null ? { segmentReach } : {}),
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching subscriber stats:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch stats";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
