// Brand + URL re-exported from the single source of truth
export { BRAND, SITE_URL } from '@/lib/site';

// International format (without +) for WhatsApp API links
export const WHATSAPP_NUMBER = '923078656300';

// Display-friendly format shown on the website
export const WHATSAPP_DISPLAY = '+92 307 8656300';

// Pre-built WhatsApp base URL
export const WHATSAPP_BASE_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

/** Build a WhatsApp chat link with an optional pre-filled message. */
export function getWhatsAppChatLink(message?: string): string {
  if (message) {
    return `${WHATSAPP_BASE_URL}?text=${encodeURIComponent(message)}`;
  }
  return WHATSAPP_BASE_URL;
}

// ─── Product Grid ─────────────────────────────────────────────────────────────

import type { CardProduct } from "@/types";

export const CATEGORIES = [
  "All",
  "Luxury",
  "Classic",
  "Modern",
  "Minimalist",
  "Floral",
  "Textured",
  "Acrylic",
] as const;

export const SORT_OPTIONS = [
  { value: "featured",   label: "Featured" },
  { value: "best-selling", label: "Best Selling" },
  { value: "price-asc",  label: "Price, Low to High" },
  { value: "price-desc", label: "Price, High to Low" },
  { value: "newest",     label: "Newest" },
  { value: "name-asc",   label: "Alphabetically, A\u2013Z" },
  { value: "name-desc",  label: "Alphabetically, Z\u2013A" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

/** Number of cards shown per page (4 rows × 3 columns on desktop). */
export const ITEMS_PER_PAGE = 12;

/** Sort a copy of `cards` in-place according to the chosen sort key. */
export function sortCards(cards: CardProduct[], sort: SortValue): CardProduct[] {
  const sorted = [...cards];
  switch (sort) {
    case "featured":
      return sorted.sort((a, b) => {
        if (a.is_bestseller !== b.is_bestseller) return a.is_bestseller ? -1 : 1;
        if (a.is_new !== b.is_new) return a.is_new ? -1 : 1;
        return 0;
      });
    case "best-selling":
      return sorted.sort((a, b) => (b.is_bestseller ? 1 : 0) - (a.is_bestseller ? 1 : 0));
    case "price-asc":
      return sorted.sort((a, b) => a.base_price - b.base_price);
    case "price-desc":
      return sorted.sort((a, b) => b.base_price - a.base_price);
    case "newest":
      return sorted.sort((a, b) => (b.is_new ? 1 : 0) - (a.is_new ? 1 : 0));
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    default:
      return sorted;
  }
}
