"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// How many days to wait before re-prompting after a dismissal (permission stays 'default').
const COOLDOWN_DAYS = 3;
// Minimum time on page (ms) before we arm the gesture listener.
const ENGAGEMENT_DELAY_MS = 6000;

const IOS_HINT_DISMISSED_KEY = "push_ios_hint_dismissed";
const LAST_PROMPTED_KEY = "push_last_prompted_at";

/** Convert VAPID base64url public key to Uint8Array for pushManager.subscribe */
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(new ArrayBuffer(rawData.length));
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// ── UA Client Hints types (not yet in lib.dom.d.ts) ──────────────────────────

interface UADataBrand {
  brand: string;
  version: string;
}

interface NavigatorUAData {
  getHighEntropyValues(hints: string[]): Promise<{
    platform?: string;
    platformVersion?: string;
    brands?: UADataBrand[];
    mobile?: boolean;
  }>;
}

type NavigatorWithUAData = Navigator & { userAgentData?: NavigatorUAData };

/** GREASE placeholder patterns Chrome injects to catch UA-sniffers. */
const GREASE_RE = /not[.?_ ]a[/_-]?brand/i;

/**
 * Normalise a UA-CH brand name to a short familiar label.
 * "Google Chrome" → "Chrome", "Microsoft Edge" → "Edge", etc.
 */
function normaliseBrand(brand: string): string {
  if (/microsoft edge/i.test(brand)) return "Edge";
  if (/samsung/i.test(brand)) return "Samsung Browser";
  if (/opera/i.test(brand) || /opr/i.test(brand)) return "Opera";
  if (/google chrome/i.test(brand)) return "Chrome";
  if (/chromium/i.test(brand)) return "Chromium";
  return brand;
}

async function registerSubscription(sub: PushSubscription) {
  const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };

  // ── Permissions API: pushEnabled ───────────────────────────────────────────
  let pushEnabled = true;
  try {
    const status = await navigator.permissions.query({ name: "notifications" as PermissionName });
    pushEnabled = status.state === "granted";
  } catch {
    // Permissions API not supported — assume granted since subscribe succeeded
  }

  // ── UA Client Hints (Chromium-only) ────────────────────────────────────────
  let clientOs: string | undefined;
  let clientBrowser: string | undefined;
  try {
    const uaData = (navigator as NavigatorWithUAData).userAgentData;
    if (uaData) {
      const hints = await uaData.getHighEntropyValues(["platform", "brands"]);
      if (hints.platform) clientOs = hints.platform; // e.g. "Android", "Windows", "macOS"
      const realBrand = hints.brands?.find((b) => !GREASE_RE.test(b.brand) && !/chromium/i.test(b.brand));
      if (realBrand) clientBrowser = normaliseBrand(realBrand.brand);
    }
  } catch {
    // UA-CH not supported or blocked — server falls back to UA-string parsing
  }

  // ── Visitor-tracking metadata (all synchronous, no permissions needed) ─────
  const language = navigator.language ?? "";
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
  const subscribedPage = window.location.pathname;
  const referrer = document.referrer;

  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...json,
      pushEnabled,
      ...(clientOs !== undefined && { os: clientOs }),
      ...(clientBrowser !== undefined && { browser: clientBrowser }),
      language,
      timezone,
      subscribedPage,
      referrer,
    }),
  });
}

/** Detect iOS Safari (iPhone, iPad, iPod — including iPadOS masquerading as Mac) */
function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iP(hone|ad|od)/i.test(navigator.userAgent) ||
    // iPadOS 13+ reports as MacIntel but has touch points
    (navigator.userAgent.includes("Mac") && navigator.maxTouchPoints > 1)
  );
}

/** True when the site is already running as an installed standalone PWA */
function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigator as any).standalone === true
  );
}

/** True if we are within the COOLDOWN_DAYS cooldown period after the last prompt */
function isInCooldown(): boolean {
  try {
    const raw = localStorage.getItem(LAST_PROMPTED_KEY);
    if (!raw) return false;
    const lastAt = parseInt(raw, 10);
    if (isNaN(lastAt)) return false;
    const cooldownMs = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
    return Date.now() - lastAt < cooldownMs;
  } catch {
    return false;
  }
}

/** Record the current timestamp as the last time we showed the native prompt */
function recordPromptTime() {
  try {
    localStorage.setItem(LAST_PROMPTED_KEY, String(Date.now()));
  } catch {
    // localStorage unavailable — ignore
  }
}

