'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { EInvitation } from '@/types';

const CLOUD_NAME   = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME   || '';
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';

function toSlug(s: string) {
  return s.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

function toDatetimeLocal(iso: string) {
  if (!iso) return '';
  try { return new Date(iso).toISOString().slice(0, 16); } catch { return ''; }
}

interface Props { initialData?: Partial<EInvitation>; }

type FormState = {
  couple: { groom_name: string; bride_name: string; event_title: string; seal_initials: string; monogram: string };
  slug: string;
  wedding_at: string;
  venue: { name: string; address: string; maps_embed_url: string };
  media: { image_url: string; video_url: string; background_video_url: string; audio_url: string; event_card_url: string };
  rsvp_contacts: { name: string; number: string }[];
  schedule: { time: string; title: string; description: string }[];
  faqs: { question: string; answer: string }[];
  status: 'draft' | 'published';
};

function buildInitial(d?: Partial<EInvitation>): FormState {
  return {
    couple: {
      groom_name:    d?.couple?.groom_name    ?? '',
      bride_name:    d?.couple?.bride_name     ?? '',
      event_title:   d?.couple?.event_title    ?? '',
      seal_initials: d?.couple?.seal_initials  ?? '',
      monogram:      d?.couple?.monogram       ?? '',
    },
    slug:       d?.slug       ?? '',
    wedding_at: d?.wedding_at ? toDatetimeLocal(d.wedding_at) : '',
    venue: {
      name:           d?.venue?.name           ?? '',
      address:        d?.venue?.address        ?? '',
      maps_embed_url: d?.venue?.maps_embed_url ?? '',
    },
    media: {
      image_url:            d?.media?.image_url            ?? '',
      video_url:            d?.media?.video_url            ?? '',
      background_video_url: d?.media?.background_video_url ?? '',
      audio_url:            d?.media?.audio_url            ?? '',
      event_card_url:       d?.media?.event_card_url       ?? '',
    },
    rsvp_contacts: d?.rsvp_contacts?.length
      ? d.rsvp_contacts.map(r => ({ name: r.name, number: r.number }))
      : [{ name: '', number: '' }],
    schedule: d?.schedule?.length
      ? d.schedule.map(s => ({ time: s.time, title: s.title, description: s.description ?? '' }))
      : [{ time: '', title: '', description: '' }],
    faqs: d?.faqs?.length
      ? d.faqs.map(f => ({ question: f.question, answer: f.answer }))
      : [],
    status: d?.status ?? 'draft',
  };
}

export default function EInviteForm({ initialData }: Props) {
  const router   = useRouter();
  const isEdit   = !!initialData?.slug;
  const editSlug = initialData?.slug ?? '';

  const [form, setForm]   = useState<FormState>(() => buildInitial(initialData));
  const [saving, setSaving] = useState(false);
  const [toast, setToast]   = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ─── Couple helpers ────────────────────────────────────────────────────────
  const setCouple = (k: keyof FormState['couple'], v: string) =>
    setForm(f => ({ ...f, couple: { ...f.couple, [k]: v } }));

  const handleGroomChange = (v: string) => {
    setForm(f => {
      const updated = { ...f, couple: { ...f.couple, groom_name: v } };
      // Auto-update monogram if it matches the previous auto-generated value or is blank
      const prevAuto = `${f.couple.groom_name} & ${f.couple.bride_name}`;
      if (!f.couple.monogram || f.couple.monogram === prevAuto) {
        updated.couple.monogram = `${v} & ${f.couple.bride_name}`;
      }
      return updated;
    });
  };

  const handleBrideChange = (v: string) => {
    setForm(f => {
      const updated = { ...f, couple: { ...f.couple, bride_name: v } };
      const prevAuto = `${f.couple.groom_name} & ${f.couple.bride_name}`;
      if (!f.couple.monogram || f.couple.monogram === prevAuto) {
        updated.couple.monogram = `${f.couple.groom_name} & ${v}`;
      }
      return updated;
    });
  };

  const handleSlugBlur = () => {
    if (!form.slug && form.couple.groom_name && form.couple.bride_name) {
      setForm(f => ({ ...f, slug: toSlug(`${f.couple.groom_name}-${f.couple.bride_name}`) }));
    }
  };

  // ─── RSVP helpers ──────────────────────────────────────────────────────────
  const setRsvp    = (i: number, k: string, v: string) =>
    setForm(f => { const a = [...f.rsvp_contacts]; a[i] = { ...a[i], [k]: v }; return { ...f, rsvp_contacts: a }; });
  const addRsvp    = () => setForm(f => ({ ...f, rsvp_contacts: [...f.rsvp_contacts, { name: '', number: '' }] }));
  const removeRsvp = (i: number) =>
    setForm(f => ({ ...f, rsvp_contacts: f.rsvp_contacts.filter((_, j) => j !== i) }));

  // ─── Schedule helpers ──────────────────────────────────────────────────────
  const setSchedule    = (i: number, k: string, v: string) =>
    setForm(f => { const a = [...f.schedule]; a[i] = { ...a[i], [k]: v }; return { ...f, schedule: a }; });
  const addSchedule    = () => setForm(f => ({ ...f, schedule: [...f.schedule, { time: '', title: '', description: '' }] }));
  const removeSchedule = (i: number) =>
    setForm(f => ({ ...f, schedule: f.schedule.filter((_, j) => j !== i) }));

  // ─── FAQ helpers ───────────────────────────────────────────────────────────
  const setFaq    = (i: number, k: string, v: string) =>
    setForm(f => { const a = [...f.faqs]; a[i] = { ...a[i], [k]: v }; return { ...f, faqs: a }; });
  const addFaq    = () => setForm(f => ({ ...f, faqs: [...f.faqs, { question: '', answer: '' }] }));
  const removeFaq = (i: number) =>
    setForm(f => ({ ...f, faqs: f.faqs.filter((_, j) => j !== i) }));

  // ─── Cloudinary ────────────────────────────────────────────────────────────
  const openWidget = useCallback((field: 'image_url' | 'video_url' | 'audio_url' | 'event_card_url') => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cld = (window as any).cloudinary;
    if (!cld || !CLOUD_NAME || !UPLOAD_PRESET) { showToast('Cloudinary not configured', 'error'); return; }
    const isImage = field === 'image_url' || field === 'event_card_url';
    const isAudio = field === 'audio_url';
    cld.createUploadWidget(
      {
        cloudName: CLOUD_NAME,
        uploadPreset: UPLOAD_PRESET,
        // folder name kept for historical asset compatibility
        folder: 'paighaam/einvitations',
        sources: isAudio ? ['local', 'url'] : ['local', 'url', 'camera'],
        multiple: false,
        // Cloudinary treats audio files as the 'video' resource type
        resourceType: isImage ? 'image' : 'video',
        clientAllowedFormats: isImage
          ? ['jpg', 'jpeg', 'png', 'webp', 'gif']
          : isAudio
            ? ['mp3', 'wav', 'ogg', 'm4a', 'aac']
            : ['mp4', 'webm', 'mov'],
        maxFileSize: isImage ? 10000000 : isAudio ? 20000000 : 50000000,
        theme: 'minimal',
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err: any, res: any) => {
        if (err) { showToast(`Upload failed: ${err.message || 'error'}`, 'error'); return; }
        if (res?.event === 'success' && res.info?.secure_url) {
          setForm(f => ({ ...f, media: { ...f.media, [field]: res.info.secure_url } }));
          showToast('Uploaded!', 'success');
        }
      }
    ).open();
  }, []);

  // ─── Submit ────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.couple.groom_name.trim() || !form.couple.bride_name.trim() ||
        !form.couple.event_title.trim() || !form.couple.seal_initials.trim() ||
        !form.couple.monogram.trim() || !form.slug.trim() || !form.wedding_at) {
      showToast('Fill all required fields in Couple Details', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        wedding_at: new Date(form.wedding_at).toISOString(),
      };
      const url    = isEdit ? `/api/einvitations/${editSlug}` : '/api/einvitations';
      const method = isEdit ? 'PUT' : 'POST';
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const json   = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Unknown error');
      showToast(isEdit ? 'Invitation updated!' : 'Invitation created!', 'success');
      const savedSlug = json.data?.slug ?? editSlug;
      setTimeout(() => router.push(`/admin/einvitations/${savedSlug}/preview`), 1000);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Script src="https://upload-widget.cloudinary.com/global/all.js" strategy="lazyOnload" />
      {toast && <div className={`ec-toast ec-toast--${toast.type}`}>{toast.type === 'success' ? '✓' : '✕'} {toast.msg}</div>}

      <div className="ec-page">
        <header className="ec-header">
          <button className="ec-back" onClick={() => router.push('/admin')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
            Back
          </button>
          <h1 className="ec-title">{isEdit ? 'Edit Invitation' : 'New E-Invitation'}</h1>
          <button className="ec-save-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Invitation'}
          </button>
        </header>

        <div className="ec-body">
          <div className="ec-form">

            {/* ── Section 1: Couple Details ───────────────────────────────── */}
            <div className="ec-section">
              <h2 className="ec-section-title">1 — Couple Details</h2>

              <div className="ec-grid2">
                <div className="ec-field">
                  <label className="ec-label">Groom Name <span className="ec-req">*</span></label>
                  <input className="ec-input" value={form.couple.groom_name}
                    onChange={e => handleGroomChange(e.target.value)} placeholder="e.g. Arbab" />
                </div>
                <div className="ec-field">
                  <label className="ec-label">Bride Name <span className="ec-req">*</span></label>
                  <input className="ec-input" value={form.couple.bride_name}
                    onChange={e => handleBrideChange(e.target.value)} onBlur={handleSlugBlur} placeholder="e.g. Rabia" />
                </div>
              </div>

              <div className="ec-field">
                <label className="ec-label">Event Title <span className="ec-req">*</span></label>
                <input className="ec-input" value={form.couple.event_title}
                  onChange={e => setCouple('event_title', e.target.value)} placeholder="e.g. Wedding Ceremony" />
                <p className="ec-hint">Displayed as: &ldquo;You are cordially invited to attend <em>[event title]</em> of&rdquo;</p>
              </div>

              <div className="ec-grid2">
                <div className="ec-field">
                  <label className="ec-label">Seal Initials <span className="ec-req">*</span></label>
                  <input className="ec-input" value={form.couple.seal_initials}
                    onChange={e => setCouple('seal_initials', e.target.value)} placeholder="e.g. A & R" />
                  <p className="ec-hint">Shown on the wax seal of the envelope intro screen</p>
                </div>
                <div className="ec-field">
                  <label className="ec-label">Monogram <span className="ec-req">*</span></label>
                  <input className="ec-input" value={form.couple.monogram}
                    onChange={e => setCouple('monogram', e.target.value)} placeholder="e.g. Arbab & Rabia" />
                  <p className="ec-hint">Shown in the fixed footer of the invitation</p>
                </div>
              </div>

              <div className="ec-grid2">
                <div className="ec-field">
                  <label className="ec-label">URL Slug <span className="ec-req">*</span></label>
                  <input className="ec-input ec-input--mono" value={form.slug}
                    onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                    placeholder="e.g. arbab-rabia" />
                  <p className="ec-hint">Invite URL: /invite/{form.slug || '…'}</p>
                </div>
                <div className="ec-field">
                  <label className="ec-label">Wedding Date & Time <span className="ec-req">*</span></label>
                  <input className="ec-input" type="datetime-local" value={form.wedding_at}
                    onChange={e => setForm(f => ({ ...f, wedding_at: e.target.value }))} />
                </div>
              </div>
            </div>

            {/* ── Section 2: Venue Details ────────────────────────────────── */}
            <div className="ec-section">
              <h2 className="ec-section-title">2 — Venue Details</h2>

              <div className="ec-grid2">
                <div className="ec-field">
                  <label className="ec-label">Venue Name</label>
                  <input className="ec-input" value={form.venue.name}
                    onChange={e => setForm(f => ({ ...f, venue: { ...f.venue, name: e.target.value } }))}
                    placeholder="e.g. Mövenpick Hotel, Karachi" />
                </div>
                <div className="ec-field">
                  <label className="ec-label">Venue Address</label>
                  <input className="ec-input" value={form.venue.address}
                    onChange={e => setForm(f => ({ ...f, venue: { ...f.venue, address: e.target.value } }))}
                    placeholder="e.g. Club Road, Karachi" />
                </div>
              </div>

              <div className="ec-field">
                <label className="ec-label">Google Maps Embed URL</label>
                <textarea className="ec-input ec-textarea" rows={3} value={form.venue.maps_embed_url}
                  onChange={e => setForm(f => ({ ...f, venue: { ...f.venue, maps_embed_url: e.target.value } }))}
                  placeholder="Paste the src= URL from Google Maps → Share → Embed a map" />
                <p className="ec-hint">In Google Maps: Share → Embed a map → copy only the URL inside src=&quot;…&quot;</p>
              </div>

              <div className="ec-field">
                <label className="ec-label">Event Details Card <span className="ec-opt">(optional)</span></label>
                {form.media.event_card_url ? (
                  <div className="ec-media-preview">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.media.event_card_url} alt="Event details card" className="ec-media-preview__img" />
                    <div className="ec-media-preview__actions">
                      <button type="button" className="ec-btn-sm" onClick={() => openWidget('event_card_url')}>Replace</button>
                      <button type="button" className="ec-btn-danger" onClick={() => setForm(f => ({ ...f, media: { ...f.media, event_card_url: '' } }))}>✕ Remove</button>
                    </div>
                  </div>
                ) : (
                  <button type="button" className="ec-upload-zone" onClick={() => openWidget('event_card_url')}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                    <span>Upload event details card</span>
                    <span className="ec-upload-hint">JPG, PNG, WebP, GIF — max 10 MB</span>
                  </button>
                )}
                <p className="ec-hint">Optional — shown above the venue details on Template 02 designs.</p>
              </div>
            </div>

            {/* ── Section 3: Media ────────────────────────────────────────── */}
            <div className="ec-section">
              <h2 className="ec-section-title">3 — Useful Media</h2>

              <div className="ec-field">
                <label className="ec-label">Cover Image / GIF</label>
                {form.media.image_url ? (
                  <div className="ec-media-preview">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.media.image_url} alt="Cover" className="ec-media-preview__img" />
                    <div className="ec-media-preview__actions">
                      <button type="button" className="ec-btn-sm" onClick={() => openWidget('image_url')}>Replace</button>
                      <button type="button" className="ec-btn-danger" onClick={() => setForm(f => ({ ...f, media: { ...f.media, image_url: '' } }))}>✕ Remove</button>
                    </div>
                  </div>
                ) : (
                  <button type="button" className="ec-upload-zone" onClick={() => openWidget('image_url')}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                    <span>Upload image or GIF</span>
                    <span className="ec-upload-hint">JPG, PNG, WebP, GIF — max 10 MB</span>
                  </button>
                )}
              </div>

              <div className="ec-field">
                <label className="ec-label">Video</label>
                {form.media.video_url ? (
                  <div className="ec-video-wrap">
                    <video src={form.media.video_url} className="ec-video" controls muted playsInline />
                    <div className="ec-video-actions">
                      <button type="button" className="ec-btn-sm" onClick={() => openWidget('video_url')}>Replace</button>
                      <button type="button" className="ec-btn-danger" onClick={() => setForm(f => ({ ...f, media: { ...f.media, video_url: '' } }))}>✕ Remove</button>
                    </div>
                  </div>
                ) : (
                  <button type="button" className="ec-upload-zone" onClick={() => openWidget('video_url')}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>
                    <span>Upload video</span>
                    <span className="ec-upload-hint">MP4, WebM, MOV — max 50 MB</span>
                  </button>
                )}
                <p className="ec-hint">On Template 02 designs this video plays as the envelope intro screen.</p>
              </div>

              <div className="ec-field">
                <label className="ec-label">Background Video URL <span className="ec-opt">(direct link, plays behind hero)</span></label>
                <input className="ec-input" value={form.media.background_video_url}
                  onChange={e => setForm(f => ({ ...f, media: { ...f.media, background_video_url: e.target.value } }))}
                  placeholder="https://res.cloudinary.com/…/video/upload/…" />
              </div>

              <div className="ec-field">
                <label className="ec-label">Background Audio <span className="ec-opt">(optional)</span></label>
                {form.media.audio_url ? (
                  <div className="ec-audio-wrap">
                    <audio src={form.media.audio_url} className="ec-audio" controls />
                    <div className="ec-audio-actions">
                      <button type="button" className="ec-btn-sm" onClick={() => openWidget('audio_url')}>Replace</button>
                      <button type="button" className="ec-btn-danger" onClick={() => setForm(f => ({ ...f, media: { ...f.media, audio_url: '' } }))}>✕ Remove</button>
                    </div>
                  </div>
                ) : (
                  <button type="button" className="ec-upload-zone" onClick={() => openWidget('audio_url')}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
                    <span>Upload background audio</span>
                    <span className="ec-upload-hint">MP3, WAV, OGG, M4A, AAC — max 20 MB</span>
                  </button>
                )}
                <p className="ec-hint">Optional — loops softly in the background. Leave empty for a silent invitation.</p>
              </div>
            </div>

            {/* ── Section 4: RSVP Contacts ────────────────────────────────── */}
            <div className="ec-section">
              <div className="ec-field-header" style={{ marginBottom: '0.75rem' }}>
                <h2 className="ec-section-title" style={{ margin: 0 }}>4 — RSVP Contacts</h2>
                <button type="button" className="ec-btn-add" onClick={addRsvp}>+ Add Contact</button>
              </div>

              {form.rsvp_contacts.map((contact, i) => (
                <div key={i} className="ec-list-row">
                  <div className="ec-grid2" style={{ flex: 1 }}>
                    <input className="ec-input" placeholder="Contact Name" value={contact.name}
                      onChange={e => setRsvp(i, 'name', e.target.value)} />
                    <input className="ec-input" placeholder="WhatsApp Number (e.g. 03001234567)" value={contact.number}
                      onChange={e => setRsvp(i, 'number', e.target.value)} />
                  </div>
                  {form.rsvp_contacts.length > 1 && (
                    <button type="button" className="ec-btn-danger" onClick={() => removeRsvp(i)}>✕</button>
                  )}
                </div>
              ))}
            </div>

            {/* ── Section 5: Schedule / Itinerary ────────────────────────── */}
            <div className="ec-section">
              <div className="ec-field-header" style={{ marginBottom: '0.75rem' }}>
                <h2 className="ec-section-title" style={{ margin: 0 }}>5 — Schedule / Itinerary</h2>
                <button type="button" className="ec-btn-add" onClick={addSchedule}>+ Add Item</button>
              </div>

              {form.schedule.map((item, i) => (
                <div key={i} className="ec-list-row ec-list-row--col">
                  <div className="ec-grid2">
                    <input className="ec-input" placeholder="Time (e.g. 7:00 PM)" value={item.time}
                      onChange={e => setSchedule(i, 'time', e.target.value)} />
                    <input className="ec-input" placeholder="Title (e.g. Nikkah Ceremony)" value={item.title}
                      onChange={e => setSchedule(i, 'title', e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <textarea className="ec-input ec-textarea" rows={2} placeholder="Description (optional)"
                      value={item.description} onChange={e => setSchedule(i, 'description', e.target.value)}
                      style={{ flex: 1 }} />
                    {form.schedule.length > 1 && (
                      <button type="button" className="ec-btn-danger" style={{ marginTop: '0.25rem' }}
                        onClick={() => removeSchedule(i)}>✕</button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Section 6: FAQs ─────────────────────────────────────────── */}
            <div className="ec-section">
              <div className="ec-field-header" style={{ marginBottom: '0.375rem' }}>
                <h2 className="ec-section-title" style={{ margin: 0 }}>6 — FAQs</h2>
                <button type="button" className="ec-btn-add" onClick={addFaq}>+ Add FAQ</button>
              </div>
              <p className="ec-hint" style={{ marginBottom: '0.75rem' }}>
                If no FAQs are added, the FAQ section will not appear on the invitation.
              </p>

              {form.faqs.length === 0 && (
                <p className="ec-hint" style={{ color: '#5a4a3a', fontStyle: 'italic' }}>No FAQs added yet.</p>
              )}

              {form.faqs.map((faq, i) => (
                <div key={i} className="ec-list-row ec-list-row--col">
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input className="ec-input" placeholder="Question" value={faq.question}
                      onChange={e => setFaq(i, 'question', e.target.value)} style={{ flex: 1 }} />
                    <button type="button" className="ec-btn-danger" onClick={() => removeFaq(i)}>✕</button>
                  </div>
                  <textarea className="ec-input ec-textarea" rows={2} placeholder="Answer"
                    value={faq.answer} onChange={e => setFaq(i, 'answer', e.target.value)} />
                </div>
              ))}
            </div>

            {/* ── Status ──────────────────────────────────────────────────── */}
            <div className="ec-section">
              <h2 className="ec-section-title">Status</h2>
              <label className="ec-toggle">
                <input type="checkbox" checked={form.status === 'published'}
                  onChange={e => setForm(f => ({ ...f, status: e.target.checked ? 'published' : 'draft' }))} />
                <span className="ec-toggle__track" />
                <span className="ec-toggle__label">
                  {form.status === 'published' ? 'Published — visible to customers' : 'Draft — not visible to customers'}
                </span>
              </label>
            </div>

            <div className="ec-footer">
              <button className="ec-cancel" onClick={() => router.push('/admin')}>Cancel</button>
              <button className="ec-save-btn" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Invitation'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{background:#0A0807;}
        .ec-page{min-height:100vh;background:#0A0807;font-family:inherit;color:#EDE5D8;}
        .ec-header{display:flex;align-items:center;gap:1rem;padding:1rem 1.5rem;background:#111009;border-bottom:1px solid rgba(201,169,110,0.12);position:sticky;top:0;z-index:10;}
        .ec-back{display:flex;align-items:center;gap:0.4rem;background:none;border:1px solid rgba(201,169,110,0.2);color:#a09080;padding:0.4rem 0.75rem;border-radius:7px;cursor:pointer;font-size:0.8rem;transition:all .15s;font-family:inherit;}
        .ec-back:hover{border-color:#C9A96E;color:#C9A96E;}
        .ec-title{flex:1;font-size:1.1rem;font-weight:600;color:#EDE5D8;}
        .ec-body{max-width:860px;margin:0 auto;padding:2rem 1.5rem 4rem;}
        .ec-form{display:flex;flex-direction:column;gap:1.5rem;}
        .ec-section{background:#111009;border:1px solid rgba(201,169,110,0.1);border-radius:12px;padding:1.5rem;display:flex;flex-direction:column;gap:1rem;}
        .ec-section-title{font-size:0.875rem;font-weight:700;color:#C9A96E;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:0.25rem;}
        .ec-grid2{display:grid;grid-template-columns:1fr 1fr;gap:1rem;}
        @media(max-width:600px){.ec-grid2{grid-template-columns:1fr;}}
        .ec-field{display:flex;flex-direction:column;gap:0.375rem;}
        .ec-field-header{display:flex;align-items:center;justify-content:space-between;}
        .ec-label{font-size:0.8rem;font-weight:600;color:#a09080;letter-spacing:.03em;}
        .ec-req{color:#C9A96E;} .ec-opt{color:#5a4a3a;font-weight:400;}
        .ec-hint{font-size:0.72rem;color:#5a4a3a;margin-top:2px;}
        .ec-input,.ec-select{background:#1C1916;border:1px solid rgba(201,169,110,0.15);border-radius:8px;color:#EDE5D8;font-size:0.875rem;padding:0.6rem 0.75rem;outline:none;width:100%;transition:border-color .2s;font-family:inherit;}
        .ec-input:focus,.ec-select:focus{border-color:rgba(201,169,110,0.5);box-shadow:0 0 0 3px rgba(201,169,110,0.08);}
        .ec-input::placeholder,.ec-textarea::placeholder{color:#3a2a1a;}
        .ec-input--mono{font-family:monospace;font-size:.82rem;}
        .ec-textarea{background:#1C1916;border:1px solid rgba(201,169,110,0.15);border-radius:8px;color:#EDE5D8;font-size:0.875rem;padding:0.6rem 0.75rem;outline:none;width:100%;transition:border-color .2s;font-family:inherit;resize:vertical;}
        .ec-textarea:focus{border-color:rgba(201,169,110,0.5);box-shadow:0 0 0 3px rgba(201,169,110,0.08);}
        .ec-upload-zone{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0.5rem;width:100%;padding:1.5rem;background:#1C1916;border:1.5px dashed rgba(201,169,110,0.25);border-radius:10px;color:#a09080;cursor:pointer;transition:all .2s;font-family:inherit;}
        .ec-upload-zone:hover{border-color:#C9A96E;color:#C9A96E;}
        .ec-upload-hint{font-size:0.72rem;color:#5a4a3a;}
        .ec-media-preview{display:flex;flex-direction:column;gap:0.5rem;}
        .ec-media-preview__img{width:100%;max-height:220px;object-fit:cover;border-radius:8px;border:1px solid rgba(201,169,110,0.15);}
        .ec-media-preview__actions{display:flex;gap:.5rem;}
        .ec-video-wrap{display:flex;flex-direction:column;gap:.5rem;}
        .ec-video{width:100%;max-height:220px;border-radius:8px;background:#000;}
        .ec-video-actions{display:flex;gap:.5rem;}
        .ec-audio-wrap{display:flex;flex-direction:column;gap:.5rem;}
        .ec-audio{width:100%;border-radius:8px;}
        .ec-audio-actions{display:flex;gap:.5rem;}
        .ec-list-row{display:flex;gap:0.5rem;align-items:center;padding:0.75rem;background:#0A0807;border-radius:8px;border:1px solid rgba(201,169,110,0.07);}
        .ec-list-row--col{flex-direction:column;align-items:stretch;}
        .ec-toggle{display:flex;align-items:center;gap:.625rem;cursor:pointer;padding:.6rem 0;}
        .ec-toggle input{display:none;}
        .ec-toggle__track{width:36px;height:20px;border-radius:10px;background:#2a2018;border:1px solid rgba(201,169,110,0.2);position:relative;transition:background .2s;flex-shrink:0;}
        .ec-toggle__track::after{content:'';position:absolute;left:2px;top:2px;width:14px;height:14px;border-radius:50%;background:#5a4a3a;transition:all .2s;}
        .ec-toggle input:checked~.ec-toggle__track{background:#C9A96E;}
        .ec-toggle input:checked~.ec-toggle__track::after{left:18px;background:#fff;}
        .ec-toggle__label{font-size:.8375rem;color:#a09080;}
        .ec-btn-sm{background:transparent;border:1px solid rgba(201,169,110,0.25);color:#a09080;padding:.3rem .65rem;border-radius:6px;font-size:.775rem;cursor:pointer;transition:all .15s;font-family:inherit;}
        .ec-btn-sm:hover{border-color:#C9A96E;color:#C9A96E;}
        .ec-btn-add{background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.25);color:#4ade80;padding:.3rem .75rem;border-radius:6px;font-size:.775rem;cursor:pointer;transition:all .15s;font-family:inherit;white-space:nowrap;}
        .ec-btn-add:hover{background:rgba(34,197,94,0.15);border-color:#4ade80;}
        .ec-btn-danger{background:transparent;border:1px solid rgba(220,38,38,.3);color:#ef4444;padding:.3rem .6rem;border-radius:6px;font-size:.775rem;cursor:pointer;transition:all .15s;font-family:inherit;}
        .ec-btn-danger:hover{background:rgba(220,38,38,.1);}
        .ec-footer{display:flex;justify-content:flex-end;gap:.75rem;padding-top:.5rem;border-top:1px solid rgba(201,169,110,0.1);margin-top:.5rem;}
        .ec-cancel{background:transparent;border:1px solid rgba(201,169,110,0.2);color:#a09080;padding:.55rem 1.25rem;border-radius:8px;cursor:pointer;font-size:.875rem;font-family:inherit;transition:all .15s;}
        .ec-cancel:hover{border-color:#C9A96E;color:#C9A96E;}
        .ec-save-btn{background:linear-gradient(135deg,#C9A96E,#B8944D);color:#fff;border:none;padding:.55rem 1.5rem;border-radius:8px;font-size:.875rem;font-weight:600;cursor:pointer;transition:opacity .15s;font-family:inherit;}
        .ec-save-btn:disabled{opacity:.6;cursor:not-allowed;}
        .ec-toast{position:fixed;top:1.25rem;right:1.25rem;z-index:9999;padding:.7rem 1.25rem;border-radius:9px;font-size:.875rem;font-weight:500;animation:slideIn .2s ease;}
        .ec-toast--success{background:#166534;border:1px solid #16a34a;color:#fff;}
        .ec-toast--error{background:#7f1d1d;border:1px solid #dc2626;color:#fff;}
        @keyframes slideIn{from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:translateY(0);}}
      `}</style>
    </>
  );
}
