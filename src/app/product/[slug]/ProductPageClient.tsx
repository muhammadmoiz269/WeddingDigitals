'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import type { CardProduct } from '@/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductGallery from '@/components/ProductGallery';
import PriceCalculator from '@/components/PriceCalculator';

interface ProductPageClientProps {
  card: CardProduct;
  relatedCards: CardProduct[];
}

export default function ProductPageClient({ card, relatedCards }: ProductPageClientProps) {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-24">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <nav className="flex items-center gap-2 text-xs text-charcoal/50">
            <Link href="/" className="hover:text-champagne transition-colors">Home</Link>
            <span>/</span>
            <Link href="/#collection" className="hover:text-champagne transition-colors">Collection</Link>
            <span>/</span>
            <span className="text-charcoal font-medium truncate">{card.name}</span>
          </nav>
        </div>

        {/* Main Product Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
            {/* Left: Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <ProductGallery
                images={card.images}
                videoUrl={card.short_video_url}
                productName={card.name}
              />
            </motion.div>

            {/* Right: Product Info & Calculator */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="space-y-6"
            >
              {/* Badges */}
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-champagne bg-champagne/10 rounded-full">
                  {card.category}
                </span>
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
              </div>

              {/* Title */}
              <h1 className="font-heading text-3xl sm:text-4xl font-bold text-charcoal-dark leading-tight">
                {card.name}
              </h1>

              {/* Description */}
              <p className="text-charcoal/60 leading-relaxed">
                {card.description}
              </p>

              {/* Specs */}
              <div className="flex flex-wrap gap-4 text-xs text-charcoal/50">
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-champagne" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Min. {card.min_order} pcs
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-champagne" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  5-7 days delivery
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-champagne" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Quality guaranteed
                </div>
              </div>

              {/* Price Calculator */}
              <div className="bg-white rounded-2xl border border-cream-dark/50 p-6 shadow-sm">
                <PriceCalculator
                  basePrice={card.base_price}
                  originalPrice={card.original_price}
                  productName={card.name}
                  slug={card.slug}
                  addOns={card.add_ons}
                  minOrder={card.min_order}
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Related Products */}
        {relatedCards.length > 0 && (
          <section className="bg-cream section-padding">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-10">
                <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-champagne mb-3">
                  You May Also Like
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-charcoal-dark">
                  Similar {card.category} Cards
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {relatedCards.map((related, index) => (
                  <motion.div
                    key={related.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Link href={`/product/${related.slug}`} className="group block">
                      <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-cream-dark/50 hover:border-champagne/30">
                        <div className="relative aspect-[3/4] overflow-hidden bg-cream">
                          <Image
                            src={related.images[0]}
                            alt={related.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        </div>
                        <div className="p-5">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-champagne">
                            {related.category}
                          </span>
                          <h3 className="font-heading text-lg font-semibold text-charcoal-dark mt-1 mb-2 group-hover:text-champagne-dark transition-colors">
                            {related.name}
                          </h3>
                          <span className="text-xl font-bold text-charcoal-dark">
                            PKR {related.base_price}
                          </span>
                          <span className="text-[10px] text-charcoal/50 ml-1">/card</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
