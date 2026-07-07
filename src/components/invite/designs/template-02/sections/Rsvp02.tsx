'use client';

import { motion } from 'framer-motion';
import { InvSection } from '../../../core/primitives/InvSection';
import { Divider } from '../../../core/primitives/Divider';
import { normalizeWhatsApp } from '../../../core/helpers/whatsapp';
import { SectionBg } from '../SectionBg';
import { T2_ASSETS, t2 } from '../config';
import type { EInvitation } from '@/types';

interface Props {
  contacts: EInvitation['rsvp_contacts'];
  message: string;
}

const iconLinkStyle: React.CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: '50%',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: t2.heading,
  border: '1px solid rgba(91,122,157,0.4)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 4px 14px rgba(46,73,100,0.14)',
  textDecoration: 'none',
};

function PhoneIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function Rsvp02({ contacts, message }: Props) {
  const validContacts = contacts.filter(c => c.name || c.number);

  return (
    <InvSection
      background={
        <SectionBg
          mobileSrc={`${T2_ASSETS}/rsvp-bg.png`}
          desktopSrc={`${T2_ASSETS}/rsvp-bg-desktop.png`}
        />
      }
    >
      <div className="t2-rsvp-panel">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ textAlign: 'center' }}
          >
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 400,
              color: t2.heading,
              letterSpacing: '0.05em',
              lineHeight: 1.2,
            }}>
              RSVP
            </h2>
            <Divider color={t2.accent} />
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)',
              color: t2.ink,
              opacity: 0.65,
              letterSpacing: '0.04em',
              margin: '0.25rem 0 2.25rem',
              lineHeight: 1.7,
            }}>
              {message}
            </p>
          </motion.div>

          <div style={{ display: 'flex', flexWrap: 'nowrap', justifyContent: 'center', alignItems: 'flex-start', gap: '2rem' }}>
            {validContacts.map((contact, i) => {
              const waNumber = normalizeWhatsApp(contact.number);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.65, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  style={{ textAlign: 'center', flex: '1 1 200px', maxWidth: 260 }}
                >
                  {contact.name && (
                    <p style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: 'clamp(1.05rem, 2vw, 1.3rem)',
                      color: t2.heading,
                      letterSpacing: '0.06em',
                      margin: '0 0 0.3rem',
                    }}>
                      {contact.name}
                    </p>
                  )}
                  {contact.number && (
                    <>
                      <p style={{
                        fontSize: '0.78rem',
                        letterSpacing: '0.18em',
                        color: t2.ink,
                        opacity: 0.6,
                        margin: '0 0 0.9rem',
                      }}>
                        {contact.number}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.9rem' }}>
                        <a
                          href={`tel:+${waNumber}`}
                          aria-label={`Call ${contact.name || 'contact'}`}
                          style={iconLinkStyle}
                        >
                          <PhoneIcon />
                        </a>
                        <a
                          href={`https://wa.me/${waNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`WhatsApp ${contact.name || 'contact'}`}
                          style={iconLinkStyle}
                        >
                          <WhatsAppIcon />
                        </a>
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </InvSection>
  );
}
