'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { formatPKR } from '@/lib/pricing';

interface OrderData {
  order_id: string;
  card_name: string;
  quantity: number;
  total: number;
  customization: {
    groom_name: string;
    bride_name: string;
    date: string;
    venue: string;
  };
  customer: {
    name: string;
    whatsapp: string;
    area: string;
  };
  payment: {
    method: string;
    amount_due: number;
    receipt_url: string;
    status: string;
  };
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '';
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) { setLoading(false); setError('No order ID provided.'); return; }

    fetch(`/api/orders/${orderId}`)
      .then(r => r.json())
      .then(json => {
        if (json.success) setOrder(json.data);
        else setError(json.error || 'Order not found');
      })
      .catch(() => setError('Failed to load order details'))
      .finally(() => setLoading(false));
  }, [orderId]);

  const isConfirmed = order?.payment.status === 'confirmed';

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <div style={{ width: 32, height: 32, border: '3px solid rgba(201,169,110,0.2)', borderTopColor: '#C9A96E', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="success-card">
        <div className="success-icon success-icon--error">✕</div>
        <h1 className="success-title">Something went wrong</h1>
        <p className="success-desc">{error || 'Order not found.'}</p>
        <a href="/" className="success-btn success-btn--secondary">Go Home</a>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="success-card">
      {/* Success icon */}
      <div className={`success-icon ${isConfirmed ? '' : 'success-icon--pending'}`}>
        {isConfirmed ? (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" strokeLinecap="round" />
          </svg>
        )}
      </div>

      <h1 className="success-title">
        {isConfirmed ? 'Order Confirmed! 🎉' : 'Order Placed! 📋'}
      </h1>
      <p className="success-desc">
        {isConfirmed ? (
          <>
            Your order <strong>#{order.order_id}</strong> has been confirmed! Payment receipt received — our team will begin working on your cards. You&apos;ll receive a confirmation message on WhatsApp shortly.
          </>
        ) : (
          <>
            Your order <strong>#{order.order_id}</strong> has been placed. Please complete the payment and send your receipt screenshot on WhatsApp to confirm.
          </>
        )}
      </p>

      {/* Confirmed — Delivery Timeline */}
      {isConfirmed && (
        <div className="success-timeline">
          <div className="success-timeline__step success-timeline__step--done">
            <div className="success-timeline__dot" />
            <div>
              <strong>Order Received</strong>
              <span>Your order has been placed</span>
            </div>
          </div>
          <div className="success-timeline__step success-timeline__step--done">
            <div className="success-timeline__dot" />
            <div>
              <strong>Payment Confirmed</strong>
              <span>Receipt verified</span>
            </div>
          </div>
          <div className="success-timeline__step success-timeline__step--current">
            <div className="success-timeline__dot" />
            <div>
              <strong>Design & Printing</strong>
              <span>Your cards are being prepared — 5-7 working days</span>
            </div>
          </div>
          <div className="success-timeline__step">
            <div className="success-timeline__dot" />
            <div>
              <strong>Delivery</strong>
              <span>Dispatched to {order.customer.area}, Karachi</span>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp notification info — confirmed */}
      {isConfirmed && (
        <div className="success-wa-info">
          <svg width="20" height="20" fill="#25D366" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <div>
            <strong>We&apos;ll message you on WhatsApp</strong>
            <span>A confirmation with your order details and delivery estimate will be sent to <strong>{order.customer.whatsapp}</strong></span>
          </div>
        </div>
      )}

      {/* Order Summary */}
      <div className="success-summary">
        <div className="success-row">
          <span>Order ID</span>
          <strong>{order.order_id}</strong>
        </div>
        <div className="success-row">
          <span>Card</span>
          <span>{order.card_name}</span>
        </div>
        <div className="success-row">
          <span>Couple</span>
          <span>{order.customization.groom_name} & {order.customization.bride_name}</span>
        </div>
        <div className="success-row">
          <span>Date</span>
          <span>{order.customization.date}</span>
        </div>
        <div className="success-row">
          <span>Venue</span>
          <span>{order.customization.venue}</span>
        </div>
        <div className="success-row">
          <span>Quantity</span>
          <span>{order.quantity} cards</span>
        </div>
        <div className="success-row">
          <span>Delivery</span>
          <span>{order.customer.area}, Karachi</span>
        </div>
        <div className="success-row success-row--total">
          <span>{isConfirmed ? 'Amount Paid' : 'Amount Due'}</span>
          <span>{formatPKR(order.payment.amount_due)}</span>
        </div>
      </div>

      {/* Status badge */}
      <div className="success-status">
        {isConfirmed ? (
          <>
            <span className="success-status__badge success-status__badge--confirmed">✓ Order Confirmed</span>
            <span className="success-status__text">Estimated delivery: 7-10 working days to {order.customer.area}</span>
          </>
        ) : (
          <>
            <span className="success-status__badge">⏳ Awaiting Payment</span>
            <span className="success-status__text">Complete the payment and send receipt to confirm your order</span>
          </>
        )}
      </div>

      {/* Pending — show WhatsApp to send receipt */}
      {!isConfirmed && (
        <a
          href={`https://wa.me/923001234567?text=${encodeURIComponent(
            `Hi Paighaam! I just placed Order #${order.order_id}.\n` +
            `📋 Card: ${order.card_name}\n` +
            `📦 Quantity: ${order.quantity} pcs\n` +
            `💰 Total: ${formatPKR(order.payment.amount_due)}\n\n` +
            `I'll send my payment receipt shortly. Thank you!`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="success-btn success-btn--wa"
        >
          <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Send Receipt on WhatsApp
        </a>
      )}

      <a href="/" className="success-btn success-btn--secondary">← Back to Home</a>
    </motion.div>
  );
}

export default function SuccessPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="success-wrapper">
          <Suspense fallback={
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
              <div style={{ width: 32, height: 32, border: '3px solid rgba(201,169,110,0.2)', borderTopColor: '#C9A96E', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          }>
            <SuccessContent />
          </Suspense>
        </div>
      </main>
      <Footer />

      <style>{`
        .success-wrapper {
          max-width: 560px;
          margin: 0 auto;
          padding: 0 1rem;
        }
        .success-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 1.25rem;
        }
        .success-icon {
          width: 72px; height: 72px; border-radius: 50%;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          display: flex; align-items: center; justify-content: center;
          color: white;
          box-shadow: 0 8px 24px rgba(34,197,94,0.25);
        }
        .success-icon--pending {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          box-shadow: 0 8px 24px rgba(245,158,11,0.25);
        }
        .success-icon--error {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          font-size: 1.5rem; font-weight: 700;
          box-shadow: 0 8px 24px rgba(220,38,38,0.25);
        }
        .success-title {
          font-size: 1.5rem; font-weight: 800; color: #2a2018; margin: 0;
          font-family: var(--font-heading, serif);
        }
        .success-desc {
          font-size: 0.9rem; color: #6a5a4a; line-height: 1.6; margin: 0;
          max-width: 440px;
        }
        .success-desc strong { color: #C9A96E; }

        /* ── Timeline ── */
        .success-timeline {
          width: 100%; text-align: left; display: flex; flex-direction: column;
          gap: 0; padding: 0.5rem 0;
        }
        .success-timeline__step {
          display: flex; align-items: flex-start; gap: 1rem;
          padding: 0.75rem 0; position: relative;
          padding-left: 2rem;
        }
        .success-timeline__step::before {
          content: ''; position: absolute; left: 9px; top: 28px; bottom: -4px;
          width: 2px; background: #e0d6c6;
        }
        .success-timeline__step:last-child::before { display: none; }
        .success-timeline__step--done::before { background: #22c55e; }
        .success-timeline__dot {
          width: 20px; height: 20px; border-radius: 50%;
          border: 2px solid #e0d6c6; background: white;
          flex-shrink: 0; position: absolute; left: 0; top: 0.75rem;
        }
        .success-timeline__step--done .success-timeline__dot {
          border-color: #22c55e; background: #22c55e;
        }
        .success-timeline__step--done .success-timeline__dot::after {
          content: '✓'; position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 0.65rem; font-weight: 700;
        }
        .success-timeline__step--current .success-timeline__dot {
          border-color: #C9A96E; background: #C9A96E;
          box-shadow: 0 0 0 4px rgba(201,169,110,0.2);
        }
        .success-timeline__step--current .success-timeline__dot::after {
          content: ''; position: absolute; top: 4px; left: 4px; right: 4px; bottom: 4px;
          background: white; border-radius: 50%;
        }
        .success-timeline__step strong {
          display: block; font-size: 0.85rem; color: #2a2018; font-weight: 600;
        }
        .success-timeline__step span {
          font-size: 0.75rem; color: #8a7a6a; line-height: 1.4;
        }
        .success-timeline__step--current strong { color: #96793f; }

        /* ── WhatsApp notification banner ── */
        .success-wa-info {
          width: 100%; display: flex; align-items: flex-start; gap: 0.75rem;
          padding: 1rem 1.25rem; background: rgba(37,211,102,0.06);
          border: 1px solid rgba(37,211,102,0.15); border-radius: 14px;
          text-align: left;
        }
        .success-wa-info svg { flex-shrink: 0; margin-top: 2px; }
        .success-wa-info strong {
          display: block; font-size: 0.85rem; color: #166534; margin-bottom: 0.2rem;
        }
        .success-wa-info span { font-size: 0.78rem; color: #4a7a5a; line-height: 1.45; }
        .success-wa-info span strong { display: inline; font-size: inherit; color: #166534; }

        /* ── Summary ── */
        .success-summary {
          width: 100%; background: white; border: 1px solid #e8e0d4;
          border-radius: 16px; overflow: hidden; text-align: left;
        }
        .success-row {
          display: flex; justify-content: space-between; padding: 0.7rem 1.25rem;
          font-size: 0.8125rem; color: #5a4a3a;
          border-bottom: 1px solid rgba(201,169,110,0.08);
        }
        .success-row:last-child { border-bottom: none; }
        .success-row span:first-child { color: #8a7a6a; }
        .success-row strong { color: #C9A96E; }
        .success-row--total {
          background: #f9f5ee; font-weight: 700; font-size: 0.9375rem;
          padding: 0.875rem 1.25rem;
        }
        .success-row--total span { color: #2a2018; }

        /* ── Status ── */
        .success-status {
          display: flex; flex-direction: column; align-items: center; gap: 0.375rem;
        }
        .success-status__badge {
          padding: 0.4rem 1rem; background: rgba(234,179,8,0.1);
          border: 1px solid rgba(234,179,8,0.2); border-radius: 20px;
          font-size: 0.78rem; font-weight: 600; color: #92400e;
        }
        .success-status__badge--confirmed {
          background: rgba(34,197,94,0.08);
          border-color: rgba(34,197,94,0.2);
          color: #166534;
        }
        .success-status__text { font-size: 0.75rem; color: #a09080; }

        /* ── Buttons ── */
        .success-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 0.75rem;
          width: 100%; padding: 1rem; border-radius: 14px; font-size: 1rem;
          font-weight: 700; text-decoration: none; transition: all 0.2s; cursor: pointer;
          border: none; font-family: inherit;
        }
        .success-btn--wa {
          background: #25D366; color: white;
          box-shadow: 0 6px 20px rgba(37,211,102,0.3);
        }
        .success-btn--wa:hover {
          background: #20BD5A; transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(37,211,102,0.4);
        }
        .success-btn--secondary {
          background: white; color: #5a4a3a; border: 1px solid #e0d6c6;
          font-weight: 500; font-size: 0.875rem;
        }
        .success-btn--secondary:hover { background: #f9f5ee; }
      `}</style>
    </>
  );
}
