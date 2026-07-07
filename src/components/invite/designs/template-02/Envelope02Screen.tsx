'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { t2 } from './config';
import type { EInvitation } from '@/types';

interface Props {
  invitation: EInvitation;
  onOpen: () => void;
}

/**
 * Video envelope intro for template-02.
 * The invitation's media.video_url shows a closed envelope; it sits paused on
 * its first frame until the guest presses the seal, then plays through the
 * opening animation and reveals the invitation content when it ends.
 */
export default function Envelope02Screen({ invitation, onOpen }: Props) {
  const videoUrl = invitation.media.video_url;
  const videoRef = useRef<HTMLVideoElement>(null);
  const openedRef = useRef(false);
  const [stage, setStage] = useState<'idle' | 'playing'>('idle');

  // Hands control to InvitePageClient: the content mounts behind this overlay
  // and AnimatePresence plays the exit fade while the video's last frames are
  // still on screen — a straight crossfade into the hero background.
  const finish = () => {
    if (openedRef.current) return;
    openedRef.current = true;
    onOpen();
  };

  const handleSealClick = () => {
    if (stage !== 'idle') return;
    const video = videoRef.current;
    if (!videoUrl || !video) { finish(); return; }
    setStage('playing');
    video.play().catch(() => finish());
  };

  // Start the crossfade just before the video ends so the overlay never
  // sits on a stopped frame (that pause read as a "flash").
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || stage !== 'playing' || !isFinite(video.duration)) return;
    if (video.duration - video.currentTime <= 1.4) finish();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.9, ease: 'easeInOut' } }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: t2.paper,
        overflow: 'hidden',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* ── Envelope video — paused on first frame until the seal is pressed ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        {videoUrl && (
          <video
            ref={videoRef}
            src={videoUrl}
            muted
            playsInline
            preload="auto"
            onTimeUpdate={handleTimeUpdate}
            onEnded={finish}
            onError={() => { if (stage !== 'idle') finish(); }}
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover',
              display: 'block',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

      {/* ── Tap target — whole screen, so the seal is always tappable
       *   regardless of how object-fit: cover crops the video ────────── */}
      <button
        onClick={handleSealClick}
        disabled={stage !== 'idle'}
        aria-label="Open invitation"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 6,
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: stage === 'idle' ? 'pointer' : 'default',
          touchAction: 'manipulation',
        }}
      >
      </button>
    </motion.div>
  );
}
