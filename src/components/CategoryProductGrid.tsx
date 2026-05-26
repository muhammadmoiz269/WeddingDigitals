import Link from 'next/link';
import type { CardProduct } from '@/types';
import type { CATEGORY_LANDING } from '@/lib/categories';
import InfiniteCardGrid from '@/components/InfiniteCardGrid';

type Sibling = (typeof CATEGORY_LANDING)[number];

interface Props {
  cards: CardProduct[];
  /** Total count of cards matching this category (may be > cards.length). */
  total: number;
  category: string;
  siblings: readonly Sibling[];
}

export default function CategoryProductGrid({
  cards,
  total,
  category,
  siblings,
}: Props) {
  return (
    <section className="section-padding bg-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/*
          InfiniteCardGrid is a client component. It receives the
          server-rendered cards as initialCards so they are present in the
          initial HTML (SEO-friendly), then loads more on scroll via the API.
        */}
        <InfiniteCardGrid
          initialCards={cards}
          initialTotal={total}
          filterParam="category"
          filterValue={category}
        />

        {siblings.length > 0 && (
          <div className="mt-16 pt-10 border-t border-cream-dark">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-champagne mb-4">
              Also browse
            </p>
            <div className="flex flex-wrap gap-3">
              {siblings.map((s) => (
                <Link
                  key={s.slug}
                  href={`/category/${s.slug}`}
                  className="px-5 py-2 text-sm font-medium bg-cream text-charcoal/70 hover:bg-champagne hover:text-white rounded-full border border-cream-dark transition-all duration-300"
                >
                  {s.h1.replace(' in Karachi', '')}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
