'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { EInvitation } from '@/types';
import EnvelopeScreen from './sections/EnvelopeScreen';
import { resolveDesign, resolveEnvelope, resolveEnvelopeConfig } from './designs/registry';
import { InviteAnimationContext } from './core/InviteAnimationContext';

interface Props {
  invitation: EInvitation;
}

/*
 * Orchestrates the two-phase invitation experience:
 *   1. EnvelopeScreen — wax-seal intro, full-viewport.
 *   2. InvitationContent — full invitation after the seal is tapped.
 *
 * CustomEnvelope path (e.g. template-02 video envelope):
 *   Content is pre-mounted silently at opacity 0 from the start, so no DOM
 *   mutation happens at transition time. When the seal opens, only the opacity
 *   animation fires — no jank from mounting a complex tree mid-video.
 *   fade-in completes → envelope removed from behind → audio starts.
 *
 * Standard EnvelopeScreen path:
 *   tap seal → AnimatePresence plays exit fade → onExitComplete mounts content.
 *
 * Audio: if audio_url is set, an Audio element is pre-loaded on mount so it
 * can start immediately on transition, satisfying the browser's
 * user-gesture requirement for autoplay (the tap counts as a gesture).
 */
export default function InvitePageClient({ invitation }: Props) {
  const [envelopeVisible, setEnvelopeVisible] = useState(true);
  const [contentVisible,  setContentVisible]  = useState(false);
  const [fadeIn,          setFadeIn]          = useState(false);
  const doneRef  = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const Design          = useMemo(() => resolveDesign(invitation.slug), [invitation.slug]);
  const CustomEnvelope  = useMemo(() => resolveEnvelope(invitation.slug), [invitation.slug]);
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

  const handleSealOpen = () => {
    if (CustomEnvelope) {
      // Content is already in the DOM (pre-mounted). Just start the fade-in.
      setFadeIn(true);
    } else {
      setEnvelopeVisible(false);
    }
  };

  // CustomEnvelope path: fade-in complete → remove envelope + start audio.
  const handleContentFadeInComplete = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setEnvelopeVisible(false);
    audioRef.current?.play().catch(() => {});
  };

  // Standard EnvelopeScreen path: exit animation done → mount content + audio.
  const handleExitComplete = () => {
    if (!CustomEnvelope) {
      setContentVisible(true);
      audioRef.current?.play().catch(() => {});
    }
  };

  return (
    <>
      <AnimatePresence onExitComplete={handleExitComplete}>
        {envelopeVisible && (CustomEnvelope ? (
          // eslint-disable-next-line react-hooks/static-components -- registry lookup returns a stable module-level component
          <CustomEnvelope
            invitation={invitation}
            onOpen={handleSealOpen}
          />
        ) : (
          <EnvelopeScreen
            onOpen={handleSealOpen}
            {...envelopeConfig}
          />
        ))}
      </AnimatePresence>

      {/* CustomEnvelope: pre-mount content silently from the start so the React
          tree is already painted when the transition fires. Only opacity changes.
          InviteAnimationContext gates entrance animations inside until fadeIn. */}
      {CustomEnvelope ? (
        <motion.div
          animate={{ opacity: fadeIn ? 1 : 0 }}
          transition={fadeIn ? { duration: 0.9, ease: 'easeInOut' } : { duration: 0 }}
          onAnimationComplete={fadeIn ? handleContentFadeInComplete : undefined}
          style={{ position: 'fixed', inset: 0, zIndex: 60, opacity: 0, pointerEvents: fadeIn ? 'auto' : 'none' }}
        >
          <InviteAnimationContext.Provider value={fadeIn}>
            {/* eslint-disable-next-line react-hooks/static-components -- registry lookup returns a stable module-level component */}
            <Design invitation={invitation} />
          </InviteAnimationContext.Provider>
        </motion.div>
      ) : (
        contentVisible && (
          // eslint-disable-next-line react-hooks/static-components -- registry lookup returns a stable module-level component
          <Design invitation={invitation} />
        )
      )}
    </>
  );
}
