'use client';

/**
 * Scoped styles for the template-02 (watercolor) design.
 * DefaultStyles is NOT mounted alongside this design, so the shared layout
 * classes used by reused components (InvSection, RsvpChatCard) are redefined
 * here with the template-02 colorway.
 */
export function Template02Styles() {
  return (
    <style>{`
      .t2-root.inv-scroller { scrollbar-width: thin; scrollbar-color: #5B7A9D transparent; }
      .t2-root.inv-scroller::-webkit-scrollbar { width: 5px; }
      .t2-root.inv-scroller::-webkit-scrollbar-track { background: transparent; }
      .t2-root.inv-scroller::-webkit-scrollbar-thumb { background: #5B7A9D; border-radius: 99px; }
      .t2-root.inv-scroller::-webkit-scrollbar-thumb:hover { background: #2E4964; }

      /* ── Responsive full-bleed backgrounds ─────────────────────────── */
      .t2-bg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .t2-bg--desktop { display: none; }
      @media (min-width: 768px) {
        .t2-bg--mobile  { display: none; }
        .t2-bg--desktop { display: block; }
      }

      /* ── Section layout (copied from DefaultStyles, unchanged) ─────── */
      .inv-section {
        width: 100%;
        height: 100vh;
        flex-shrink: 0;
        scroll-snap-align: start;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      .inv-container {
        max-width: 1080px;
        margin: 0 auto;
        width: 100%;
        padding: 0 1.25rem;
      }
      .inv-section-flow {
        width: 100%;
        min-height: 100vh;
        scroll-snap-align: start;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        position: relative;
      }

      /* ── Countdown (t2 colorway) ────────────────────────────────────── */
      .inv-countdown-outer {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .inv-countdown-units {
        display: flex;
        align-items: flex-start;
      }
      .inv-countdown-unit {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 6.5rem;
        padding: 0 0.5rem;
        position: relative;
        flex-shrink: 0;
      }
      .inv-countdown-unit + .inv-countdown-unit::before {
        content: ':';
        position: absolute;
        left: -0.15rem;
        top: 0.2rem;
        font-family: var(--font-heading);
        font-size: clamp(1.8rem, 4vw, 3rem);
        color: #5B7A9D;
        opacity: 0.35;
        line-height: 1;
      }
      .inv-countdown-number {
        font-family: var(--font-heading);
        font-size: clamp(2.4rem, 5vw, 3.8rem);
        color: #2E4964;
        line-height: 1;
        font-weight: 300;
        letter-spacing: 0.04em;
        font-variant-numeric: tabular-nums;
        display: block;
        text-align: center;
        width: 100%;
      }
      .inv-countdown-timelabel {
        font-size: 0.55rem;
        letter-spacing: 0.28em;
        text-transform: uppercase;
        opacity: 0.55;
        margin-top: 0.7rem;
        color: #3A4A5C;
      }

      /* Compact countdown variant sized to fit inside the scratch card */
      .t2-scratch-countdown .inv-countdown-unit {
        min-width: 4.5rem;
        padding: 0 0.35rem;
      }
      .t2-scratch-countdown .inv-countdown-number {
        font-size: clamp(1.7rem, 5vw, 2.4rem);
      }
      .t2-scratch-countdown .inv-countdown-unit + .inv-countdown-unit::before {
        font-size: clamp(1.3rem, 3.5vw, 2rem);
        top: 0.15rem;
      }
      @media (max-width: 380px) {
        .t2-scratch-countdown .inv-countdown-unit { min-width: 3.9rem; padding: 0 0.25rem; }
      }

      /* ── RSVP arched content panel ─────────────────────────────────── */
      .t2-rsvp-panel {
        position: relative;
        width: min(520px, 94%);
        margin: 0 auto;
        padding: 4.5rem 2.75rem 3.5rem;
      }
      @media (max-width: 767px) {
        .t2-rsvp-panel { padding: 3.75rem 1.5rem 3rem; }
      }

      @media (max-width: 768px) {
        .inv-countdown-unit { min-width: 4.25rem; padding: 0 0.3rem; }
        .inv-section-flow { box-sizing: border-box; }
        .inv-faq-item-btn { padding: 0.75rem 0.85rem !important; }
        .inv-faq-answer  { padding: 0.6rem 0.85rem 0.85rem !important; }
      }
    `}</style>
  );
}
