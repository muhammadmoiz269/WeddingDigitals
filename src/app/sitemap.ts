import type { MetadataRoute } from 'next';
import connectToDatabase from '@/lib/mongodb';
import Card from '@/lib/models/Card';
import { SITE_URL } from '@/lib/site';
import { CATEGORY_LANDING } from '@/lib/categories';
import { EVENT_LANDING } from '@/lib/events';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  let cards: Array<{ slug: string; updated_at?: Date }> = [];

  try {
    await connectToDatabase();
    cards = await Card.find({}, 'slug updated_at').lean();
  } catch {
    // DB unreachable — return static URLs only
  }

  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },

    ...CATEGORY_LANDING.map((c) => ({
      url: `${SITE_URL}/category/${c.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),

    ...EVENT_LANDING.map((e) => ({
      url: `${SITE_URL}/event/${e.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),

    ...cards.map((c) => ({
      url: `${SITE_URL}/product/${c.slug}`,
      lastModified: c.updated_at ?? now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
