'use client';

import { useRef, useState, useEffect, startTransition } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { normalizeWhatsApp } from '../core/helpers/whatsapp';
import { playWASound } from '../core/helpers/audio';

export function RsvpChatCard({ contact }: {
  contact: { name: string; number: string };
}) {
  const [msg, setMsg]           = useState("");
  const [showTyping, setTyping] = useState(false);
  const cardRef    = useRef<HTMLDivElement>(null);
  const bubbleCtrl = useAnimation();
  const isInView   = useInView(cardRef, { once: false, amount: 0.5 });

  useEffect(() => {
    if (isInView) {
      bubbleCtrl.set({ opacity: 0, scale: 0.72, x: -14 });
      startTransition(() => setTyping(true));
      const timer = setTimeout(() => {
        startTransition(() => setTyping(false));
        playWASound();
        bubbleCtrl.start({
          opacity: 1, scale: 1, x: 0,
          transition: { type: 'spring', stiffness: 420, damping: 22 },
        });
      }, 3000);
      return () => { clearTimeout(timer); startTransition(() => setTyping(false)); };
    } else {
      startTransition(() => setTyping(false));
      bubbleCtrl.set({ opacity: 0, scale: 0.72, x: -14 });
    }
  }, [isInView, bubbleCtrl]);

  const send = () => {
    window.open(
      `https://wa.me/${normalizeWhatsApp(contact.number)}?text=${encodeURIComponent(msg)}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  const initials = contact.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');

  return (
    <div className="inv-wa-card" ref={cardRef}>
      {/* Header */}
      <div className="inv-wa-header">
        <div className="inv-wa-avatar">{initials || '?'}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#fff', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {contact.name}
          </p>
          {contact.number && (
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', fontWeight: 700, marginTop: '0.15rem' }}>
              {contact.number}
            </p>
          )}
        </div>
        {/* Video call + phone call icons */}
        <div className="inv-wa-call-icons" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexShrink: 0 }}>
          <button
            onClick={() => window.open(`https://wa.me/${normalizeWhatsApp(contact.number)}?text=${encodeURIComponent('Hello, can I call you?')}`, '_blank', 'noopener,noreferrer')}
            aria-label="Video call"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center', WebkitTapHighlightColor: 'transparent' }}
          >
            <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7"/>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
          </button>
          <button
            onClick={() => window.open(`https://wa.me/${normalizeWhatsApp(contact.number)}?text=${encodeURIComponent('Hello, can I call you?')}`, '_blank', 'noopener,noreferrer')}
            aria-label="Phone call"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center', WebkitTapHighlightColor: 'transparent' }}
          >
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.34 9.87a19.79 19.79 0 01-3.07-8.67A2 2 0 012.46 1h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 8.4a16 16 0 006.72 6.72l1.76-1.76a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Chat body */}
      <div className="inv-wa-body">
        {/* Typing indicator — three bouncing dots while waiting */}
        {showTyping && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '0.75rem' }}>
            <div className="inv-wa-bubble inv-wa-bubble-in" style={{ padding: '0.6rem 0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 16 }}>
                {[0, 1, 2].map(i => (
                  <motion.span
                    key={i}
                    style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(0,0,0,0.32)', display: 'block' }}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Incoming greeting bubble — pops in 3 s after card enters view */}
        <motion.div
          animate={bubbleCtrl}
          style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '0.75rem', transformOrigin: 'bottom left' }}
        >
          <div className="inv-wa-bubble inv-wa-bubble-in">
            <p style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.5, color: '#111' }}>
              Assalam o Alaikum 👋<br />We&apos;re so glad you&apos;re here! Feel free to reach out.
            </p>
            <span className="inv-wa-time">now</span>
          </div>
        </motion.div>

      </div>

      {/* Send bar — editable message lives here */}
      <div className="inv-wa-footer">
        <div className="inv-wa-input-bar">
          <textarea
            className="inv-wa-input"
            value={msg}
            onChange={e => setMsg(e.target.value)}
            rows={2}
            aria-label="Edit your WhatsApp message"
            placeholder="Type a message"
          />
        </div>
        <button onClick={send} className="inv-wa-send" aria-label="Send WhatsApp message">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 2L15 22 11 13 2 9l20-7z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
