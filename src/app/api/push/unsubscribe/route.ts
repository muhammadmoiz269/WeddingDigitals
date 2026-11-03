import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import PushSubscription from "@/lib/models/PushSubscription";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { endpoint } = body ?? {};

    if (!endpoint || typeof endpoint !== "string") {
      return NextResponse.json(
        { success: false, error: "endpoint is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    await PushSubscription.findOneAndUpdate(
      { endpoint },
      { $set: { status: "expired" } }
    );

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error in /api/push/unsubscribe:", error);
    const message =
      error instanceof Error ? error.message : "Failed to unsubscribe";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
