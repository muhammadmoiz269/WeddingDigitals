'use client';

import { useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useState } from 'react';
import { fadeUp } from '@/components/invite/animations';
import type { Faq } from '@/lib/faqs';

interface Props {
  faqs: Faq[];
  heading?: string;
}

export default function FaqAccordion({ faqs, heading = 'Frequently Asked' }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const toggle = (i: number) => setOpenIndex(prev => (prev === i ? null : i));

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const headingY      = useTransform(scrollYProgress, [0, 0.5, 1], [60, 0, -60]);
  const ornamentSlowY = useTransform(scrollYProgress, [0, 1], ['-12%', '12%']);
  const ornamentFastY = useTransform(scrollYProgress, [0, 1], ['18%', '-18%']);
  const itemsY        = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section
      ref={sectionRef}
      className="section-padding bg-ivory border-t border-cream-dark relative overflow-hidden"
      aria-label={heading}
    >
      {/* Decorative parallax ornaments */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          style={{ y: ornamentSlowY }}
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-champagne/10 to-transparent blur-3xl"
        />
        <motion.div
          style={{ y: ornamentFastY }}
          className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-champagne/8 to-transparent blur-3xl"
        />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header — mirrors Features/Hero pattern */}
        <motion.div
          className="text-center mb-16"
          style={{ y: headingY }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-champagne mb-4">
            Questions &amp; Answers
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-charcoal-dark mb-3">
            Everything You Need to{' '}
            <span className="text-gold-gradient">Know</span>
          </h2>
          <div className="w-20 h-0.5 bg-gradient-to-r from-champagne to-champagne-light mx-auto mt-5 mb-5" />
          <p className="max-w-lg mx-auto text-charcoal/60 text-sm sm:text-base">
            Quick answers to the most common questions before you order.
          </p>
        </motion.div>

        {/* FAQ accordion items with shared parallax drift */}
        <motion.div className="space-y-3" style={{ y: itemsY }}>
          {faqs.map((faq, i) => {
            const isOpen    = openIndex === i;
            const panelId   = `faq-panel-${i}`;
            const triggerId = `faq-trigger-${i}`;

            return (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-30px' }}
                custom={i}
                className="bg-white rounded-xl border border-cream-dark/60 overflow-hidden"
              >
                <button
                  id={triggerId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-4 text-sm font-semibold text-charcoal-dark hover:text-champagne-dark transition-colors duration-200 text-left"
                >
                  <span>{faq.question}</span>
                  <motion.svg
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="w-4 h-4 text-champagne flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={triggerId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 pt-1 text-sm text-charcoal/65 leading-relaxed border-t border-cream-dark/40">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
