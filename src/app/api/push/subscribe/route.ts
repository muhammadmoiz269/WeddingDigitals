import { NextResponse } from "next/server";
import { headers } from "next/headers";
import connectToDatabase from "@/lib/mongodb";
import PushSubscription from "@/lib/models/PushSubscription";

function detectDeviceType(ua: string): "mobile" | "tablet" | "desktop" {
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) return "mobile";
  return "desktop";
}

function detectOS(ua: string): string {
  if (/iP(hone|ad|od)/i.test(ua)) return "iOS";
  if (/android/i.test(ua)) return "Android";
  if (/windows/i.test(ua)) return "Windows";
  if (/mac os x/i.test(ua)) return "macOS";
  if (/linux/i.test(ua)) return "Linux";
  return "Unknown";
}

function detectBrowser(ua: string): string {
  // Order matters — Edge and Opera include "Chrome" in their UA strings.
  if (/edg\//i.test(ua)) return "Edge";
  if (/opr\//i.test(ua) || /opera/i.test(ua)) return "Opera";
  if (/samsungbrowser/i.test(ua)) return "Samsung Browser";
  if (/chrome/i.test(ua)) return "Chrome";
  if (/firefox/i.test(ua)) return "Firefox";
  if (/safari/i.test(ua)) return "Safari";
  return "Unknown";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      endpoint,
      keys,
      pushEnabled,
      os: clientOs,
      browser: clientBrowser,
      language,
      timezone,
      subscribedPage,
      referrer,
    } = body ?? {};

    if (!endpoint || typeof endpoint !== "string") {
      return NextResponse.json(
        { success: false, error: "endpoint is required" },
        { status: 400 }
      );
    }
    if (!keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { success: false, error: "keys.p256dh and keys.auth are required" },
        { status: 400 }
      );
    }

    const headerStore = await headers();

    const ua = headerStore.get("user-agent") ?? "";
    const deviceType = detectDeviceType(ua);
    // Prefer UA-CH values sent by the client; fall back to server-side UA-string parsing
    // for browsers that don't support navigator.userAgentData (Firefox, Safari).
    const os = (typeof clientOs === "string" && clientOs) ? clientOs : detectOS(ua);
    const browser = (typeof clientBrowser === "string" && clientBrowser) ? clientBrowser : detectBrowser(ua);
    const ip =
      headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headerStore.get("x-real-ip") ??
      "";

    // Vercel geo headers (populated in production/preview)
    const geo = {
      country: headerStore.get("x-vercel-ip-country") ?? "",
      region: headerStore.get("x-vercel-ip-country-region") ?? "",
      city: headerStore.get("x-vercel-ip-city") ?? "",
    };

    await connectToDatabase();

    await PushSubscription.findOneAndUpdate(
      { endpoint },
      {
        $set: {
          keys,
          userAgent: ua,
          deviceType,
          os,
          browser,
          pushEnabled: pushEnabled !== false,
          // Refresh on every visit — reflects current device locale/settings
          language: typeof language === "string" ? language : "",
          timezone: typeof timezone === "string" ? timezone : "",
          ipAddress: ip,
          geo,
          status: "active",
          last_seen: new Date(),
        },
        $setOnInsert: {
          subscribed_at: new Date(),
          // Capture once at opt-in time; never overwritten on subsequent refreshes
          subscribed_page: typeof subscribedPage === "string" ? subscribedPage : "",
          referrer: typeof referrer === "string" ? referrer : "",
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error in /api/push/subscribe:", error);
    const message =
      error instanceof Error ? error.message : "Failed to store subscription";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
