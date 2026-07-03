'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { cld } from '@/lib/cloudinary';

const HOVER_SLIDE_INTERVAL_MS = 1400;

interface CardTileSliderProps {
  images: string[];
  alt: string;
  sizes?: string;
  /** Preload the first image (LCP candidates above the fold). */
  preload?: boolean;
  quality?: number;
}

/**
 * Image slider for card grid tiles. Auto-advances through all images while
 * hovered, plus prev/next arrows. Rendered inside a <Link>, so the arrow
 * buttons stop propagation to avoid navigating.
 */
export default function CardTileSlider({
  images,
  alt,
  sizes = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw',
  preload = false,
  quality,
}: CardTileSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selected, setSelected] = useState(0);
  const hoverTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  const stopHoverSlide = useCallback(() => {
    if (hoverTimer.current) {
      clearInterval(hoverTimer.current);
      hoverTimer.current = null;
    }
  }, []);

  const startHoverSlide = useCallback(() => {
    stopHoverSlide();
    hoverTimer.current = setInterval(() => emblaApi?.scrollNext(), HOVER_SLIDE_INTERVAL_MS);
  }, [emblaApi, stopHoverSlide]);

  useEffect(() => stopHoverSlide, [stopHoverSlide]);

  const arrow = (dir: 'prev' | 'next') => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dir === 'prev') emblaApi?.scrollPrev();
    else emblaApi?.scrollNext();
  };

  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <Image
        src={cld(images[0])}
        alt={alt}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes={sizes}
        preload={preload}
        quality={quality}
      />
    );
  }

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={startHoverSlide}
      onMouseLeave={stopHoverSlide}
    >
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {images.map((img, i) => (
            <div key={img} className="relative flex-[0_0_100%] min-w-0">
              <Image
                src={cld(img)}
                alt={i === 0 ? alt : `${alt} — view ${i + 1}`}
                fill
                className="object-cover"
                sizes={sizes}
                preload={preload && i === 0}
                quality={quality}
              />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        aria-label="Previous image"
        onClick={arrow('prev')}
        onMouseEnter={stopHoverSlide}
        onMouseLeave={startHoverSlide}
        className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-white/80 text-charcoal-dark shadow-sm opacity-0 group-hover:opacity-100 hover:bg-white transition-opacity duration-300 z-10"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Next image"
        onClick={arrow('next')}
        onMouseEnter={stopHoverSlide}
        onMouseLeave={startHoverSlide}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-white/80 text-charcoal-dark shadow-sm opacity-0 group-hover:opacity-100 hover:bg-white transition-opacity duration-300 z-10"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {images.map((img, i) => (
          <span
            key={img}
            className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
              i === selected ? 'bg-white' : 'bg-white/45'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
