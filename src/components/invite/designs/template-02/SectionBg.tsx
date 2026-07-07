'use client';

interface Props {
  mobileSrc: string;
  desktopSrc: string;
  /** Eager-load (hero only); everything else lazy-loads. */
  eager?: boolean;
  /** Optional CSS gradient laid over the art for text legibility. */
  scrim?: string;
}

/**
 * Full-bleed responsive background for template-02 sections.
 * Mobile and desktop assets are different art compositions, so we swap
 * whole <img> elements at the 768px breakpoint (see Template02Styles).
 */
export function SectionBg({ mobileSrc, desktopSrc, eager = false, scrim }: Props) {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={mobileSrc} alt="" className="t2-bg t2-bg--mobile" loading={eager ? 'eager' : 'lazy'} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={desktopSrc} alt="" className="t2-bg t2-bg--desktop" loading={eager ? 'eager' : 'lazy'} />
      {scrim && <div style={{ position: 'absolute', inset: 0, background: scrim }} />}
    </div>
  );
}
