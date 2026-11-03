'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Campaign {
  _id: string;
  heading: string;
  description: string;
  bannerImageUrl: string;
  iconUrl: string;
  ctaLabel: string;
  ctaUrl: string;
  segment: { activeWithinDays: number | null };
  status: 'draft' | 'sending' | 'sent';
  target_count: number;
  delivered_count: number;
  opened_count: number;
  sent_at: string | null;
  created_at: string;
}

interface Stats {
  target: number;
  delivered: number;
  opened: number;
  openRate: number;
}

interface Delivery {
  _id: string;
  delivered: boolean;
  opened: boolean;
  delivered_at: string | null;
  opened_at: string | null;
  subscription: {
    deviceType: string;
    os: string;
    browser: string;
    pushEnabled: boolean;
    language: string;
    timezone: string;
    subscribed_page: string;
    referrer: string;
    geo: { country: string; region: string; city: string };
    last_seen: string;
    status: string;
  } | null;
}

interface Filters {
  browsers: string[];
  oses: string[];
  countries: string[];
}

type SegmentOption = 'all' | '30' | '60' | '90';

interface FollowUpForm {
  heading: string;
  description: string;
  bannerImageUrl: string;
  ctaLabel: string;
  ctaUrl: string;
  segment: SegmentOption;
}

const EMPTY_FILTERS: Filters = { browsers: [], oses: [], countries: [] };

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' });
}

function segmentLabel(c: Campaign) {
  return c.segment.activeWithinDays ? `Active ≤ ${c.segment.activeWithinDays}d` : 'All active';
}

function segmentFromDays(days: number | null): SegmentOption {
  if (days === 30) return '30';
  if (days === 60) return '60';
  if (days === 90) return '90';
  return 'all';
}

function toggle(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
}

function unique(vals: (string | undefined)[]): string[] {
  return [...new Set(vals.filter(Boolean) as string[])].sort();
}

function activeCount(f: Filters) {
  return f.browsers.length + f.oses.length + f.countries.length;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <section className="cd-card">
      <h2 className="cd-card__title"><span>{icon}</span> {title}</h2>
      {children}
    </section>
  );
}

function Field({ label, value, mono }: { label: string; value?: React.ReactNode; mono?: boolean }) {
  return (
    <div className="cd-field">
      <span className="cd-field__label">{label}</span>
      <span className={`cd-field__value${mono ? ' cd-field__value--mono' : ''}`}>{value ?? '—'}</span>
    </div>
  );
}

// ─── Filter Drawer ─────────────────────────────────────────────────────────────

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  deliveries: Delivery[];
  pending: Filters;
  setPending: React.Dispatch<React.SetStateAction<Filters>>;
  onApply: () => void;
  onClear: () => void;
}

function FilterDrawer({ open, onClose, deliveries, pending, setPending, onApply, onClear }: FilterDrawerProps) {
  const browsers  = useMemo(() => unique(deliveries.map((d) => d.subscription?.browser)), [deliveries]);
  const oses      = useMemo(() => unique(deliveries.map((d) => d.subscription?.os)), [deliveries]);
  const countries = useMemo(() => unique(deliveries.map((d) => d.subscription?.geo?.country)), [deliveries]);

  return (
    <>
      <div className={`cd-drawer-backdrop${open ? ' cd-drawer-backdrop--open' : ''}`} onClick={onClose} />
      <aside className={`cd-drawer${open ? ' cd-drawer--open' : ''}`} aria-label="Delivery filters">
        <div className="cd-drawer__header">
          <span className="cd-drawer__title">Filter Deliveries</span>
          <button className="cd-drawer__close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="cd-drawer__body">
          {([
            { label: 'Browser', key: 'browsers' as const, options: browsers },
            { label: 'OS',      key: 'oses'     as const, options: oses },
            { label: 'Country', key: 'countries' as const, options: countries },
          ]).map(({ label, key, options }) => (
            <div key={key} className="cd-drawer__group">
              <p className="cd-drawer__group-label">{label}</p>
              {options.length === 0
                ? <p className="cd-drawer__empty">No data</p>
                : options.map((opt) => (
                  <label key={opt} className="cd-drawer__option">
                    <input
                      type="checkbox"
                      className="cd-drawer__checkbox"
                      checked={pending[key].includes(opt)}
                      onChange={() => setPending((f) => ({ ...f, [key]: toggle(f[key], opt) }))}
                    />
                    <span className="cd-drawer__option-label">{opt}</span>
                  </label>
                ))
              }
            </div>
          ))}
        </div>
        <div className="cd-drawer__footer">
          <button className="cd-drawer__clear" onClick={onClear}>Clear all</button>
          <button className="cd-drawer__apply" onClick={onApply}>Apply</button>
        </div>
      </aside>
    </>
  );
}

