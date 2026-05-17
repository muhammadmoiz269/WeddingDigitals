"use client";

import { calculatePrice, formatPKR } from "@/lib/pricing";
import type { CardProduct, AddOn } from "@/types";

export const MAIN_EVENTS = [
  "Valima",
  "Wedding",
  "Engagement",
  "Nikkah",
] as const;
export type MainEvent = (typeof MAIN_EVENTS)[number];

export const ADDON_EVENTS = [
  "Valima",
  "Wedding",
  "Nikkah",
  "Mayon",
  "Mehendi",
] as const;
export type AddonEventType = (typeof ADDON_EVENTS)[number];

export const ENGLISH_TEMPLATE = `Mrs. Ahmed
REQUESTS THE PLEASURE OF YOUR COMPANY AT THE
[Event] Ceremony
OF HER BELOVED DAUGHTER

Amna Ali
D/O. Muhammad Ahmed

WITH

Muhammad Hassan
S/O. Muhammad Ali

إِنْ شَاءَ اللَّهُ

[Day]  |  [Date]  |  [Month & Year]

AT
[Venue Name]
[Venue Address]

AWAITING TO WELCOME               PROGRAMME
ALL FAMILY MEMBERS                ARRIVAL......... 07:30 P.M.
[Contact Numbers]                 DINNER.......... 08:00 P.M.
                                  RUKHSATI........ 09:30 P.M.`;

export const ADDON_MIN_QTY = 50;

export interface AddOnEventData {
  eventType: AddonEventType;
  enabled: boolean;
  quantity: string;
  content: string;
}

