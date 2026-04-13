'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import type { CardProduct, AddOn } from '@/types';
import { calculatePrice, formatPKR } from '@/lib/pricing';

// ─── Constants ────────────────────────────────────────────────────────────────

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';

const KARACHI_AREAS = [
  'Gulshan-e-Iqbal', 'DHA', 'North Nazimabad', 'Clifton', 'PECHS',
  'Saddar', 'Malir', 'Korangi', 'Nazimabad', 'Gulistan-e-Johar',
  'Bahria Town', 'FB Area', 'Tariq Road', 'Liaquatabad', 'Orangi Town',
  'Landhi', 'Shah Faisal', 'Scheme 33', 'North Karachi', 'Surjani Town',
  'Garden', 'Lyari', 'Kemari', 'Bin Qasim', 'Other',
];

const QUANTITY_OPTIONS = [50, 100, 200, 500];

const TEMPLATES = {
  urdu: {
    label: 'Traditional Urdu',
    icon: '🕌',
    content: `بسم اللہ الرحمن الرحیم

آپ کو بخوشی مطلع کیا جاتا ہے کہ

[Groom Name]
ولد جناب _______________

کا نکاح

[Bride Name]
بنت جناب _______________

سے طے پایا ہے۔

تاریخ: [Date]
مقام: [Venue]

آپ کی تشریف آوری کی درخواست ہے۔
نماز و دعا کے لیے حاضر ہوں۔`,
  },
  english: {
    label: 'Modern English',
    icon: '✨',
    content: `Together with their families

[Groom Name]
&
[Bride Name]

Request the honour of your presence
at the celebration of their marriage

Date: [Date]
Venue: [Venue]

Dinner to follow

With love and joy,
The [Groom Name] & [Bride Name] Families`,
  },
  minimalist: {
    label: 'Minimalist',
    icon: '📐',
    content: `[Groom Name] & [Bride Name]

are getting married

[Date]
[Venue]

You are cordially invited.`,
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface CheckoutProps {
  card: CardProduct;
  initialQty: number;
  initialAddOnIds: string[];
}

interface FormData {
  // Step 1
  template: 'urdu' | 'english' | 'minimalist';
  content: string;
  groomName: string;
  brideName: string;
  date: string;
  venue: string;
  // Step 2
  customerName: string;
  whatsapp: string;
  area: string;
  quantity: number;
  // Step 3
  paymentMethod: 'full' | 'deposit';
  receiptUrl: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CheckoutClient({ card, initialQty, initialAddOnIds }: CheckoutProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const cloudinaryRef = useRef(false);

  const [selectedAddOnIds] = useState<Set<string>>(new Set(initialAddOnIds));
  const selectedAddOns = useMemo(
    () => card.add_ons.filter((a: AddOn) => selectedAddOnIds.has(a.id)),
    [card.add_ons, selectedAddOnIds]
  );

  const [form, setForm] = useState<FormData>({
    template: 'english',
    content: TEMPLATES.english.content,
    groomName: '',
    brideName: '',
    date: '',
    venue: '',
    customerName: '',
    whatsapp: '',
    area: '',
    quantity: initialQty || 100,
    paymentMethod: 'deposit',
    receiptUrl: '',
  });

  const [areaSearch, setAreaSearch] = useState('');
  const [areaDropdownOpen, setAreaDropdownOpen] = useState(false);
  const areaRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (areaRef.current && !areaRef.current.contains(e.target as Node)) {
        setAreaDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const breakdown = useMemo(
    () => calculatePrice(card.base_price, form.quantity, selectedAddOns),
    [card.base_price, form.quantity, selectedAddOns]
  );

  const amountDue = form.paymentMethod === 'deposit'
    ? Math.ceil(breakdown.total / 2)
    : breakdown.total;

  // ─── Template selection ─────────────────────────────────────────────────────

  const selectTemplate = useCallback((key: 'urdu' | 'english' | 'minimalist') => {
    let content = TEMPLATES[key].content;
    // Replace placeholders if user has already entered values
    if (form.groomName) content = content.replace(/\[Groom Name\]/g, form.groomName);
    if (form.brideName) content = content.replace(/\[Bride Name\]/g, form.brideName);
    if (form.date) content = content.replace(/\[Date\]/g, form.date);
    if (form.venue) content = content.replace(/\[Venue\]/g, form.venue);
    setForm(f => ({ ...f, template: key, content }));
  }, [form.groomName, form.brideName, form.date, form.venue]);

  // ─── Live preview content ───────────────────────────────────────────────────

  const previewContent = useMemo(() => {
    let text = form.content;
    if (form.groomName) text = text.replace(/\[Groom Name\]/g, form.groomName);
    if (form.brideName) text = text.replace(/\[Bride Name\]/g, form.brideName);
    if (form.date) text = text.replace(/\[Date\]/g, form.date);
    if (form.venue) text = text.replace(/\[Venue\]/g, form.venue);
    return text;
  }, [form.content, form.groomName, form.brideName, form.date, form.venue]);

  // ─── Validation ─────────────────────────────────────────────────────────────

  const validateStep = (s: number): string | null => {
    if (s === 1) {
      if (!form.groomName.trim()) return 'Please enter the groom\'s name';
      if (!form.brideName.trim()) return 'Please enter the bride\'s name';
      if (!form.date.trim()) return 'Please enter the event date';
      if (!form.venue.trim()) return 'Please enter the venue';
    }
    if (s === 2) {
      if (!form.customerName.trim()) return 'Please enter your full name';
      if (!form.whatsapp.trim()) return 'Please enter your WhatsApp number';
      if (!/^(\+92|0)?3\d{9}$/.test(form.whatsapp.replace(/[\s-]/g, ''))) {
        return 'Invalid WhatsApp number. Use format: 03XX-XXXXXXX';
      }
      if (!form.area) return 'Please select your area';
    }
    return null;
  };

  const nextStep = () => {
    const err = validateStep(step);
    if (err) { setError(err); return; }
    setError('');
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setError('');
    setStep(s => s - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ─── Receipt upload ─────────────────────────────────────────────────────────

  const openReceiptUpload = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cld = (window as any).cloudinary;
    if (!cld || !CLOUD_NAME || !UPLOAD_PRESET) {
      setError('Cloudinary not configured');
      return;
    }
    const widget = cld.createUploadWidget(
      {
        cloudName: CLOUD_NAME,
        uploadPreset: UPLOAD_PRESET,
        sources: ['local', 'camera'],
        multiple: false,
        maxFiles: 1,
        resourceType: 'image',
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        maxFileSize: 5000000,
        folder: 'paighaam/receipts',
        theme: 'minimal',
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err: any, result: any) => {
        if (err) { setError('Upload failed'); return; }
        if (result?.event === 'success' && result.info?.secure_url) {
          setForm(f => ({ ...f, receiptUrl: result.info.secure_url }));
        }
      }
    );
    widget.open();
  }, []);

  // ─── Submit order ───────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    const err = validateStep(3);
    if (err) { setError(err); return; }
    setError('');
    setSubmitting(true);

    try {
      const payload = {
        card_slug: card.slug,
        card_name: card.name,
        quantity: form.quantity,
        base_price: card.base_price,
        add_ons: selectedAddOns.map(a => ({ name: a.name, price: a.price })),
        total: breakdown.total,
        customization: {
          template: form.template,
          content: previewContent,
          groom_name: form.groomName,
          bride_name: form.brideName,
          date: form.date,
          venue: form.venue,
        },
        customer: {
          name: form.customerName,
          whatsapp: form.whatsapp,
          area: form.area,
        },
        payment: {
          method: form.paymentMethod,
          amount_due: amountDue,
          receipt_url: form.receiptUrl,
        },
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to place order');
      }

      router.push(`/checkout/success?orderId=${json.data.order_id}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Order failed';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Filtered areas ─────────────────────────────────────────────────────────

  const filteredAreas = KARACHI_AREAS.filter(a =>
    a.toLowerCase().includes(areaSearch.toLowerCase())
  );

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <Script
        src="https://upload-widget.cloudinary.com/global/all.js"
        strategy="lazyOnload"
        onLoad={() => { cloudinaryRef.current = true; }}
      />

      <div className="co-wrapper">
        {/* Progress Bar */}
        <div className="co-progress">
          {[1, 2, 3].map(s => (
            <div key={s} className={`co-progress__step ${step >= s ? 'co-progress__step--active' : ''} ${step > s ? 'co-progress__step--done' : ''}`}>
              <div className="co-progress__circle">
                {step > s ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>
                ) : s}
              </div>
              <span className="co-progress__label">
                {s === 1 ? 'Customize' : s === 2 ? 'Details' : 'Payment'}
              </span>
            </div>
          ))}
          <div className="co-progress__bar">
            <div className="co-progress__fill" style={{ width: `${((step - 1) / 2) * 100}%` }} />
          </div>
        </div>

        {/* Card Info Banner */}
        <div className="co-card-info">
          <div className="co-card-info__left">
            {card.images[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={card.images[0]} alt={card.name} className="co-card-info__img" />
            )}
            <div>
              <h2 className="co-card-info__name">{card.name}</h2>
              <span className="co-card-info__cat">{card.category}</span>
            </div>
          </div>
          <div className="co-card-info__right">
            <span className="co-card-info__price">{formatPKR(breakdown.total)}</span>
            <span className="co-card-info__qty">{form.quantity} cards</span>
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="co-error"
            >
              ⚠ {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Steps */}
        <AnimatePresence mode="wait">
          {/* ── STEP 1: Card Editor ── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="co-step">
              <h3 className="co-step__title">✍️ Customize Your Card</h3>
              <p className="co-step__desc">Choose a template, fill in your details, and preview your card in real-time.</p>

              {/* Template Buttons */}
              <div className="co-templates">
                {(Object.keys(TEMPLATES) as Array<keyof typeof TEMPLATES>).map(key => (
                  <button
                    key={key}
                    className={`co-template-btn ${form.template === key ? 'co-template-btn--active' : ''}`}
                    onClick={() => selectTemplate(key)}
                  >
                    <span className="co-template-btn__icon">{TEMPLATES[key].icon}</span>
                    <span>{TEMPLATES[key].label}</span>
                  </button>
                ))}
              </div>

              {/* Detail Fields */}
              <div className="co-fields-grid">
                <div className="co-field">
                  <label className="co-label">Groom&apos;s Name *</label>
                  <input
                    className="co-input"
                    placeholder="e.g. Ahmed Ali"
                    value={form.groomName}
                    onChange={e => setForm(f => ({ ...f, groomName: e.target.value }))}
                  />
                </div>
                <div className="co-field">
                  <label className="co-label">Bride&apos;s Name *</label>
                  <input
                    className="co-input"
                    placeholder="e.g. Fatima Khan"
                    value={form.brideName}
                    onChange={e => setForm(f => ({ ...f, brideName: e.target.value }))}
                  />
                </div>
                <div className="co-field">
                  <label className="co-label">Event Date *</label>
                  <input
                    type="date"
                    className="co-input"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  />
                </div>
                <div className="co-field">
                  <label className="co-label">Venue *</label>
                  <input
                    className="co-input"
                    placeholder="e.g. Royal Marquee, DHA"
                    value={form.venue}
                    onChange={e => setForm(f => ({ ...f, venue: e.target.value }))}
                  />
                </div>
              </div>

              {/* Content Editor */}
              <div className="co-field">
                <label className="co-label">Card Text</label>
                <textarea
                  className="co-textarea"
                  rows={8}
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                />
              </div>

              {/* Live Preview */}
              <div className="co-field">
                <label className="co-label">📄 Live Preview</label>
                <div className={`co-preview ${form.template === 'urdu' ? 'co-preview--urdu' : ''}`}>
                  <div className="co-preview__corner co-preview__corner--tl" />
                  <div className="co-preview__corner co-preview__corner--tr" />
                  <div className="co-preview__corner co-preview__corner--bl" />
                  <div className="co-preview__corner co-preview__corner--br" />
                  <div className="co-preview__text">{previewContent}</div>
                </div>
              </div>

              <div className="co-actions">
                <button className="co-btn co-btn--secondary" onClick={() => router.back()}>← Back to Card</button>
                <button className="co-btn co-btn--primary" onClick={nextStep}>Continue to Details →</button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Checkout Form ── */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="co-step">
              <h3 className="co-step__title">📋 Your Details</h3>
              <p className="co-step__desc">We need a few details to process your order.</p>

              <div className="co-fields-grid">
                <div className="co-field">
                  <label className="co-label">Full Name *</label>
                  <input
                    className="co-input"
                    placeholder="Your full name"
                    value={form.customerName}
                    onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
                  />
                </div>
                <div className="co-field">
                  <label className="co-label">WhatsApp Number *</label>
                  <input
                    className="co-input"
                    placeholder="03XX-XXXXXXX"
                    value={form.whatsapp}
                    onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
                  />
                </div>
              </div>

              {/* Area Dropdown */}
              <div className="co-field" ref={areaRef}>
                <label className="co-label">Delivery Area (Karachi) *</label>
                <div className="co-select-wrap">
                  <input
                    className="co-input"
                    placeholder="Search area…"
                    value={areaDropdownOpen ? areaSearch : form.area || areaSearch}
                    onChange={e => { setAreaSearch(e.target.value); setAreaDropdownOpen(true); }}
                    onFocus={() => setAreaDropdownOpen(true)}
                  />
                  {areaDropdownOpen && (
                    <div className="co-dropdown">
                      {filteredAreas.length > 0 ? filteredAreas.map(a => (
                        <button
                          key={a}
                          className={`co-dropdown__item ${form.area === a ? 'co-dropdown__item--active' : ''}`}
                          onClick={() => { setForm(f => ({ ...f, area: a })); setAreaSearch(''); setAreaDropdownOpen(false); }}
                        >
                          {a}
                        </button>
                      )) : (
                        <div className="co-dropdown__empty">No areas found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity */}
              <div className="co-field">
                <label className="co-label">Quantity</label>
                <div className="co-qty-grid">
                  {QUANTITY_OPTIONS.map(q => (
                    <button
                      key={q}
                      className={`co-qty-btn ${form.quantity === q ? 'co-qty-btn--active' : ''}`}
                      onClick={() => setForm(f => ({ ...f, quantity: q }))}
                    >
                      <strong>{q}</strong>
                      <span>cards</span>
                      {q >= 500 && <span className="co-qty-btn__badge">-10%</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="co-summary">
                <div className="co-summary__row">
                  <span>Base ({formatPKR(card.base_price)} × {form.quantity})</span>
                  <span>{formatPKR(breakdown.subtotal)}</span>
                </div>
                {selectedAddOns.length > 0 && (
                  <div className="co-summary__row">
                    <span>Add-ons ({selectedAddOns.length})</span>
                    <span>+{formatPKR(breakdown.addOnsTotal)}</span>
                  </div>
                )}
                {breakdown.discount > 0 && (
                  <div className="co-summary__row co-summary__row--green">
                    <span>Bulk Discount</span>
                    <span>-{formatPKR(breakdown.discount)}</span>
                  </div>
                )}
                <div className="co-summary__total">
                  <span>Total</span>
                  <span>{formatPKR(breakdown.total)}</span>
                </div>
              </div>

              <div className="co-actions">
                <button className="co-btn co-btn--secondary" onClick={prevStep}>← Back</button>
                <button className="co-btn co-btn--primary" onClick={nextStep}>Continue to Payment →</button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Payment ── */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="co-step">
              <h3 className="co-step__title">💳 Payment</h3>
              <p className="co-step__desc">Choose your payment option and upload your receipt.</p>

              {/* Payment Options */}
              <div className="co-pay-options">
                <button
                  className={`co-pay-option ${form.paymentMethod === 'full' ? 'co-pay-option--active' : ''}`}
                  onClick={() => setForm(f => ({ ...f, paymentMethod: 'full' }))}
                >
                  <div className="co-pay-option__radio" />
                  <div>
                    <strong>Full Payment (Fast-Track)</strong>
                    <span>{formatPKR(breakdown.total)}</span>
                  </div>
                </button>
                <button
                  className={`co-pay-option ${form.paymentMethod === 'deposit' ? 'co-pay-option--active' : ''}`}
                  onClick={() => setForm(f => ({ ...f, paymentMethod: 'deposit' }))}
                >
                  <div className="co-pay-option__radio" />
                  <div>
                    <strong>50% Deposit (Secure Order)</strong>
                    <span>{formatPKR(Math.ceil(breakdown.total / 2))}</span>
                  </div>
                </button>
              </div>

              <div className="co-disclaimer">
                ⚠️ Because cards are custom-printed with your details, a minimum 50% deposit is required to start the design process. The remaining balance is due before delivery.
              </div>

              {/* Amount Due */}
              <div className="co-amount-due">
                <span>Amount to Pay Now</span>
                <span className="co-amount-due__value">{formatPKR(amountDue)}</span>
              </div>

              {/* Payment Details */}
              <div className="co-pay-details">
                <h4>📱 Payment Methods</h4>
                <div className="co-pay-methods">
                  <div className="co-pay-method">
                    <span className="co-pay-method__label">JazzCash</span>
                    <span className="co-pay-method__value">0300-1234567</span>
                  </div>
                  <div className="co-pay-method">
                    <span className="co-pay-method__label">EasyPaisa</span>
                    <span className="co-pay-method__value">0300-1234567</span>
                  </div>
                  <div className="co-pay-method">
                    <span className="co-pay-method__label">Raast ID</span>
                    <span className="co-pay-method__value">PK00MEZN0000000000001234</span>
                  </div>
                </div>
                <p className="co-pay-details__note">
                  Send payment to any of the above accounts and upload a screenshot below.
                </p>
              </div>

              {/* Receipt Upload */}
              <div className="co-field">
                <label className="co-label">Upload Payment Receipt</label>
                {form.receiptUrl ? (
                  <div className="co-receipt-preview">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.receiptUrl} alt="Payment receipt" className="co-receipt-preview__img" />
                    <div className="co-receipt-preview__actions">
                      <span className="co-receipt-preview__ok">✓ Receipt Uploaded</span>
                      <button className="co-btn co-btn--small" onClick={openReceiptUpload}>Replace</button>
                      <button className="co-btn co-btn--small co-btn--danger" onClick={() => setForm(f => ({ ...f, receiptUrl: '' }))}>Remove</button>
                    </div>
                  </div>
                ) : (
                  <button className="co-upload-zone" onClick={openReceiptUpload}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>Click to upload receipt screenshot</span>
                    <span className="co-upload-zone__hint">JPG, PNG — max 5 MB</span>
                  </button>
                )}
              </div>

              <div className="co-actions">
                <button className="co-btn co-btn--secondary" onClick={prevStep}>← Back</button>
                <button
                  className="co-btn co-btn--submit"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? '⏳ Placing Order…' : `✓ Place Order — ${formatPKR(amountDue)}`}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .co-wrapper {
          max-width: 720px;
          margin: 0 auto;
          padding: 0 1rem 3rem;
        }

        /* ── Progress ── */
        .co-progress {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          gap: 3rem;
          margin-bottom: 2rem;
          position: relative;
          padding: 0 2rem;
        }
        .co-progress__bar {
          position: absolute;
          top: 18px;
          left: calc(16.66% + 18px);
          right: calc(16.66% + 18px);
          height: 3px;
          background: #e8e0d4;
          border-radius: 2px;
          z-index: 0;
        }
        .co-progress__fill {
          height: 100%;
          background: linear-gradient(to right, #C9A96E, #D4B87A);
          border-radius: 2px;
          transition: width 0.4s ease;
        }
        .co-progress__step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          z-index: 1;
        }
        .co-progress__circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #f5f0e8;
          border: 2px solid #e0d6c6;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 700;
          color: #a09080;
          transition: all 0.3s;
        }
        .co-progress__step--active .co-progress__circle {
          background: linear-gradient(135deg, #C9A96E, #D4B87A);
          border-color: #C9A96E;
          color: white;
        }
        .co-progress__step--done .co-progress__circle {
          background: #C9A96E;
          border-color: #C9A96E;
          color: white;
        }
        .co-progress__label {
          font-size: 0.72rem;
          font-weight: 600;
          color: #a09080;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .co-progress__step--active .co-progress__label { color: #2a2018; }

        /* ── Card info banner ── */
        .co-card-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: white;
          border: 1px solid #e8e0d4;
          border-radius: 16px;
          padding: 1rem 1.25rem;
          margin-bottom: 1.5rem;
          gap: 1rem;
        }
        .co-card-info__left { display: flex; align-items: center; gap: 0.75rem; }
        .co-card-info__img { width: 48px; height: 48px; border-radius: 10px; object-fit: cover; border: 1px solid #e8e0d4; }
        .co-card-info__name { font-weight: 600; font-size: 0.95rem; color: #2a2018; }
        .co-card-info__cat { font-size: 0.7rem; color: #C9A96E; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; }
        .co-card-info__right { text-align: right; flex-shrink: 0; }
        .co-card-info__price { display: block; font-size: 1.125rem; font-weight: 700; color: #2a2018; }
        .co-card-info__qty { font-size: 0.72rem; color: #8a7a6a; }

        /* ── Error ── */
        .co-error {
          padding: 0.75rem 1rem;
          background: rgba(220,38,38,0.06);
          border: 1px solid rgba(220,38,38,0.15);
          border-radius: 12px;
          color: #dc2626;
          font-size: 0.8125rem;
          font-weight: 500;
          margin-bottom: 1rem;
        }

        /* ── Step ── */
        .co-step { display: flex; flex-direction: column; gap: 1.25rem; }
        .co-step__title { font-size: 1.25rem; font-weight: 700; color: #2a2018; margin: 0; }
        .co-step__desc { font-size: 0.875rem; color: #8a7a6a; margin: -0.5rem 0 0; }

        /* ── Templates ── */
        .co-templates { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }
        .co-template-btn {
          display: flex; flex-direction: column; align-items: center; gap: 0.375rem;
          padding: 1rem; border-radius: 14px; border: 2px solid #e8e0d4;
          background: white; cursor: pointer; transition: all 0.2s; font-size: 0.8rem; font-weight: 600; color: #5a4a3a;
        }
        .co-template-btn:hover { border-color: #C9A96E; }
        .co-template-btn--active { border-color: #C9A96E; background: rgba(201,169,110,0.06); color: #96793f; }
        .co-template-btn__icon { font-size: 1.5rem; }

        /* ── Fields ── */
        .co-fields-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        @media (max-width: 500px) { .co-fields-grid { grid-template-columns: 1fr; } }
        .co-field { display: flex; flex-direction: column; gap: 0.375rem; }
        .co-label { font-size: 0.75rem; font-weight: 600; color: #6a5a4a; letter-spacing: 0.02em; }
        .co-input {
          padding: 0.7rem 0.875rem; border: 1px solid #e0d6c6; border-radius: 10px;
          font-size: 0.875rem; color: #2a2018; background: white; outline: none;
          transition: border-color 0.2s; font-family: inherit;
        }
        .co-input:focus { border-color: #C9A96E; box-shadow: 0 0 0 3px rgba(201,169,110,0.08); }
        .co-input::placeholder { color: #baa88a; }
        .co-textarea {
          padding: 0.75rem; border: 1px solid #e0d6c6; border-radius: 10px;
          font-size: 0.8125rem; color: #2a2018; background: white; outline: none;
          transition: border-color 0.2s; resize: vertical; line-height: 1.6;
          font-family: inherit; min-height: 180px;
        }
        .co-textarea:focus { border-color: #C9A96E; }

        /* ── Preview ── */
        .co-preview {
          position: relative; padding: 2.5rem 2rem; background: #FFFDF8;
          border: 2px solid #e0d6c6; border-radius: 4px;
          font-size: 0.875rem; line-height: 1.8; color: #3a2a1a;
          text-align: center; white-space: pre-line;
          box-shadow: 0 4px 20px rgba(0,0,0,0.04);
          min-height: 200px;
        }
        .co-preview--urdu { direction: rtl; font-size: 1rem; }
        .co-preview__text { position: relative; z-index: 1; }
        .co-preview__corner {
          position: absolute; width: 20px; height: 20px;
          border-color: #C9A96E; border-style: solid; border-width: 0; opacity: 0.5;
        }
        .co-preview__corner--tl { top: 8px; left: 8px; border-top-width: 2px; border-left-width: 2px; }
        .co-preview__corner--tr { top: 8px; right: 8px; border-top-width: 2px; border-right-width: 2px; }
        .co-preview__corner--bl { bottom: 8px; left: 8px; border-bottom-width: 2px; border-left-width: 2px; }
        .co-preview__corner--br { bottom: 8px; right: 8px; border-bottom-width: 2px; border-right-width: 2px; }

        /* ── Area Dropdown ── */
        .co-select-wrap { position: relative; }
        .co-dropdown {
          position: absolute; top: 100%; left: 0; right: 0; z-index: 50;
          max-height: 200px; overflow-y: auto; background: white;
          border: 1px solid #e0d6c6; border-radius: 10px; margin-top: 4px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        }
        .co-dropdown__item {
          display: block; width: 100%; text-align: left; padding: 0.6rem 0.875rem;
          font-size: 0.8125rem; color: #2a2018; background: none; border: none;
          cursor: pointer; transition: background 0.15s;
        }
        .co-dropdown__item:hover { background: rgba(201,169,110,0.06); }
        .co-dropdown__item--active { color: #C9A96E; font-weight: 600; }
        .co-dropdown__empty { padding: 0.75rem; font-size: 0.8125rem; color: #a09080; text-align: center; }

        /* ── Quantity ── */
        .co-qty-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }
        .co-qty-btn {
          display: flex; flex-direction: column; align-items: center; position: relative;
          padding: 0.75rem 0.5rem; border-radius: 12px; border: 2px solid #e8e0d4;
          background: white; cursor: pointer; transition: all 0.2s; font-size: 0.7rem; color: #6a5a4a;
        }
        .co-qty-btn strong { font-size: 1.125rem; color: #2a2018; }
        .co-qty-btn:hover { border-color: #C9A96E; }
        .co-qty-btn--active { border-color: #C9A96E; background: rgba(201,169,110,0.06); }
        .co-qty-btn--active strong { color: #96793f; }
        .co-qty-btn__badge {
          position: absolute; top: -8px; right: -4px; padding: 1px 6px;
          font-size: 0.6rem; font-weight: 700; background: #22c55e; color: white; border-radius: 20px;
        }

        /* ── Summary ── */
        .co-summary {
          background: #f9f5ee; border-radius: 14px; padding: 1.25rem;
          display: flex; flex-direction: column; gap: 0.5rem;
        }
        .co-summary__row {
          display: flex; justify-content: space-between; font-size: 0.8125rem; color: #5a4a3a;
        }
        .co-summary__row--green { color: #16a34a; font-weight: 500; }
        .co-summary__total {
          display: flex; justify-content: space-between; font-size: 1.125rem; font-weight: 700;
          color: #2a2018; padding-top: 0.5rem; border-top: 1px solid #e0d6c6; margin-top: 0.25rem;
        }

        /* ── Payment ── */
        .co-pay-options { display: flex; flex-direction: column; gap: 0.75rem; }
        .co-pay-option {
          display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.25rem;
          border: 2px solid #e8e0d4; border-radius: 14px; background: white;
          cursor: pointer; transition: all 0.2s; text-align: left; width: 100%;
        }
        .co-pay-option:hover { border-color: #C9A96E; }
        .co-pay-option--active { border-color: #C9A96E; background: rgba(201,169,110,0.04); }
        .co-pay-option__radio {
          width: 20px; height: 20px; border-radius: 50%; border: 2px solid #ccc;
          flex-shrink: 0; transition: all 0.2s; position: relative;
        }
        .co-pay-option--active .co-pay-option__radio {
          border-color: #C9A96E;
        }
        .co-pay-option--active .co-pay-option__radio::after {
          content: ''; position: absolute; top: 3px; left: 3px; right: 3px; bottom: 3px;
          background: #C9A96E; border-radius: 50%;
        }
        .co-pay-option strong { display: block; font-size: 0.9rem; color: #2a2018; }
        .co-pay-option span { font-size: 1.125rem; font-weight: 700; color: #C9A96E; }

        .co-disclaimer {
          padding: 0.875rem 1rem; background: rgba(234,179,8,0.06);
          border: 1px solid rgba(234,179,8,0.15); border-radius: 12px;
          font-size: 0.78rem; color: #92400e; line-height: 1.5;
        }

        .co-amount-due {
          display: flex; justify-content: space-between; align-items: center;
          padding: 1rem 1.25rem; background: #f9f5ee; border-radius: 14px;
        }
        .co-amount-due span:first-child { font-weight: 600; color: #2a2018; }
        .co-amount-due__value { font-size: 1.5rem; font-weight: 800; color: #C9A96E; }

        .co-pay-details {
          background: white; border: 1px solid #e8e0d4; border-radius: 14px; padding: 1.25rem;
        }
        .co-pay-details h4 { font-size: 0.9rem; font-weight: 700; color: #2a2018; margin: 0 0 0.75rem; }
        .co-pay-methods { display: flex; flex-direction: column; gap: 0.5rem; }
        .co-pay-method {
          display: flex; justify-content: space-between; padding: 0.6rem 0.75rem;
          background: #f9f5ee; border-radius: 8px; font-size: 0.8125rem;
        }
        .co-pay-method__label { color: #6a5a4a; font-weight: 500; }
        .co-pay-method__value { font-weight: 700; color: #2a2018; font-family: monospace; }
        .co-pay-details__note { font-size: 0.75rem; color: #8a7a6a; margin: 0.75rem 0 0; }

        /* ── Upload ── */
        .co-upload-zone {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 0.5rem; padding: 1.5rem; border: 2px dashed #d4c8b0; border-radius: 14px;
          background: rgba(201,169,110,0.02); cursor: pointer; transition: all 0.2s;
          color: #8a7a6a; font-size: 0.875rem; font-weight: 500; width: 100%;
        }
        .co-upload-zone:hover { border-color: #C9A96E; background: rgba(201,169,110,0.05); }
        .co-upload-zone__hint { font-size: 0.72rem; color: #a09080; }

        .co-receipt-preview { display: flex; align-items: center; gap: 1rem; padding: 0.75rem; background: #f9f5ee; border-radius: 12px; }
        .co-receipt-preview__img { width: 64px; height: 64px; object-fit: cover; border-radius: 8px; border: 1px solid #e0d6c6; }
        .co-receipt-preview__actions { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; }
        .co-receipt-preview__ok { font-size: 0.8rem; font-weight: 600; color: #16a34a; }

        /* ── Actions ── */
        .co-actions { display: flex; justify-content: space-between; gap: 0.75rem; padding-top: 0.5rem; }
        .co-btn {
          padding: 0.75rem 1.5rem; border-radius: 12px; font-size: 0.875rem; font-weight: 600;
          cursor: pointer; transition: all 0.2s; border: none; font-family: inherit;
        }
        .co-btn--primary { background: linear-gradient(135deg, #C9A96E, #B8944D); color: white; }
        .co-btn--primary:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(201,169,110,0.35); }
        .co-btn--secondary { background: white; color: #5a4a3a; border: 1px solid #e0d6c6; }
        .co-btn--secondary:hover { background: #f9f5ee; }
        .co-btn--submit {
          flex: 1; padding: 1rem; background: linear-gradient(135deg, #C9A96E, #B8944D);
          color: white; font-size: 1rem;
        }
        .co-btn--submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(201,169,110,0.4); }
        .co-btn--submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .co-btn--small { padding: 0.375rem 0.75rem; font-size: 0.72rem; border-radius: 8px; background: white; border: 1px solid #e0d6c6; color: #5a4a3a; cursor: pointer; }
        .co-btn--danger { color: #dc2626; border-color: rgba(220,38,38,0.2); }
      `}</style>
    </>
  );
}
