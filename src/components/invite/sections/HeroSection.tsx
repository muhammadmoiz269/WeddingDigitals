'use client';

import { useRef } from 'react';
import { motion, useAnimation, useScroll, useTransform } from 'framer-motion';
import { useScroller } from '../core/ScrollerContext';
import { Divider } from '../core/primitives/Divider';
import ShareButton from './ShareButton';
import type { EInvitation } from '@/types';

type AnimCtrl = ReturnType<typeof useAnimation>;

interface Props {
  couple: EInvitation['couple'];
  media: EInvitation['media'];
  slug: string;
  leftCurtainCtrl:   AnimCtrl;
  rightCurtainCtrl:  AnimCtrl;
  centerCurtainCtrl: AnimCtrl;
  textVisible: boolean;
}

const heroIntroText  = 'You are cordially invited to attend';
const bgVideoOpacity = 0.1;

export function HeroSection({
  couple,
  media,
  slug,
  leftCurtainCtrl,
  rightCurtainCtrl,
  centerCurtainCtrl,
  textVisible,
}: Props) {
  // Hero owns its own scroll-linked parallax (runs inside ScrollerContext.Provider)
  const scrollRef = useScroller();
  const heroRef   = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProg } = useScroll({
    target: heroRef,
    container: scrollRef as React.RefObject<HTMLElement>,
    offset: ['start start', 'end start'],
  });
  const backgroundY  = useTransform(heroProg, [0, 1], ['0%', '40%']);
  const heroContentY = useTransform(heroProg, [0, 1], [0, -150]);
  return (
    <section
      ref={heroRef}
      style={{
        height: '100vh',
        flexShrink: 0,
        scrollSnapAlign: 'start',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '0 3rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Parallax background video */}
      {media.background_video_url && (
        <motion.div style={{
          y: backgroundY,
          position: 'absolute',
          top: '-20%', left: 0, right: 0, bottom: '-20%',
          zIndex: 0,
        }}>
          <video
            src={media.background_video_url}
            autoPlay muted loop playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: bgVideoOpacity, pointerEvents: 'none', display: 'block' }}
          />
        </motion.div>
      )}

      {/* Center curtain — clips via overflow:hidden wrapper, slides in top→bottom */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 1, pointerEvents: 'none', display: 'flex', justifyContent: 'center' }}>
        <motion.img
          animate={centerCurtainCtrl}
          initial={{ y: '-100%' }}
          src="/assets/template-01/curtain-center.png"
          alt=""
          aria-hidden="true"
          style={{ height: '100%', width: 'auto', display: 'block', flexShrink: 0, transformOrigin: 'top center', opacity: 0.35 }}
        />
      </div>

      {/* Left curtain */}
      <motion.div
        animate={leftCurtainCtrl}
        style={{ position: 'absolute', left: -40, top: 0, height: '100%', transformOrigin: 'top left', zIndex: 10, pointerEvents: 'none' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/template-01/curtain-left.png" alt="" aria-hidden="true" style={{ height: '100%', width: 'auto', display: 'block' }} />
      </motion.div>

      {/* Right curtain */}
      <motion.div
        animate={rightCurtainCtrl}
        style={{ position: 'absolute', right: -40, top: 0, height: '100%', transformOrigin: 'top right', zIndex: 10, pointerEvents: 'none' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/template-01/curtain-right.png" alt="" aria-hidden="true" style={{ height: '100%', width: 'auto', display: 'block' }} />
      </motion.div>

      {/* Foreground content — only mounts after center curtain completes */}
      {textVisible && (
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'relative', zIndex: 3,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          maxWidth: 860,
          y: heroContentY,
        }}
      >
        <motion.p
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ delay: 0.1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontSize: '0.62rem',
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: '#3a5542',
            marginBottom: '1.25rem',
          }}
        >
          {heroIntroText}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
            letterSpacing: '0.08em',
            marginBottom: '0.5rem',
          }}
        >
          {couple.event_title}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.45 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          style={{ fontSize: '0.8rem', letterSpacing: '0.18em', marginBottom: '0.5rem' }}
        >
          of
        </motion.p>

        <Divider />

        <motion.h1
          initial={{ opacity: 0, y: -22, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.65, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2.2rem, 7vw, 5rem)',
            fontWeight: 400,
            color: '#3a5542',
            lineHeight: 1.2,
            letterSpacing: '0.02em',
            margin: '0.25rem 0',
          }}
        >
          {couple.groom_name}
          <br />
          <span style={{ fontSize: '0.45em', opacity: 0.65, fontStyle: 'italic', letterSpacing: '0.28em' }}>
            &amp;
          </span>
          <br />
          {couple.bride_name}
        </motion.h1>

        <Divider />

        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <ShareButton
            slug={slug}
            coupleName={`${couple.groom_name} & ${couple.bride_name}`}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 1.6, duration: 0.7 }}
          style={{ marginTop: '2rem' }}
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut', delay: 4.6 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>
      )}
    </section>
  );
}

