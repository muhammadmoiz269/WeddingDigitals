'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import type { CardProduct } from '@/types';

const CATEGORIES = ['All', 'Nikkah', 'Barat', 'Valima', 'Mehndi', 'Luxury', 'Minimalist'] as const;

export default function ProductGrid() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [allCards, setAllCards] = useState<CardProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cards')
      .then((r) => r.json())
      .then((json) => setAllCards(json.data || []))
      .catch(() => setAllCards([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    activeCategory === 'All'
      ? allCards
      : allCards.filter((c) => c.category === activeCategory);

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
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
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

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-cream-dark/50">
                <div className="aspect-[3/4] bg-cream animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-cream rounded w-1/3 animate-pulse" />
                  <div className="h-5 bg-cream rounded w-4/5 animate-pulse" />
                  <div className="h-3 bg-cream rounded w-full animate-pulse" />
                  <div className="h-3 bg-cream rounded w-2/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Product Grid */}
        {!loading && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8"
            >
              {filtered.map((card, index) => (
                <CardGridItem key={card.slug} card={card} index={index} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
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

// ─── Card item with hover video preview ──────────────────────────────────────

function CardGridItem({ card, index }: { card: CardProduct; index: number }) {
  const discount =
    card.original_price && card.original_price > card.base_price
      ? Math.round(((card.original_price - card.base_price) / card.original_price) * 100)
      : 0;

  const imageSrc = card.images?.[0] ?? null;
  const videoUrl = card.short_video_url;

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const handleMouseEnter = useCallback(() => {
    if (!videoUrl) return;
    setIsHovering(true);
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
  }, [videoUrl]);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      viewport={{ once: true, margin: '-50px' }}
      className="group relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={`/product/${card.slug}`} className="block">
        <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-cream-dark/50 hover:border-champagne/30">
          {/* Image Container */}
          <div className="relative aspect-[3/4] overflow-hidden bg-cream">
            {imageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageSrc}
                alt={card.name}
                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl">🃏</div>
            )}

            {/* Hover Video Preview — lazy-loaded, muted, looping */}
            {videoUrl && (
              <div
                className="absolute inset-0 z-[2] transition-opacity duration-500"
                style={{ opacity: isHovering && videoReady ? 1 : 0 }}
              >
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                  preload="none"
                  onCanPlayThrough={() => setVideoReady(true)}
                />
              </div>
            )}

            {/* Overlay on hover */}
            <div className="absolute inset-0 z-[3] bg-gradient-to-t from-charcoal-dark/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Badges */}
            <div className="absolute top-3 left-3 z-[4] flex flex-col gap-2">
              {card.is_new && (
                <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-charcoal-dark text-white rounded-full">
                  New
                </span>
              )}
              {card.is_bestseller && (
                <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-champagne text-white rounded-full">
                  Bestseller
                </span>
              )}
              {discount > 0 && (
                <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-red-500 text-white rounded-full">
                  -{discount}%
                </span>
              )}
            </div>

            {/* Video indicator badge */}
            {videoUrl && (
              <div className="absolute top-3 right-3 z-[4]">
                <span className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-sm text-charcoal-dark rounded-full">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Video
                </span>
              </div>
            )}

            {/* Quick View Button */}
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[4] px-6 py-2.5 bg-white/95 backdrop-blur-sm text-charcoal-dark text-sm font-semibold rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:bg-champagne group-hover:text-white shadow-lg cursor-pointer">
              View Details
            </span>
          </div>

          {/* Content */}
          <div className="p-5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-champagne">
              {card.category}
            </span>
            <h3 className="font-heading text-lg font-semibold text-charcoal-dark mt-1 mb-2 leading-snug group-hover:text-champagne-dark transition-colors duration-300">
              {card.name}
            </h3>
            <p className="text-sm text-charcoal/60 leading-relaxed line-clamp-2 mb-4">
              {card.description}
            </p>
            <div className="flex items-end justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-charcoal-dark">
                  PKR {card.base_price.toLocaleString()}
                </span>
                {card.original_price && (
                  <span className="text-sm text-charcoal/40 line-through">
                    PKR {card.original_price.toLocaleString()}
                  </span>
                )}
                <span className="text-[10px] text-charcoal/50">/card</span>
              </div>
              <span className="text-[10px] text-charcoal/40 uppercase tracking-wider">
                Min. {card.min_order} pcs
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
