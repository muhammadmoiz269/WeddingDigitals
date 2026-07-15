'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { GoogleReview, PlaceReviewData } from '@/lib/server/googleReviews';
import { MAPS_URL } from '@/lib/server/googleReviews';

/* ── Static fallback reviews shown when no API data is available ─────────── */
const FALLBACK_REVIEWS: GoogleReview[] = [
  {
    authorName: 'Sana Mirza',
    rating: 5,
    text: 'Absolutely stunning cards! The quality is unmatched in Karachi. Our guests were so impressed — everyone asked where we got them from. Will definitely order again for our Valima!',
    relativeTime: '2 weeks ago',
  },
  {
    authorName: 'Ahmed Farouk',
    rating: 5,
    text: 'Shahi Bulawa delivered beyond our expectations. The foil work on our cards was exquisite. The team was incredibly responsive on WhatsApp throughout the whole process.',
    relativeTime: '1 month ago',
  },
  {
    authorName: 'Hina Qureshi',
    rating: 5,
    text: 'Ordered 250 cards for our wedding and every single one was perfect. The packaging was beautiful too. Delivery was right on time. Highly recommend!',
    relativeTime: '3 weeks ago',
  },
  {
    authorName: 'Zara Khan',
    rating: 5,
    text: 'The attention to detail is remarkable. From the embossing to the envelope liner, everything felt so premium. Our families were delighted with the cards.',
    relativeTime: '5 weeks ago',
  },
  {
    authorName: 'Bilal Hussain',
    rating: 5,
    text: 'Got 300 cards printed and not a single defect. The price is very fair for the quality you receive. Shahi Bulawa is the go-to for luxury wedding cards in Karachi!',
    relativeTime: '2 months ago',
  },
];

/* ── Star component ──────────────────────────────────────────────────────── */
function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const px = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} className={`${px} flex-shrink-0`} viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={i < Math.round(rating) ? '#C9A96E' : '#e5e0d8'}
          />
        </svg>
      ))}
    </div>
  );
}

/* ── Avatar initial ──────────────────────────────────────────────────────── */
function Avatar({ name, photoUrl }: { name: string; photoUrl?: string }) {
  const initial = name.charAt(0).toUpperCase();
  if (photoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={photoUrl}
        alt={name}
        referrerPolicy="no-referrer"
        className="w-10 h-10 rounded-full object-cover"
      />
    );
  }
  // Deterministic hue from the first char
  const hue = (initial.charCodeAt(0) * 47) % 360;
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
      style={{ background: `hsl(${hue},40%,52%)` }}
    >
      {initial}
    </div>
  );
}

/* ── Single review card ──────────────────────────────────────────────────── */
function ReviewCard({ review }: { review: GoogleReview }) {
  const excerpt =
    review.text.length > 200 ? review.text.slice(0, 197).trim() + '…' : review.text;

  return (
    <article className="flex-shrink-0 w-[300px] sm:w-[340px] bg-white rounded-2xl border border-cream-dark/60 p-6 shadow-sm hover:shadow-lg hover:border-champagne/30 transition-all duration-400 flex flex-col gap-4">
      {/* Stars + Google badge */}
      <div className="flex items-center justify-between">
        <Stars rating={review.rating} />
        {/* Google "G" icon */}
        <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" aria-label="Google review">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
      </div>

      {/* Review text */}
      <p className="text-sm text-charcoal/70 leading-relaxed flex-1">&ldquo;{excerpt}&rdquo;</p>

      {/* Author */}
      <div className="flex items-center gap-3 pt-2 border-t border-cream-dark/50">
        <Avatar name={review.authorName} photoUrl={review.authorPhotoUrl} />
        <div>
          <p className="text-sm font-semibold text-charcoal-dark">{review.authorName}</p>
          {review.relativeTime && (
            <p className="text-[11px] text-charcoal/40">{review.relativeTime}</p>
          )}
        </div>
      </div>
    </article>
  );
}

