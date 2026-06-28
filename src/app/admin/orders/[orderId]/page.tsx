'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

const STATUS_OPTIONS = [
  { value: 'pending_payment', label: '⏳ Pending Payment', color: '#f59e0b' },
  { value: 'confirmed',      label: '✓ Confirmed',        color: '#10b981' },
  { value: 'in_production',  label: '🔄 In Production',   color: '#3b82f6' },
  { value: 'completed',      label: '✅ Completed',        color: '#8b5cf6' },
];

function statusLabel(s: string) {
  return STATUS_OPTIONS.find(o => o.value === s)?.label ?? s;
}
function statusColor(s: string) {
  return STATUS_OPTIONS.find(o => o.value === s)?.color ?? '#6b7280';
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <section className="od-card">
      <h2 className="od-card__title"><span>{icon}</span> {title}</h2>
      {children}
    </section>
  );
}

function Field({ label, value, mono, highlight, full }: {
  label: string; value?: React.ReactNode; mono?: boolean; highlight?: boolean; full?: boolean;
}) {
  return (
    <div className={`od-field${full ? ' od-field--full' : ''}`}>
      <span className="od-field__label">{label}</span>
      <span className={`od-field__value${mono ? ' od-field__value--mono' : ''}${highlight ? ' od-field__value--highlight' : ''}`}>
        {value ?? '—'}
      </span>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildWhatsApp(order: any) {
  const msg =
    `Assalam o Alaikum ${order.customer?.name}! 🌙\n\n` +
    `Your order *#${order.order_id}* has been *confirmed!* ✅\n\n` +
    `📋 *Card:* ${order.card_name}\n` +
    `🎉 *Event:* ${order.customization?.main_event}\n` +
    `📦 *Quantity:* ${order.quantity} cards\n` +
    `💰 *Order Total:* PKR ${order.total?.toLocaleString()}\n\n` +
    `Please share the following details so we can design your card:\n` +
    `• Names (bride & groom)\n` +
    `• Date, time & venue of each event\n` +
    `• Contact numbers to print on card\n\n` +
    `Your cards will be designed, printed and dispatched to ${order.customer?.area}, Karachi within *7-10 working days* after design approval.\n\n` +
    `We'll share a mockup for your approval before printing. Thank you for choosing Shahi Bulawa! 🤍`;
  return `https://wa.me/${(order.customer?.whatsapp || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`;
}

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const json = await res.json();
      if (json.success) setOrder(json.data);
      else setError(json.error || 'Order not found');
    } catch {
      setError('Failed to load order');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  const updateStatus = async (status: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 'payment.status': status }),
      });
      const json = await res.json();
      if (json.success) { setOrder(json.data); showToast('Status updated!'); }
      else showToast('Failed to update status');
    } catch { showToast('Error updating status'); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="od-page od-page--center">
      <div className="od-spinner" />
    </div>
  );

  if (error || !order) return (
    <div className="od-page od-page--center">
      <p style={{ color: '#dc2626' }}>{error || 'Order not found'}</p>
      <button className="od-btn od-btn--ghost" onClick={() => router.back()} style={{ marginTop: '1rem' }}>← Back</button>
    </div>
  );

  const addonEvents: { event_type: string; quantity: number; price_per_card?: number }[] =
    order.customization?.addon_events ?? [];

  return (
    <div className="od-page">
      {toast && <div className="od-toast">{toast}</div>}

      {/* Header */}
      <header className="od-header">
        <button className="od-btn od-btn--ghost" onClick={() => router.back()}>← Back to Orders</button>
        <div className="od-header__center">
          <h1 className="od-header__title">Order <span className="od-header__id">{order.order_id}</span></h1>
          <p className="od-header__meta">
            {order.created_at ? new Date(order.created_at).toLocaleDateString('en-PK', {
              day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
            }) : ''}
          </p>
        </div>
        <div className="od-header__actions">
          {order.payment?.status === 'confirmed' && (
            <a href={buildWhatsApp(order)} target="_blank" rel="noopener noreferrer" className="od-btn od-btn--wa">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Send WhatsApp
            </a>
          )}
        </div>
      </header>

      <div className="od-grid-layout">

        {/* ── Left Column ── */}
        <div className="od-col">

          {/* Order Info */}
          <Section title="Order Info" icon="📋">
            <div className="od-fields">
              <Field label="Order ID" value={order.order_id} mono />
              <Field label="Card" value={order.card_name} />
              <Field label="Main Event" value={order.customization?.main_event} highlight />
              <Field label="Quantity" value={`${order.quantity} cards`} />
              <Field label="Base Price / card" value={`PKR ${order.base_price?.toLocaleString()}`} />
            </div>
          </Section>

          {/* Add-on Events (if any) */}
          {addonEvents.length > 0 && (
            <Section title="Additional Event Cards" icon="🎴">
              <div className="od-addons-list">
                {addonEvents.map((evt, i) => (
                  <div key={i} className="od-addon-row">
                    <span>{evt.event_type}</span>
                    <span className="od-field__value--highlight">{evt.quantity} cards{evt.price_per_card ? ` × PKR ${evt.price_per_card.toLocaleString()}/card` : ''}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

        </div>

        {/* ── Right Column ── */}
        <div className="od-col">

          {/* Status Control */}
          <Section title="Order Status" icon="🔖">
            <div className="od-status-current" style={{ borderColor: statusColor(order.payment?.status) }}>
              <span style={{ color: statusColor(order.payment?.status) }}>
                {statusLabel(order.payment?.status || 'pending_payment')}
              </span>
            </div>
            <div className="od-status-btns">
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  className={`od-status-btn${order.payment?.status === opt.value ? ' od-status-btn--active' : ''}`}
                  style={order.payment?.status === opt.value ? { borderColor: opt.color, color: opt.color } : {}}
                  onClick={() => updateStatus(opt.value)}
                  disabled={saving || order.payment?.status === opt.value}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Section>

          {/* Payment */}
          <Section title="Payment" icon="💳">
            <div className="od-fields">
              <Field label="Payment Preference" value={order.payment?.method === 'full' ? '💰 Full Payment' : '💳 50% Deposit'} />
              <Field label="Order Total" value={`PKR ${order.total?.toLocaleString()}`} highlight />
            </div>
            <p className="od-hint">Payment is collected manually via WhatsApp.</p>
          </Section>

          {/* Customer & Delivery */}
          <Section title="Customer & Delivery" icon="🚚">
            <div className="od-fields">
              <Field label="Name" value={order.customer?.name} />
              <Field label="WhatsApp" value={order.customer?.whatsapp} mono />
              <Field label="Area" value={`${order.customer?.area}, Karachi`} />
              <Field label="Address" value={order.customer?.address} full />
            </div>
          </Section>

          {/* Card Add-ons (premium add-ons like gold foil etc) */}
          {order.add_ons?.length > 0 && (
            <Section title="Premium Add-ons" icon="✨">
              <div className="od-addons-list">
                {order.add_ons.map((a: { name: string; price: number }, i: number) => (
                  <div key={i} className="od-addon-row">
                    <span>{a.name}</span>
                    <span className="od-field__value--highlight">PKR {a.price?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

        </div>
      </div>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0d0b09; }

        .od-page {
          min-height: 100vh; background: #0d0b09; color: #e8ddd0;
          font-family: 'Inter', system-ui, sans-serif; padding: 1.5rem;
        }
        .od-page--center { display: flex; flex-direction: column; align-items: center; justify-content: center; }

        .od-toast {
          position: fixed; top: 1.25rem; right: 1.25rem; z-index: 9999;
          background: #C9A96E; color: white; padding: 0.65rem 1.25rem;
          border-radius: 10px; font-size: 0.875rem; font-weight: 600;
          box-shadow: 0 4px 20px rgba(201,169,110,0.35);
          animation: slideIn 0.2s ease;
        }
        @keyframes slideIn { from { transform: translateY(-8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .od-spinner {
          width: 36px; height: 36px; border: 3px solid rgba(201,169,110,0.2);
          border-top-color: #C9A96E; border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Header ── */
        .od-header {
          display: flex; align-items: center; justify-content: space-between;
          gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap;
        }
        .od-header__center { text-align: center; flex: 1; }
        .od-header__title { font-size: 1.375rem; font-weight: 700; color: #e8ddd0; }
        .od-header__id { color: #C9A96E; font-family: monospace; }
        .od-header__meta { font-size: 0.8rem; color: #6a5a4a; margin-top: 0.25rem; }
        .od-header__actions { display: flex; gap: 0.5rem; flex-shrink: 0; }

        /* ── Buttons ── */
        .od-btn {
          display: inline-flex; align-items: center; gap: 0.375rem;
          padding: 0.55rem 1rem; border-radius: 10px; font-size: 0.8125rem;
          font-weight: 600; cursor: pointer; border: none; font-family: inherit;
          transition: all 0.2s; text-decoration: none;
        }
        .od-btn--ghost { background: rgba(255,255,255,0.05); color: #a09080; border: 1px solid rgba(255,255,255,0.08); }
        .od-btn--ghost:hover { background: rgba(255,255,255,0.09); color: #e8ddd0; }
        .od-btn--wa { background: #25D366; color: white; }
        .od-btn--wa:hover { background: #1db954; }

        /* ── Layout ── */
        .od-grid-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; align-items: start; }
        @media (max-width: 900px) { .od-grid-layout { grid-template-columns: 1fr; } }
        .od-col { display: flex; flex-direction: column; gap: 1.25rem; }

        /* ── Card ── */
        .od-card {
          background: #161210; border: 1px solid rgba(201,169,110,0.12);
          border-radius: 16px; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem;
        }
        .od-card__title {
          font-size: 0.8rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.1em; color: #C9A96E; display: flex; align-items: center; gap: 0.5rem;
        }

        /* ── Fields ── */
        .od-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .od-field { display: flex; flex-direction: column; gap: 0.2rem; }
        .od-field--full { grid-column: 1 / -1; }
        .od-field__label { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.08em; color: #6a5a4a; font-weight: 600; }
        .od-field__value { font-size: 0.875rem; color: #c8b89a; }
        .od-field__value--mono { font-family: monospace; }
        .od-field__value--highlight { color: #C9A96E; font-weight: 700; }

        /* ── Card content box ── */
        .od-content-box {
          background: #FFFDF8; color: #3a2a1a;
          border-radius: 10px; padding: 1.25rem 1.5rem;
          font-family: 'Georgia', serif; font-size: 0.875rem;
          line-height: 1.9; text-align: center; white-space: pre-line;
          border: 1px solid #e0d6c6;
        }

        /* ── Status ── */
        .od-status-current {
          padding: 0.65rem 1rem; border-radius: 10px;
          border: 2px solid; font-size: 0.95rem; font-weight: 700;
          text-align: center; background: rgba(255,255,255,0.03);
        }
        .od-status-btns { display: flex; flex-direction: column; gap: 0.5rem; }
        .od-status-btn {
          width: 100%; padding: 0.6rem 1rem; border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03);
          color: #a09080; font-size: 0.8125rem; font-weight: 600;
          cursor: pointer; text-align: left; transition: all 0.2s; font-family: inherit;
        }
        .od-status-btn:hover:not(:disabled) { background: rgba(255,255,255,0.06); color: #e8ddd0; }
        .od-status-btn--active { background: rgba(255,255,255,0.05); font-weight: 700; }
        .od-status-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* ── Receipt ── */
        .od-receipt { display: flex; flex-direction: column; }
        .od-receipt__img { width: 100%; max-width: 280px; border-radius: 10px; border: 1px solid rgba(201,169,110,0.2); display: block; }

        /* ── Add-ons ── */
        .od-addons-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .od-addon-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 0.5rem 0.75rem; background: rgba(255,255,255,0.03);
          border-radius: 8px; font-size: 0.8125rem; color: #c8b89a;
        }

        .od-hint { font-size: 0.75rem; color: #6a5a4a; font-style: italic; }
      `}</style>
    </div>
  );
}
