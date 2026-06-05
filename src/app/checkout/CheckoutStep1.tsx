"use client";

import { calculateAddonEventPrice, formatPKR } from "@/lib/pricing";
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

export const ADDON_MIN_QTY = 50;

export interface AddOnEventData {
  eventType: AddonEventType;
  enabled: boolean;
  quantity: string;
}

interface Props {
  card: CardProduct;
  quantity: number;
  selectedAddOns: AddOn[];
  mainEvent: MainEvent;
  addOnEvents: AddOnEventData[];
  fieldErrors: Record<string, string>;
  mainTotal: number;
  onMainEventChange: (e: MainEvent) => void;
  onAddonChange: (idx: number, patch: Partial<AddOnEventData>) => void;
  onClearError: (field: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function CheckoutStep1({
  card,
  quantity,
  mainEvent,
  addOnEvents,
  fieldErrors,
  mainTotal,
  onMainEventChange,
  onAddonChange,
  onClearError,
  onNext,
  onBack,
}: Props) {
  const addonCardPrice = card.inner_card_price ?? 0;

  const addonTotals = addOnEvents.map((evt) => {
    if (!evt.enabled) return 0;
    const qty = parseInt(evt.quantity, 10);
    return isNaN(qty) || qty < 1 ? 0 : calculateAddonEventPrice(addonCardPrice, qty);
  });

  const grandTotal = mainTotal + addonTotals.reduce((a, b) => a + b, 0);

  return (
    <div className="co-step">
      <div>
        <h3 className="co-step__title">🎉 Select Your Events</h3>
        <p className="co-step__desc">
          Choose your main event and add inner cards for additional ceremonies.
        </p>
      </div>

      {/* WhatsApp Notice */}
      <div className="co-wa-notice">
        <span className="co-wa-notice__icon">💬</span>
        <div>
          <strong>Card details collected via WhatsApp</strong>
          <p>
            After placing your order, our team will contact you on WhatsApp to collect names, dates, venue and any other card details.
          </p>
        </div>
      </div>

      {/* Main Event */}
      <div>
        <label className="co-label" style={{ display: "block", marginBottom: "0.5rem" }}>
          Main Event <span style={{ color: "#C9A96E" }}>*</span>
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
        <p className="co-step__hint">
          Main card: {quantity} pcs × {formatPKR(card.base_price)}/card = <strong>{formatPKR(mainTotal)}</strong>
        </p>
      </div>

      {/* Add-on Event Cards */}
      <div className="co-addons-section">
        <div className="co-addons-header">
          <h4 className="co-addons-title">Additional Event Cards</h4>
          {addonCardPrice > 0 ? (
            <span className="co-addons-price-badge">
              {formatPKR(addonCardPrice)}/card
            </span>
          ) : (
            <span className="co-addons-price-badge co-addons-price-badge--warn">
              Price not set
            </span>
          )}
        </div>
        <p className="co-addons-desc">
          Need inner cards for other ceremonies? These are smaller cards included with your main envelope.
          {addonCardPrice > 0 && (
            <> Priced at <strong>{formatPKR(addonCardPrice)}/card</strong> — separate from main card price.</>
          )}
        </p>

        <div className="co-addons-list">
          {addOnEvents.map((evt, idx) => {
            const isDisabled = evt.eventType === mainEvent;
            const addonTotal = addonTotals[idx];
            const qty = parseInt(evt.quantity, 10);
            return (
              <div key={evt.eventType} className="co-addon-item">
                <div className={`co-addon-row${isDisabled ? " co-addon-row--disabled" : ""}`}>
                  <label className="co-addon-check-label">
                    <input
                      type="checkbox"
                      disabled={isDisabled}
                      checked={evt.enabled}
                      onChange={(e) => onAddonChange(idx, { enabled: e.target.checked })}
                    />
                    <span className="co-addon-name">{evt.eventType}</span>
                    {isDisabled && (
                      <span className="co-addon-badge">Your main event</span>
                    )}
                  </label>

                  {evt.enabled && !isDisabled && (
                    <div className="co-addon-qty-row">
                      <span className="co-addon-qty-label">Quantity:</span>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                        <input
                          type="number"
                          min={ADDON_MIN_QTY}
                          max={10000}
                          placeholder={`min ${ADDON_MIN_QTY}`}
                          value={evt.quantity}
                          onChange={(e) => {
                            const val = e.target.value;
                            const num = parseInt(val, 10);
                            if (!isNaN(num) && num > 10000) {
                              onAddonChange(idx, { quantity: "10000" });
                            } else {
                              onAddonChange(idx, { quantity: val });
                            }
                            onClearError(`addon_qty_${idx}`);
                          }}
                          className={`co-addon-qty-input${fieldErrors[`addon_qty_${idx}`] ? " co-input--error" : ""}`}
                        />
                        {fieldErrors[`addon_qty_${idx}`] && (
                          <span className="co-field-error">{fieldErrors[`addon_qty_${idx}`]}</span>
                        )}
                      </div>
                      {addonCardPrice > 0 && !isNaN(qty) && qty >= ADDON_MIN_QTY && (
                        <div className="co-addon-price-info">
                          <span className="co-addon-unit-price">{formatPKR(addonCardPrice)}/card</span>
                          {addonTotal > 0 && (
                            <span className="co-addon-price">= {formatPKR(addonTotal)}</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Price Summary */}
      <div className="co-summary">
        <div className="co-summary__row">
          <span>{mainEvent} (Main) — {quantity} cards</span>
          <span>{formatPKR(mainTotal)}</span>
        </div>
        {addOnEvents
          .filter((e) => e.enabled && e.eventType !== mainEvent)
          .map((evt, i) => {
            const qty = parseInt(evt.quantity, 10);
            if (isNaN(qty) || qty < 1) return null;
            const t = calculateAddonEventPrice(addonCardPrice, qty);
            return (
              <div key={evt.eventType} className="co-summary__row">
                <span>{evt.eventType} (Inner card) — {qty} cards</span>
                <span>{addonCardPrice > 0 ? formatPKR(t) : "Price TBD"}</span>
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