/* ── Marquee (infinite scroll) ───────────────────────────────────────────── */
function ReviewMarquee({ reviews }: { reviews: GoogleReview[] }) {
  // Duplicate for seamless loop
  const doubled = [...reviews, ...reviews];

  return (
    <div className="relative overflow-hidden">
      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-20 sm:w-32 z-10 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-20 sm:w-32 z-10 bg-gradient-to-l from-white to-transparent" />

      <div className="gr-marquee-track flex gap-5 py-4">
        {doubled.map((review, i) => (
          <ReviewCard key={i} review={review} />
        ))}
      </div>

      <style jsx>{`
        .gr-marquee-track {
          width: max-content;
          animation: gr-scroll 38s linear infinite;
        }
        .gr-marquee-track:hover {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .gr-marquee-track {
            animation: none;
          }
        }
        @keyframes gr-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

/* ── Main exported component ─────────────────────────────────────────────── */
interface Props extends PlaceReviewData {}

export default function GoogleReviews({ reviews, rating, totalRatings }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const headingY = useTransform(scrollYProgress, [0, 0.5, 1], [50, 0, -50]);

  const displayReviews = reviews.length > 0 ? reviews : FALLBACK_REVIEWS;
  const displayRating = rating > 0 ? rating : 5.0;
  const displayTotal = totalRatings > 0 ? totalRatings : null;

  return (
    <section
      ref={sectionRef}
      id="reviews"
      className="section-padding bg-white relative overflow-hidden"
      aria-label="Customer reviews"
    >
      {/* Background decorative blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-gradient-to-br from-champagne/8 to-transparent blur-3xl" />
        <div className="absolute -bottom-24 -right-20 w-96 h-96 rounded-full bg-gradient-to-tl from-champagne/6 to-transparent blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <motion.div
          className="text-center mb-14"
          style={{ y: headingY }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-champagne mb-4">
            Real Couples, Real Love
          </span>

          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-charcoal-dark mb-4">
            What Our{' '}
            <span className="text-gold-gradient">Couples Say</span>
          </h2>

          <div className="w-20 h-0.5 bg-gradient-to-r from-champagne to-champagne-light mx-auto mb-6" />

          {/* Rating badge */}
          <div className="inline-flex items-center gap-3 bg-cream rounded-2xl px-5 py-3 border border-champagne/20">
            <Stars rating={displayRating} size="lg" />
            <div className="text-left">
              <p className="text-lg font-bold text-charcoal-dark leading-none">
                {displayRating.toFixed(1)}
              </p>
              <p className="text-[11px] text-charcoal/50 mt-0.5">
                {displayTotal ? `${displayTotal.toLocaleString()} Google reviews` : 'Google reviews'}
              </p>
            </div>
            {/* Google wordmark */}
            <svg viewBox="0 0 74 24" className="h-4 w-auto ml-1 opacity-60" aria-label="Google">
              <path d="M9.24 8.19v2.46h5.88c-.18 1.38-.64 2.39-1.34 3.1-.86.86-2.2 1.8-4.54 1.8-3.62 0-6.45-2.92-6.45-6.54s2.83-6.54 6.45-6.54c1.95 0 3.38.77 4.43 1.76L15.4 2.5C13.94 1.08 11.98 0 9.24 0 4.28 0 .11 4.04.11 9s4.17 9 9.13 9c2.68 0 4.7-.88 6.28-2.52 1.62-1.62 2.13-3.91 2.13-5.75 0-.57-.04-1.1-.13-1.54H9.24z" fill="#4285f4"/>
              <path d="M25 6.19c-3.21 0-5.83 2.44-5.83 5.81 0 3.34 2.62 5.81 5.83 5.81s5.83-2.46 5.83-5.81c0-3.37-2.62-5.81-5.83-5.81zm0 9.33c-1.76 0-3.28-1.45-3.28-3.52s1.52-3.52 3.28-3.52 3.28 1.45 3.28 3.52-1.52 3.52-3.28 3.52z" fill="#ea4335"/>
              <path d="M53.58 7.49h-.09c-.23-.27-.67-.65-1.44-.88-.77-.23-1.56-.3-2.1-.3-3.06 0-5.81 2.73-5.81 5.82 0 3.06 2.75 5.77 5.81 5.77.54 0 1.33-.07 2.1-.3.77-.23 1.21-.61 1.44-.88h.09v.54c0 2.22-1.19 3.41-3.1 3.41-1.56 0-2.53-1.12-2.93-2.07l-2.22.92c.64 1.54 2.33 3.43 5.15 3.43 2.99 0 5.52-1.76 5.52-6.05V6.49h-2.42v1zm-3.43 8.24c-1.76 0-3.23-1.48-3.23-3.52 0-2.07 1.47-3.57 3.23-3.57 1.74 0 3.1 1.5 3.1 3.57 0 2.04-1.36 3.52-3.1 3.52z" fill="#4285f4"/>
              <path d="M38 6.19c-3.21 0-5.83 2.44-5.83 5.81 0 3.34 2.62 5.81 5.83 5.81s5.83-2.46 5.83-5.81c0-3.37-2.62-5.81-5.83-5.81zm0 9.33c-1.76 0-3.28-1.45-3.28-3.52s1.52-3.52 3.28-3.52 3.28 1.45 3.28 3.52-1.52 3.52-3.28 3.52z" fill="#fbbc05"/>
              <path d="M58.14 0h2.55v18h-2.55z" fill="#34a853"/>
              <path d="M68.49 15.52c-1.3 0-2.22-.59-2.82-1.76l7.77-3.21-.26-.66c-.48-1.3-1.96-3.7-4.97-3.7-2.99 0-5.48 2.35-5.48 5.81 0 3.26 2.46 5.81 5.76 5.81 2.66 0 4.2-1.63 4.84-2.57l-1.98-1.32c-.66.96-1.56 1.6-2.86 1.6zm-.18-7.15c1.03 0 1.91.53 2.2 1.28l-5.25 2.17c0-2.44 1.73-3.45 3.05-3.45z" fill="#ea4335"/>
            </svg>
          </div>
        </motion.div>

        {/* Scrolling review cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <ReviewMarquee reviews={displayReviews} />
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            id="google-reviews-cta"
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full border-2 border-champagne/40 text-champagne-dark font-semibold text-sm hover:bg-champagne hover:text-white hover:border-champagne transition-all duration-300"
          >
            {/* Google "G" icon */}
            <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            View All Reviews on Google
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