export default function PushOptIn() {
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const pathname = usePathname();

  // Only used on iOS-not-standalone to show the install hint
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    if (!vapidKey) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (typeof Notification === "undefined") return;

    let cancelled = false;
    let engagementTimer: ReturnType<typeof setTimeout> | null = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let gestureListener: ((e: any) => void) | null = null;

    const doSubscribe = async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        if (cancelled) return;
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });
        if (cancelled) return;
        await registerSubscription(sub);
      } catch (err) {
        console.error("[PushOptIn] Subscribe failed:", err);
      }
    };

    const showPrompt = async () => {
      if (cancelled) return;
      if (Notification.permission !== "default") return;

      recordPromptTime();
      try {
        const permission = await Notification.requestPermission();
        if (cancelled) return;
        if (permission === "granted") {
          await doSubscribe();
        }
        // 'default' (dismissed) or 'denied' — both handled by cooldown / denied guard
      } catch (err) {
        console.error("[PushOptIn] requestPermission failed:", err);
      }
    };

    /** Arm the one-shot gesture listener so the next tap triggers the native dialog */
    const armGestureListener = () => {
      if (cancelled) return;
      if (Notification.permission !== "default") return;

      const onGesture = () => {
        gestureListener = null; // consumed
        void showPrompt();
      };

      gestureListener = onGesture;
      document.addEventListener("pointerdown", onGesture, { once: true, capture: true });
    };

    const init = async () => {
      const permission = Notification.permission;
      console.log(`[PushOptIn] Permission: "${permission}" — path: ${pathname}`);

      // ── Already granted: re-subscribe (or keep existing subscription alive) ──
      if (permission === "granted") {
        try {
          const reg = await navigator.serviceWorker.ready;
          if (cancelled) return;
          const existing = await reg.pushManager.getSubscription();
          if (cancelled) return;
          if (existing) {
            await registerSubscription(existing);
          } else {
            await doSubscribe();
          }
        } catch (err) {
          console.error("[PushOptIn] Failed to refresh subscription:", err);
        }
        return;
      }

      if (permission === "denied") return;

      // ── permission === 'default' ──

      // iOS Safari (not installed as PWA): show install hint instead of a prompt that
      // can never appear. iOS push only works from an installed standalone PWA.
      if (isIOS() && !isStandalone()) {
        const dismissed = localStorage.getItem(IOS_HINT_DISMISSED_KEY);
        if (!dismissed) setShowIosHint(true);
        return;
      }

      // Respect the cross-visit cooldown — if we recently showed the native dialog
      // and it was dismissed, don't re-arm until COOLDOWN_DAYS have passed. This
      // prevents repeated prompts from training users to hit 'Block'.
      if (isInCooldown()) {
        console.log("[PushOptIn] In cooldown — skipping prompt this visit");
        return;
      }

      // Wait for genuine engagement before arming the gesture listener.
      // Attaching it immediately causes the native dialog to fire on an accidental
      // first tap, which drives reflexive 'Block' clicks.
      engagementTimer = setTimeout(() => {
        if (cancelled) return;
        armGestureListener();
      }, ENGAGEMENT_DELAY_MS);
    };

    void init();

    return () => {
      cancelled = true;
      if (engagementTimer !== null) clearTimeout(engagementTimer);
      if (gestureListener) {
        document.removeEventListener("pointerdown", gestureListener, { capture: true });
        gestureListener = null;
      }
    };
  }, [vapidKey, pathname]);

  // ── iOS install hint ────────────────────────────────────────────────────────
  if (!showIosHint) return null;

  return (
    <>
      <style>{`
        .push-ios-hint {
          position: fixed;
          bottom: env(safe-area-inset-bottom, 0);
          left: 0;
          right: 0;
          z-index: 9999;
          background: rgba(20, 15, 10, 0.97);
          border-top: 1px solid rgba(201, 169, 110, 0.25);
          padding: 0.875rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-family: inherit;
          backdrop-filter: blur(8px);
        }
        .push-ios-hint__icon {
          font-size: 1.25rem;
          flex-shrink: 0;
        }
        .push-ios-hint__text {
          flex: 1;
          font-size: 0.8125rem;
          color: #c9bfb0;
          line-height: 1.4;
        }
        .push-ios-hint__text strong { color: #EDE5D8; }
        .push-ios-hint__close {
          background: transparent;
          border: none;
          color: #5a4a3a;
          font-size: 1.1rem;
          padding: 0.25rem 0.4rem;
          cursor: pointer;
          flex-shrink: 0;
          line-height: 1;
        }
      `}</style>
      <div className="push-ios-hint" role="status">
        <span className="push-ios-hint__icon">🔔</span>
        <p className="push-ios-hint__text">
          <strong>Get notified</strong> about new designs — tap{" "}
          <strong>Share ⬆</strong> then <strong>&ldquo;Add to Home Screen&rdquo;</strong>
        </p>
        <button
          className="push-ios-hint__close"
          aria-label="Dismiss"
          onClick={() => {
            localStorage.setItem(IOS_HINT_DISMISSED_KEY, "1");
            setShowIosHint(false);
          }}
        >
          ✕
        </button>
      </div>
    </>
  );
}
