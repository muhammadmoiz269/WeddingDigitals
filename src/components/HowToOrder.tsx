"use client";

import { useState } from "react";
import JsonLd from "@/components/JsonLd";

// ─── Step data ───────────────────────────────────────────────────────────────

const STEPS = [
  {
    number: 1,
    title: "Customize & Checkout Online",
    body: (
      <>
        Select your card, choose the <strong>total number of cards</strong> and
        any <strong>add-ons</strong> (additional event cards e.g. Valima,
        Mehndi).
      </>
    ),
  },
  {
    number: 2,
    title: "We Create a WhatsApp Group",
    body: (
      <>
        Once your order is placed, we will create a{" "}
        <strong>WhatsApp group</strong> with you to coordinate everything
        smoothly.
      </>
    ),
  },
  {
    number: 3,
    title: "Confirm Wedding Details",
    body: (
      <>
        In the WhatsApp group, we will{" "}
        <strong>ask for the content</strong> for the card design and will send
        you soft copy of the design for your approval before printing.
      </>
    ),
  },
  {
    number: 4,
    title: "Payment Transfer",
    body: (
      <>
        You will also be asked to make a <strong>payment transfer</strong> and
        share the receipt with us in the group.
        <strong>(Full payment or 50% advance can be made)</strong>
      </>
    ),
  },
  {
    number: 5,
    title: "Printing & Dispatch",
    body: (
      <>
        Order will go into printing and will be dispatched in{" "}
        <strong>5 to 7 working days</strong>.
      </>
    ),
  },
];

// ─── Shared accordion row ─────────────────────────────────────────────────────

function AccordionSection({
  icon,
  label,
  children,
  defaultOpen = false,
  isLast = false,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isLast?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`acc-section${isLast ? "" : " acc-section--bordered"}`}>
      <button
        className="acc-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="acc-toggle__icon">{icon}</span>
        <span className="acc-toggle__label">{label}</span>
        <svg
          className={`acc-toggle__chevron${open ? " acc-toggle__chevron--open" : ""}`}
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && <div className="acc-body">{children}</div>}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

const howToLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Order Wedding Cards from Shahi Bulawa',
  description: 'Order custom wedding cards in Karachi in 3 simple steps via WhatsApp.',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Browse & Choose Your Design',
      text: 'Explore our collection of floral, luxury, minimalist and classic wedding card designs. Filter by category or event type to find the perfect match for your occasion.',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Customise via WhatsApp',
      text: 'Message us on WhatsApp with your preferred card, event details, guest names and any customisation requests. We will send a free digital proof within 24 hours.',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Approve Proof & Receive Delivery',
      text: 'Review and approve your digital proof, then confirm your order. Cards are printed and dispatched within 3–7 business days. We deliver across Karachi and nationwide.',
    },
  ],
};

export default function HowToOrder() {
  return (
    <>
      <JsonLd id="ld-howto-order" data={howToLd} />
      <div className="hto-card" style={{ marginTop: "30px" }}>
        {/* How to Place Order */}
        <AccordionSection
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          label="How to Place the Order?"
          defaultOpen={true}
        >
          <ol className="hto-steps">
            {STEPS.map((step) => (
              <li key={step.number} className="hto-step">
                <div className="hto-step__num">{step.number}</div>
                <div className="hto-step__content">
                  <p className="hto-step__title">{step.title}</p>
                  <p className="hto-step__body">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </AccordionSection>

        {/* Materials */}
        <AccordionSection
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
            </svg>
          }
          label="Materials"
        >
          <p className="acc-text">
            This is an eco-friendly product, completely{" "}
            <strong>compostable</strong> and <strong>recycle-able</strong>.
          </p>
        </AccordionSection>

        {/* Shipping */}
        <AccordionSection
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="1" y="3" width="15" height="13" rx="1" />
              <path d="M16 8h4l3 3v5h-7V8z" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          }
          label="Shipping"
          isLast
        >
          <p className="acc-text">
            Shipping is possible within <strong>07 working days</strong>, after
            the final design is confirmed.
          </p>
        </AccordionSection>
      </div>

      <style>{`
        /* ── Card wrapper ── */
        .hto-card {
          border: 1px solid #e8e0d4;
          border-radius: 16px;
          overflow: hidden;
          background: white;
        }

        /* ── Accordion section ── */
        .acc-section--bordered {
          border-bottom: 1px solid #f0e8dc;
        }

        /* ── Toggle button ── */
        .acc-toggle {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          width: 100%;
          padding: 0.875rem 1.125rem;
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          text-align: left;
          transition: background 0.2s;
        }
        .acc-toggle:hover {
          background: rgba(201,169,110,0.04);
        }
        .acc-toggle__icon {
          flex-shrink: 0;
          color: #8a7a6a;
          display: flex;
          align-items: center;
        }
        .acc-toggle__label {
          flex: 1;
          font-size: 0.875rem;
          font-weight: 700;
          color: #2a2018;
          letter-spacing: 0.01em;
        }
        .acc-toggle__chevron {
          flex-shrink: 0;
          color: #C9A96E;
          transition: transform 0.25s ease;
        }
        .acc-toggle__chevron--open {
          transform: rotate(180deg);
        }

        /* ── Body ── */
        .acc-body {
          padding: 0 1.125rem 1.125rem;
        }
        .acc-text {
          font-size: 0.8125rem;
          color: #6a5a4a;
          line-height: 1.6;
          margin: 0;
        }
        .acc-text strong {
          color: #2a2018;
          font-weight: 700;
        }

        /* ── Steps ── */
        .hto-steps {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
        }
        .hto-step {
          display: flex;
          gap: 0.875rem;
          align-items: flex-start;
          padding: 0.65rem 0;
          position: relative;
        }
        .hto-step:not(:last-child)::after {
          content: '';
          position: absolute;
          left: 13px;
          top: 34px;
          bottom: 0;
          width: 2px;
          background: linear-gradient(to bottom, #C9A96E40, #e8e0d4);
        }
        .hto-step__num {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #C9A96E, #B8944D);
          color: white;
          font-size: 0.72rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          position: relative;
          z-index: 1;
          box-shadow: 0 2px 8px rgba(201,169,110,0.3);
        }
        .hto-step__content {
          padding-top: 0.125rem;
        }
        .hto-step__title {
          font-size: 0.8125rem;
          font-weight: 700;
          color: #2a2018;
          margin: 0 0 0.2rem;
        }
        .hto-step__body {
          font-size: 0.775rem;
          color: #6a5a4a;
          line-height: 1.55;
          margin: 0;
        }
        .hto-step__body strong {
          color: #2a2018;
          font-weight: 700;
        }
      `}</style>
    </>
  );
}
