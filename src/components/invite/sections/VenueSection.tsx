'use client';

import { InvSection } from '../core/primitives/InvSection';
import { Parallax } from '../core/primitives/Parallax';
import { Divider } from '../core/primitives/Divider';
import { embedToDirectionsUrl } from '../core/helpers/maps';
import type { EInvitation } from '@/types';

interface Props {
  venue: EInvitation['venue'];
}

export function VenueSection({ venue }: Props) {
  return (
    <InvSection
      sideLeft={
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/assets/template-01/roses-top-left.png" alt="" aria-hidden="true" style={{ width: 200, objectFit: 'contain', display: 'block', opacity: 0.6 }} />
      }
      sideRight={
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/assets/template-01/roses-bottom-right.png" alt="" aria-hidden="true" style={{ width: 200, objectFit: 'contain', display: 'block', opacity: 0.6 }} />
      }
    >
      <Parallax speed={150}>
        <h2 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(2rem, 5vw, 3.2rem)',
          fontWeight: 400,
          color: '#3a5542',
          textAlign: 'center',
          letterSpacing: '0.05em',
          margin: '0 0 0.5rem',
          lineHeight: 1.2,
        }}>
          The Venue Details
        </h2>
        <Divider />
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'clamp(0.8rem, 1.5vw, 1rem)',
          color: '#2C2C2C',
          textAlign: 'center',
          opacity: 0.55,
          letterSpacing: '0.06em',
          margin: '0 0 2.5rem',
        }}>
          When &amp; Where
        </p>
      </Parallax>
      <Parallax speed={150}>
        <div className="inv-venue-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center', alignItems: 'flex-start' }}>
            {venue.name && (
              <p style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)',
                lineHeight: 1.25,
              }}>
                {venue.name}
              </p>
            )}
            {venue.address && (
              <p style={{ fontSize: '0.9rem', opacity: 0.55, lineHeight: 1.7 }}>
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
                  color: '#3a5542',
                  textDecoration: 'none',
                  marginTop: '0.5rem',
                  padding: '0.65rem 1.25rem',
                  border: '1px solid #3a5542',
                  borderRadius: 6,
                  alignSelf: 'flex-start',
                  opacity: 0.9,
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Get Directions
              </a>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/template-01/cypress-trees.png" alt="" aria-hidden="true" className="inv-cypress-img" style={{ height: 140, objectFit: 'contain', opacity: 0.55, display: 'block', alignSelf: 'flex-end', marginTop: 'auto' }} />
          </div>

          {venue.maps_embed_url && (
            <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.07)' }}>
              <iframe
                src={venue.maps_embed_url}
                width="100%"
                height="340"
                style={{ display: 'block', border: 'none' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={venue.name ? `Map to ${venue.name}` : 'Venue map'}
              />
            </div>
          )}
        </div>
      </Parallax>
    </InvSection>
  );
}
