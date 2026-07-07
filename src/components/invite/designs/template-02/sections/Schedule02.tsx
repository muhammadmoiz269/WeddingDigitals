'use client';

import { motion } from 'framer-motion';
import { Divider } from '../../../core/primitives/Divider';
import { getScheduleIcon } from '../../../core/helpers/scheduleIcon';
import { SectionBg } from '../SectionBg';
import { T2_ASSETS, t2 } from '../config';
import type { EInvitation } from '@/types';

interface Props {
  schedule: EInvitation['schedule'];
}

export function Schedule02({ schedule }: Props) {
  return (
    <section className="inv-section-flow">
      <SectionBg
        mobileSrc={`${T2_ASSETS}/timeline-bg.png`}
        desktopSrc={`${T2_ASSETS}/timeline-bg-desktop.png`}
      />
      <div className="inv-container" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{
          maxWidth: 560,
          margin: '0 auto',
          padding: 'clamp(1.5rem, 4vw, 2.5rem)',
        }}>
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2rem, 5vw, 3.2rem)',
              fontWeight: 400,
              color: t2.heading,
              textAlign: 'center',
              letterSpacing: '0.05em',
              margin: '0 0 0.5rem',
              lineHeight: 1.2,
            }}>
              Program
            </h2>
            <Divider color={t2.accent} />
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(0.8rem, 1.5vw, 1rem)',
              color: t2.ink,
              textAlign: 'center',
              letterSpacing: '0.06em',
              margin: '0 0 2rem',
            }}>
              as per schedule
            </p>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
            {schedule.map((item, i) => {
              const isLeft = i % 2 === 0;
              const content = (
                <motion.div
                  initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, margin: '0px' }}
                  transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                  style={{ textAlign: isLeft ? 'right' : 'left', flex: 1 }}
                >
                  <p style={{
                    fontSize: '0.9rem',
                    color: t2.accent,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: '0.3rem',
                  }}>
                    {item.time}
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(1rem, 1.5vw, 1.15rem)',
                    fontWeight: 700,
                    color: t2.heading,
                    marginBottom: item.description ? '0.4rem' : 0,
                    lineHeight: 1.3,
                  }}>
                    {item.title}
                  </p>
                  {item.description && (
                    <p style={{ fontSize: '0.9rem', color: t2.ink, lineHeight: 1.6 }}>
                      {item.description}
                    </p>
                  )}
                </motion.div>
              );

              return (
                <div key={i} style={{ display: 'flex', alignItems: 'stretch', gap: '1rem' }}>
                  {/* Left slot */}
                  {isLeft ? content : <div style={{ flex: 1 }} />}

                  {/* Center: icon + connecting line */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%',
                      border: `1px solid ${t2.heading}`,
                      background: 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: t2.heading,
                    }}>
                      {getScheduleIcon(item.title)}
                    </div>
                    {i < schedule.length - 1 && (
                      <motion.div
                        initial={{ scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        viewport={{ once: false, margin: '0px' }}
                        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.25 }}
                        style={{
                          width: 1, flex: 1, minHeight: 72,
                          background: `linear-gradient(to bottom, ${t2.accent}, transparent)`,
                          transformOrigin: 'top', marginTop: 4,
                        }}
                      />
                    )}
                  </div>

                  {/* Right slot */}
                  {!isLeft ? content : <div style={{ flex: 1 }} />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
