"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "";

interface Stats {
  total: number;
  active7: number;
  active30: number;
  active60: number;
  active90: number;
  byCountry: { _id: string; count: number }[];
  byDevice: { _id: string; count: number }[];
  byOS: { _id: string; count: number }[];
  byBrowser: { _id: string; count: number }[];
}

interface Campaign {
  _id: string;
  heading: string;
  description: string;
  bannerImageUrl: string;
  iconUrl: string;
  ctaLabel: string;
  ctaUrl: string;
  segment: { activeWithinDays: number | null };
  status: "draft" | "sending" | "sent";
  target_count: number;
  delivered_count: number;
  opened_count: number;
  sent_at: string | null;
  created_at: string;
}

type SegmentOption = "all" | "7" | "30" | "60" | "90";

interface ComposeForm {
  heading: string;
  description: string;
  bannerImageUrl: string;
  iconUrl: string;
  ctaLabel: string;
  ctaUrl: string;
  segment: SegmentOption;
}

const EMPTY_FORM: ComposeForm = {
  heading: "",
  description: "",
  bannerImageUrl: "",
  iconUrl: "",
  ctaLabel: "View Now",
  ctaUrl: "",
  segment: "all",
};

interface Props {
  addToast: (message: string, type: "success" | "error") => void;
}

