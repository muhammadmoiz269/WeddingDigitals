'use client';

import { useRef } from 'react';
import { Great_Vibes, Pinyon_Script } from 'next/font/google';
import type { EInvitation } from '@/types';
import { ScrollerContext } from '../../core/ScrollerContext';
import { formatDate } from '../../core/helpers/datetime';
import { useCountdown } from '../../core/hooks/useCountdown';
import { Hero02 } from './sections/Hero02';
import { Countdown02 } from './sections/Countdown02';
import { Venue02 } from './sections/Venue02';
import { Schedule02 } from './sections/Schedule02';
import { Rsvp02 } from './sections/Rsvp02';
import { FaqsFooter02 } from './sections/FaqsFooter02';
import { Template02Styles } from './Template02Styles';
import { template02Config, t2 } from './config';

const scriptFont = Great_Vibes({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-script',
  display: 'swap',
});

const scriptFontAlt = Pinyon_Script({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-script-alt',
  display: 'swap',
});

interface Props {
  invitation: EInvitation;
}

export function Template02Design({ invitation }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { couple, wedding_at, venue, media, rsvp_contacts, schedule, faqs } = invitation;

  const {
    showCountdown, showSchedule, showRsvp, rsvpMessage,
  } = template02Config;

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
      className={`inv-scroller t2-root ${scriptFont.variable} ${scriptFontAlt.variable}`}
      style={{
        background: t2.paper,
        color: t2.ink,
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
      <Template02Styles />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <Hero02 couple={couple} />

      {/* ── Countdown ────────────────────────────────────────────────────── */}
      {showCountdown && (
        <Countdown02
          weddingDate={weddingDate}
          timeLeft={timeLeft}
          isPast={isPast}
        />
      )}

      {/* ── Venue ─────────────────────────────────────────────────────────── */}
      {hasVenue && <Venue02 venue={venue} eventCardUrl={media.event_card_url} />}

      {/* ── Schedule ─────────────────────────────────────────────────────── */}
      {hasSchedule && <Schedule02 schedule={schedule} />}

      {/* ── RSVP ─────────────────────────────────────────────────────────── */}
      {hasRsvp && (
        <Rsvp02 contacts={rsvp_contacts} message={rsvpMessage} />
      )}

      {/* ── FAQs + Footer ────────────────────────────────────────────────── */}
      <FaqsFooter02 faqs={faqs} monogram={couple.monogram} />

      </ScrollerContext.Provider>
    </div>
    </div>
  );
}
