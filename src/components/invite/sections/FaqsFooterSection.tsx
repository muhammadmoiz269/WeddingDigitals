'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InvSection } from '../core/primitives/InvSection';
import { Parallax } from '../core/primitives/Parallax';
import { Divider } from '../core/primitives/Divider';
import type { EInvitation } from '@/types';

interface Props {
  faqs: EInvitation['faqs'];
  monogram: string;
}

export function FaqsFooterSection({ faqs, monogram }: Props) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const toggleFaq = (i: number) => setOpenFaqIndex(prev => (prev === i ? null : i));
  const hasFaqs = faqs.length > 0;

  return (
    <InvSection>
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: '80vh', justifyContent: 'space-between' }}>
        {hasFaqs && (
          <>
            <Parallax speed={150}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h2 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(2rem, 5vw, 3.2rem)',
                  fontWeight: 400,
                  color: '#3a5542',
                  letterSpacing: '0.05em',
                  margin: '0 0 0.5rem',
                  lineHeight: 1.2,
                }}>
                  FAQs
                </h2>
                <Divider />
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)',
                  color: '#2C2C2C',
                  opacity: 0.55,
                  letterSpacing: '0.06em',
                  margin: '0.5rem 0 1.25rem',
                }}>
                  Good to know
                </p>
              </div>
            </Parallax>
            <Parallax speed={80} fade={false}>
              <div style={{ width: '90%', maxWidth: 500, margin: '0 auto 3rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxSizing: 'border-box' }}>
                {faqs.map((faq, i) => {
                  const isOpen = openFaqIndex === i;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-20px' }}
                      transition={{ delay: i * 0.08, duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
                      style={{
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(58,85,66, 0.18)',
                        overflow: 'hidden',
                        background: 'rgba(255,255,255,0.04)',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      <button
                        onClick={() => toggleFaq(i)}
                        aria-expanded={isOpen}
                        className="inv-faq-item-btn"
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '1rem',
                          padding: '1rem 1.25rem',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          WebkitTapHighlightColor: 'transparent',
                        }}
                      >
                        <span style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: 'clamp(0.88rem, 1.4vw, 1rem)',
                          color: '#3a5542',
                          lineHeight: 1.4,
                        }}>
                          {faq.question}
                        </span>
                        <motion.svg
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          width={16}
                          height={16}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          aria-hidden="true"
                          style={{ flexShrink: 0, color: '#3a5542', opacity: 0.7 }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </motion.svg>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                            style={{ overflow: 'hidden' }}
                          >
                            <p className="inv-faq-answer" style={{
                              fontSize: '0.85rem',
                              opacity: 0.58,
                              lineHeight: 1.75,
                              padding: '0 1.25rem 1rem',
                              borderTop: '1px solid rgba(255,255,255,0.07)',
                              paddingTop: '0.75rem',
                            }}>
                              {faq.answer}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </Parallax>
          </>
        )}

        {/* Footer — always at the bottom of this section */}

        {/* Candles — slow parallax so they drift lazily behind the text */}
        <Parallax speed={40}>
          <div style={{ textAlign: 'center', marginBottom: '-1rem' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/template-01/candles-white.png"
              alt=""
              aria-hidden="true"
              style={{
                height: 'clamp(80px, 14vh, 160px)',
                objectFit: 'contain',
                opacity: 0.75,
                display: 'inline-block',
              }}
            />
          </div>
        </Parallax>

        <Parallax speed={150}>
          <div style={{ textAlign: 'center', paddingBottom: '2rem' }}>
            <Divider />
            <p style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
              color: '#3a5542',
              letterSpacing: '0.06em',
              margin: '1.25rem 0 0.6rem',
            }}>
              {monogram}
            </p>
            <Divider />
            <p style={{
              fontSize: '0.6rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              margin: '1.25rem 0 0',
            }}>
              <span style={{ opacity: 0.35 }}>made with love by{' '}</span>
              <a
                href="https://shahibulawa.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#C9A96E',
                  textDecoration: 'none',
                  borderBottom: '1px solid #C9A96E',
                  paddingBottom: '0.05em',
                  transition: 'opacity 0.2s',
                }}
              >
                Shahi Bulawa
              </a>
            </p>
          </div>
        </Parallax>
      </div>
    </InvSection>
  );
}
