import type { MetadataRoute } from 'next';
import connectToDatabase from '@/lib/mongodb';
import Card from '@/lib/models/Card';
import { SITE_URL } from '@/lib/site';
import { CATEGORY_LANDING } from '@/lib/categories';
import { EVENT_LANDING } from '@/lib/events';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  let cards: Array<{
    slug: string;
    category?: string;
    events?: string[];
    updated_at?: Date;
  }> = [];

  try {
    await connectToDatabase();
    cards = await Card.find({}, 'slug category events updated_at').lean();
  } catch {
    // DB unreachable — return static URLs only
  }

  // Latest product update per category/event, so listing pages reflect real
  // content changes rather than a fresh "now" on every build.
  const latestByCategory = new Map<string, Date>();
  const latestByEvent = new Map<string, Date>();
  for (const c of cards) {
    const updatedAt = c.updated_at ?? now;
    if (c.category) {
      const current = latestByCategory.get(c.category);
      if (!current || updatedAt > current) latestByCategory.set(c.category, updatedAt);
    }
    for (const ev of c.events ?? []) {
      const current = latestByEvent.get(ev);
      if (!current || updatedAt > current) latestByEvent.set(ev, updatedAt);
    }
  }

  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },

    {
      url: `${SITE_URL}/cards`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },

    ...CATEGORY_LANDING.map((c) => ({
      url: `${SITE_URL}/category/${c.slug}`,
      lastModified: latestByCategory.get(c.category) ?? now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),

    ...EVENT_LANDING.map((e) => ({
      url: `${SITE_URL}/event/${e.slug}`,
      lastModified: latestByEvent.get(e.event) ?? now,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),

    ...cards.map((c) => ({
      url: `${SITE_URL}/product/${c.slug}`,
      lastModified: c.updated_at ?? now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),

    {
      url: `${SITE_URL}/privacy-policy`,
      lastModified: now,
      changeFrequency: 'yearly' as const,
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: now,
      changeFrequency: 'yearly' as const,
      priority: 0.2,
    },
  ];
}
