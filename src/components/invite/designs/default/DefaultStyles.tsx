'use client';

/** All inv-* scoped styles for the default invitation design. */
export function DefaultStyles() {
  return (
    <style>{`
      .inv-scroller { scrollbar-width: thin; scrollbar-color: #3a5542 transparent; }
      .inv-scroller::-webkit-scrollbar { width: 5px; }
      .inv-scroller::-webkit-scrollbar-track { background: transparent; }
      .inv-scroller::-webkit-scrollbar-thumb { background: #3a5542; border-radius: 99px; }
      .inv-scroller::-webkit-scrollbar-thumb:hover { background: #2e4436; }

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
      }

      .inv-label {
        font-size: 0.62rem;
        letter-spacing: 0.32em;
        text-transform: uppercase;
        text-align: center;
        margin-bottom: 2.5rem;
        opacity: 0.9;
      }

      .inv-venue-grid {
        display: grid;
        grid-template-columns: 1fr 1.5fr;
        gap: 4rem;
        align-items: start;
      }

      .inv-side-left {
        position: absolute;
        top: 0;
        bottom: 0;
        left: -40px;
        display: flex;
        align-items: center;
        z-index: 1;
        pointer-events: none;
      }
      .inv-side-right {
        position: absolute;
        top: 0;
        bottom: 0;
        right: -40px;
        display: flex;
        align-items: center;
        z-index: 1;
        pointer-events: none;
      }
      .inv-col-img {
        height: 90%;
        width: auto;
        object-fit: contain;
        opacity: 0.45;
      }

      .inv-schedule-container {
        display: flex;
        align-items: flex-start;
        gap: 3rem;
        max-width: 900px;
        margin: 1.5rem auto 0;
      }
      .inv-schedule-list {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 1.75rem;
        margin-top: 3rem;
      }

      .inv-rsvp-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
        gap: 1.5rem;
        width: 90%;
        margin: 0 auto;
      }

      /* ── WhatsApp chat card ───────────────────────────────────────── */
      .inv-wa-card {
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        display: flex;
        flex-direction: column;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        width: 100%;
        min-width: 0;
      }
      .inv-wa-header {
        background: #3a5542;
        padding: 0.75rem 1rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      .inv-wa-avatar {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: rgba(255,255,255,0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.85rem;
        font-weight: 700;
        color: #fff;
        flex-shrink: 0;
        letter-spacing: 0.02em;
      }
      .inv-wa-body {
        background: #ECE5DD;
        padding: 1rem;
        height: 100px;
        flex-shrink: 0;
        overflow: hidden;
      }
      .inv-wa-bubble {
        max-width: 82%;
        padding: 0.55rem 0.75rem 0.3rem;
        border-radius: 8px;
        position: relative;
      }
      .inv-wa-bubble-in {
        background: #fff;
        border-top-left-radius: 2px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.12);
      }
      .inv-wa-bubble-out {
        background: #DCF8C6;
        border-top-right-radius: 2px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.1);
      }
      .inv-wa-time {
        display: block;
        font-size: 0.62rem;
        color: rgba(0,0,0,0.38);
        margin-top: 0.2rem;
        line-height: 1;
      }
      .inv-wa-input {
        width: 100%;
        background: transparent;
        border: none;
        outline: none;
        resize: none;
        font-family: inherit;
        font-size: 0.82rem;
        line-height: 1.5;
        color: #111;
        padding: 0;
        display: block;
        cursor: text;
      }
      .inv-wa-footer {
        background: #F0F2F5;
        padding: 0.5rem 0.75rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .inv-wa-input-bar {
        flex: 1;
        background: #fff;
        border-radius: 20px;
        padding: 0.45rem 0.85rem;
        display: flex;
        align-items: flex-end;
      }
      .inv-wa-send {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #25D366;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: background 0.18s, transform 0.18s;
        -webkit-tap-highlight-color: transparent;
      }
      .inv-wa-send:hover { background: #1DA851; transform: scale(1.08); }
      .inv-wa-send:active { transform: scale(0.94); }

      .inv-media-wrap {
        max-width: 860px;
        margin: 0 auto;
      }

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
        color: #3a5542;
        opacity: 0.28;
        line-height: 1;
      }
      .inv-countdown-number {
        font-family: var(--font-heading);
        font-size: clamp(2.4rem, 5vw, 3.8rem);
        color: #3a5542;
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
        opacity: 0.4;
        margin-top: 0.7rem;
      }

      .inv-section-flow {
        width: 100%;
        min-height: 100vh;
        scroll-snap-align: start;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        padding-top: 12vh;
        padding-bottom: 10vh;
        overflow: hidden;
      }

      .inv-flower-stand {
        height: 500px;
        object-fit: contain;
        opacity: 0.6;
        flex-shrink: 0;
        display: block;
      }

      @media (max-width: 768px) {
        .inv-venue-grid  { grid-template-columns: 1fr; gap: 1.75rem; }
        .inv-countdown-unit { min-width: 4.25rem; padding: 0 0.3rem; }
        .inv-col-img     { height: 55%; opacity: 0.25; }
        .inv-cypress-img { display: none !important; }
        .inv-schedule-container { flex-direction: row; gap: 1rem; align-items: center; }
        .inv-rsvp-grid   { grid-template-columns: 1fr; }
        .inv-section-flow { box-sizing: border-box; }
        .inv-vase img     { height: 95px !important; width: auto !important; }
        .inv-rsvp-heading { gap: 0.75rem !important; align-items: center !important; flex-wrap: nowrap !important; }
        .inv-wa-header   { padding: 0.5rem 0.65rem; gap: 0.5rem; }
        .inv-wa-avatar   { width: 32px; height: 32px; font-size: 0.75rem; }
        .inv-wa-call-icons { gap: 0.75rem !important; }
        .inv-wa-call-icons svg { width: 18px !important; height: 18px !important; }
        .inv-wa-bubble   { max-width: 92%; word-break: break-word; }
        .inv-wa-body     { height: 110px; padding: 0.75rem; }
        .inv-wa-footer   { padding: 0.4rem 0.5rem; }
        .inv-wa-input-bar { padding: 0.35rem 0.65rem; }
        .inv-faq-item-btn { padding: 0.75rem 0.85rem !important; }
        .inv-faq-answer  { padding: 0.6rem 0.85rem 0.85rem !important; }
      }

      /* outer div: pure vertical fall + opacity fade */
      .inv-petal {
        animation: inv-petal-fall var(--pd) linear var(--pdel) infinite;
      }
      @keyframes inv-petal-fall {
        0%   { transform: translateY(-60px); opacity: 0; }
        8%   { opacity: var(--po); }
        92%  { opacity: var(--po); }
        100% { transform: translateY(110vh); opacity: 0; }
      }
      /* inner div: horizontal sway + rotation (runs in sync with outer) */
      .inv-petal-inner {
        animation: inv-petal-sway var(--pd) ease-in-out var(--pdel) infinite;
      }
      @keyframes inv-petal-sway {
        0%   { transform: translateX(0)                       rotate(0deg)   scale(var(--ps)); }
        20%  { transform: translateX(calc(var(--pdr)*0.45))   rotate(140deg) scale(var(--ps)); }
        40%  { transform: translateX(calc(var(--pdr)*-0.1))   rotate(270deg) scale(var(--ps)); }
        60%  { transform: translateX(calc(var(--pdr)*0.6))    rotate(410deg) scale(var(--ps)); }
        80%  { transform: translateX(calc(var(--pdr)*0.05))   rotate(560deg) scale(var(--ps)); }
        100% { transform: translateX(calc(var(--pdr)*0.35))   rotate(700deg) scale(var(--ps)); }
      }
    `}</style>
  );
}
