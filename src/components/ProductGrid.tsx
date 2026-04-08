'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { products, categories } from '@/data/products';
import ProductCard from './ProductCard';
import type { Category } from '@/types';

export default function ProductGrid() {
  const [activeCategory, setActiveCategory] = useState<Category>('All');

  const filteredProducts =
    activeCategory === 'All'
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <section id="collection" className="section-padding bg-ivory">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-champagne mb-4"
          >
            Our Collection
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-charcoal-dark mb-4"
          >
            Handcrafted with Love
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
            Each invitation is a masterpiece — designed, printed, and finished in our
            Karachi studio with the finest materials.
          </motion.p>
        </div>

        {/* Category Filter Pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat as Category)}
              className={`px-4 sm:px-5 py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-300 cursor-pointer ${
                activeCategory === cat
                  ? 'bg-champagne text-white shadow-md shadow-champagne/25'
                  : 'bg-cream text-charcoal/70 hover:bg-cream-dark hover:text-charcoal border border-cream-dark'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Product Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8"
          >
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-charcoal/50 text-lg">No cards found in this category yet.</p>
            <button
              onClick={() => setActiveCategory('All')}
              className="mt-4 btn-secondary text-sm"
            >
              View All Cards
            </button>
          </div>
        )}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-14"
        >
          <p className="text-sm text-charcoal/50 mb-4">
            Don&apos;t see what you&apos;re looking for?
          </p>
          <a href="#contact" className="btn-secondary">
            Request Custom Design
          </a>
        </motion.div>
      </div>
    </section>
  );
}
