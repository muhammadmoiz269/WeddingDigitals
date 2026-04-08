'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  index: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true, margin: '-50px' }}
      className="group relative"
    >
      <Link href={`/product/${product.id}`} className="block">
      <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-cream-dark/50 hover:border-champagne/30">
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-cream">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && (
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-charcoal-dark text-white rounded-full">
                New
              </span>
            )}
            {product.isBestseller && (
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

          {/* Quick View Button */}
          <span
            className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2.5 bg-white/95 backdrop-blur-sm text-charcoal-dark text-sm font-semibold rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:bg-champagne group-hover:text-white shadow-lg cursor-pointer"
          >
            View Details
          </span>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Category */}
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-champagne">
            {product.category}
          </span>

          {/* Name */}
          <h3 className="font-heading text-lg font-semibold text-charcoal-dark mt-1 mb-2 leading-snug group-hover:text-champagne-dark transition-colors duration-300">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-charcoal/60 leading-relaxed line-clamp-2 mb-4">
            {product.description}
          </p>

          {/* Price & Min Order */}
          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-charcoal-dark">
                PKR {product.price}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-charcoal/40 line-through">
                  PKR {product.originalPrice}
                </span>
              )}
              <span className="text-[10px] text-charcoal/50">/card</span>
            </div>
            {product.minOrder && (
              <span className="text-[10px] text-charcoal/40 uppercase tracking-wider">
                Min. {product.minOrder} pcs
              </span>
            )}
          </div>
        </div>
      </div>
      </Link>
    </motion.div>
  );
}
