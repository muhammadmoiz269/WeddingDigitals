"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { CardProduct } from "@/types";
import {
  CATEGORIES,
  SORT_OPTIONS,
  ITEMS_PER_PAGE,
  getWhatsAppChatLink,
  type SortValue,
} from "@/lib/constants";
import Pagination from "@/components/Pagination";
import { whatsappClick } from "@/lib/analytics";

// Cache key: "category::sort::page"
function cacheKey(category: string, sort: string, page: number) {
  return `${category}::${sort}::${page}`;
}

export default function ProductGrid({
  initialPage = 1,
}: {
  initialPage?: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSort, setActiveSort] = useState<SortValue>("featured");
  const [isSortOpen, setIsSortOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [currentPageCards, setCurrentPageCards] = useState<CardProduct[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  // In-memory page cache — persists for the lifetime of this component instance.
  // Keys: cacheKey(category, sort, page) → CardProduct[]
  // Totals keys: "category::sort" → { total, totalPages }
  const pageCache = useRef<Map<string, CardProduct[]>>(new Map());
  const totalsCache = useRef<
    Map<string, { total: number; totalPages: number }>
  >(new Map());

  const sortRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // ── Fetch (or serve from cache) one page of cards ──────────────────────────
  const fetchPage = useCallback(
    async (page: number, category: string, sort: string) => {
      const key = cacheKey(category, sort, page);
      const totKey = `${category}::${sort}`;

      // Cache hit — show immediately, no loading flash
      if (pageCache.current.has(key)) {
        setCurrentPageCards(pageCache.current.get(key)!);
        const totals = totalsCache.current.get(totKey);
        if (totals) {
          setTotalCount(totals.total);
          setTotalPages(totals.totalPages);
        }
        setLoading(false);
        return;
      }

      // Cache miss — fetch from API
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(ITEMS_PER_PAGE),
          sort,
          ...(category !== "All" && { category }),
        });
        const res = await fetch(`/api/cards?${params}`);
        const json = await res.json();
        const cards: CardProduct[] = json.data ?? [];

        // Persist in cache
        pageCache.current.set(key, cards);
        totalsCache.current.set(totKey, {
          total: json.total ?? 0,
          totalPages: json.totalPages ?? 0,
        });

        setCurrentPageCards(cards);
        setTotalCount(json.total ?? 0);
        setTotalPages(json.totalPages ?? 0);
      } catch {
        setCurrentPageCards([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Initial fetch on mount + whenever page / category / sort changes
  useEffect(() => {
    fetchPage(currentPage, activeCategory, activeSort);
  }, [currentPage, activeCategory, activeSort, fetchPage]);

  // When the server re-renders page.tsx with a new ?page= param (breadcrumb /
  // browser back), sync the new initialPage into local state.
  useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  // Close sort dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleCategoryChange = useCallback((cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1); // React 18 batches both into one re-render
  }, []);

  const handleSortChange = useCallback((sort: SortValue) => {
    setActiveSort(sort);
    setCurrentPage(1);
    setIsSortOpen(false);
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      const params = new URLSearchParams(searchParams.toString());
      if (page === 1) {
        params.delete("page");
      } else {
        params.set("page", String(page));
      }
      const qs = params.toString();
      router.replace(qs ? `/?${qs}` : "/", { scroll: false });
      if (gridRef.current) {
        gridRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [router, searchParams],
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  console.log("currentPageCards", currentPageCards);

  return (
    <section id="collection" className="section-padding bg-ivory">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-champagne mb-4">
            Our Collection
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-charcoal-dark mb-4">
            Handcrafted with Love
          </h2>
          <div className="w-20 h-0.5 bg-gradient-to-r from-champagne to-champagne-light mx-auto mb-6" />
          <p className="max-w-lg mx-auto text-charcoal/60 text-sm sm:text-base">
            Each invitation is a masterpiece, designed, printed, and finished
            in our Karachi studio with the finest materials.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12">
          {/* Category Pills */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 sm:px-5 py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-300 cursor-pointer ${activeCategory === cat
                    ? "bg-champagne text-white shadow-md shadow-champagne/25"
                    : "bg-cream text-charcoal/70 hover:bg-cream-dark hover:text-charcoal border border-cream-dark"
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
              <svg
                className="w-3.5 h-3.5 text-champagne"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 7h18M6 12h12M9 17h6"
                />
              </svg>
              <span className="hidden sm:inline text-charcoal/50">Sort:</span>
              <span className="text-charcoal-dark font-semibold">
                {SORT_OPTIONS.find((o) => o.value === activeSort)?.label}
              </span>
              <svg
                className={`w-3.5 h-3.5 text-charcoal/40 transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isSortOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-cream-dark/50 overflow-hidden z-20">
                <div className="py-1">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${activeSort === option.value
                          ? "bg-champagne/10 text-champagne-dark font-semibold"
                          : "text-charcoal/70 hover:bg-cream/60 hover:text-charcoal-dark"
                        }`}
                    >
                      <span className="flex items-center justify-between">
                        {option.label}
                        {activeSort === option.value && (
                          <svg
                            className="w-4 h-4 text-champagne"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={2.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results count */}
        {!loading && totalCount > 0 && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-charcoal/50">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of{" "}
              {totalCount} designs
            </p>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden border border-cream-dark/50"
              >
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
        {!loading && currentPageCards.length > 0 && (
          <div
            ref={gridRef}
            key={`${activeCategory}-${activeSort}-${currentPage}`}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8"
          >
            {currentPageCards.map((card, index) => (
              <CardGridItem
                key={card.slug}
                card={card}
                index={index}
                currentPage={currentPage}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && currentPageCards.length === 0 && (
          <div className="text-center py-20">
            <p className="text-charcoal/50 text-lg">
              No cards found in this category yet.
            </p>
            <button
              onClick={() => handleCategoryChange("All")}
              className="mt-4 btn-secondary text-sm"
            >
              View All Cards
            </button>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}

        {/* Bottom CTA */}
        <div className="text-center mt-14">
          <p className="text-sm text-charcoal/50 mb-4">
            Don&apos;t see what you&apos;re looking for?
          </p>
          <a
            href={getWhatsAppChatLink(
              "Hi! I\'m interested in a custom wedding card design. Can you help me with that?",
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            onClick={() => whatsappClick('collection_cta')}
          >
            Request Custom Design
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Card item with hover video preview ──────────────────────────────────────

function CardGridItem({
  card,
  index,
  currentPage,
}: {
  card: CardProduct;
  index: number;
  currentPage: number;
}) {
  const discount =
    card.original_price && card.original_price > card.base_price
      ? Math.round(
        ((card.original_price - card.base_price) / card.original_price) * 100,
      )
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
      video.play().catch(() => { });
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
    <div
      className="group relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={`/product/${card.slug}${currentPage > 1 ? `?from=${currentPage}` : ""}`}
        className="block h-full"
      >
        <div className="relative h-full flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-cream-dark/50 hover:border-champagne/30">
          {/* Image Container */}
          <div className="relative aspect-[3/4] overflow-hidden bg-cream">
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={card.image_alt_text || card.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                quality={95}
                priority={index < 4}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl">
                🃏
              </div>
            )}

            {/* Hover Video Preview */}
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

            {/* Video badge */}
            {videoUrl && (
              <div className="absolute top-3 right-3 z-[4]">
                <span className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-sm text-charcoal-dark rounded-full">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Video
                </span>
              </div>
            )}

            {/* Quick View */}
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
            <p
              className="text-sm text-charcoal/60 leading-relaxed line-clamp-2 mb-4"
              dangerouslySetInnerHTML={{
                __html: card.description
                  ? card.description
                    .replace(/<[^>]*>/g, " ")
                    .replace(/\s+/g, " ")
                    .trim()
                  : "",
              }}
            />
            <div className="flex items-end justify-between mt-auto">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-charcoal-dark">
                  PKR {card.base_price.toLocaleString()}
                </span>
                {card.original_price && card.original_price > card.base_price && (
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
    </div>
  );
}
