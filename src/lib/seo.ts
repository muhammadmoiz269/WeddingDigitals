import { SEO_BY_SLUG, SEO_BY_CARD_CODE } from '@/data/seo-products';
import type { SeoProduct } from '@/data/seo-products';

export type { SeoProduct };

export function getSeoBySlug(slug: string): SeoProduct | null {
  return SEO_BY_SLUG[slug] ?? null;
}

export function getSeoByCardCode(code?: string | null): SeoProduct | null {
  if (!code) return null;
  return SEO_BY_CARD_CODE[code.toUpperCase()] ?? null;
}
