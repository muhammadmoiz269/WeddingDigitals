'use client';

import { motion, type Variants } from 'framer-motion';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.2 + i * 0.15, duration: 0.8 },
  }),
};

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center hero-pattern overflow-hidden"
    >
      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top-right ornament */}
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-gradient-to-br from-champagne/10 to-transparent blur-3xl" />
        {/* Bottom-left ornament */}
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-champagne/8 to-transparent blur-3xl" />
        {/* Floating dots */}
        <div className="absolute top-1/4 right-1/4 w-2 h-2 rounded-full bg-champagne/30 animate-float" />
        <div className="absolute top-1/3 left-1/3 w-1.5 h-1.5 rounded-full bg-champagne/20 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/3 right-1/3 w-1 h-1 rounded-full bg-champagne/25 animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Ornamental Border Lines */}
      <div className="absolute top-8 left-8 right-8 bottom-8 border border-champagne/10 rounded-3xl pointer-events-none hidden lg:block" />

      <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 py-32">
        {/* Badge */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cream border border-champagne/20 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-champagne animate-pulse" />
          <span className="text-xs font-medium uppercase tracking-widest text-champagne-dark">
            Karachi&apos;s Finest Wedding Cards
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-charcoal-dark mb-6"
        >
          Exquisite Wedding{' '}
          <br className="hidden sm:block" />
          Invitations,{' '}
          <span className="text-gold-gradient">Crafted in Karachi</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="max-w-2xl mx-auto text-base sm:text-lg text-charcoal/70 leading-relaxed mb-10"
        >
          Premium quality cards at transparent prices. No hidden charges, no middlemen
          — just beautiful invitations delivered to your doorstep. Starting from{' '}
          <span className="font-semibold text-champagne-dark">PKR 120/card</span>.
        </motion.p>

        {/* CTAs */}
        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a href="#pricing" className="btn-primary text-base px-8 py-4">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            Check Our Prices
          </a>
          <a href="#collection" className="btn-secondary text-base px-8 py-4">
            Browse Collection
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          custom={4}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mt-16 flex flex-wrap items-center justify-center gap-6 sm:gap-10"
        >
          {[
            { value: '5,000+', label: 'Happy Couples' },
            { value: '200+', label: 'Designs' },
            { value: '4.9★', label: 'Rating' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-heading font-bold text-gold-gradient">
                {stat.value}
              </p>
              <p className="text-xs uppercase tracking-widest text-charcoal/50 mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.3em] text-charcoal/40">Scroll</span>
          <div className="w-5 h-8 rounded-full border-2 border-champagne/30 flex items-start justify-center p-1">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1.5 h-1.5 rounded-full bg-champagne"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
