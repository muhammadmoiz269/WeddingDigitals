'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { navLinks } from '@/data/navigation';
import SearchModal from '@/components/SearchModal';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Ctrl+K / Cmd+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const searchIcon = (
    <svg
      className="w-[18px] h-[18px] text-charcoal/70 hover:text-champagne transition-colors"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </svg>
  );

  return (
    <>
      {/* ── Desktop Navbar (md+) ───────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 hidden md:block ${
          isScrolled ? 'glass shadow-lg shadow-champagne/5' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2.5 group">
              <Image
                src="/images/logo.png"
                alt="Paighaam"
                width={40}
                height={40}
                className="rounded-full shadow-md group-hover:shadow-lg transition-shadow duration-300"
              />
              <div className="flex flex-col">
                <span className="font-heading text-xl font-bold text-charcoal-dark tracking-tight">
                  Paighaam
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-champagne font-medium -mt-1">
                  Wedding Cards
                </span>
              </div>
            </a>

            {/* Nav Links */}
            <div className="flex items-center gap-1">
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

            {/* Search + CTA */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-cream/80 transition-colors cursor-pointer"
                aria-label="Search cards"
                id="search-toggle"
              >
                {searchIcon}
              </button>
              <a href="#collection" className="btn-primary text-sm !px-5 !py-2.5">
                Get a Quote
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile Navbar (< md): Logo left, Search right ─────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 md:hidden ${
          isScrolled ? 'glass shadow-md shadow-champagne/5' : 'bg-ivory/80 backdrop-blur-sm'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            <Image
              src="/images/logo.png"
              alt="Paighaam"
              width={36}
              height={36}
              className="rounded-full shadow-sm"
            />
            <div className="flex flex-col">
              <span className="font-heading text-base font-bold text-charcoal-dark tracking-tight leading-tight">
                Paighaam
              </span>
              <span className="text-[9px] uppercase tracking-[0.18em] text-champagne font-medium -mt-0.5">
                Wedding Cards
              </span>
            </div>
          </a>

          {/* Search icon */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-cream transition-colors cursor-pointer"
            aria-label="Search cards"
            id="search-toggle-mobile"
          >
            {searchIcon}
          </button>
        </div>
      </nav>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