export default function NotificationsTab({ addToast }: Props) {
  const router = useRouter();
  const [view, setView] = useState<"subscribers" | "compose">("subscribers");
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [form, setForm] = useState<ComposeForm>(EMPTY_FORM);
  const [segmentReach, setSegmentReach] = useState<number | null>(null);
  const [reachLoading, setReachLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const cloudinaryLoaded = useRef(false);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch("/api/push/subscribers");
      const json = await res.json();
      if (json.success) setStats(json.data);
    } catch (err) {
      console.error("[NotificationsTab] Failed to load subscriber stats:", err);
      addToast("Failed to load subscriber stats", "error");
    } finally {
      setStatsLoading(false);
    }
  }, [addToast]);

  const fetchCampaigns = useCallback(async () => {
    setCampaignsLoading(true);
    try {
      const res = await fetch("/api/push/campaigns");
      const json = await res.json();
      if (json.success) setCampaigns(json.data);
    } catch (err) {
      console.error("[NotificationsTab] Failed to load campaigns:", err);
      addToast("Failed to load campaigns", "error");
    } finally {
      setCampaignsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchStats();
    fetchCampaigns();
  }, [fetchStats, fetchCampaigns]);

  // ── Segment reach estimate ─────────────────────────────────────────────────

  useEffect(() => {
    if (form.segment === "all") {
      setSegmentReach(stats?.total ?? null);
      return;
    }
    setReachLoading(true);
    const controller = new AbortController();
    fetch(`/api/push/subscribers?activeWithinDays=${form.segment}`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((json) => { if (json.success) setSegmentReach(json.data.segmentReach); })
      .catch(() => {})
      .finally(() => setReachLoading(false));
    return () => controller.abort();
  }, [form.segment, stats?.total]);

  // ── Cloudinary banner upload ───────────────────────────────────────────────

  const openBannerUpload = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cld = (window as any).cloudinary;
    if (!cld || !CLOUD_NAME || !UPLOAD_PRESET) { addToast("Cloudinary not configured", "error"); return; }
    const w = cld.createUploadWidget(
      {
        cloudName: CLOUD_NAME,
        uploadPreset: UPLOAD_PRESET,
        sources: ["local", "url"],
        multiple: false,
        maxFiles: 1,
        resourceType: "image",
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
        maxFileSize: 5000000,
        folder: "shahibulawa/push",
        theme: "minimal",
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err: any, res: any) => {
        if (err) { addToast(`Upload failed: ${err.message ?? "error"}`, "error"); return; }
        if (res?.event === "success" && res.info?.secure_url) {
          setForm((f) => ({ ...f, bannerImageUrl: res.info.secure_url }));
        }
      }
    );
    w.open();
  }, [addToast]);

  // ── Save / Send ────────────────────────────────────────────────────────────

  const buildPayload = () => ({
    heading: form.heading,
    description: form.description,
    bannerImageUrl: form.bannerImageUrl,
    iconUrl: form.iconUrl,
    ctaLabel: form.ctaLabel,
    ctaUrl: form.ctaUrl,
    segment: { activeWithinDays: form.segment === "all" ? null : parseInt(form.segment, 10) },
  });

  const handleSaveDraft = async () => {
    if (!form.heading.trim()) { addToast("Heading is required", "error"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/push/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      addToast("Draft saved!", "success");
      setForm(EMPTY_FORM);
      setView("subscribers");
      fetchCampaigns();
    } catch (e) {
      addToast(e instanceof Error ? e.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSendNow = async () => {
    if (!form.heading.trim()) { addToast("Heading is required", "error"); return; }
    if (!confirm(`Send to ~${segmentReach ?? "?"} subscribers now?`)) return;
    setSaving(true);
    try {
      const createRes = await fetch("/api/push/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const createJson = await createRes.json();
      if (!createJson.success) throw new Error(createJson.error);

      const sendRes = await fetch(`/api/push/campaigns/${createJson.data._id}/send`, { method: "POST" });
      const sendJson = await sendRes.json();
      if (!sendJson.success) throw new Error(sendJson.error);

      addToast(`Sending to ${sendJson.data.targetCount} subscribers…`, "success");
      setForm(EMPTY_FORM);
      setView("subscribers");
      fetchCampaigns();
    } catch (e) {
      addToast(e instanceof Error ? e.message : "Send failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSendDraft = async (campaign: Campaign) => {
    if (!confirm(`Send "${campaign.heading}" to ~${stats?.total ?? "?"} subscribers?`)) return;
    setSending(campaign._id);
    try {
      const res = await fetch(`/api/push/campaigns/${campaign._id}/send`, { method: "POST" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      addToast(`Sending to ${json.data.targetCount} subscribers…`, "success");
      fetchCampaigns();
    } catch (e) {
      addToast(e instanceof Error ? e.message : "Send failed", "error");
    } finally {
      setSending(null);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────

  const fmtDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" }) : "—";

  const openRate = (c: Campaign) =>
    c.delivered_count > 0 ? `${((c.opened_count / c.delivered_count) * 100).toFixed(1)}%` : "—";

  const segmentLabel = (c: Campaign) =>
    c.segment.activeWithinDays ? `Active ≤ ${c.segment.activeWithinDays}d` : "All active";

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <Script
        src="https://upload-widget.cloudinary.com/global/all.js"
        strategy="lazyOnload"
        onLoad={() => { cloudinaryLoaded.current = true; }}
      />

      <style>{`
        /* ── Stat cards ── */
        .nt-stats { display:grid; grid-template-columns:repeat(auto-fill,minmax(175px,1fr)); gap:1rem; margin-bottom:2rem; }
        .nt-stat { background:#1C1916; border:1px solid rgba(201,169,110,0.12); border-radius:12px; padding:1.25rem 1.375rem; }
        .nt-stat__val { font-size:2rem; font-weight:700; color:#EDE5D8; line-height:1; margin-bottom:4px; font-family:var(--font-heading,Georgia,serif); }
        .nt-stat__label { font-size:0.72rem; color:#8a7a6a; text-transform:uppercase; letter-spacing:.05em; }
        .nt-stat--highlight { border-color:rgba(201,169,110,0.35); }
        .nt-stat--highlight .nt-stat__val { color:#C9A96E; }

        /* ── Country / device ── */
        .nt-section-title { font-size:0.72rem; font-weight:600; color:#6a5a4a; text-transform:uppercase; letter-spacing:.08em; margin:0 0 0.75rem; }
        .nt-country-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:0.5rem; margin-bottom:1.5rem; }
        .nt-country-item { display:flex; justify-content:space-between; background:#1C1916; border:1px solid rgba(201,169,110,0.08); border-radius:8px; padding:0.5rem 0.875rem; font-size:0.8125rem; }
        .nt-country-item__name { color:#8a7a6a; }
        .nt-country-item__count { font-weight:600; color:#EDE5D8; }
        .nt-devices { display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:2rem; }
        .nt-device-pill { background:#1C1916; border:1px solid rgba(201,169,110,0.1); border-radius:20px; padding:4px 14px; font-size:0.75rem; color:#8a7a6a; }
        .nt-device-pill strong { color:#EDE5D8; }

        /* ── Campaign summary badges ── */
        .nt-badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:0.7rem; font-weight:600; letter-spacing:.03em; text-transform:uppercase; }
        .nt-badge--draft { background:rgba(255,255,255,0.05); color:#6a5a4a; border:1px solid rgba(255,255,255,0.07); }
        .nt-badge--sending { background:rgba(212,168,77,0.12); color:#D4B87A; border:1px solid rgba(212,168,77,0.2); }
        .nt-badge--sent { background:rgba(34,197,94,0.1); color:#4ade80; border:1px solid rgba(34,197,94,0.15); }

        /* ── Compose form (ec-* style adapted for admin context) ── */
        .nt-compose-wrap { display:flex; gap:2.5rem; align-items:flex-start; }
        .nt-form { flex:7 1 0; min-width:0; display:flex; flex-direction:column; gap:1.25rem; }
        .nt-field { display:flex; flex-direction:column; gap:0.375rem; }
        .nt-label { font-size:0.8rem; font-weight:600; color:#a09080; letter-spacing:.03em; }
        .nt-label-hint { font-size:0.75rem; font-weight:400; color:#5a4a3a; }
        .nt-req { color:#C9A96E; }
        .nt-input { background:#1C1916; border:1px solid rgba(201,169,110,0.15); border-radius:8px; color:#EDE5D8; font-size:0.875rem; padding:0.6rem 0.75rem; outline:none; width:100%; transition:border-color .2s, box-shadow .2s; font-family:inherit; box-sizing:border-box; }
        .nt-input:focus { border-color:rgba(201,169,110,0.5); box-shadow:0 0 0 3px rgba(201,169,110,0.08); }
        .nt-input::placeholder { color:#3a2a1a; }
        .nt-textarea { resize:vertical; min-height:76px; font-family:inherit; }
        .nt-hint { font-size:0.72rem; color:#5a4a3a; margin-top:2px; }
        .nt-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
        @media(max-width:600px){ .nt-grid2 { grid-template-columns:1fr; } }

        /* ── Banner upload zone ── */
        .nt-upload-zone { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:0.5rem; width:100%; padding:1.25rem; background:#1C1916; border:1.5px dashed rgba(201,169,110,0.25); border-radius:10px; color:#a09080; cursor:pointer; transition:all .2s; font-family:inherit; text-align:center; }
        .nt-upload-zone:hover { border-color:#C9A96E; color:#C9A96E; }
        .nt-upload-hint { font-size:0.72rem; color:#5a4a3a; }
        .nt-banner-thumb { width:80px; height:52px; border-radius:8px; object-fit:cover; border:1px solid rgba(201,169,110,0.2); background:#1C1916; flex-shrink:0; }
        .nt-banner-row { display:flex; gap:0.75rem; align-items:flex-start; }
        .nt-banner-actions { flex:1; display:flex; flex-direction:column; gap:0.5rem; }
        .nt-paste-btn { background:transparent; border:1px solid rgba(201,169,110,0.2); color:#a09080; padding:0.3rem 0.65rem; border-radius:6px; font-size:0.775rem; cursor:pointer; font-family:inherit; transition:all .15s; }
        .nt-paste-btn:hover { border-color:#C9A96E; color:#C9A96E; }

        /* ── Segment selector ── */
        .nt-segment-opts { display:flex; gap:0.5rem; flex-wrap:wrap; }
        .nt-segment-opt { display:flex; align-items:center; background:#1C1916; border:1px solid rgba(201,169,110,0.15); border-radius:8px; padding:0.5rem 0.875rem; cursor:pointer; font-size:0.8125rem; color:#8a7a6a; transition:all .15s; user-select:none; }
        .nt-segment-opt--active { border-color:rgba(201,169,110,0.5); color:#C9A96E; background:rgba(201,169,110,0.07); font-weight:600; }

        /* ── Compose action buttons ── */
        .nt-compose-actions { display:flex; gap:0.75rem; padding-top:0.25rem; border-top:1px solid rgba(201,169,110,0.1); margin-top:0.25rem; }
        .nt-send-btn { background:linear-gradient(135deg,#C9A96E,#D4B87A); color:#0A0807; border:none; padding:0.6rem 1.5rem; border-radius:8px; font-size:0.875rem; font-weight:700; cursor:pointer; transition:opacity .15s; font-family:inherit; }
        .nt-send-btn:hover:not(:disabled) { opacity:0.9; }
        .nt-send-btn:disabled { opacity:0.5; cursor:not-allowed; }
        .nt-draft-btn { background:transparent; border:1px solid rgba(201,169,110,0.2); color:#a09080; padding:0.6rem 1.25rem; border-radius:8px; font-size:0.875rem; cursor:pointer; font-family:inherit; transition:all .15s; }
        .nt-draft-btn:hover:not(:disabled) { border-color:#C9A96E; color:#C9A96E; }
        .nt-draft-btn:disabled { opacity:0.5; cursor:not-allowed; }

        /* ── Live preview card ── */
        .nt-preview-col { flex:4 1 0; min-width:200px; position:sticky; top:1.5rem; }
        .nt-preview { background:#1a1a2e; border-radius:14px; padding:16px; color:#fff; }
        .nt-preview__label { font-size:10px; color:#888; margin:0 0 10px; letter-spacing:.05em; text-transform:uppercase; }
        .nt-preview__banner { width:100%; border-radius:8px; object-fit:cover; max-height:120px; margin-bottom:10px; background:#2a2a3e; display:block; }
        .nt-preview__icon-row { display:flex; align-items:center; gap:8px; margin-bottom:6px; }
        .nt-preview__icon { width:28px; height:28px; border-radius:6px; object-fit:cover; background:#3a3a5e; display:flex; align-items:center; justify-content:center; font-size:14px; flex-shrink:0; }
        .nt-preview__app { font-size:11px; color:#aaa; }
        .nt-preview__heading { font-size:14px; font-weight:600; margin:0 0 4px; font-family:var(--font-heading,Georgia,serif); }
        .nt-preview__desc { font-size:12px; color:#ccc; margin:0 0 10px; }
        .nt-preview__cta { display:inline-block; background:#C9A96E; color:#0A0807; border-radius:6px; padding:5px 12px; font-size:11px; font-weight:700; }

        /* ── Summary table empty / skeleton ── */
        .nt-btn-sm { padding:4px 12px; font-size:0.75rem; background:linear-gradient(135deg,#C9A96E,#D4B87A); color:#0A0807; border:none; border-radius:6px; cursor:pointer; font-weight:600; font-family:inherit; }
        .nt-btn-sm:disabled { opacity:.5; cursor:not-allowed; }

        @media(max-width:900px){ .nt-compose-wrap { flex-direction:column; flex-wrap:wrap; } .nt-preview-col { flex:none; width:100%; max-width:320px; position:static; } }
      `}</style>

      {/* ── Page header ── */}
      <header className="admin-header">
        <div>
          <h1 className="admin-header__title">Push Notifications</h1>
          <p className="admin-header__sub">
            {view === "subscribers"
              ? `${stats?.total ?? "—"} active subscribers · ${campaigns.length} campaigns`
              : "Create and send a push notification"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {view === "subscribers" && (
            <button
              className="admin-btn admin-btn--ghost"
              onClick={() => { fetchStats(); fetchCampaigns(); }}
              disabled={statsLoading || campaignsLoading}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
              </svg>
              Refresh
            </button>
          )}
          {view === "subscribers" ? (
            <button className="admin-btn admin-btn--primary" onClick={() => setView("compose")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Notification
            </button>
          ) : (
            <button className="admin-btn admin-btn--ghost" onClick={() => setView("subscribers")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Back
            </button>
          )}
        </div>
      </header>

      {/* ── Subscribers view ── */}
      {view === "subscribers" && (
        <>
          {/* Stat cards */}
          {statsLoading ? (
            <div className="nt-stats">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="nt-stat" style={{ height: 86 }}>
                  <div className="admin-skeleton-row" style={{ height: 28, marginBottom: 8, borderRadius: 6 }} />
                  <div className="admin-skeleton-row" style={{ height: 12, width: "70%", borderRadius: 4 }} />
                </div>
              ))}
            </div>
          ) : stats ? (
            <>
              <div className="nt-stats">
                <div className="nt-stat nt-stat--highlight">
                  <div className="nt-stat__val">{(stats.total ?? 0).toLocaleString()}</div>
                  <div className="nt-stat__label">Total subscribers</div>
                </div>
                <div className="nt-stat">
                  <div className="nt-stat__val">{(stats.active7 ?? 0).toLocaleString()}</div>
                  <div className="nt-stat__label">Active 7 days</div>
                </div>
                <div className="nt-stat">
                  <div className="nt-stat__val">{(stats.active30 ?? 0).toLocaleString()}</div>
                  <div className="nt-stat__label">Active 30 days</div>
                </div>
                <div className="nt-stat">
                  <div className="nt-stat__val">{(stats.active60 ?? 0).toLocaleString()}</div>
                  <div className="nt-stat__label">Active 60 days</div>
                </div>
                <div className="nt-stat">
                  <div className="nt-stat__val">{(stats.active90 ?? 0).toLocaleString()}</div>
                  <div className="nt-stat__label">Active 90 days</div>
                </div>
              </div>
            </>
          ) : (
            <div className="admin-empty" style={{ marginBottom: "2rem" }}>
              <p>No subscriber data yet.</p>
            </div>
          )}

          {/* Campaign Summary */}
          <p className="nt-section-title" style={{ marginTop: "0.5rem" }}>Campaign Summary</p>

          {campaignsLoading ? (
            <div className="admin-skeletons">
              {[...Array(3)].map((_, i) => <div key={i} className="admin-skeleton-row" />)}
            </div>
          ) : campaigns.length === 0 ? (
            <div className="admin-empty">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 8h1a4 4 0 010 8h-1" />
                <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
                <line x1="6" y1="1" x2="6" y2="4" />
                <line x1="10" y1="1" x2="10" y2="4" />
                <line x1="14" y1="1" x2="14" y2="4" />
              </svg>
              <p>No campaigns yet. Click <strong>New Notification</strong> to send your first push.</p>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Notification</th>
                    <th>Audience</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Targeted</th>
                    <th style={{ textAlign: "right" }}>Delivered</th>
                    <th style={{ textAlign: "right" }}>Open Rate</th>
                    <th>Sent</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c) => (
                    <tr
                      key={c._id}
                      className="admin-table__row admin-table__row--clickable"
                      onClick={() => router.push(`/admin/campaigns/${c._id}`)}
                    >
                      <td>
                        <p className="admin-card-name">{c.heading}</p>
                        {c.description && (
                          <p className="admin-card-slug" style={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {c.description}
                          </p>
                        )}
                      </td>
                      <td>
                        <span className="admin-card-slug" style={{ fontSize: "0.8rem", color: "#8a7a6a" }}>
                          {segmentLabel(c)}
                        </span>
                      </td>
                      <td>
                        <span className={`nt-badge nt-badge--${c.status}`}>
                          {c.status === "sending" ? "Sending…" : c.status}
                        </span>
                      </td>
                      <td style={{ textAlign: "right", color: "#8a7a6a" }}>{c.target_count.toLocaleString()}</td>
                      <td style={{ textAlign: "right", color: "#EDE5D8", fontWeight: 500 }}>{c.delivered_count.toLocaleString()}</td>
                      <td style={{ textAlign: "right", fontWeight: 600, color: c.opened_count > 0 ? "#4ade80" : "#5a4a3a" }}>
                        {openRate(c)}
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <span className="admin-card-slug" style={{ fontSize: "0.8rem" }}>{fmtDate(c.sent_at)}</span>
                      </td>
                      <td>
                        {c.status === "draft" && (
                          <button
                            className="nt-btn-sm"
                            onClick={(e) => { e.stopPropagation(); handleSendDraft(c); }}
                            disabled={sending === c._id}
                          >
                            {sending === c._id ? "…" : "Send"}
                          </button>
                        )}
                        {c.status === "sending" && (
                          <span style={{ fontSize: 12, color: "#D4B87A" }}>⏳</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── Compose view ── */}
      {view === "compose" && (
        <div className="nt-compose-wrap">

          {/* Form */}
          <div className="nt-form">

            <div className="nt-field">
              <label className="nt-label">Heading <span className="nt-req">*</span></label>
              <input
                className="nt-input"
                value={form.heading}
                onChange={(e) => setForm((f) => ({ ...f, heading: e.target.value }))}
                placeholder="✨ New Luxury Collection Arrived!"
                maxLength={80}
              />
            </div>

            <div className="nt-field">
              <label className="nt-label">Description</label>
              <textarea
                className="nt-input nt-textarea"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Explore our latest designs — hand-crafted for your special day."
                maxLength={200}
              />
            </div>

            <div className="nt-field">
              <label className="nt-label">
                Banner Image <span className="nt-label-hint">(optional)</span>
              </label>
              {form.bannerImageUrl ? (
                <div className="nt-banner-row">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.bannerImageUrl} alt="Banner" className="nt-banner-thumb" />
                  <div className="nt-banner-actions">
                    <button className="nt-paste-btn" onClick={openBannerUpload} type="button">
                      Replace via Cloudinary
                    </button>
                    <button
                      className="nt-paste-btn"
                      onClick={() => setForm((f) => ({ ...f, bannerImageUrl: "" }))}
                      type="button"
                      style={{ color: "#f87171", borderColor: "rgba(220,38,38,.25)" }}
                    >
                      ✕ Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button className="nt-upload-zone" onClick={openBannerUpload} type="button">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span>Click to upload banner</span>
                  <span className="nt-upload-hint">JPG, PNG, WebP — max 5 MB</span>
                </button>
              )}
              {!form.bannerImageUrl && (
                <input
                  className="nt-input"
                  value={form.bannerImageUrl}
                  onChange={(e) => setForm((f) => ({ ...f, bannerImageUrl: e.target.value }))}
                  placeholder="…or paste image URL"
                  style={{ marginTop: 6, fontSize: "0.8rem" }}
                />
              )}
            </div>

            <div className="nt-grid2">
              <div className="nt-field">
                <label className="nt-label">CTA Label</label>
                <input
                  className="nt-input"
                  value={form.ctaLabel}
                  onChange={(e) => setForm((f) => ({ ...f, ctaLabel: e.target.value }))}
                  placeholder="Shop Now"
                />
              </div>
              <div className="nt-field">
                <label className="nt-label">
                  CTA URL <span className="nt-label-hint">(blank = homepage)</span>
                </label>
                <input
                  className="nt-input"
                  value={form.ctaUrl}
                  onChange={(e) => setForm((f) => ({ ...f, ctaUrl: e.target.value }))}
                  placeholder="https://shahibulawa.com/cards"
                />
              </div>
            </div>

            <div className="nt-field">
              <label className="nt-label">Audience</label>
              <div className="nt-segment-opts">
                {([
                  { value: "all", label: "All active" },
                  { value: "7",  label: "≤ 7 days" },
                  { value: "30", label: "≤ 30 days" },
                  { value: "60", label: "≤ 60 days" },
                  { value: "90", label: "≤ 90 days" },
                ] as const).map((opt) => (
                  <label
                    key={opt.value}
                    className={`nt-segment-opt ${form.segment === opt.value ? "nt-segment-opt--active" : ""}`}
                  >
                    <input
                      type="radio"
                      name="segment"
                      value={opt.value}
                      checked={form.segment === opt.value}
                      onChange={() => setForm((f) => ({ ...f, segment: opt.value }))}
                      style={{ display: "none" }}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
              <p className="nt-hint" style={{ marginTop: 8 }}>
                Estimated reach:{" "}
                {reachLoading ? (
                  <span style={{ color: "#8a7a6a" }}>calculating…</span>
                ) : segmentReach !== null ? (
                  <strong style={{ color: "#C9A96E" }}>{segmentReach.toLocaleString()} subscribers</strong>
                ) : "—"}
              </p>
            </div>

            <div className="nt-compose-actions">
              <button className="nt-send-btn" onClick={handleSendNow} disabled={saving}>
                {saving ? "Sending…" : "Send Now"}
              </button>
              <button className="nt-draft-btn" onClick={handleSaveDraft} disabled={saving}>
                Save Draft
              </button>
            </div>
          </div>

          {/* Live preview */}
          <div className="nt-preview-col">
            <p className="nt-section-title" style={{ marginBottom: 12 }}>Live Preview</p>
            <div className="nt-preview">
              <p className="nt-preview__label">Browser notification</p>
              {form.bannerImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.bannerImageUrl} alt="" className="nt-preview__banner" />
              )}
              <div className="nt-preview__icon-row">
                {form.iconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.iconUrl} alt="" className="nt-preview__icon" style={{ objectFit: "cover" }} />
                ) : (
                  <div className="nt-preview__icon">💍</div>
                )}
                <span className="nt-preview__app">Shahi Bulawa</span>
              </div>
              <p className="nt-preview__heading">{form.heading || "Your heading here"}</p>
              <p className="nt-preview__desc">{form.description || "Your description here"}</p>
              <span className="nt-preview__cta">{form.ctaLabel || "View Now"}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
