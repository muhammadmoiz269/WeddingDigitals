'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useScroller } from '../../../core/ScrollerContext';
import { useInviteAnimation } from '../../../core/InviteAnimationContext';
import { SectionBg } from '../SectionBg';
import { T2_ASSETS, t2 } from '../config';
import type { EInvitation } from '@/types';

interface Props {
  couple: EInvitation['couple'];
}

const heroIntroText = 'You are invited to attend';
const ease = [0.22, 1, 0.36, 1] as const;

export function Hero02({ couple }: Props) {
  const shouldAnimate = useInviteAnimation();
  const scrollRef = useScroller();
  const heroRef   = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProg } = useScroll({
    target: heroRef,
    container: scrollRef as React.RefObject<HTMLElement>,
    offset: ['start start', 'end start'],
  });
  const heroContentY = useTransform(heroProg, [0, 1], [0, -150]);

  return (
    <section
      ref={heroRef}
      style={{
        height: '100vh',
        flexShrink: 0,
        scrollSnapAlign: 'start',
        textAlign: 'center',
        padding: '0 2rem',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <SectionBg
        mobileSrc={`${T2_ASSETS}/hero-bg.png`}
        desktopSrc={`${T2_ASSETS}/hero-bg-desktop.png`}
        eager
      />

      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={shouldAnimate ? { scale: 1, opacity: 1 } : { scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.9, ease }}
        style={{
          position: 'relative', zIndex: 3,
          width: '100%',
          maxWidth: 720,
          y: heroContentY,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '90%',
        }}
      >
        {/* Left: intro → event title → "of" */}
        <div style={{ marginTop: '8rem', textAlign: 'center' }}>
          <motion.p
            initial={{ opacity: 0, y: -18 }}
            animate={shouldAnimate ? { opacity: 0.75, y: 0 } : { opacity: 0, y: -18 }}
            transition={{ delay: 0.1, duration: 0.9, ease }}
            style={{
              fontSize: '0.62rem',
              fontWeight: 700,
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              color: t2.ink,
              marginBottom: '1rem',
            }}
          >
            {heroIntroText}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: -18 }}
            animate={shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: -18 }}
            transition={{ delay: 0.3, duration: 0.9, ease }}
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: t2.heading,
              marginBottom: '0.5rem',
            }}
          >
            {couple.event_title}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={shouldAnimate ? { opacity: 0.5 } : { opacity: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.18em', marginBottom: '0.25rem' }}
          >
            of
          </motion.p>
        </div>

        {/* Right: bride & groom names + scroll button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <motion.h1
            initial={{ opacity: 0, y: -22, scale: 0.95 }}
            animate={shouldAnimate ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -22, scale: 0.95 }}
            transition={{ delay: 0.65, duration: 1.1, ease }}
            style={{
              fontFamily: 'var(--font-script), var(--font-script-alt), cursive',
              fontSize: 'clamp(2rem, 6.5vw, 4rem)',
              fontWeight: 700,
              color: t2.heading,
              lineHeight: 1.15,
              letterSpacing: '0.02em',
              margin: '0.25rem 0',
              textAlign: 'center',
            }}
          >
            {couple.groom_name}
            <br />
            <span style={{ fontSize: '0.4em', opacity: 0.7, letterSpacing: '0.1em' }}>
              &amp;
            </span>
            <br />
            {couple.bride_name}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={shouldAnimate ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 1.2, duration: 0.7 }}
            style={{ color: t2.heading, display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '1rem' }}
          >
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut', delay: 3 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
