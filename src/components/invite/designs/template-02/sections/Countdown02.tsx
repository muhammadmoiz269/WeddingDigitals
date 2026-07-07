'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import ScratchCard, { Brushes, Covers, type ScratchCardRef } from 'react-scratchcard-v2';
import { InvSection } from '../../../core/primitives/InvSection';
import { Parallax } from '../../../core/primitives/Parallax';
import { Divider } from '../../../core/primitives/Divider';
import { SectionBg } from '../SectionBg';
import { T2_ASSETS, t2 } from '../config';

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface Props {
  weddingDate: string;
  timeLeft: CountdownTime;
  isPast: boolean;
}

const CARD_HEIGHT = 150;

// Scratch foil in the theme's dusty blues with faint cream sparkles.
const foilSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='380' height='${CARD_HEIGHT}'>
  <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
    <stop offset='0' stop-color='#7C99B8'/>
    <stop offset='0.5' stop-color='#5B7A9D'/>
    <stop offset='1' stop-color='#3E5C7E'/>
  </linearGradient></defs>
  <rect width='380' height='${CARD_HEIGHT}' fill='url(#g)'/>
  <g fill='rgba(242,236,223,0.55)'>
    <text x='60'  y='45'  font-size='16'>&#10022;</text>
    <text x='300' y='40'  font-size='12'>&#10022;</text>
    <text x='190' y='30'  font-size='10'>&#10022;</text>
    <text x='110' y='100' font-size='11'>&#10022;</text>
    <text x='250' y='95'  font-size='15'>&#10022;</text>
    <text x='330' y='105' font-size='10'>&#10022;</text>
    <text x='30'  y='85'  font-size='9'>&#10022;</text>
  </g>
</svg>`;
const FOIL_DATA_URI = `data:image/svg+xml,${encodeURIComponent(foilSvg)}`;

const CONFETTI_COLORS = ['#5B7A9D', '#2E4964', '#8FB0CE', '#F2ECDF', '#FBF7EF'];

// Three staggered bursts raining down from the top of the screen.
function fireConfetti() {
  [0.18, 0.5, 0.82].forEach((x, i) => {
    setTimeout(() => {
      confetti({
        particleCount: 70,
        angle: 270,
        spread: 100,
        origin: { x, y: -0.05 },
        colors: CONFETTI_COLORS,
        startVelocity: 28,
        gravity: 0.85,
        ticks: 280,
        scalar: 0.9,
        disableForReducedMotion: true,
      });
    }, i * 140);
  });
}

export function Countdown02({ weddingDate, timeLeft, isPast }: Props) {
  const [revealed, setRevealed] = useState(false);
  // Section only mounts client-side (after the envelope opens), so window is available.
  const [cardWidth] = useState(() =>
    typeof window === 'undefined' ? 340 : Math.min(380, window.innerWidth - 64)
  );
  const scratchRef = useRef<ScratchCardRef>(null);

  const handleComplete = () => {
    if (revealed) return;
    setRevealed(true);
    scratchRef.current?.revealAll({ duration: 450 });
    fireConfetti();
  };

  return (
    <InvSection
      background={
        <SectionBg
          mobileSrc={`${T2_ASSETS}/countdown-bg.png`}
          desktopSrc={`${T2_ASSETS}/countdown-bg-desktop.png`}
        />
      }
    >
      <Parallax speed={120}>
        {revealed && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 0.7, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontSize: '0.62rem',
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              color: t2.ink,
              textAlign: 'center',
              margin: '0 0 0.75rem',
            }}
          >
            Save the date
          </motion.p>
        )}
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
          {revealed ? weddingDate : 'Scratch to reveal'}
        </h2>
        <Divider color={t2.accent} />
      </Parallax>

      <Parallax speed={120}>
        {/* ── Scratch card hiding the wedding date ─────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '1.5rem 0 2rem' }}>
          <div style={{
            borderRadius: 14,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.45)',
            boxShadow: '0 8px 32px rgba(46,73,100,0.18), 0 2px 8px rgba(46,73,100,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
            touchAction: 'none',
          }}>
            <ScratchCard
              ref={scratchRef}
              width={cardWidth}
              height={CARD_HEIGHT}
              cover={Covers.image(FOIL_DATA_URI)}
              brush={Brushes.circle(22)}
              finishPercent={55}
              onComplete={handleComplete}
              ariaLabel="Scratch to reveal the wedding date"
              canvasProps={{ style: { touchAction: 'none', display: 'block' } }}
            >
              <div className="t2-scratch-countdown" style={{
                width: cardWidth,
                height: CARD_HEIGHT,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(46,73,100,0.08), 0 8px 32px rgba(46,73,100,0.18)',
              }}>
                {isPast ? (
                  <p style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(1.2rem, 3vw, 1.6rem)',
                    color: t2.heading,
                    textAlign: 'center',
                    opacity: 0.85,
                    padding: '0 1rem',
                  }}>
                    The big day has arrived
                  </p>
                ) : (
                  <div className="inv-countdown-units">
                    {(
                      [
                        { value: timeLeft.days,    label: 'Days' },
                        { value: timeLeft.hours,   label: 'Hours' },
                        { value: timeLeft.minutes, label: 'Minutes' },
                        { value: timeLeft.seconds, label: 'Seconds' },
                      ] as const
                    ).map(({ value, label }) => (
                      <div key={label} className="inv-countdown-unit">
                        <span className="inv-countdown-number" suppressHydrationWarning>
                          {String(value).padStart(2, '0')}
                        </span>
                        <span className="inv-countdown-timelabel">{label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScratchCard>
          </div>
        </div>
      </Parallax>
    </InvSection>
  );
}
