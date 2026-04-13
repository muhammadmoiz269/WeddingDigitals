import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import connectToDatabase from '@/lib/mongodb';
import Card from '@/lib/models/Card';
import type { CardProduct } from '@/types';
import ProductPageClient from './ProductPageClient';

// Make this page dynamic so it always reads live data from MongoDB
export const dynamic = 'force-dynamic';

// ─── Fetch helpers ────────────────────────────────────────────────────────────

async function fetchCardBySlug(slug: string): Promise<CardProduct | null> {
  try {
    await connectToDatabase();
    const doc = await Card.findOne({ slug }).lean();
    if (doc) {
      // Map MongoDB doc to CardProduct shape
      return {
        id: String(doc._id),
        slug: doc.slug,
        name: doc.name,
        base_price: doc.base_price,
        original_price: doc.original_price,
        category: doc.category,
        description: doc.description,
        images: doc.images,
        short_video_url: doc.short_video_url,
        is_new: doc.is_new,
        is_bestseller: doc.is_bestseller,
        min_order: doc.min_order,
        add_ons: doc.add_ons.map((a: { name: string; price: number; description: string }) => ({
          id: a.name.toLowerCase().replace(/\s+/g, '-'),
          name: a.name,
          price: a.price,
          description: a.description,
        })),
      } as CardProduct;
    }
  } catch (err) {
    console.warn('MongoDB unavailable:', err);
  }
  return null;
}

async function fetchAllCards(): Promise<CardProduct[]> {
  try {
    await connectToDatabase();
    const docs = await Card.find({}).lean();
    if (docs.length > 0) {
      return docs.map((doc) => ({
        id: String(doc._id),
        slug: doc.slug,
        name: doc.name,
        base_price: doc.base_price,
        original_price: doc.original_price,
        category: doc.category,
        description: doc.description,
        images: doc.images,
        short_video_url: doc.short_video_url,
        is_new: doc.is_new,
        is_bestseller: doc.is_bestseller,
        min_order: doc.min_order,
        add_ons: doc.add_ons.map((a: { name: string; price: number; description: string }) => ({
          id: a.name.toLowerCase().replace(/\s+/g, '-'),
          name: a.name,
          price: a.price,
          description: a.description,
        })),
      })) as CardProduct[];
    }
  } catch {
    // silently fall back
  }
  return [];
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const card = await fetchCardBySlug(slug);

  if (!card) {
    return { title: 'Card Not Found | Paighaam Wedding Cards' };
  }

  return {
    title: `${card.name} — PKR ${card.base_price}/card | Paighaam Wedding Cards`,
    description: card.description,
    openGraph: {
      title: `${card.name} | Paighaam Wedding Cards`,
      description: card.description,
      images: card.images.length > 0 ? [card.images[0]] : [],
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [card, allCards] = await Promise.all([fetchCardBySlug(slug), fetchAllCards()]);

  if (!card) {
    notFound();
  }

  // Related products: same category, exclude current
  const related = allCards
    .filter((p) => p.category === card.category && p.slug !== card.slug)
    .slice(0, 3);

  return <ProductPageClient card={card} relatedCards={related} />;
}
