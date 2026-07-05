'use client';

import { motion } from 'framer-motion';
import { InvSection } from '../core/primitives/InvSection';
import { Divider } from '../core/primitives/Divider';
import { RsvpChatCard } from './RsvpChatCard';
import type { EInvitation } from '@/types';

interface Props {
  contacts: EInvitation['rsvp_contacts'];
  message: string;
}

export function RsvpSection({ contacts, message }: Props) {
  return (
    <InvSection>
      {/* RSVP heading flanked by vases */}
      <div className="inv-rsvp-heading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', marginBottom: '0.5rem' }}>
        {/* Vase left */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          className="inv-vase"
          style={{ flexShrink: 0, pointerEvents: 'none' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/template-01/vase-left.png" alt="" aria-hidden="true" style={{ height: 150, width: 'auto', objectFit: 'contain', opacity: 0.55, display: 'block' }} />
        </motion.div>

        {/* h2 only */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: 'center', flex: '0 0 auto' }}
        >
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 400,
            color: '#3a5542',
            letterSpacing: '0.05em',
            margin: 0,
            lineHeight: 1.2,
          }}>
            RSVP
          </h2>
        </motion.div>

        {/* Vase right */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 1.0, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="inv-vase"
          style={{ flexShrink: 0, pointerEvents: 'none' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/template-01/vase-right.png" alt="" aria-hidden="true" style={{ height: 150, width: 'auto', objectFit: 'contain', opacity: 0.55, display: 'block' }} />
        </motion.div>
      </div>

      {/* Divider + sub-heading below the vase row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        style={{ textAlign: 'center' }}
      >
        <Divider />
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)',
          color: '#2C2C2C',
          opacity: 0.55,
          letterSpacing: '0.04em',
          margin: '0.5rem 0 2rem',
          lineHeight: 1.7,
        }}>
          {message}
        </p>
      </motion.div>

      {/* One WhatsApp chat card per contact — staggered entry */}
      <div className="inv-rsvp-grid">
        {contacts.filter(c => c.name || c.number).map((contact, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.65, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <RsvpChatCard contact={contact} />
          </motion.div>
        ))}
      </div>
    </InvSection>
  );
}
