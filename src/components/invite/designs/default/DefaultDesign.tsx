'use client';

import { useRef } from 'react';
import type { EInvitation } from '@/types';
import { ScrollerContext } from '../../core/ScrollerContext';
import { formatDate } from '../../core/helpers/datetime';
import { useCountdown } from '../../core/hooks/useCountdown';
import { useEntranceChoreography } from '../../core/hooks/useEntranceChoreography';
import { HeroSection } from '../../sections/HeroSection';
import { CountdownSection } from '../../sections/CountdownSection';
import { CoverImageSection } from '../../sections/CoverImageSection';
import { CoverVideoSection } from '../../sections/CoverVideoSection';
import { VenueSection } from '../../sections/VenueSection';
import { ScheduleSection } from '../../sections/ScheduleSection';
import { RsvpSection } from '../../sections/RsvpSection';
import { FaqsFooterSection } from '../../sections/FaqsFooterSection';
import { PetalsOverlay } from '../../sections/PetalsOverlay';
import { DefaultStyles } from './DefaultStyles';
import { defaultConfig } from './config';

interface Props {
  invitation: EInvitation;
}

export function DefaultDesign({ invitation }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    leftCurtainCtrl, rightCurtainCtrl, centerCurtainCtrl,
    textVisible, petalsVisible,
  } = useEntranceChoreography();

  const { couple, wedding_at, venue, media, rsvp_contacts, schedule, faqs } = invitation;

  const {
    showCountdown, countdownHeading, showSchedule, showRsvp, rsvpMessage,
  } = defaultConfig;

  const timeLeft = useCountdown(wedding_at as string);
  const isPast   = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  const weddingDate = formatDate(wedding_at as string);

  const hasVenue    = !!(venue.name || venue.address || venue.maps_embed_url);
  const hasSchedule = schedule.length > 0 && showSchedule;
  const hasRsvp     = rsvp_contacts.some(r => r.name || r.number) && showRsvp;

  return (
    <div style={{ height: '100vh', overflow: 'hidden' }}>
    <div
      ref={containerRef}
      className="inv-scroller"
      style={{
        background: '#FDFAF6',
        color: '#2C2C2C',
        fontFamily: 'var(--font-body)',
        height: '100vh',
        overflowY: 'scroll',
        overflowX: 'hidden',
        scrollSnapType: 'y mandatory',
        width: '100%',
      }}
    >
      <ScrollerContext.Provider value={containerRef}>

      {/* ── Scoped layout styles ─────────────────────────────────────────── */}
      <DefaultStyles />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <HeroSection
        couple={couple}
        media={media}
        slug={invitation.slug}
        leftCurtainCtrl={leftCurtainCtrl}
        rightCurtainCtrl={rightCurtainCtrl}
        centerCurtainCtrl={centerCurtainCtrl}
        textVisible={textVisible}
      />

      {/* ── Countdown ────────────────────────────────────────────────────── */}
      {showCountdown && (
        <CountdownSection
          countdownHeading={countdownHeading}
          weddingDate={weddingDate}
          timeLeft={timeLeft}
          isPast={isPast}
        />
      )}

      {/* ── Cover image ──────────────────────────────────────────────────── */}
      {media.image_url && (
        <CoverImageSection
          imageUrl={media.image_url}
          groomName={couple.groom_name}
          brideName={couple.bride_name}
        />
      )}

      {/* ── Cover video ──────────────────────────────────────────────────── */}
      {media.video_url && (
        <CoverVideoSection videoUrl={media.video_url} />
      )}

      {/* ── Venue ─────────────────────────────────────────────────────────── */}
      {hasVenue && <VenueSection venue={venue} />}

      {/* ── Schedule ─────────────────────────────────────────────────────── */}
      {hasSchedule && <ScheduleSection schedule={schedule} />}

      {/* ── RSVP ─────────────────────────────────────────────────────────── */}
      {hasRsvp && (
        <RsvpSection contacts={rsvp_contacts} message={rsvpMessage} />
      )}

      {/* ── FAQs + Footer ────────────────────────────────────────────────── */}
      <FaqsFooterSection faqs={faqs} monogram={couple.monogram} />

      {/* ── Falling Petals ───────────────────────────────────────────────── */}
      {petalsVisible && <PetalsOverlay />}

      </ScrollerContext.Provider>
    </div>
    </div>
  );
}
