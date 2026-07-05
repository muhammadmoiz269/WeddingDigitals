'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface Props {
  onOpen: () => void;
}

// ─── Particle colours — green palette only, gold stays on the seal glow ───────
const PARTICLE_COLORS = [
  'rgba(58,85,66,0.95)',    // #3a5542 deep green
  'rgba(58,85,66,0.65)',
  'rgba(78,122,94,0.9)',    // #4e7a5e mid green
  'rgba(100,150,115,0.85)', // lighter green
  'rgba(255,255,255,0.9)',  // white
  'rgba(220,235,225,0.85)', // pale green-white
];

interface Particle {
  id: number;
  dx: number; dy: number;
  size: number; tall: boolean;
  color: string;
  duration: number; delay: number;
  rotate: number;
}

function generateParticles(): Particle[] {
  return Array.from({ length: 52 }, (_, i) => {
    const angle = (i / 52) * Math.PI * 2 + (Math.random() - 0.5) * 0.45;
    const dist  = 90 + Math.random() * 230;
    return {
      id:       i,
      dx:       Math.cos(angle) * dist,
      dy:       Math.sin(angle) * dist + 50, // slight gravity pull
      size:     4 + Math.random() * 9,
      tall:     Math.random() > 0.55,        // confetti ribbon vs circle
      color:    PARTICLE_COLORS[i % PARTICLE_COLORS.length],
      duration: 0.5 + Math.random() * 0.55,
      delay:    Math.random() * 0.1,
      rotate:   Math.random() * 540 - 270,
    };
  });
}

// ─── Corner ornament ───────────────────────────────────────────────────────────
function CornerOrnament({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const placement: React.CSSProperties =
    position === 'tl' ? { top: 20, left: 20 }
    : position === 'tr' ? { top: 20, right: 20 }
    : position === 'bl' ? { bottom: 20, left: 20 }
    : { bottom: 20, right: 20 };

  const d =
    position === 'tl' ? 'M1 47 L1 1 L47 1'
    : position === 'tr' ? 'M1 1 L47 1 L47 47'
    : position === 'bl' ? 'M1 1 L1 47 L47 47'
    : 'M47 1 L47 47 L1 47';

  const dot: [number, number] =
    position === 'tl' ? [1, 1]
    : position === 'tr' ? [47, 1]
    : position === 'bl' ? [1, 47]
    : [47, 47];

  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.15, duration: 1.4 }}
      style={{ position: 'absolute', ...placement, zIndex: 10 }}
      width="48" height="48" viewBox="0 0 48 48" fill="none"
    >
      <path d={d} stroke="rgba(58,85,66,0.3)" strokeWidth="1" />
      <circle cx={dot[0]} cy={dot[1]} r="2.5" fill="rgba(58,85,66,0.38)" />
    </motion.svg>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function EnvelopeScreen({ onOpen }: Props) {
  const [stage, setStage]       = useState<'idle' | 'opening'>('idle');
  const [particles, setParticles] = useState<Particle[]>([]);
  const openedRef = useRef(false);
  const isOpening = stage === 'opening';

  const handleSealClick = () => {
    if (stage !== 'idle') return;
    setParticles(generateParticles());
    setStage('opening');
  };

  const handleEnvelopeFadeComplete = () => {
    if (isOpening && !openedRef.current) {
      openedRef.current = true;
      onOpen();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: '#080604',
        overflow: 'hidden',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <CornerOrnament position="tl" />
      <CornerOrnament position="tr" />
      <CornerOrnament position="bl" />
      <CornerOrnament position="br" />

      {/* ── Envelope photo — full viewport, fades + scales on open ──── */}
      <motion.div
        style={{ position: 'absolute', inset: 0, zIndex: 1 }}
        animate={{
          opacity: isOpening ? 0 : 1,
          scale:   isOpening ? 1.07 : 1,
        }}
        transition={{ delay: isOpening ? 0.05 : 0, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        onAnimationComplete={handleEnvelopeFadeComplete}
      >
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(/assets/template-01/envelope.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }} />
      </motion.div>

      {/* ── Seal button — wrapper div owns the centering transform so
       *   framer-motion's scale/opacity on the inner button can't clobber it ── */}
      <div style={{
        position: 'absolute',
        top: '49%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 6,
      }}>
        <motion.button
          onClick={handleSealClick}
          disabled={isOpening}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: isOpening ? 0 : 1,
            scale:   isOpening ? 0 : 1,
          }}
          transition={isOpening
            ? { duration: 0.12, ease: 'easeIn' }
            : { delay: 1.05, duration: 0.65, ease: [0.2, 0.9, 0.3, 1] }
          }
          aria-label="Open invitation"
          className="env-seal-btn"
          style={{
            width: 200, height: 200,
            borderRadius: '50%',
            background: 'transparent',
            border: 'none',
            cursor: isOpening ? 'default' : 'pointer',
            touchAction: 'manipulation',
          }}
        >
        </motion.button>
      </div>

      {/* ── Confetti burst — anchored to seal centre ────────────────── */}
      {isOpening && (
        <div style={{
          position: 'absolute',
          top: '49%', left: '50%',
          zIndex: 8,
          pointerEvents: 'none',
        }}>
          {particles.map(p => (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
              animate={{
                x: p.dx, y: p.dy,
                scale:   [0, 1.4, 0],
                opacity: [0, 1, 0],
                rotate:  p.rotate,
              }}
              transition={{ duration: p.duration, delay: p.delay, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                width:  p.size,
                height: p.tall ? p.size * 0.38 : p.size,
                borderRadius: p.tall ? 2 : '50%',
                background: p.color,
                marginLeft: -(p.size / 2),
                marginTop:  -(p.size / 2),
              }}
            />
          ))}
        </div>
      )}

      {/* ── Hint below the seal ─────────────────────────────────────── */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpening ? 0 : 1 }}
        transition={{ delay: isOpening ? 0 : 1.85, duration: 0.85 }}
        style={{
          position: 'absolute',
          top: '72%',
          left: 0, right: 0,
          textAlign: 'center',
          color: '#4a7a5a',
          fontFamily: 'var(--font-heading)',
          fontSize: '1.05rem',
          fontWeight: 400,
          fontStyle: 'italic',
          letterSpacing: '0.08em',
          margin: 0,
          zIndex: 5,
          pointerEvents: 'none',
        }}
      >
        Press the seal to reveal your invitation
      </motion.p>

      <style>{`
        .env-seal-btn {
          animation: env-breathe 3s ease-in-out infinite;
        }
        @keyframes env-breathe {
          0%, 100% {
            box-shadow:
              0 0 0 6px  rgba(201,169,110,0.1),
              0 0 0 14px rgba(201,169,110,0.04),
              0 0 50px   rgba(201,169,110,0.18);
          }
          50% {
            box-shadow:
              0 0 0 13px rgba(201,169,110,0.22),
              0 0 0 28px rgba(201,169,110,0.08),
              0 0 90px   rgba(201,169,110,0.38);
          }
        }
      `}</style>
    </motion.div>
  );
}
