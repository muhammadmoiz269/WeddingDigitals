'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import type { CardProduct } from '@/types';

interface SearchResult extends CardProduct {
  _id?: string;
}

interface SearchResponse {
  success: boolean;
  results: SearchResult[];
  suggestions: {
    name: string;
    slug: string;
    category: string;
    base_price: number;
    image: string | null;
  }[];
  query?: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchResponse['suggestions']>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      // Reset state when closed
      setQuery('');
      setResults([]);
      setSuggestions([]);
      setHasSearched(false);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Debounced search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setSuggestions([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/cards/search?q=${encodeURIComponent(searchQuery.trim())}`);
      const json: SearchResponse = await res.json();

      if (json.success) {
        setResults(json.results);
        setSuggestions(json.suggestions);
      }
    } catch {
      setResults([]);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  const highlightMatch = (text: string, q: string) => {
    if (!q.trim()) return text;
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-champagne/25 text-charcoal-dark rounded-sm px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex flex-col sm:flex-row sm:flex-wrap sm:items-start sm:justify-center sm:pt-[12vh] sm:px-4"
          onClick={onClose}
        >
          {/* Backdrop — visible on sm+ only */}
          <div className="absolute inset-0 bg-charcoal-dark/50 backdrop-blur-sm hidden sm:block" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full sm:max-w-2xl bg-ivory sm:rounded-2xl shadow-2xl sm:border border-cream-dark/60 overflow-hidden flex flex-col flex-1 sm:flex-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 sm:px-5 py-4 border-b border-cream-dark/50">
              {/* Mobile: close / back button */}
              <button
                onClick={onClose}
                className="sm:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream-dark/60 text-charcoal/60 hover:text-charcoal transition-colors shrink-0 cursor-pointer"
                aria-label="Close search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Search Icon — desktop only */}
              <svg
                className="hidden sm:block w-5 h-5 text-champagne shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Search cards by name or description..."
                className="flex-1 bg-transparent text-charcoal-dark text-base placeholder:text-charcoal/40 outline-none font-medium"
                id="search-input"
              />

              {/* Loading spinner or clear button */}
              {loading ? (
                <div className="w-5 h-5 border-2 border-champagne/30 border-t-champagne rounded-full animate-spin shrink-0" />
              ) : query ? (
                <button
                  onClick={() => {
                    setQuery('');
                    setResults([]);
                    setSuggestions([]);
                    setHasSearched(false);
                    inputRef.current?.focus();
                  }}
                  className="w-6 h-6 flex items-center justify-center rounded-full bg-cream-dark/60 hover:bg-cream-dark text-charcoal/60 hover:text-charcoal transition-colors shrink-0 cursor-pointer"
                  aria-label="Clear search"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ) : null}

              {/* Shortcut hint — desktop only */}
              <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-semibold text-charcoal/40 bg-cream rounded border border-cream-dark shrink-0">
                ESC
              </kbd>
            </div>

            {/* Results Panel */}
            <div className="flex-1 sm:flex-none sm:max-h-[60vh] overflow-y-auto overscroll-contain">
              {/* Results */}
              {results.length > 0 && (
                <div className="p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-charcoal/40 px-2 mb-2">
                    {results.length} result{results.length !== 1 ? 's' : ''} found
                  </p>
                  <div className="space-y-1">
                    {results.map((card) => (
                      <Link
                        key={card.slug}
                        href={`/product/${card.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-cream/80 transition-colors group"
                      >
                        {/* Thumbnail */}
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-cream shrink-0 border border-cream-dark/40">
                          {card.images?.[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={card.images[0]}
                              alt={card.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">🃏</div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-heading text-sm font-semibold text-charcoal-dark truncate group-hover:text-champagne-dark transition-colors">
                            {highlightMatch(card.name, query)}
                          </h4>
                          <p className="text-xs text-charcoal/50 line-clamp-1 mt-0.5">
                            {highlightMatch(card.description, query)}
                          </p>
                        </div>

                        {/* Price */}
                        <div className="text-right shrink-0">
                          <span className="text-sm font-bold text-charcoal-dark">
                            PKR {card.base_price?.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-charcoal/40 block">/card</span>
                        </div>

                        {/* Arrow */}
                        <svg
                          className="w-4 h-4 text-charcoal/20 group-hover:text-champagne transition-colors shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* No results + Suggestions */}
              {hasSearched && !loading && results.length === 0 && (
                <div className="p-6 text-center">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-sm font-medium text-charcoal-dark mb-1">
                    No cards found for &ldquo;{query}&rdquo;
                  </p>
                  <p className="text-xs text-charcoal/50">
                    Try a different search term or browse our suggestions below
                  </p>
                </div>
              )}

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="p-3 border-t border-cream-dark/30">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-charcoal/40 px-2 mb-2">
                    {results.length > 0 ? 'You might also like' : 'Popular cards'}
                  </p>
                  <div className="space-y-1">
                    {suggestions.map((item) => (
                      <Link
                        key={item.slug}
                        href={`/product/${item.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-4 px-3 py-2.5 rounded-xl hover:bg-cream/80 transition-colors group"
                      >
                        {/* Thumbnail */}
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-cream shrink-0 border border-cream-dark/40">
                          {item.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg">🃏</div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-charcoal/70 truncate group-hover:text-champagne-dark transition-colors">
                            {item.name}
                          </h4>
                        </div>

                        <span className="text-xs font-semibold text-charcoal/50 shrink-0">
                          PKR {item.base_price?.toLocaleString()}
                        </span>

                        <svg
                          className="w-3.5 h-3.5 text-charcoal/15 group-hover:text-champagne transition-colors shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Initial state — before any search */}
              {!hasSearched && !loading && (
                <div className="p-6 text-center">
                  <p className="text-xs text-charcoal/40">
                    Start typing to search our collection of wedding cards
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
                    {['Velvet', 'Gold Foil', 'Minimalist', 'Laser-Cut'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          setQuery(tag);
                          performSearch(tag);
                        }}
                        className="px-3 py-1.5 text-xs font-medium text-charcoal/60 bg-cream hover:bg-cream-dark rounded-full border border-cream-dark/50 transition-colors cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
