"use client";

/**
 * InfiniteCardGrid
 *
 * A generic client component used by CategoryPage and EventPage.
 * It receives the server-rendered first batch of cards and loads
 * additional cards on scroll via the /api/cards endpoint.
 *
 * Props
 * ─────
 * initialCards  – first batch, already in the server-rendered HTML
 * initialTotal  – total matching cards for this filter
 * filterParam   – the API query param name for filtering: "category" | "event"
 * filterValue   – the value to pass for that param (e.g. "Luxury" or "Nikkah")
 */

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { CardProduct } from "@/types";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { cld } from "@/lib/cloudinary";

interface Props {
  initialCards: CardProduct[];
  initialTotal: number;
  filterParam: "category" | "event";
  filterValue: string;
}

export default function InfiniteCardGrid({
  initialCards,
  initialTotal,
  filterParam,
  filterValue,
}: Props) {
  const [cards, setCards] = useState<CardProduct[]>(initialCards);
  const [nextPage, setNextPage] = useState(2);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialCards.length < initialTotal);

  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const params = new URLSearchParams({
        page: String(nextPage),
        limit: String(ITEMS_PER_PAGE),
        sort: "featured",
        [filterParam]: filterValue,
      });
      const res = await fetch(`/api/cards?${params}`);
      const json = await res.json();

      const fetched: CardProduct[] = json.data ?? [];
      const total: number = json.total ?? initialTotal;

      setCards((prev) => {
        const merged = [...prev, ...fetched];
        // Update hasMore inside updater to use the true merged length
        setHasMore(fetched.length > 0 && merged.length < total);
        return merged;
      });
      setNextPage((p) => p + 1);
    } catch {
      // silently fail — the user can trigger again by scrolling
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, nextPage, filterParam, filterValue, initialTotal]);

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

  return (
    <>
      {cards.length > 0 ? (
        <>
          <p className="text-sm text-charcoal/50 mb-8">
            Showing {cards.length} of {initialTotal} design
            {initialTotal !== 1 ? "s" : ""} in this collection
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {cards.map((card, index) => (
              <InfiniteCardItem key={card.slug} card={card} index={index} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-20">
          <p className="text-charcoal/50 text-lg mb-4">
            No cards in this collection yet.
          </p>
          <Link href="/" className="btn-secondary text-sm">
            Browse All Cards
          </Link>
        </div>
      )}

      {/* Sentinel — IntersectionObserver target */}
      <div ref={sentinelRef} className="mt-10" aria-hidden="true" />

      {/* Loading skeletons for next batch */}
      {isLoadingMore && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 mt-0">
          {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
            <div
              key={`skel-${i}`}
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

    </>
  );
}

// ─── Card item ────────────────────────────────────────────────────────────────

function InfiniteCardItem({
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
  const imageSrc = card.images?.[0] ? cld(card.images[0]) : null;

  return (
    <Link href={`/product/${card.slug}`} className="group block">
      <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-cream-dark/50 hover:border-champagne/30">
        <div className="relative aspect-[3/4] overflow-hidden bg-cream">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={card.image_alt_text || card.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              quality={90}
              priority={index < 4}
            />
          ) : (
            <div className="w-full h-full bg-cream" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {card.is_new && (
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-charcoal-dark text-white rounded-full">
                New
              </span>
            )}
            {card.is_bestseller && (
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-champagne text-white rounded-full">
                Bestseller
              </span>
            )}
            {discount > 0 && (
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-500 text-white rounded-full">
                -{discount}%
              </span>
            )}
          </div>
        </div>

        <div className="p-5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-champagne">
            {card.category}
          </span>
          <h2 className="font-heading text-lg font-semibold text-charcoal-dark mt-1 mb-3 leading-snug line-clamp-2 group-hover:text-champagne-dark transition-colors duration-300">
            {card.name}
          </h2>
          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-1.5">
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
              Min. {card.min_order}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
