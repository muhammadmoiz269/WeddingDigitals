"use client";

import { motion } from "framer-motion";

export default function PricingBanner() {
  return (
    <section
      id="pricing"
      className="section-padding bg-charcoal-dark relative overflow-hidden"
    >
      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-champagne/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-champagne/3 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-champagne mb-4"
        >
          Transparent Pricing
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          viewport={{ once: true }}
          className="text-gold-gradient font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6"
        >
          No Hidden Charges. <span className="text-gold-gradient">Ever.</span>
        </motion.h2>

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          viewport={{ once: true }}
          className="w-20 h-0.5 bg-gradient-to-r from-champagne to-champagne-light mx-auto mb-8"
        />

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-white/60 text-sm sm:text-base mb-12 leading-relaxed"
        >
          Unlike Instagram vendors who reveal prices only in DMs, we believe you
          deserve to know what you&apos;re paying before you commit. Every card
          price includes design, printing, and packaging.
        </motion.p>

        {/* Price Tiers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-12">
          {[
            {
              tier: "Essential",
              range: "PKR 100 - 180",
              desc: "Clean designs on premium card stock",
              features: [
                "300gsm card stock",
                "Digital printing",
                "Standard envelope",
                "Free delivery (200+ pcs)",
              ],
            },
            {
              tier: "Premium",
              range: "PKR 180 - 350",
              desc: "Elevated finishes & custom touches",
              features: [
                "Imported textured paper",
                "Gold/silver foil accents",
                "Lined envelope",
                "RSVP insert included",
              ],
              popular: true,
            },
            {
              tier: "Luxury",
              range: "PKR 350 - 600",
              desc: "Bespoke creations for grand events",
              features: [
                "Velvet/silk materials",
                "Real gold foil stamping",
                "Wax seal & ribbon",
                "Multi-piece card set",
              ],
            },
          ].map((item, index) => (
            <motion.div
              key={item.tier}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * index, duration: 0.6 }}
              viewport={{ once: true }}
              className={`relative rounded-2xl p-7 text-left border transition-all duration-500 hover:-translate-y-1 ${
                item.popular
                  ? "bg-gradient-to-b from-champagne/15 to-champagne/5 border-champagne/40 shadow-lg shadow-champagne/10"
                  : "bg-white/5 border-white/10 hover:border-champagne/25"
              }`}
            >
              {item.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-[10px] font-bold uppercase tracking-wider bg-champagne text-white rounded-full">
                  Most Popular
                </span>
              )}
              <h3 className="font-heading text-lg font-semibold text-white mb-1">
                {item.tier}
              </h3>
              <p className="text-2xl font-bold text-champagne mb-2">
                {item.range}
              </p>
              <p className="text-xs text-white/50 mb-5">{item.desc}</p>
              <ul className="space-y-2.5">
                {item.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2.5 text-sm text-white/70"
                  >
                    <svg
                      className="w-4 h-4 text-champagne flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
          className="text-white/40 text-xs"
        >
          * All prices are per card. Minimum order quantities apply. Prices
          include GST.
        </motion.p>
      </div>
    </section>
  );
}
