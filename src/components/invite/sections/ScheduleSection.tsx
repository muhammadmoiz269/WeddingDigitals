'use client';

import { motion } from 'framer-motion';
import { Divider } from '../core/primitives/Divider';
import { getScheduleIcon } from '../core/helpers/scheduleIcon';
import type { EInvitation } from '@/types';

interface Props {
  schedule: EInvitation['schedule'];
}

export function ScheduleSection({ schedule }: Props) {
  return (
    <section className="inv-section-flow">
      <div className="inv-container">
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
            color: '#3a5542',
            textAlign: 'center',
            letterSpacing: '0.05em',
            margin: '0 0 0.5rem',
            lineHeight: 1.2,
          }}>
            Program
          </h2>
          <Divider />
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(0.8rem, 1.5vw, 1rem)',
            color: '#2C2C2C',
            textAlign: 'center',
            opacity: 0.55,
            letterSpacing: '0.06em',
            margin: '0 0 1rem',
          }}>
            as per schedule
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.05 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inv-schedule-container">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/template-01/flower-stand.png" alt="" aria-hidden="true" className="inv-flower-stand" />
            <div className="inv-schedule-list">
            {schedule.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, margin: '0px' }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}
              >
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', alignSelf: 'stretch' }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    border: '1px solid #3a5542',
                    background: '#FDFAF6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#3a5542',
                    flexShrink: 0, zIndex: 1,
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
                        width: 1, flex: 1, minHeight: 24,
                        background: 'linear-gradient(to bottom, #3a5542, transparent)',
                        opacity: 0.3, transformOrigin: 'top', marginTop: 4,
                      }}
                    />
                  )}
                </div>

                <div style={{ flex: 1, paddingBottom: i < schedule.length - 1 ? '2.5rem' : 0, paddingTop: '0.1rem' }}>
                  <p style={{
                    fontSize: '0.9rem',
                    color: '#3a5542',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: '0.3rem',
                    opacity: 0.9,
                  }}>
                    {item.time}
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(1rem, 1.5vw, 1.15rem)',
                    fontWeight: 700,
                    marginBottom: item.description ? '0.4rem' : 0,
                    lineHeight: 1.3,
                  }}>
                    {item.title}
                  </p>
                  {item.description && (
                    <p style={{ fontSize: '0.9rem', opacity: 0.5, lineHeight: 1.6 }}>
                      {item.description}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
