'use client';

import { motion } from 'framer-motion';
import type { Feature } from '@/types';

export default function FeatureCards({ features }: { features: Feature[] }) {
  return (
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
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cream to-ivory-deep flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform duration-300">
            {feature.icon}
          </div>
          <h3 className="font-heading text-lg font-semibold text-charcoal-dark mb-3 group-hover:text-champagne-dark transition-colors duration-300">
            {feature.title}
          </h3>
          <p className="text-sm text-charcoal/60 leading-relaxed">
            {feature.description}
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-champagne to-champagne-light rounded-b-2xl scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
        </motion.div>
      ))}
    </div>
  );
}
