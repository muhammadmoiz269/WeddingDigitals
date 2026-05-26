"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useTransition,
} from "react";
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
import { whatsappClick } from "@/lib/analytics";

// ─── Types ───────────────────────────────────────────────────────────────────

interface InfiniteProductGridProps {
  /** Server-rendered first batch of cards — already in the initial HTML. */
  initialCards: CardProduct[];
  /** Total card count matching the default filter (All categories, featured sort). */
  initialTotal: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function InfiniteProductGrid({
  initialCards,
  initialTotal,
}: InfiniteProductGridProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSort, setActiveSort] = useState<SortValue>("featured");
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Cards that are currently displayed (initial SSR batch + loaded batches)
  const [cards, setCards] = useState<CardProduct[]>(initialCards);
  const [totalCount, setTotalCount] = useState(initialTotal);

  // Which page to fetch next. Page 1 is already loaded (initialCards).
  const [nextPage, setNextPage] = useState(2);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialCards.length < initialTotal);

  // True while we are re-fetching page 1 after a filter/sort change
  const [isFiltering, setIsFiltering] = useState(false);
  const [, startTransition] = useTransition();

  const sortRef = useRef<HTMLDivElement>(null);
  // Sentinel element at the bottom — observed to trigger load-more
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Track the current filter/sort key so we can abort stale responses
  const filterKeyRef = useRef(`All::featured`);

  // ── Re-fetch page 1 when filter or sort changes ────────────────────────────

  const resetAndFetch = useCallback(
    async (category: string, sort: string) => {
      const key = `${category}::${sort}`;
      filterKeyRef.current = key;

      setIsFiltering(true);
      setCards([]);
      setHasMore(false);

      try {
        const params = new URLSearchParams({
          page: "1",
          limit: String(ITEMS_PER_PAGE),
          sort,
          ...(category !== "All" && { category }),
        });
        const res = await fetch(`/api/cards?${params}`);
        const json = await res.json();

        // Discard if the user changed filters again before this resolved
        if (filterKeyRef.current !== key) return;

        const fetched: CardProduct[] = json.data ?? [];
        const total: number = json.total ?? 0;

        setCards(fetched);
        setTotalCount(total);
        setNextPage(2);
        setHasMore(fetched.length < total);
      } catch {
        if (filterKeyRef.current !== key) return;
        setCards([]);
        setTotalCount(0);
        setHasMore(false);
      } finally {
        if (filterKeyRef.current === key) {
          setIsFiltering(false);
        }
      }
    },
    [],
  );

  // ── Load the next page (triggered by IntersectionObserver) ─────────────────

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || isFiltering) return;

    const key = filterKeyRef.current;
    const [category, sort] = key.split("::");

    setIsLoadingMore(true);
    try {
      const params = new URLSearchParams({
        page: String(nextPage),
        limit: String(ITEMS_PER_PAGE),
        sort,
        ...(category !== "All" && { category }),
      });
      const res = await fetch(`/api/cards?${params}`);
      const json = await res.json();

      if (filterKeyRef.current !== key) return;

      const fetched: CardProduct[] = json.data ?? [];
      const total: number = json.total ?? 0;

      setCards((prev) => {
        const merged = [...prev, ...fetched];
        // Update hasMore inside the updater so we use the real merged length
        setHasMore(fetched.length > 0 && merged.length < total);
        return merged;
      });
      setTotalCount(total);
      setNextPage((p) => p + 1);
    } catch {
      // silently fail — the user can scroll up/down to retry
    } finally {
      if (filterKeyRef.current === key) {
        setIsLoadingMore(false);
      }
    }
  }, [isLoadingMore, hasMore, isFiltering, nextPage]);

  // ── IntersectionObserver wired to the sentinel ─────────────────────────────

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  // ── Close sort dropdown on outside click ──────────────────────────────────

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

  const handleCategoryChange = useCallback(
    (cat: string) => {
      if (cat === activeCategory) return;
      startTransition(() => {
        setActiveCategory(cat);
      });
      resetAndFetch(cat, activeSort);
    },
    [activeCategory, activeSort, resetAndFetch],
  );

  const handleSortChange = useCallback(
    (sort: SortValue) => {
      if (sort === activeSort) return;
      setActiveSort(sort);
      setIsSortOpen(false);
      resetAndFetch(activeCategory, sort);
    },
    [activeCategory, activeSort, resetAndFetch],
  );

  // ── Render ──────────────────────────────────────────────────────────────────

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
            Each invitation is a masterpiece — designed, printed, and finished
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
                className={`px-4 sm:px-5 py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-300 cursor-pointer ${
                  activeCategory === cat
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
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                        activeSort === option.value
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
        {!isFiltering && totalCount > 0 && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-charcoal/50">
              Showing {Math.min(cards.length, totalCount)} of {totalCount}{" "}
              designs
            </p>
          </div>
        )}

        {/* Filter loading skeletons — shown while re-fetching page 1 */}
        {isFiltering && (
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
        {!isFiltering && cards.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {cards.map((card, index) => (
              <CardGridItem key={card.slug} card={card} index={index} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isFiltering && cards.length === 0 && (
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

        {/* Sentinel + load-more feedback — sits below the grid */}
        <div ref={sentinelRef} className="mt-10" aria-hidden="true" />

        {/* Loading More Skeletons */}
        {isLoadingMore && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 mt-0">
            {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
              <div
                key={`skel-more-${i}`}
                className="rounded-2xl overflow-hidden border border-cream-dark/50"
              >
                <div className="aspect-[3/4] bg-cream animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-cream rounded w-1/3 animate-pulse" />
                  <div className="h-5 bg-cream rounded w-4/5 animate-pulse" />
                  <div className="h-3 bg-cream rounded w-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}


        {/* Bottom CTA */}
        <div className="text-center mt-14">
          <p className="text-sm text-charcoal/50 mb-4">
            Don&apos;t see what you&apos;re looking for?
          </p>
          <a
            href={getWhatsAppChatLink(
              "Hi! I'm interested in a custom wedding card design. Can you help me with that?",
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            onClick={() => whatsappClick("collection_cta")}
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
}: {
  card: CardProduct;
  index: number;
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
    <div
      className="group relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={`/product/${card.slug}`} className="block h-full">
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
              <div className="w-full h-full flex items-center justify-center text-5xl bg-cream" />
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

            {/* Quick View label */}
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
    </div>
  );
}
