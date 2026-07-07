'use client';

import { InvSection } from '../../../core/primitives/InvSection';
import { Parallax } from '../../../core/primitives/Parallax';
import { Divider } from '../../../core/primitives/Divider';
import { embedToDirectionsUrl } from '../../../core/helpers/maps';
import { SectionBg } from '../SectionBg';
import { T2_ASSETS, t2 } from '../config';
import type { EInvitation } from '@/types';

interface Props {
  venue: EInvitation['venue'];
  eventCardUrl?: string;
}

export function Venue02({ venue, eventCardUrl }: Props) {
  return (
    <InvSection
      background={
        <SectionBg
          mobileSrc={`${T2_ASSETS}/venue-details-bg.png`}
          desktopSrc={`${T2_ASSETS}/venue-details-bg-desktop.png`}
        />
      }
    >
      <Parallax speed={120}>
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
          The Venue Details
        </h2>
        <Divider color={t2.accent} />
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'clamp(0.8rem, 1.5vw, 1rem)',
          color: t2.ink,
          textAlign: 'center',
          opacity: 0.65,
          letterSpacing: '0.06em',
          margin: '0 0 2rem',
        }}>
          When &amp; Where
        </p>
      </Parallax>
      <Parallax speed={120}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center', alignItems: 'center', textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
            {eventCardUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={eventCardUrl}
                alt="Event details"
                style={{
                  width: 'min(420px, 88vw)',
                  maxWidth: '100%',
                  display: 'block',
                }}
              />
            )}
            {venue.name && (
              <p style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)',
                color: t2.heading,
                lineHeight: 1.25,
              }}>
                {venue.name}
              </p>
            )}
            {venue.address && (
              <p style={{ fontSize: '0.9rem', color: t2.ink, opacity: 0.65, lineHeight: 1.7 }}>
                {venue.address}
              </p>
            )}
            {venue.maps_embed_url && (
              <a
                href={embedToDirectionsUrl(venue.maps_embed_url)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.72rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: t2.heading,
                  textDecoration: 'none',
                  marginTop: '0.5rem',
                  padding: '0.65rem 1.25rem',
                  border: '1px solid rgba(255,255,255,0.45)',
                  borderRadius: 8,
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(46,73,100,0.08), 0 8px 32px rgba(46,73,100,0.18)',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Get Directions
              </a>
            )}
        </div>
      </Parallax>
    </InvSection>
  );
}