// ─── Follow-up Drawer ──────────────────────────────────────────────────────────

interface FollowUpDrawerProps {
  open: boolean;
  onClose: () => void;
  form: FollowUpForm;
  setForm: React.Dispatch<React.SetStateAction<FollowUpForm>>;
  onSend: () => void;
  sending: boolean;
}

function FollowUpDrawer({ open, onClose, form, setForm, onSend, sending }: FollowUpDrawerProps) {
  const SEGMENTS: { value: SegmentOption; label: string }[] = [
    { value: 'all', label: 'All active' },
    { value: '30',  label: '≤ 30 days' },
    { value: '60',  label: '≤ 60 days' },
    { value: '90',  label: '≤ 90 days' },
  ];

  return (
    <>
      <div className={`cd-drawer-backdrop${open ? ' cd-drawer-backdrop--open' : ''}`} onClick={onClose} />
      <aside className={`cd-drawer${open ? ' cd-drawer--open' : ''}`} aria-label="Send follow-up">
        <div className="cd-drawer__header">
          <span className="cd-drawer__title">Send Follow-up</span>
          <button className="cd-drawer__close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="cd-drawer__body">
          <div className="cd-fu-field">
            <label className="cd-fu-label">Heading <span className="cd-fu-req">*</span></label>
            <input
              className="cd-fu-input"
              value={form.heading}
              onChange={(e) => setForm((f) => ({ ...f, heading: e.target.value }))}
              placeholder="Follow-up heading"
              maxLength={80}
            />
          </div>

          <div className="cd-fu-field">
            <label className="cd-fu-label">Description</label>
            <textarea
              className="cd-fu-input cd-fu-textarea"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Follow-up message"
              maxLength={200}
            />
          </div>

          <div className="cd-fu-field">
            <label className="cd-fu-label">Banner URL <span className="cd-fu-hint">(optional)</span></label>
            <input
              className="cd-fu-input"
              value={form.bannerImageUrl}
              onChange={(e) => setForm((f) => ({ ...f, bannerImageUrl: e.target.value }))}
              placeholder="https://…"
            />
          </div>

          <div className="cd-fu-grid2">
            <div className="cd-fu-field">
              <label className="cd-fu-label">CTA Label</label>
              <input
                className="cd-fu-input"
                value={form.ctaLabel}
                onChange={(e) => setForm((f) => ({ ...f, ctaLabel: e.target.value }))}
                placeholder="View Now"
              />
            </div>
            <div className="cd-fu-field">
              <label className="cd-fu-label">CTA URL</label>
              <input
                className="cd-fu-input"
                value={form.ctaUrl}
                onChange={(e) => setForm((f) => ({ ...f, ctaUrl: e.target.value }))}
                placeholder="https://…"
              />
            </div>
          </div>

          <div className="cd-fu-field">
            <label className="cd-fu-label">Audience</label>
            <div className="cd-fu-segments">
              {SEGMENTS.map((s) => (
                <label
                  key={s.value}
                  className={`cd-fu-seg${form.segment === s.value ? ' cd-fu-seg--active' : ''}`}
                >
                  <input
                    type="radio"
                    name="fu-segment"
                    value={s.value}
                    checked={form.segment === s.value}
                    onChange={() => setForm((f) => ({ ...f, segment: s.value }))}
                    style={{ display: 'none' }}
                  />
                  {s.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="cd-drawer__footer">
          <button className="cd-drawer__clear" onClick={onClose} disabled={sending}>Cancel</button>
          <button className="cd-drawer__apply" onClick={onSend} disabled={sending}>
            {sending ? 'Sending…' : 'Send Now'}
          </button>
        </div>
      </aside>
    </>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CampaignDetailPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const router = useRouter();

  const [campaign, setCampaign]     = useState<Campaign | null>(null);
  const [stats, setStats]           = useState<Stats | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  // Toast
  const [toast, setToast]           = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const toastTimer                  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  // Filter drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [applied, setApplied]       = useState<Filters>(EMPTY_FILTERS);
  const [pending, setPending]       = useState<Filters>(EMPTY_FILTERS);

  // Follow-up drawer
  const [fuOpen, setFuOpen]         = useState(false);
  const [fuSending, setFuSending]   = useState(false);
  const [fuForm, setFuForm]         = useState<FollowUpForm>({
    heading: '', description: '', bannerImageUrl: '', ctaLabel: 'View Now', ctaUrl: '', segment: 'all',
  });

  const fetchCampaign = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/push/campaigns/${campaignId}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? 'Failed to load campaign');
      setCampaign(json.data.campaign);
      setStats(json.data.stats);
      setDeliveries(json.data.deliveries ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load campaign');
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => { fetchCampaign(); }, [fetchCampaign]);

  // Pre-fill follow-up form from campaign
  const openFollowUp = () => {
    if (!campaign) return;
    setFuForm({
      heading:       campaign.heading,
      description:   campaign.description,
      bannerImageUrl: campaign.bannerImageUrl,
      ctaLabel:      campaign.ctaLabel,
      ctaUrl:        campaign.ctaUrl,
      segment:       segmentFromDays(campaign.segment.activeWithinDays),
    });
    setFuOpen(true);
  };

  const sendFollowUp = async () => {
    if (!fuForm.heading.trim()) { showToast('Heading is required', 'error'); return; }
    setFuSending(true);
    try {
      const createRes = await fetch('/api/push/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heading:       fuForm.heading,
          description:   fuForm.description,
          bannerImageUrl: fuForm.bannerImageUrl,
          ctaLabel:      fuForm.ctaLabel,
          ctaUrl:        fuForm.ctaUrl,
          segment: { activeWithinDays: fuForm.segment === 'all' ? null : parseInt(fuForm.segment, 10) },
        }),
      });
      const createJson = await createRes.json();
      if (!createJson.success) throw new Error(createJson.error);

      const sendRes = await fetch(`/api/push/campaigns/${createJson.data._id}/send`, { method: 'POST' });
      const sendJson = await sendRes.json();
      if (!sendJson.success) throw new Error(sendJson.error);

      showToast(`Follow-up sent to ${sendJson.data.targetCount} subscribers`, 'success');
      setFuOpen(false);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Send failed', 'error');
    } finally {
      setFuSending(false);
    }
  };

  // Filter drawer
  const openDrawer = () => { setPending(applied); setDrawerOpen(true); };
  const applyFilters = () => { setApplied(pending); setDrawerOpen(false); };
  const clearFilters = () => { setPending(EMPTY_FILTERS); setApplied(EMPTY_FILTERS); setDrawerOpen(false); };

  // Client-side filtering
  const filtered = useMemo(() => deliveries.filter((d) => {
    const sub = d.subscription;
    if (applied.browsers.length  > 0 && !applied.browsers.includes(sub?.browser ?? ''))          return false;
    if (applied.oses.length      > 0 && !applied.oses.includes(sub?.os ?? ''))                   return false;
    if (applied.countries.length > 0 && !applied.countries.includes(sub?.geo?.country ?? ''))    return false;
    return true;
  }), [deliveries, applied]);

  const filtersActive = activeCount(applied);

  const removeChip = (key: keyof Filters, val: string) =>
    setApplied((f) => ({ ...f, [key]: f[key].filter((x) => x !== val) }));


  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0d0b09; }

        /* ── Layout ── */
        .cd-page { min-height: 100vh; background: #0d0b09; color: #e8ddd0;
          font-family: 'Inter', system-ui, sans-serif; padding: 1.5rem; }
        .cd-page--center { display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .cd-wrap { max-width: 1400px; margin: 0 auto; }
        .cd-topbar { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
        .cd-back { display: inline-flex; align-items: center; gap: 0.4rem; background: transparent;
          border: 1px solid rgba(201,169,110,0.18); color: #a09080; padding: 0.45rem 1rem;
          border-radius: 7px; font-size: 0.8rem; cursor: pointer; font-family: inherit;
          transition: all .15s; }
        .cd-back:hover { border-color: #C9A96E; color: #C9A96E; }
        .cd-followup-btn { display: inline-flex; align-items: center; gap: 0.4rem;
          background: linear-gradient(135deg,#C9A96E,#D4B87A); color: #0A0807;
          border: none; padding: 0.45rem 1rem; border-radius: 7px; font-size: 0.8rem;
          font-weight: 700; cursor: pointer; font-family: inherit; transition: opacity .15s; margin-left: auto; }
        .cd-followup-btn:hover { opacity: 0.88; }

        /* ── Preview + stats side-by-side ── */
        .cd-top { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.75rem; }
        .cd-preview-outer { background: #1C1916; border: 1px solid rgba(201,169,110,0.14);
          border-radius: 14px; padding: 1.5rem; }
        .cd-preview-title { font-size: 0.7rem; font-weight: 600; color: #5a4a3a;
          text-transform: uppercase; letter-spacing: .08em; margin: 0 0 1rem; }
        .cd-preview { background: #1a1a2e; border-radius: 14px; padding: 16px; color: #fff; width: 100%; }
        .cd-preview__banner { width: 100%; border-radius: 8px; object-fit: cover;
          max-height: 120px; margin-bottom: 10px; background: #2a2a3e; display: block; }
        .cd-preview__icon-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
        .cd-preview__icon { width: 28px; height: 28px; border-radius: 6px; object-fit: cover;
          background: #3a3a5e; display: flex; align-items: center; justify-content: center;
          font-size: 14px; flex-shrink: 0; }
        .cd-preview__app { font-size: 11px; color: #aaa; }
        .cd-preview__heading { font-size: 14px; font-weight: 600; margin: 0 0 4px;
          font-family: var(--font-heading, Georgia, serif); }
        .cd-preview__desc { font-size: 12px; color: #ccc; margin: 0 0 10px; }
        .cd-preview__cta { display: inline-block; background: #C9A96E; color: #0A0807;
          border-radius: 6px; padding: 5px 12px; font-size: 11px; font-weight: 700; }

        /* ── Stats grids ── */
        .cd-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; align-content: start; }
        .cd-stat { background: #1C1916; border: 1px solid rgba(201,169,110,0.12);
          border-radius: 12px; padding: 1.125rem 1.25rem; }
        .cd-stat--highlight { border-color: rgba(201,169,110,0.35); }
        .cd-stat__val { font-size: 1.75rem; font-weight: 700; color: #EDE5D8; line-height: 1;
          margin-bottom: 4px; font-family: var(--font-heading, Georgia, serif); }
        .cd-stat--highlight .cd-stat__val { color: #C9A96E; }
        .cd-stat__label { font-size: 0.7rem; color: #6a5a4a; text-transform: uppercase; letter-spacing: .05em; }
        @media (max-width: 700px) { .cd-top { grid-template-columns: 1fr; } }

        /* ── Status badge ── */
        .cd-badge { display: inline-block; padding: 3px 10px; border-radius: 20px;
          font-size: 0.7rem; font-weight: 600; letter-spacing: .03em; text-transform: uppercase; }
        .cd-badge--draft   { background: rgba(255,255,255,.05); color: #6a5a4a; border: 1px solid rgba(255,255,255,.07); }
        .cd-badge--sending { background: rgba(212,168,77,.12); color: #D4B87A; border: 1px solid rgba(212,168,77,.2); }
        .cd-badge--sent    { background: rgba(34,197,94,.1); color: #4ade80; border: 1px solid rgba(34,197,94,.15); }

        /* ── Detail cards ── */
        .cd-card { background: #1C1916; border: 1px solid rgba(201,169,110,0.12);
          border-radius: 12px; padding: 1.375rem 1.5rem; margin-bottom: 1.25rem; }
        .cd-card__title { font-size: 0.72rem; font-weight: 600; color: #6a5a4a;
          text-transform: uppercase; letter-spacing: .08em; margin: 0 0 1.1rem;
          display: flex; align-items: center; gap: 0.5rem; }
        .cd-card__title-actions { margin-left: auto; display: flex; align-items: center; gap: 0.5rem; }
        .cd-fields { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 0.75rem 1.5rem; }
        .cd-field { display: flex; flex-direction: column; gap: 3px; }
        .cd-field__label { font-size: 0.7rem; color: #5a4a3a; text-transform: uppercase; letter-spacing: .05em; }
        .cd-field__value { font-size: 0.875rem; color: #EDE5D8; }
        .cd-field__value--mono { font-family: monospace; font-size: 0.8rem; word-break: break-all; }

        /* ── Filter button + chips ── */
        .cd-filter-btn { display: inline-flex; align-items: center; gap: 0.35rem;
          background: transparent; border: 1px solid rgba(201,169,110,0.2); color: #a09080;
          padding: 0.3rem 0.75rem; border-radius: 6px; font-size: 0.75rem; cursor: pointer;
          font-family: inherit; transition: all .15s; }
        .cd-filter-btn:hover { border-color: #C9A96E; color: #C9A96E; }
        .cd-filter-btn--active { border-color: rgba(201,169,110,0.5); color: #C9A96E; background: rgba(201,169,110,0.07); }
        .cd-filter-badge { background: #C9A96E; color: #0A0807; border-radius: 10px;
          font-size: 0.65rem; font-weight: 700; padding: 1px 6px; line-height: 1.4; }
        .cd-chips { display: flex; gap: 0.375rem; flex-wrap: wrap; margin-bottom: 1rem; }
        .cd-chip { display: inline-flex; align-items: center; gap: 0.3rem;
          background: rgba(201,169,110,0.1); border: 1px solid rgba(201,169,110,0.25);
          border-radius: 20px; padding: 3px 10px; font-size: 0.72rem; color: #C9A96E; }
        .cd-chip__remove { background: transparent; border: none; color: #7a6a5a;
          cursor: pointer; font-size: 0.75rem; line-height: 1; padding: 0 0 0 2px; transition: color .15s; }
        .cd-chip__remove:hover { color: #f87171; }

        /* ── Device table ── */
        .cd-table-wrap { overflow-x: auto; }
        .cd-table { width: 100%; border-collapse: collapse; font-size: 0.825rem; }
        .cd-table th { font-size: 0.68rem; color: #5a4a3a; text-transform: uppercase;
          letter-spacing: .06em; padding: 0 0.75rem 0.625rem; text-align: left;
          border-bottom: 1px solid rgba(201,169,110,0.1); white-space: nowrap; }
        .cd-table td { padding: 0.7rem 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.04);
          color: #a09080; vertical-align: middle; white-space: nowrap; }
        .cd-table td:first-child { color: #EDE5D8; }
        .cd-check { color: #4ade80; font-weight: 600; }
        .cd-cross { color: #3a2a2a; }
        .cd-ts { font-size: 0.75rem; color: #5a4a3a; }

        /* ── Shared drawer chrome ── */
        .cd-drawer-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0);
          z-index: 40; pointer-events: none; transition: background .25s; }
        .cd-drawer-backdrop--open { background: rgba(0,0,0,0.55); pointer-events: auto; }
        .cd-drawer { position: fixed; top: 0; right: 0; bottom: 0; width: 320px;
          background: #1a1512; border-left: 1px solid rgba(201,169,110,0.15);
          z-index: 50; display: flex; flex-direction: column;
          transform: translateX(100%); transition: transform .25s cubic-bezier(.4,0,.2,1); }
        .cd-drawer--open { transform: translateX(0); }
        .cd-drawer__header { display: flex; align-items: center; justify-content: space-between;
          padding: 1.125rem 1.25rem; border-bottom: 1px solid rgba(201,169,110,0.1); flex-shrink: 0; }
        .cd-drawer__title { font-size: 0.8rem; font-weight: 600; color: #EDE5D8;
          text-transform: uppercase; letter-spacing: .06em; }
        .cd-drawer__close { background: transparent; border: none; color: #5a4a3a;
          font-size: 1rem; cursor: pointer; padding: 0.2rem; transition: color .15s; line-height: 1; }
        .cd-drawer__close:hover { color: #f87171; }
        .cd-drawer__body { flex: 1; overflow-y: auto; padding: 1.25rem;
          display: flex; flex-direction: column; gap: 1.25rem; }
        .cd-drawer__group-label { font-size: 0.68rem; font-weight: 600; color: #6a5a4a;
          text-transform: uppercase; letter-spacing: .08em; margin-bottom: 0.625rem; }
        .cd-drawer__option { display: flex; align-items: center; gap: 0.625rem; padding: 0.35rem 0; cursor: pointer; }
        .cd-drawer__checkbox { width: 14px; height: 14px; accent-color: #C9A96E; cursor: pointer; flex-shrink: 0; }
        .cd-drawer__option-label { font-size: 0.8125rem; color: #c9bfb0; }
        .cd-drawer__empty { font-size: 0.8rem; color: #4a3a2a; }
        .cd-drawer__footer { display: flex; gap: 0.625rem; padding: 1rem 1.25rem;
          border-top: 1px solid rgba(201,169,110,0.1); flex-shrink: 0; }
        .cd-drawer__apply { flex: 1; background: linear-gradient(135deg,#C9A96E,#D4B87A);
          color: #0A0807; border: none; padding: 0.55rem; border-radius: 7px;
          font-size: 0.825rem; font-weight: 700; cursor: pointer; font-family: inherit; }
        .cd-drawer__apply:disabled { opacity: 0.5; cursor: not-allowed; }
        .cd-drawer__clear { background: transparent; border: 1px solid rgba(201,169,110,0.2);
          color: #8a7a6a; padding: 0.55rem 0.875rem; border-radius: 7px;
          font-size: 0.825rem; cursor: pointer; font-family: inherit; transition: all .15s; }
        .cd-drawer__clear:hover:not(:disabled) { border-color: #f87171; color: #f87171; }
        .cd-drawer__clear:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ── Follow-up form fields ── */
        .cd-fu-field { display: flex; flex-direction: column; gap: 0.35rem; }
        .cd-fu-label { font-size: 0.78rem; font-weight: 600; color: #a09080; letter-spacing: .03em; }
        .cd-fu-hint  { font-size: 0.72rem; font-weight: 400; color: #5a4a3a; }
        .cd-fu-req   { color: #C9A96E; }
        .cd-fu-input { background: #120f0c; border: 1px solid rgba(201,169,110,0.15);
          border-radius: 7px; color: #EDE5D8; font-size: 0.85rem; padding: 0.55rem 0.7rem;
          outline: none; width: 100%; font-family: inherit; transition: border-color .2s; }
        .cd-fu-input:focus { border-color: rgba(201,169,110,0.45); }
        .cd-fu-input::placeholder { color: #3a2a1a; }
        .cd-fu-textarea { resize: vertical; min-height: 72px; font-family: inherit; }
        .cd-fu-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .cd-fu-segments { display: flex; flex-wrap: wrap; gap: 0.4rem; }
        .cd-fu-seg { display: flex; align-items: center; background: #120f0c;
          border: 1px solid rgba(201,169,110,0.15); border-radius: 7px; padding: 0.4rem 0.75rem;
          cursor: pointer; font-size: 0.8rem; color: #8a7a6a; transition: all .15s; user-select: none; }
        .cd-fu-seg--active { border-color: rgba(201,169,110,0.5); color: #C9A96E;
          background: rgba(201,169,110,0.07); font-weight: 600; }

        /* ── Toast ── */
        .cd-toast { position: fixed; bottom: 1.5rem; left: 50%; transform: translateX(-50%);
          z-index: 100; padding: 0.7rem 1.25rem; border-radius: 9px; font-size: 0.85rem;
          font-weight: 500; white-space: nowrap; pointer-events: none;
          animation: cd-toast-in .2s ease; }
        .cd-toast--success { background: rgba(34,197,94,.15); border: 1px solid rgba(34,197,94,.3); color: #4ade80; }
        .cd-toast--error   { background: rgba(239,68,68,.12); border: 1px solid rgba(239,68,68,.25); color: #f87171; }
        @keyframes cd-toast-in { from { opacity: 0; transform: translateX(-50%) translateY(8px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }

        /* ── States ── */
        .cd-spinner { width: 36px; height: 36px; border: 3px solid rgba(201,169,110,0.2);
          border-top-color: #C9A96E; border-radius: 50%; animation: cd-spin 0.6s linear infinite; }
        @keyframes cd-spin { to { transform: rotate(360deg); } }
        .cd-error { background: rgba(239,68,68,.08); border: 1px solid rgba(239,68,68,.2);
          border-radius: 10px; padding: 1.25rem 1.5rem; color: #f87171; margin-bottom: 1.25rem; }
      `}</style>

      {/* Drawers */}
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        deliveries={deliveries}
        pending={pending}
        setPending={setPending}
        onApply={applyFilters}
        onClear={clearFilters}
      />
      <FollowUpDrawer
        open={fuOpen}
        onClose={() => setFuOpen(false)}
        form={fuForm}
        setForm={setFuForm}
        onSend={sendFollowUp}
        sending={fuSending}
      />

      {/* Toast */}
      {toast && (
        <div className={`cd-toast cd-toast--${toast.type}`}>{toast.msg}</div>
      )}

      {loading && (
        <div className="cd-page cd-page--center"><div className="cd-spinner" /></div>
      )}

      {!loading && error && (
        <div className="cd-page cd-page--center">
          <div className="cd-error">{error}</div>
          <button className="cd-back" onClick={() => router.back()}>← Back</button>
        </div>
      )}

      {!loading && !error && campaign && stats && (
        <div className="cd-page">
          <div className="cd-wrap">

            {/* Top bar */}
            <div className="cd-topbar">
              <button className="cd-back" onClick={() => router.back()}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
                Back
              </button>
              <button className="cd-followup-btn" onClick={openFollowUp}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/>
                </svg>
                Send Follow-up
              </button>
            </div>

            {/* Preview + Overall stats */}
            <div className="cd-top">
              <div className="cd-preview-outer">
                <p className="cd-preview-title">Notification Preview</p>
                <div className="cd-preview">
                  {campaign.bannerImageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={campaign.bannerImageUrl} alt="" className="cd-preview__banner" />
                  )}
                  <div className="cd-preview__icon-row">
                    {campaign.iconUrl
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={campaign.iconUrl} alt="" className="cd-preview__icon" style={{ objectFit: 'cover' }} />
                      : <div className="cd-preview__icon">💍</div>}
                    <span className="cd-preview__app">Shahi Bulawa</span>
                    <span className={`cd-badge cd-badge--${campaign.status}`} style={{ marginLeft: 'auto', fontSize: '0.65rem' }}>
                      {campaign.status === 'sending' ? 'Sending…' : campaign.status}
                    </span>
                  </div>
                  <p className="cd-preview__heading">{campaign.heading || 'Your heading here'}</p>
                  <p className="cd-preview__desc">{campaign.description || 'Your description here'}</p>
                  <span className="cd-preview__cta">{campaign.ctaLabel || 'View Now'}</span>
                </div>
              </div>

              <div className="cd-stats">
                <div className="cd-stat">
                  <div className="cd-stat__val">{stats.target.toLocaleString()}</div>
                  <div className="cd-stat__label">Targeted</div>
                </div>
                <div className="cd-stat cd-stat--highlight">
                  <div className="cd-stat__val">{stats.delivered.toLocaleString()}</div>
                  <div className="cd-stat__label">Delivered</div>
                </div>
                <div className="cd-stat">
                  <div className="cd-stat__val">{stats.opened.toLocaleString()}</div>
                  <div className="cd-stat__label">Opened</div>
                </div>
                <div className="cd-stat">
                  <div className="cd-stat__val">{stats.delivered > 0 ? `${stats.openRate}%` : '—'}</div>
                  <div className="cd-stat__label">Open Rate</div>
                </div>
              </div>
            </div>

            {/* Campaign metadata */}
            <Section title="Campaign Details" icon="📋">
              <div className="cd-fields">
                <Field label="Audience" value={segmentLabel(campaign)} />
                <Field label="CTA URL" value={campaign.ctaUrl || '/'} mono />
                <Field label="Created" value={fmtDate(campaign.created_at)} />
                <Field label="Sent" value={fmtDate(campaign.sent_at)} />
              </div>
            </Section>

            {/* Delivery table */}
            <section className="cd-card">
              <h2 className="cd-card__title">
                <span>📡</span>
                Delivery Details
                {filtersActive === 0
                  ? <span style={{ color: '#5a4a3a', fontWeight: 400 }}>({deliveries.length})</span>
                  : <span style={{ color: '#5a4a3a', fontWeight: 400 }}>({filtered.length} of {deliveries.length})</span>
                }
                <div className="cd-card__title-actions">
                  <button
                    className={`cd-filter-btn${filtersActive > 0 ? ' cd-filter-btn--active' : ''}`}
                    onClick={openDrawer}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
                    </svg>
                    Filters
                    {filtersActive > 0 && <span className="cd-filter-badge">{filtersActive}</span>}
                  </button>
                </div>
              </h2>

              {filtersActive > 0 && (
                <div className="cd-chips">
                  {(['browsers', 'oses', 'countries'] as const).flatMap((key) =>
                    applied[key].map((val) => (
                      <span key={`${key}-${val}`} className="cd-chip">
                        {val}
                        <button className="cd-chip__remove" onClick={() => removeChip(key, val)} aria-label={`Remove ${val}`}>✕</button>
                      </span>
                    ))
                  )}
                </div>
              )}

              {deliveries.length === 0 ? (
                <p style={{ color: '#5a4a3a', fontSize: '0.875rem', margin: 0 }}>No delivery records yet.</p>
              ) : filtered.length === 0 ? (
                <p style={{ color: '#5a4a3a', fontSize: '0.875rem', margin: 0 }}>No deliveries match the selected filters.</p>
              ) : (
                <div className="cd-table-wrap">
                  <table className="cd-table">
                    <thead>
                      <tr>
                        <th>#</th><th>Device</th><th>OS</th><th>Browser</th><th>Push</th>
                        <th>Language</th><th>Timezone</th><th>Subscribed Page</th><th>Referrer</th>
                        <th>Country</th><th>Delivered</th><th>Delivered at</th><th>Opened</th><th>Opened at</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((d, i) => (
                        <tr key={d._id}>
                          <td style={{ color: '#5a4a3a' }}>{i + 1}</td>
                          <td>{d.subscription?.deviceType ?? '—'}</td>
                          <td>{d.subscription?.os || '—'}</td>
                          <td>{d.subscription?.browser || '—'}</td>
                          <td>{d.subscription?.pushEnabled !== false ? <span className="cd-check">✓</span> : <span className="cd-cross">✗</span>}</td>
                          <td>{d.subscription?.language || '—'}</td>
                          <td>{d.subscription?.timezone || '—'}</td>
                          <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.subscription?.subscribed_page || '—'}</td>
                          <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {d.subscription?.referrer
                              ? (() => { try { return new URL(d.subscription.referrer).hostname; } catch { return d.subscription.referrer; } })()
                              : '—'}
                          </td>
                          <td>{d.subscription?.geo?.country || '—'}</td>
                          <td>{d.delivered ? <span className="cd-check">✓</span> : <span className="cd-cross">✗</span>}</td>
                          <td><span className="cd-ts">{fmtDate(d.delivered_at)}</span></td>
                          <td>{d.opened ? <span className="cd-check">✓</span> : <span className="cd-cross">✗</span>}</td>
                          <td><span className="cd-ts">{fmtDate(d.opened_at)}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

          </div>
        </div>
      )}
    </>
  );
}
