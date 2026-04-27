'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import type { CardProduct } from '@/types';

<<<<<<< HEAD
const CATEGORIES = ['All', 'Nikkah', 'Barat', 'Valima', 'Mehndi', 'Luxury'] as const;
=======
const CATEGORIES = ['All', 'Luxury', 'Classic', 'Modern', 'Minimalist', 'Floral', 'Textured'] as const;

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'best-selling', label: 'Best Selling' },
  { value: 'price-asc', label: 'Price, Low to High' },
  { value: 'price-desc', label: 'Price, High to Low' },
  { value: 'newest', label: 'Newest' },
  { value: 'name-asc', label: 'Alphabetically, A–Z' },
  { value: 'name-desc', label: 'Alphabetically, Z–A' },
] as const;

type SortValue = typeof SORT_OPTIONS[number]['value'];

function sortCards(cards: CardProduct[], sort: SortValue): CardProduct[] {
  const sorted = [...cards];
  switch (sort) {
    case 'featured':
      return sorted.sort((a, b) => {
        if (a.is_bestseller !== b.is_bestseller) return a.is_bestseller ? -1 : 1;
        if (a.is_new !== b.is_new) return a.is_new ? -1 : 1;
        return 0;
      });
    case 'best-selling':
      return sorted.sort((a, b) => (b.is_bestseller ? 1 : 0) - (a.is_bestseller ? 1 : 0));
    case 'price-asc':
      return sorted.sort((a, b) => a.base_price - b.base_price);
    case 'price-desc':
      return sorted.sort((a, b) => b.base_price - a.base_price);
    case 'newest':
      return sorted; // API already returns newest first
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    default:
      return sorted;
  }
}
>>>>>>> f3b7ffc7ec9359ad4bd5bb324f3d2a180947e66b

export default function ProductGrid() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSort, setActiveSort] = useState<SortValue>('featured');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [allCards, setAllCards] = useState<CardProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/cards')
      .then((r) => r.json())
      .then((json) => setAllCards(json.data || []))
      .catch(() => setAllCards([]))
      .finally(() => setLoading(false));
  }, []);

  // Close sort dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = useMemo(() => {
    const byCategory =
      activeCategory === 'All'
        ? allCards
        : allCards.filter((c) => c.category === activeCategory);
    return sortCards(byCategory, activeSort);
  }, [allCards, activeCategory, activeSort]);

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

        {/* Filter Bar — Category Pills + Sort Dropdown */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12"
        >
          {/* Category Pills */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
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
          </div>

          {/* Sort Dropdown */}
          <div ref={sortRef} className="relative shrink-0">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-charcoal/70 bg-cream hover:bg-cream-dark border border-cream-dark rounded-full transition-all duration-200 cursor-pointer"
              id="sort-dropdown-toggle"
            >
              <svg className="w-3.5 h-3.5 text-champagne" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M6 12h12M9 17h6" />
              </svg>
              <span className="hidden sm:inline text-charcoal/50">Sort:</span>
              <span className="text-charcoal-dark font-semibold">
                {SORT_OPTIONS.find((o) => o.value === activeSort)?.label}
              </span>
              <svg
                className={`w-3.5 h-3.5 text-charcoal/40 transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isSortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-cream-dark/50 overflow-hidden z-20"
                >
                  <div className="py-1">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setActiveSort(option.value);
                          setIsSortOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                          activeSort === option.value
                            ? 'bg-champagne/10 text-champagne-dark font-semibold'
                            : 'text-charcoal/70 hover:bg-cream/60 hover:text-charcoal-dark'
                        }`}
                      >
                        <span className="flex items-center justify-between">
                          {option.label}
                          {activeSort === option.value && (
                            <svg className="w-4 h-4 text-champagne" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
              key={`${activeCategory}-${activeSort}`}
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
      <Link href={`/product/${card.slug}`} className="block h-full">
        <div className="relative h-full flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-cream-dark/50 hover:border-champagne/30">
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
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[4] px-4 py-1.5 bg-white/95 backdrop-blur-sm text-charcoal-dark text-xs font-semibold rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:bg-champagne group-hover:text-white shadow-lg cursor-pointer whitespace-nowrap">
              View Details
            </span>
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col flex-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-champagne">
              {card.category}
            </span>
            <h3 className="font-heading text-lg font-semibold text-charcoal-dark mt-1 mb-2 leading-snug line-clamp-2 group-hover:text-champagne-dark transition-colors duration-300">
              {card.name}
            </h3>
            <p className="text-sm text-charcoal/60 leading-relaxed line-clamp-2 mb-4">
              {card.description}
            </p>
            <div className="flex items-end justify-between mt-auto">
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
