/**
 * Server-side helper — live per-card price ranges for landing page copy.
 *
 * Event and category copy in src/lib/events.ts and src/lib/categories.ts
 * uses {from}, {typical} and {to} placeholders instead of hardcoded prices,
 * so the quoted prices always match the cards actually listed on the page.
 */

import { cache } from 'react';
import connectToDatabase from '@/lib/mongodb';
import Card from '@/lib/models/Card';
import { PRICE_RANGE } from '@/lib/site';

export interface PriceStats {
  /** Cheapest card */
  from: number;
  /** 25th percentile */
  typicalLow: number;
  /** 75th percentile */
  typicalHigh: number;
  /** Most expensive card */
  to: number;
}

const FALLBACK: PriceStats = { ...PRICE_RANGE };

function percentile(sorted: number[], p: number): number {
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil(p * sorted.length) - 1));
  return sorted[idx];
}

async function queryPriceStats(key: string): Promise<PriceStats> {
  const filter = JSON.parse(key) as Record<string, string>;
  try {
    await connectToDatabase();
    const docs = await Card.find(filter, 'base_price').lean();
    const prices = docs
      .map((d) => d.base_price)
      .filter((p): p is number => typeof p === 'number' && p > 0)
      .sort((a, b) => a - b);
    if (prices.length === 0) return FALLBACK;
    return {
      from: prices[0],
      typicalLow: percentile(prices, 0.25),
      typicalHigh: percentile(prices, 0.75),
      to: prices[prices.length - 1],
    };
  } catch {
    return FALLBACK;
  }
}

// cache() dedupes the query between generateMetadata and the page render.
// It keys on argument identity, so the filter is serialised to a string.
const cachedPriceStats = cache(queryPriceStats);

/** Price stats for cards matching a filter, e.g. { events: 'Nikkah' } or { category: 'Floral' }. */
export function getPriceStats(filter: Record<string, string> = {}): Promise<PriceStats> {
  return cachedPriceStats(JSON.stringify(filter));
}

/** Replace {from}, {typical} and {to} placeholders with live prices. */
export function fillPrices(text: string, stats: PriceStats): string {
  const typical =
    stats.typicalLow === stats.typicalHigh
      ? `${stats.typicalLow}`
      : `${stats.typicalLow}–${stats.typicalHigh}`;
  return text
    .replaceAll('{from}', `${stats.from}`)
    .replaceAll('{typical}', typical)
    .replaceAll('{to}', `${stats.to}`);
}
