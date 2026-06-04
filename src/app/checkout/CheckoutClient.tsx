'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type { CardProduct, AddOn } from '@/types';
import { calculatePrice, calculateAddonEventPrice, formatPKR } from '@/lib/pricing';
import { beginCheckout, purchase } from '@/lib/analytics';
import CheckoutStep1, {
  ADDON_EVENTS, ADDON_MIN_QTY,
  type MainEvent, type AddOnEventData,
} from './CheckoutStep1';

// ─── Constants ────────────────────────────────────────────────────────────────

const KARACHI_AREAS = [
  'Gulshan-e-Iqbal', 'DHA', 'North Nazimabad', 'Clifton', 'PECHS',
  'Saddar', 'Malir', 'Korangi', 'Nazimabad', 'Gulistan-e-Johar',
  'Bahria Town', 'FB Area', 'Tariq Road', 'Liaquatabad', 'Orangi Town',
  'Landhi', 'Shah Faisal', 'Scheme 33', 'North Karachi', 'Surjani Town',
  'Garden', 'Lyari', 'Kemari', 'Bin Qasim', 'Other',
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface CheckoutProps {
  card: CardProduct;
  initialQty: number;
  initialAddOnIds: string[];
}

interface FormData {
  // Step 1
  mainEvent: MainEvent;
  addOnEvents: AddOnEventData[];
  // Step 2
  customerName: string;
  whatsapp: string;
  area: string;
  address: string;
  quantity: number;
  // Step 2 — payment preference
  paymentMethod: 'full' | 'deposit';
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CheckoutClient({ card, initialQty, initialAddOnIds }: CheckoutProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Fire InitiateCheckout on mount
  useEffect(() => {
    beginCheckout(card.slug, initialQty, card.base_price * initialQty);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [selectedAddOnIds] = useState<Set<string>>(new Set(initialAddOnIds));
  const selectedAddOns = useMemo(
    () => card.add_ons.filter((a: AddOn) => selectedAddOnIds.has(a.id)),
    [card.add_ons, selectedAddOnIds]
  );

  const [form, setForm] = useState<FormData>({
    mainEvent: 'Wedding',
    addOnEvents: ADDON_EVENTS.map(eventType => ({
      eventType,
      enabled: false,
      quantity: '',
    })),
    customerName: '',
    whatsapp: '',
    area: '',
    address: '',
    quantity: initialQty || 100,
    paymentMethod: 'deposit',
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

  const addonTotals = useMemo(
    () => form.addOnEvents.map(evt => {
      if (!evt.enabled) return 0;
      const qty = parseInt(evt.quantity, 10);
      const addonCardPrice = card.inner_card_price ?? 0;
      return isNaN(qty) || qty < 1 ? 0 : calculateAddonEventPrice(addonCardPrice, qty);
    }),
    [form.addOnEvents, card.inner_card_price]
  );

  const grandTotal = useMemo(
    () => breakdown.total + addonTotals.reduce((a, b) => a + b, 0),
    [breakdown.total, addonTotals]
  );

  const updateAddonEvent = useCallback((idx: number, patch: Partial<AddOnEventData>) => {
    setForm(f => {
      const next = [...f.addOnEvents];
      next[idx] = { ...next[idx], ...patch };
      return { ...f, addOnEvents: next };
    });
  }, []);

  const amountDue = grandTotal;

  // ─── Validation ─────────────────────────────────────────────────────────────

  const validateStep = (s: number): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (s === 1) {
      form.addOnEvents.forEach((evt, idx) => {
        if (!evt.enabled || evt.eventType === form.mainEvent) return;
        const qty = parseInt(evt.quantity, 10);
        if (!evt.quantity.trim() || isNaN(qty)) {
          errors[`addon_qty_${idx}`] = `Please enter a quantity for ${evt.eventType}`;
        } else if (qty < ADDON_MIN_QTY) {
          errors[`addon_qty_${idx}`] = `Minimum quantity for ${evt.eventType} is ${ADDON_MIN_QTY}`;
        }
      });
    }
    if (s === 2) {
      if (!form.customerName.trim()) errors.customerName = 'Please enter your full name';
      if (!form.whatsapp.trim()) {
        errors.whatsapp = 'Please enter your WhatsApp number';
      } else if (!/^(\+92|0)?3\d{9}$/.test(form.whatsapp.replace(/[\s-]/g, ''))) {
        errors.whatsapp = 'Invalid number. Use format: 03XX-XXXXXXX';
      }
      if (!form.area) errors.area = 'Please select your delivery area';
      if (!form.address.trim()) errors.address = 'Please enter your delivery address';
    }
    return errors;
  };

  const nextStep = () => {
    const errors = validateStep(step);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please fill in all required fields');
      return;
    }
    setFieldErrors({});
    setError('');
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setError('');
    setFieldErrors({});
    setStep(s => s - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ─── Submit order ───────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    const errors = validateStep(2);
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); setError('Please fill in all required fields'); return; }
    setFieldErrors({});
    setError('');
    setSubmitting(true);

    try {
      const enabledAddons = form.addOnEvents.filter(e => e.enabled && e.eventType !== form.mainEvent);
      const payload = {
        card_slug: card.slug,
        card_name: card.name,
        quantity: form.quantity,
        base_price: card.base_price,
        inner_card_price: card.inner_card_price ?? 0,
        add_ons: selectedAddOns.map(a => ({ name: a.name, price: a.price })),
        total: grandTotal,
        customization: {
          main_event: form.mainEvent,
          addon_events: enabledAddons.map(e => ({
            event_type: e.eventType,
            quantity: parseInt(e.quantity, 10),
            price_per_card: card.inner_card_price ?? 0,
          })),
        },
        customer: {
          name: form.customerName,
          whatsapp: form.whatsapp,
          area: form.area,
          address: form.address,
        },
        payment: {
          method: form.paymentMethod,
          amount_due: amountDue,
        },
      };

      beginCheckout(card.slug, form.quantity, grandTotal);

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to place order');
      }

      // Fire Purchase event with confirmed order details
      purchase(json.data.order_id, card.slug, form.quantity, grandTotal);

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
      <div className="co-wrapper">
        {/* Progress Bar */}
        <div className="co-progress">
          {[1, 2].map(s => (
            <div key={s} className={`co-progress__step ${step >= s ? 'co-progress__step--active' : ''} ${step > s ? 'co-progress__step--done' : ''}`}>
              <div className="co-progress__circle">
                {step > s ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>
                ) : s}
              </div>
              <span className="co-progress__label">
                {s === 1 ? 'Event Cards' : 'Your Details'}
              </span>
            </div>
          ))}
          <div className="co-progress__bar">
            <div className="co-progress__fill" style={{ width: `${(step - 1) * 100}%` }} />
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
            <span className="co-card-info__price">{formatPKR(grandTotal)}</span>
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
            <CheckoutStep1
              key="step1"
              card={card}
              quantity={form.quantity}
              selectedAddOns={selectedAddOns}
              mainEvent={form.mainEvent}
              addOnEvents={form.addOnEvents}
              fieldErrors={fieldErrors}
              mainTotal={breakdown.total}
              onMainEventChange={evt => setForm(f => ({ ...f, mainEvent: evt }))}
              onAddonChange={updateAddonEvent}
              onClearError={field => setFieldErrors(fe => { const n = {...fe}; delete n[field]; return n; })}
              onNext={nextStep}
              onBack={() => router.back()}
            />
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
                    className={`co-input ${fieldErrors.customerName ? 'co-input--error' : ''}`}
                    placeholder="Your full name"
                    value={form.customerName}
                    onChange={e => { setForm(f => ({ ...f, customerName: e.target.value })); setFieldErrors(fe => { const n = {...fe}; delete n.customerName; return n; }); }}
                  />
                  {fieldErrors.customerName && <span className="co-field-error">{fieldErrors.customerName}</span>}
                </div>
                <div className="co-field">
                  <label className="co-label">WhatsApp Number *</label>
                  <input
                    className={`co-input ${fieldErrors.whatsapp ? 'co-input--error' : ''}`}
                    placeholder="03XX-XXXXXXX"
                    value={form.whatsapp}
                    onChange={e => { setForm(f => ({ ...f, whatsapp: e.target.value })); setFieldErrors(fe => { const n = {...fe}; delete n.whatsapp; return n; }); }}
                  />
                  {fieldErrors.whatsapp && <span className="co-field-error">{fieldErrors.whatsapp}</span>}
                </div>
              </div>

              {/* Area Dropdown */}
              <div className="co-field" ref={areaRef}>
                <label className="co-label">Delivery Area (Karachi) *</label>
                <div className="co-select-wrap">
                  <input
                    className={`co-input ${fieldErrors.area ? 'co-input--error' : ''}`}
                    placeholder="Search area…"
                    value={areaDropdownOpen ? areaSearch : form.area || areaSearch}
                    onChange={e => { setAreaSearch(e.target.value); setAreaDropdownOpen(true); setFieldErrors(fe => { const n = {...fe}; delete n.area; return n; }); }}
                    onFocus={() => setAreaDropdownOpen(true)}
                  />
                  {areaDropdownOpen && (
                    <div className="co-dropdown">
                      {filteredAreas.length > 0 ? filteredAreas.map(a => (
                        <button
                          key={a}
                          className={`co-dropdown__item ${form.area === a ? 'co-dropdown__item--active' : ''}`}
                          onClick={() => { setForm(f => ({ ...f, area: a })); setAreaSearch(''); setAreaDropdownOpen(false); setFieldErrors(fe => { const n = {...fe}; delete n.area; return n; }); }}
                        >
                          {a}
                        </button>
                      )) : (
                        <div className="co-dropdown__empty">No areas found</div>
                      )}
                    </div>
                  )}
                </div>
                {fieldErrors.area && <span className="co-field-error">{fieldErrors.area}</span>}
              </div>

              {/* Delivery Address */}
              <div className="co-field">
                <label className="co-label">Delivery Address *</label>
                <input
                  className={`co-input ${fieldErrors.address ? 'co-input--error' : ''}`}
                  placeholder="House/flat no, street, block, area"
                  value={form.address}
                  onChange={e => { setForm(f => ({ ...f, address: e.target.value })); setFieldErrors(fe => { const n = {...fe}; delete n.address; return n; }); }}
                />
                {fieldErrors.address && <span className="co-field-error">{fieldErrors.address}</span>}
              </div>

              {/* Order Summary */}
              <div className="co-summary">
                <div className="co-summary__section-label">🗂 Order Summary</div>
                {/* Main Event */}
                <div className="co-summary__row">
                  <span>
                    {form.mainEvent} (Main) — {form.quantity} cards
                    {breakdown.discount > 0 && (
                      <span className="co-summary__discount-tag"> ({breakdown.discountPercent}% bulk discount)</span>
                    )}
                  </span>
                  <span>{formatPKR(breakdown.total)}</span>
                </div>
                {/* Add-on Events */}
                {form.addOnEvents
                  .filter(e => e.enabled && e.eventType !== form.mainEvent)
                  .map(evt => {
                    const qty = parseInt(evt.quantity, 10);
                    if (isNaN(qty) || qty < 1) return null;
                    const addonCardPrice = card.inner_card_price ?? 0;
                    const t = calculateAddonEventPrice(addonCardPrice, qty);
                    return (
                      <div key={evt.eventType} className="co-summary__row">
                        <span>{evt.eventType} (Inner card) — {qty} × {addonCardPrice > 0 ? formatPKR(addonCardPrice) : '?'}/card</span>
                        <span>{addonCardPrice > 0 ? formatPKR(t) : 'TBD'}</span>
                      </div>
                    );
                  })}
                <div className="co-summary__total">
                  <span>Grand Total</span>
                  <span>{formatPKR(grandTotal)}</span>
                </div>
              </div>

              {/* Payment Preference */}
              <div>
                <label className="co-label" style={{ marginBottom: '0.5rem', display: 'block' }}>💳 Payment Preference</label>
                <div className="co-pay-options">
                  <button
                    className={`co-pay-option ${form.paymentMethod === 'full' ? 'co-pay-option--active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, paymentMethod: 'full' }))}
                  >
                    <div className="co-pay-option__radio" />
                    <div>
                      <strong>Full Payment</strong>
                      <span>{formatPKR(grandTotal)}</span>
                    </div>
                  </button>
                  <button
                    className={`co-pay-option ${form.paymentMethod === 'deposit' ? 'co-pay-option--active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, paymentMethod: 'deposit' }))}
                  >
                    <div className="co-pay-option__radio" />
                    <div>
                      <strong>50% Deposit</strong>
                      <span>{formatPKR(Math.ceil(grandTotal / 2))} now · {formatPKR(grandTotal - Math.ceil(grandTotal / 2))} on delivery</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* WhatsApp Handoff Notice */}
              <div className="co-whatsapp-notice">
                <div className="co-whatsapp-notice__icon">💬</div>
                <div>
                  <strong>Payment via WhatsApp</strong>
                  <p>No online payment required right now. Once you place your order, our team will reach out to you on WhatsApp to confirm details and guide you through the payment process.</p>
                </div>
              </div>

              <div className="co-actions">
                <button className="co-btn co-btn--secondary" onClick={prevStep}>← Back</button>
                <button
                  className="co-btn co-btn--submit"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? '⏳ Placing Order…' : '✓ Place Order'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>


      <style>{`
        .co-wrapper {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 1.5rem 3rem;
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
          text-align: center;
          white-space: nowrap;
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

        /* ── Field-level errors ── */
        .co-field-error {
          font-size: 0.72rem;
          color: #dc2626;
          font-weight: 500;
          margin-top: 2px;
        }
        .co-input--error {
          border-color: #dc2626 !important;
          background: rgba(220,38,38,0.02);
        }
        .co-input--error:focus {
          box-shadow: 0 0 0 3px rgba(220,38,38,0.08) !important;
        }

        /* ── Step ── */
        .co-step { display: flex; flex-direction: column; gap: 1.25rem; }
        .co-step__title { font-size: 1.25rem; font-weight: 700; color: #2a2018; margin: 0; }
        .co-step__desc { font-size: 0.875rem; color: #8a7a6a; margin: -0.5rem 0 0; }

        /* ── Templates ── */
        .co-templates { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
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
          position: relative; padding: 2rem 1.75rem 1.5rem; background: #FFFDF8;
          border: 2px solid #e0d6c6; border-radius: 4px;
          color: #3a2a1a;
          box-shadow: 0 4px 20px rgba(0,0,0,0.04);
          min-height: 200px; flex: 1;
          display: flex; flex-direction: column;
          font-family: 'Georgia', 'Times New Roman', serif;
        }
        .co-preview--compact { min-height: 160px; padding: 1.5rem 1.25rem; }
        .co-preview__body { display: flex; flex-direction: column; align-items: center; text-align: center; flex: 1; }
        .co-preview__spacer { height: 0.6em; }
        .co-preview__line { font-size: 0.75rem; line-height: 1.6; color: #4a3a2a; }
        .co-preview__small-caps {
          font-size: 0.62rem; letter-spacing: 0.12em; text-transform: uppercase;
          color: #5a4a3a; line-height: 1.7; font-weight: 500;
        }
        .co-preview__name {
          font-size: 1.35rem; font-family: 'Georgia', serif; font-style: italic;
          color: #2a1a0a; line-height: 1.3; margin: 0.1em 0;
          letter-spacing: 0.01em;
        }
        .co-preview--compact .co-preview__name { font-size: 1rem; }
        .co-preview__with {
          font-size: 0.72rem; font-style: italic; color: #6a5a4a;
          letter-spacing: 0.05em;
        }
        .co-preview__date {
          font-size: 0.78rem; font-weight: 700; letter-spacing: 0.05em;
          color: #3a2a1a; border-top: 1px solid #e0d6c6; border-bottom: 1px solid #e0d6c6;
          padding: 0.35em 1em; margin: 0.4em 0;
        }
        .co-preview__at {
          font-size: 0.62rem; letter-spacing: 0.2em; text-transform: uppercase;
          color: #8a7a6a; margin-top: 0.2em;
        }
        .co-preview__venue {
          font-size: 0.82rem; font-weight: 700; letter-spacing: 0.06em;
          text-transform: uppercase; color: #2a1a0a; line-height: 1.4;
        }
        .co-preview__footer {
          margin-top: 1rem; padding-top: 0.6rem; border-top: 1px solid #e0d6c6;
          display: flex; flex-direction: column; gap: 0.15em; width: 100%;
        }
        .co-preview__footer-row {
          display: flex; justify-content: space-between; align-items: flex-start;
          font-size: 0.58rem; color: #5a4a3a; line-height: 1.7;
          font-family: 'Georgia', serif;
        }
        .co-preview__footer-left { text-align: left; }
        .co-preview__footer-right { text-align: right; }

        /* ── Event pills ── */
        .co-event-pills { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .co-event-pill {
          padding: 0.5rem 1.25rem; border-radius: 999px; border: 2px solid #e0d6c6;
          background: white; font-size: 0.875rem; font-weight: 600; color: #5a4a3a;
          cursor: pointer; transition: all 0.2s;
        }
        .co-event-pill:hover { border-color: #C9A96E; }
        .co-event-pill--active { border-color: #C9A96E; background: #C9A96E; color: white; }

        /* ── Side-by-side editor ── */
        .co-editor-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; align-items: start;
        }
        @media (max-width: 700px) { .co-editor-grid { grid-template-columns: 1fr; } }

        /* ── Hint bar ── */
        .co-hint-bar {
          display: flex; flex-wrap: wrap; align-items: center; gap: 0.375rem;
          padding: 0.5rem 0.75rem; background: #fef9f0; border: 1px solid #f0e6ce;
          border-radius: 8px; font-size: 0.72rem; color: #8a7a6a; margin-bottom: 0.25rem;
        }
        .co-token {
          display: inline-block; padding: 0.1rem 0.5rem; background: #C9A96E1a;
          border: 1px solid #C9A96E50; border-radius: 4px; font-family: monospace;
          font-size: 0.68rem; color: #96793f; font-weight: 600;
        }

        /* ── Add-on Events ── */
        .co-addons-section {
          background: #faf7f2; border: 1px solid #e8e0d4; border-radius: 16px; padding: 1.25rem;
          display: flex; flex-direction: column; gap: 0.875rem;
        }
        .co-addons-title { font-size: 1rem; font-weight: 700; color: #2a2018; margin: 0; }
        .co-addons-desc { font-size: 0.8rem; color: #8a7a6a; margin: -0.5rem 0 0; }
        .co-addons-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .co-addon-item {
          background: white; border: 1px solid #e8e0d4; border-radius: 12px; overflow: hidden;
        }
        .co-addon-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.75rem 1rem; gap: 1rem; flex-wrap: wrap;
        }
        .co-addon-row--disabled { opacity: 0.45; pointer-events: none; }
        .co-addon-check-label {
          display: flex; align-items: center; gap: 0.625rem; cursor: pointer;
          font-size: 0.875rem; font-weight: 600; color: #2a2018;
        }
        .co-addon-check-label input[type=checkbox] {
          width: 18px; height: 18px; accent-color: #C9A96E; cursor: pointer;
        }
        .co-addon-badge {
          font-size: 0.65rem; font-weight: 700; padding: 0.1rem 0.5rem;
          background: #C9A96E20; color: #96793f; border-radius: 999px; border: 1px solid #C9A96E40;
        }
        .co-addon-qty-row {
          display: flex; align-items: center; gap: 0.625rem; flex-wrap: wrap;
        }
        .co-addon-qty-label { font-size: 0.75rem; color: #8a7a6a; font-weight: 500; white-space: nowrap; }
        .co-addon-qty-input {
          width: 160px; padding: 0.45rem 0.75rem; border: 1px solid #e0d6c6; border-radius: 8px;
          font-size: 0.875rem; color: #2a2018; outline: none; font-family: inherit;
        }
        .co-addon-qty-input:focus { border-color: #C9A96E; }
        .co-addon-qty-input::placeholder { color: #baa88a; }
        .co-addon-price { font-size: 0.875rem; font-weight: 700; color: #C9A96E; white-space: nowrap; }
        .co-addon-editor { padding: 0 1rem 1rem; border-top: 1px solid #f0e6ce; }
        .co-addon-editor > .co-editor-grid { padding-top: 1rem; }
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
        .co-summary__section-label {
          font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
          color: #C9A96E; margin-bottom: 0.25rem;
        }
        .co-summary__row {
          display: flex; justify-content: space-between; font-size: 0.8125rem; color: #5a4a3a;
        }
        .co-summary__row--green { color: #16a34a; font-weight: 500; }
        .co-summary__discount-tag { font-size: 0.72rem; color: #16a34a; font-weight: 600; }
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

        /* ── WhatsApp Notice (checkout step 2) ── */
        .co-whatsapp-notice {
          display: flex; align-items: flex-start; gap: 0.875rem;
          padding: 1rem 1.25rem; background: linear-gradient(135deg, #e7f7ee, #dcf5e7);
          border: 1px solid #a7e3bf; border-radius: 14px;
        }
        .co-whatsapp-notice__icon { font-size: 1.75rem; flex-shrink: 0; line-height: 1; }
        .co-whatsapp-notice strong { display: block; font-size: 0.9rem; color: #14532d; margin-bottom: 0.25rem; }
        .co-whatsapp-notice p { font-size: 0.8rem; color: #166534; margin: 0; line-height: 1.5; }

        /* ── Step 1 WhatsApp Banner (green, top of step) ── */
        .co-wa-notice {
          display: flex; align-items: flex-start; gap: 0.875rem;
          padding: 0.875rem 1.125rem; background: #f0fdf4;
          border: 1px solid #bbf7d0; border-radius: 14px;
        }
        .co-wa-notice__icon { font-size: 1.5rem; flex-shrink: 0; line-height: 1.2; }
        .co-wa-notice strong { display: block; font-size: 0.85rem; color: #14532d; margin-bottom: 0.2rem; }
        .co-wa-notice p { font-size: 0.78rem; color: #166534; margin: 0; line-height: 1.5; }

        /* ── Step hint (below event selector) ── */
        .co-step__hint { font-size: 0.78rem; color: #8a7a6a; margin-top: 0.5rem; }
        .co-step__hint strong { color: #C9A96E; }

        /* ── Add-ons section header row ── */
        .co-addons-header {
          display: flex; align-items: center; justify-content: space-between; gap: 1rem;
        }
        .co-addons-price-badge {
          display: inline-flex; align-items: center;
          padding: 0.25rem 0.75rem; border-radius: 999px;
          background: rgba(201,169,110,0.12); color: #96793f;
          border: 1px solid rgba(201,169,110,0.3); font-size: 0.75rem; font-weight: 700;
          white-space: nowrap;
        }
        .co-addons-price-badge--warn {
          background: rgba(234,179,8,0.1); color: #92400e;
          border-color: rgba(234,179,8,0.25);
        }

        /* ── Addon per-card price info ── */
        .co-addon-price-info {
          display: flex; flex-direction: column; align-items: flex-end; gap: 0.1rem;
          white-space: nowrap;
        }
        .co-addon-unit-price { font-size: 0.72rem; color: #8a7a6a; }

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