interface Props {
  card: CardProduct;
  quantity: number;
  selectedAddOns: AddOn[];
  mainEvent: MainEvent;
  content: string;
  addOnEvents: AddOnEventData[];
  fieldErrors: Record<string, string>;
  mainTotal: number;
  onMainEventChange: (e: MainEvent) => void;
  onContentChange: (c: string) => void;
  onAddonChange: (idx: number, patch: Partial<AddOnEventData>) => void;
  onClearError: (field: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const TOKENS = [
  "[Event]",
  "[Day]",
  "[Date]",
  "[Month & Year]",
  "[Venue Name]",
  "[Venue Address]",
  "[Contact Numbers]",
];

function classifyLine(
  line: string,
):
  | "name"
  | "with"
  | "date"
  | "at"
  | "footer"
  | "small-caps"
  | "venue"
  | "normal" {
  const t = line.trim();
  if (!t) return "normal";
  // "with" / "WITH" standalone
  if (/^with$/i.test(t)) return "with";
  // Date row
  if (t.includes("|")) return "date";
  // AT
  if (/^AT$/.test(t)) return "at";
  // Footer rows
  if (
    /Awaiting|Programme|Family Members|Arrival|Dinner|Contact|Rukhsati/i.test(t)
  )
    return "footer";
  // Small-caps: REQUESTS / Mrs. / Mr. & Mrs. / D/O. / S/O. / OF HER / OF THEIR / OF HIS
  if (
    /^(REQUESTS?|Mrs?\.|Mr\. & Mrs\.|D\/O\.|S\/O\.|OF HER|OF THEIR|OF HIS)/i.test(
      t,
    )
  )
    return "small-caps";
  // Venue tokens
  if (/^\[Venue/i.test(t)) return "venue";
  // Lines starting with [ are token placeholders
  if (t.startsWith("[")) return "normal";
  // Arabic script → render as name class (prominent centre display)
  if (/[\u0600-\u06FF]/.test(t)) return "name";
  // Short standalone lines → names (Amna Ali, Muhammad Hassan, venue lines the user fills)
  if (t.length <= 35 && !/[|:@#]/.test(t)) return "name";
  return "normal";
}

function PreviewBox({
  content,
  compact,
}: {
  content: string;
  compact?: boolean;
}) {
  const lines = content.split("\n");

  // Split footer block from the rest
  const footerStart = lines.findIndex((l) => /Awaiting|Programme/i.test(l));
  const bodyLines = footerStart >= 0 ? lines.slice(0, footerStart) : lines;
  const footerLines = footerStart >= 0 ? lines.slice(footerStart) : [];

  return (
    <div className={`co-preview${compact ? " co-preview--compact" : ""}`}>
      <div className="co-preview__corner co-preview__corner--tl" />
      <div className="co-preview__corner co-preview__corner--tr" />
      <div className="co-preview__corner co-preview__corner--bl" />
      <div className="co-preview__corner co-preview__corner--br" />

      <div className="co-preview__body">
        {bodyLines.map((line, i) => {
          const kind = classifyLine(line);
          if (!line.trim())
            return <div key={i} className="co-preview__spacer" />;
          if (kind === "name")
            return (
              <div key={i} className="co-preview__name">
                {line}
              </div>
            );
          if (kind === "with")
            return (
              <div key={i} className="co-preview__with">
                {line}
              </div>
            );
          if (kind === "date")
            return (
              <div key={i} className="co-preview__date">
                {line}
              </div>
            );
          if (kind === "at")
            return (
              <div key={i} className="co-preview__at">
                {line}
              </div>
            );
          if (kind === "small-caps")
            return (
              <div key={i} className="co-preview__small-caps">
                {line}
              </div>
            );
          if (kind === "venue")
            return (
              <div key={i} className="co-preview__venue">
                {line}
              </div>
            );
          return (
            <div key={i} className="co-preview__line">
              {line}
            </div>
          );
        })}
      </div>

      {footerLines.length > 0 && (
        <div className="co-preview__footer">
          {footerLines.map((line, i) => {
            // Split on 2+ consecutive spaces to find left and right columns
            const parts = line.split(/  +/);
            const left = parts[0] ?? "";
            const right = parts.slice(1).join("  ").trim();
            return (
              <div key={i} className="co-preview__footer-row">
                <span className="co-preview__footer-left">{left}</span>
                {right && (
                  <span className="co-preview__footer-right">{right}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function CheckoutStep1({
  card,
  quantity,
  mainEvent,
  content,
  addOnEvents,
  fieldErrors,
  mainTotal,
  onMainEventChange,
  onContentChange,
  onAddonChange,
  onClearError,
  onNext,
  onBack,
}: Props) {
  const addonTotals = addOnEvents.map((evt) => {
    if (!evt.enabled) return 0;
    const qty = parseInt(evt.quantity, 10);
    return isNaN(qty) || qty < 1
      ? 0
      : calculatePrice(card.base_price, qty, []).total;
  });

  const grandTotal = mainTotal + addonTotals.reduce((a, b) => a + b, 0);

  return (
    <div className="co-step">
      <div>
        <h3 className="co-step__title">✍️ Customize Your Card</h3>
        <p className="co-step__desc">
          Select your event, edit the card text, and preview it live.
        </p>
      </div>

      {/* Event Type */}
      <div>
        <label
          className="co-label"
          style={{ display: "block", marginBottom: "0.5rem" }}
        >
          Main Event *
        </label>
        <div className="co-event-pills">
          {MAIN_EVENTS.map((evt) => (
            <button
              key={evt}
              className={`co-event-pill${mainEvent === evt ? " co-event-pill--active" : ""}`}
              onClick={() => onMainEventChange(evt)}
            >
              {evt}
            </button>
          ))}
        </div>
      </div>

      {/* Main editor */}
      <div className="co-editor-grid">
        <div className="co-field">
          <label className="co-label">Card Text</label>
          <div className="co-hint-bar">
            💡 Replace the bracketed tokens with real details:
            {TOKENS.map((t) => (
              <span key={t} className="co-token">
                {t}
              </span>
            ))}
            — and edit the names (Mr. & Mrs. Ahmed, Amna Ali, Ali Hassan)
            directly.
          </div>
          <textarea
            className={`co-textarea${fieldErrors.content ? " co-input--error" : ""}`}
            rows={13}
            value={content}
            onChange={(e) => {
              onContentChange(e.target.value);
              onClearError("content");
            }}
          />
          {fieldErrors.content && (
            <span className="co-field-error">{fieldErrors.content}</span>
          )}
        </div>
        <div className="co-field">
          <label className="co-label">📄 Live Preview</label>
          <PreviewBox content={content} />
        </div>
      </div>

      {/* Add-on Events */}
      <div className="co-addons-section">
        <h4 className="co-addons-title">Add-on Events</h4>
        <p className="co-addons-desc">
          Need cards for other occasions too? Add them below — each gets its own
          card text and quantity.
        </p>
        <div className="co-addons-list">
          {addOnEvents.map((evt, idx) => {
            const isDisabled = evt.eventType === mainEvent;
            const addonTotal = addonTotals[idx];
            return (
              <div key={evt.eventType} className="co-addon-item">
                <div
                  className={`co-addon-row${isDisabled ? " co-addon-row--disabled" : ""}`}
                >
                  <label className="co-addon-check-label">
                    <input
                      type="checkbox"
                      disabled={isDisabled}
                      checked={evt.enabled}
                      onChange={(e) =>
                        onAddonChange(idx, { enabled: e.target.checked })
                      }
                    />
                    <span className="co-addon-name">{evt.eventType}</span>
                    {isDisabled && (
                      <span className="co-addon-badge">Your main event</span>
                    )}
                  </label>
                  {evt.enabled && !isDisabled && (
                    <div className="co-addon-qty-row">
                      <span className="co-addon-qty-label">Quantity:</span>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.2rem",
                        }}
                      >
                        <input
                          type="number"
                          min={ADDON_MIN_QTY}
                          placeholder={`e.g. 100 (min ${ADDON_MIN_QTY})`}
                          value={evt.quantity}
                          onChange={(e) => {
                            onAddonChange(idx, { quantity: e.target.value });
                            onClearError(`addon_qty_${idx}`);
                          }}
                          className={`co-addon-qty-input${fieldErrors[`addon_qty_${idx}`] ? " co-input--error" : ""}`}
                        />
                        {fieldErrors[`addon_qty_${idx}`] && (
                          <span className="co-field-error">
                            {fieldErrors[`addon_qty_${idx}`]}
                          </span>
                        )}
                      </div>
                      {addonTotal > 0 && (
                        <span className="co-addon-price">
                          {formatPKR(addonTotal)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {evt.enabled && !isDisabled && (
                  <div className="co-addon-editor">
                    <div className="co-editor-grid">
                      <div className="co-field">
                        <label className="co-label">
                          {evt.eventType} — Card Text
                        </label>
                        <div className="co-hint-bar">
                          💡 Replace tokens:{" "}
                          {TOKENS.map((t) => (
                            <span key={t} className="co-token">
                              {t}
                            </span>
                          ))}{" "}
                          — edit names directly.
                        </div>
                        <textarea
                          className="co-textarea"
                          rows={10}
                          value={evt.content}
                          onChange={(e) =>
                            onAddonChange(idx, { content: e.target.value })
                          }
                        />
                      </div>
                      <div className="co-field">
                        <label className="co-label">📄 Live Preview</label>
                        <PreviewBox content={evt.content} compact />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Price summary */}
      <div className="co-summary">
        <div className="co-summary__row">
          <span>
            {mainEvent} — {quantity} cards
          </span>
          <span>{formatPKR(mainTotal)}</span>
        </div>
        {addOnEvents
          .filter((e) => e.enabled && e.eventType !== mainEvent)
          .map((evt) => {
            const qty = parseInt(evt.quantity, 10);
            if (isNaN(qty) || qty < 1) return null;
            const t = calculatePrice(card.base_price, qty, []).total;
            return (
              <div key={evt.eventType} className="co-summary__row">
                <span>
                  {evt.eventType} — {qty} cards
                </span>
                <span>{formatPKR(t)}</span>
              </div>
            );
          })}
        <div className="co-summary__total">
          <span>Grand Total</span>
          <span>{formatPKR(grandTotal)}</span>
        </div>
      </div>

      <div className="co-actions">
        <button className="co-btn co-btn--secondary" onClick={onBack}>
          ← Back to Card
        </button>
        <button className="co-btn co-btn--primary" onClick={onNext}>
          Continue to Details →
        </button>
      </div>
    </div>
  );
}
