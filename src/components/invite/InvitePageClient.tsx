'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { EInvitation } from '@/types';
import EnvelopeScreen from './sections/EnvelopeScreen';
import { resolveDesign, resolveEnvelopeConfig } from './designs/registry';

interface Props {
  invitation: EInvitation;
}

/*
 * Orchestrates the two-phase invitation experience:
 *   1. EnvelopeScreen — wax-seal intro, full-viewport.
 *   2. InvitationContent — full invitation after the seal is tapped.
 *
 * Phase transitions:
 *   tap seal → setEnvelopeVisible(false) → AnimatePresence plays exit →
 *   onExitComplete → setContentVisible(true) → content mounts.
 *
 * Audio: if audio_url is set, an Audio element is pre-loaded on mount so it
 * can start immediately on onExitComplete, satisfying the browser's
 * user-gesture requirement for autoplay (the tap counts as a gesture).
 */
export default function InvitePageClient({ invitation }: Props) {
  const [envelopeVisible, setEnvelopeVisible] = useState(true);
  const [contentVisible,  setContentVisible]  = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const Design          = resolveDesign(invitation.slug);
  const envelopeConfig  = resolveEnvelopeConfig(invitation.slug);

  useEffect(() => {
    if (!invitation.media.audio_url) return;
    const audio = new Audio(invitation.media.audio_url);
    audio.loop   = true;
    audio.volume = 0.3;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [invitation.media.audio_url]);

  const handleSealOpen = () => setEnvelopeVisible(false);

  const handleExitComplete = () => {
    setContentVisible(true);
    audioRef.current?.play().catch(() => {});
  };

  return (
    <>
      <AnimatePresence onExitComplete={handleExitComplete}>
        {envelopeVisible && (
          <EnvelopeScreen
            onOpen={handleSealOpen}
            {...envelopeConfig}
          />
        )}
      </AnimatePresence>

      {contentVisible && <Design invitation={invitation} />}
    </>
  );
}
