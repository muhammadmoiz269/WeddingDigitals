'use client';

import { useState } from 'react';
import { SITE_URL } from '@/lib/site';

interface Props {
  slug: string;
  coupleName: string;
}

export default function ShareButton({ slug, coupleName }: Props) {
  const [copied, setCopied] = useState(false);
  const url = `${SITE_URL}/invite/${slug}`;

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: `${coupleName} — Wedding Invitation`, url });
      } catch {
        // User cancelled share sheet — do nothing
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Clipboard API blocked — silently ignore
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      aria-label="Share invitation"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(58,85,66,0.35)',
        color: copied ? '#4ade80' : '#3a5542',
        padding: '0.45rem 1rem',
        borderRadius: 999,
        fontSize: '0.7rem',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        transition: 'color 0.2s, border-color 0.2s',
        fontFamily: 'var(--font-body)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
    >
      {copied ? (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Share
        </>
      )}
    </button>
  );
}
