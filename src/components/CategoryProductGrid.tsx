import Image from 'next/image';
import Link from 'next/link';
import type { CardProduct } from '@/types';
import type { CATEGORY_LANDING } from '@/lib/categories';
import { cld } from '@/lib/cloudinary';

type Sibling = (typeof CATEGORY_LANDING)[number];

interface Props {
  cards: CardProduct[];
  siblings: readonly Sibling[];
}

export default function CategoryProductGrid({ cards, siblings }: Props) {
  return (
    <section className="section-padding bg-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {cards.length > 0 ? (
          <>
            <p className="text-sm text-charcoal/50 mb-8">
              {cards.length} design{cards.length !== 1 ? 's' : ''} in this
              collection
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {cards.map((card) => (
                <CategoryCardItem key={card.slug} card={card} />
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

function CategoryCardItem({ card }: { card: CardProduct }) {
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
