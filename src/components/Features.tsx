'use client';

import { motion } from 'framer-motion';
import { features } from '@/data/features';

export default function Features() {
  return (
    <section id="about" className="section-padding bg-cream">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-champagne mb-4"
          >
            Why Choose Us
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-charcoal-dark mb-4"
          >
            Better Than Instagram Vendors
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            viewport={{ once: true }}
            className="w-20 h-0.5 bg-gradient-to-r from-champagne to-champagne-light mx-auto mb-6"
          />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="max-w-lg mx-auto text-charcoal/60 text-sm sm:text-base"
          >
            We combined the quality of boutique printers with the transparency of
            modern e-commerce. Here&apos;s what sets us apart.
          </motion.p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * index, duration: 0.6 }}
              viewport={{ once: true, margin: '-30px' }}
              className="group relative bg-white rounded-2xl p-7 shadow-sm hover:shadow-xl border border-cream-dark/50 hover:border-champagne/30 transition-all duration-500"
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cream to-ivory-deep flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="font-heading text-lg font-semibold text-charcoal-dark mb-3 group-hover:text-champagne-dark transition-colors duration-300">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-charcoal/60 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-champagne to-champagne-light rounded-b-2xl scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
