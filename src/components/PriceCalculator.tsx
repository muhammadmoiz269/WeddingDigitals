"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { AddOn } from "@/types";
import { calculatePrice, formatPKR, getWhatsAppLink } from "@/lib/pricing";

interface PriceCalculatorProps {
  basePrice: number;
  originalPrice?: number;
  productName: string;
  slug: string;
  addOns: AddOn[];
  minOrder: number;
}

const QUANTITY_TIERS: number[] = [50, 100, 250];

export default function PriceCalculator({
  basePrice,
  originalPrice,
  productName,
  slug,
  addOns,
  minOrder,
}: PriceCalculatorProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState<number>(100);
  const [rawInput, setRawInput] = useState<string>("");
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<Set<string>>(
    new Set(),
  );

  const selectedAddOns = useMemo(
    () => addOns.filter((a) => selectedAddOnIds.has(a.id)),
    [addOns, selectedAddOnIds],
  );

  const breakdown = useMemo(
    () => calculatePrice(basePrice, quantity, selectedAddOns),
    [basePrice, quantity, selectedAddOns],
  );

  const whatsappLink = useMemo(
    () =>
      getWhatsAppLink(productName, quantity, breakdown.total, selectedAddOns),
    [productName, quantity, breakdown.total, selectedAddOns],
  );

  const toggleAddOn = (id: string) => {
    setSelectedAddOnIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Price Header */}
      <div>
        <div className="flex items-baseline gap-2 sm:gap-3">
          <span className="text-2xl sm:text-3xl font-bold text-charcoal-dark font-heading">
            {formatPKR(basePrice)}
          </span>
          {originalPrice && (
            <span className="text-base sm:text-lg text-charcoal/40 line-through">
              {formatPKR(originalPrice)}
            </span>
          )}
          <span className="text-sm text-charcoal/50">/card</span>
        </div>
        {originalPrice && (
          <span className="inline-block mt-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-600 rounded-full">
            Save{" "}
            {Math.round(((originalPrice - basePrice) / originalPrice) * 100)}%
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="divider-champagne" />

      {/* Quantity Selector */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-charcoal/60 mb-3">
          Select Quantity
        </label>
        <div className="grid grid-cols-4 gap-2">
          {QUANTITY_TIERS.map((tier) => (
            <button
              key={tier}
              onClick={() => {
                setQuantity(tier);
                setRawInput("");
              }}
              className={`relative px-2 py-2.5 rounded-xl text-center transition-all duration-300 cursor-pointer border ${
                quantity === tier && rawInput === ""
                  ? "bg-champagne text-white border-champagne shadow-md shadow-champagne/20"
                  : "bg-white text-charcoal border-cream-dark hover:border-champagne/40"
              }`}
            >
              <span className="block text-base font-bold">{tier}</span>
              <span className="block text-[9px] uppercase tracking-wider mt-0.5 opacity-70">
                cards
              </span>
            </button>
          ))}

          {/* Custom quantity input */}
          <div
            className={`relative rounded-xl border transition-all duration-300 overflow-hidden ${
              rawInput !== ""
                ? "border-champagne shadow-md shadow-champagne/20 bg-champagne"
                : "border-cream-dark bg-white"
            }`}
          >
            <input
              id="custom-quantity-input"
              type="number"
              min={minOrder}
              placeholder="Own"
              value={rawInput}
              onChange={(e) => {
                const val = e.target.value;
                setRawInput(val);
                const num = parseInt(val, 10);
                if (!isNaN(num) && num >= minOrder) {
                  setQuantity(num);
                }
              }}
              onBlur={() => {
                const num = parseInt(rawInput, 10);
                if (isNaN(num) || num < minOrder) {
                  setRawInput("");
                  if (isNaN(num)) setQuantity(100);
                }
              }}
              style={{ colorScheme: "light" }}
              className={`w-full px-2 pt-2.5 pb-0 text-center text-base font-bold bg-transparent outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                rawInput !== ""
                  ? "text-white placeholder-white/70"
                  : "text-charcoal placeholder-charcoal/40"
              }`}
            />
            <span
              className={`block text-[9px] uppercase tracking-wider text-center pb-1.5 opacity-70 ${
                rawInput !== "" ? "text-white" : "text-charcoal"
              }`}
            >
              cards
            </span>
          </div>
        </div>
        <p className="mt-2 text-[10px] sm:text-xs text-charcoal/40">
          Min. {minOrder} pcs. Bulk discount at 500+ cards.
        </p>
      </div>

      {/* Add-ons */}
      {addOns.length > 0 && (
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-charcoal/60 mb-3">
            Premium Add-ons
          </label>
          <div className="space-y-2.5">
            {addOns.map((addon) => {
              const isSelected = selectedAddOnIds.has(addon.id);
              return (
                <button
                  key={addon.id}
                  onClick={() => toggleAddOn(addon.id)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-300 text-left cursor-pointer ${
                    isSelected
                      ? "bg-champagne/5 border-champagne/40 shadow-sm"
                      : "bg-white border-cream-dark hover:border-champagne/25"
                  }`}
                >
                  {/* Checkbox */}
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                      isSelected
                        ? "bg-champagne border-champagne"
                        : "border-cream-dark"
                    }`}
                  >
                    {isSelected && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Label */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium ${isSelected ? "text-champagne-dark" : "text-charcoal"}`}
                    >
                      {addon.name}
                    </p>
                    <p className="text-[11px] text-charcoal/40 leading-snug">
                      {addon.description}
                    </p>
                  </div>

                  {/* Price */}
                  <span
                    className={`text-sm font-semibold flex-shrink-0 ${isSelected ? "text-champagne-dark" : "text-charcoal/60"}`}
                  >
                    +{formatPKR(addon.price)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="divider-champagne" />

      {/* Price Breakdown */}
      <motion.div
        key={`${quantity}-${selectedAddOnIds.size}`}
        initial={{ opacity: 0.5, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-cream/60 rounded-xl p-5 space-y-2.5"
      >
        <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-charcoal/60 mb-3">
          Price Breakdown
        </h4>

        <div className="flex flex-col xs:flex-row justify-between gap-0.5 xs:gap-0 text-sm">
          <span className="text-charcoal/70">
            {formatPKR(breakdown.basePrice)}/card &times; {quantity} cards
          </span>
          <span className="font-medium text-charcoal">
            {formatPKR(breakdown.subtotal)}
          </span>
        </div>

        {selectedAddOns.length > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-charcoal/70">
              Add-ons ({selectedAddOns.length}) × {quantity}
            </span>
            <span className="font-medium text-charcoal">
              +{formatPKR(breakdown.addOnsTotal)}
            </span>
          </div>
        )}

        {breakdown.discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600 font-medium">
              Bulk Discount ({breakdown.discountPercent}%)
            </span>
            <span className="font-medium text-green-600">
              -{formatPKR(breakdown.discount)}
            </span>
          </div>
        )}

        <div className="pt-2.5 border-t border-champagne/20 flex justify-between">
          <span className="text-base font-semibold text-charcoal-dark">
            Total
          </span>
          <span className="text-2xl font-bold text-gold-gradient font-heading">
            {formatPKR(breakdown.total)}
          </span>
        </div>

        <p className="text-[10px] text-charcoal/40 text-right">
          {formatPKR(Math.round(breakdown.total / quantity))}/card after
          discount
        </p>
      </motion.div>

      {/* Sample Card Notice */}
      <div className="flex items-start gap-3 p-4 bg-champagne/8 border border-champagne/20 rounded-xl">
        <span className="text-lg leading-none mt-0.5">💌</span>
        <div>
          <p className="text-[11px] font-bold text-champagne-dark uppercase tracking-wider mb-0.5">
            Want to see it before you order?
          </p>
          <p className="text-[11px] text-charcoal/60 leading-relaxed">
            Request a <span className="font-semibold text-charcoal/80">sample card</span> delivered to your door — you only pay the delivery charges. Once you confirm your full order, <span className="font-semibold text-champagne-dark">delivery is on us</span>.
          </p>
        </div>
      </div>

      {/* Proceed to Checkout */}
      <button
        onClick={() => {
          const addOnParam = [...selectedAddOnIds].join(",");
          router.push(
            `/checkout?slug=${slug}&qty=${quantity}${addOnParam ? `&addons=${addOnParam}` : ""}`,
          );
        }}
        id="checkout-btn"
        className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-champagne to-champagne-dark text-white font-semibold text-base rounded-2xl shadow-lg shadow-champagne/25 hover:shadow-xl hover:shadow-champagne/35 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
      >
        Proceed to checkout
      </button>

      {/* WhatsApp Order (secondary) */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        id="whatsapp-order-btn"
        className="flex items-center justify-center gap-2.5 w-full py-3 bg-white text-[#25D366] font-semibold text-sm rounded-2xl border-2 border-[#25D366]/30 hover:bg-[#25D366] hover:text-white transition-all duration-300"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        Or Order via WhatsApp
      </a>
    </div>
  );
}
