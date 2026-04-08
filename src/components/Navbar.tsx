'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { navLinks } from '@/data/navigation';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'glass shadow-lg shadow-champagne/5'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-champagne to-champagne-dark flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300">
                <span className="text-white font-heading text-lg font-bold">D</span>
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-xl font-bold text-charcoal-dark tracking-tight">
                  Digitals
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-champagne font-medium -mt-1">
                  Wedding Cards
                </span>
              </div>
            </a>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="relative px-4 py-2 text-sm font-medium text-charcoal/80 hover:text-charcoal-dark transition-colors duration-300 group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-champagne to-champagne-light rounded-full transition-all duration-300 group-hover:w-3/4" />
                </a>
              ))}
            </div>

            {/* CTA + Mobile Toggle */}
            <div className="flex items-center gap-3">
              <a
                href="#collection"
                className="hidden sm:inline-flex btn-primary text-sm !px-5 !py-2.5"
              >
                Get a Quote
              </a>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-cream transition-colors"
                aria-label="Toggle menu"
                id="mobile-menu-toggle"
              >
                <div className="w-5 h-4 flex flex-col justify-between">
                  <span
                    className={`block h-0.5 bg-charcoal rounded-full transition-all duration-300 origin-center ${
                      isMobileOpen ? 'rotate-45 translate-y-[7px]' : ''
                    }`}
                  />
                  <span
                    className={`block h-0.5 bg-charcoal rounded-full transition-all duration-300 ${
                      isMobileOpen ? 'opacity-0 scale-0' : ''
                    }`}
                  />
                  <span
                    className={`block h-0.5 bg-charcoal rounded-full transition-all duration-300 origin-center ${
                      isMobileOpen ? '-rotate-45 -translate-y-[7px]' : ''
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-charcoal-dark/40 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-[280px] bg-ivory shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col h-full pt-24 px-6 pb-8">
                <div className="flex flex-col gap-1">
                  {navLinks.map((link, i) => (
                    <motion.a
                      key={link.href}
                      href={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                      onClick={() => setIsMobileOpen(false)}
                      className="px-4 py-3 text-base font-medium text-charcoal hover:text-champagne hover:bg-cream/60 rounded-lg transition-colors"
                    >
                      {link.label}
                    </motion.a>
                  ))}
                </div>

                <div className="mt-auto pt-6 border-t border-cream-dark">
                  <a
                    href="#collection"
                    className="btn-primary w-full text-center"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    Get a Quote
                  </a>
                  <p className="mt-4 text-xs text-charcoal/50 text-center">
                    Karachi&apos;s Premium Wedding Cards
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
