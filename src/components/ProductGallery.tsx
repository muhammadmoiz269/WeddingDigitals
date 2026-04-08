'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductGalleryProps {
  images: string[];
  videoUrl?: string;
  productName: string;
}

export default function ProductGallery({ images, videoUrl, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div className="space-y-4">
      {/* Main Display */}
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-cream border border-cream-dark/50">
        <AnimatePresence mode="wait">
          {showVideo && videoUrl ? (
            <motion.div
              key="video"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <video
                src={videoUrl}
                className="w-full h-full object-cover"
                controls
                autoPlay
                muted
                loop
                playsInline
              />
            </motion.div>
          ) : (
            <motion.div
              key={`image-${activeIndex}`}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              <Image
                src={images[activeIndex] || images[0]}
                alt={`${productName} - View ${activeIndex + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Video/Photo Toggle Badge */}
        {videoUrl && (
          <button
            onClick={() => setShowVideo(!showVideo)}
            className="absolute top-4 right-4 z-10 flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm text-charcoal-dark text-xs font-semibold shadow-lg hover:bg-champagne hover:text-white transition-all duration-300 cursor-pointer"
          >
            {showVideo ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                View Photos
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Watch Video
              </>
            )}
          </button>
        )}
      </div>

      {/* Thumbnail Strip */}
      <div className="flex items-center gap-3">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => { setActiveIndex(idx); setShowVideo(false); }}
            className={`relative w-20 h-24 rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
              activeIndex === idx && !showVideo
                ? 'border-champagne shadow-md shadow-champagne/20'
                : 'border-cream-dark/50 opacity-60 hover:opacity-100'
            }`}
          >
            <Image
              src={img}
              alt={`${productName} thumbnail ${idx + 1}`}
              fill
              className="object-cover"
              sizes="80px"
            />
          </button>
        ))}

        {/* Video Thumbnail */}
        {videoUrl && (
          <button
            onClick={() => setShowVideo(true)}
            className={`relative w-20 h-24 rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer flex items-center justify-center bg-charcoal-dark ${
              showVideo
                ? 'border-champagne shadow-md shadow-champagne/20'
                : 'border-cream-dark/50 opacity-60 hover:opacity-100'
            }`}
          >
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span className="absolute bottom-1 left-0 right-0 text-center text-[8px] font-bold text-white uppercase tracking-wider">
              Video
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
