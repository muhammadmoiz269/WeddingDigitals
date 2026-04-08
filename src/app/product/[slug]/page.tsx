import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCardBySlug, cardProducts } from '@/data/cardProducts';
import ProductPageClient from './ProductPageClient';

// Generate static paths for all products
export async function generateStaticParams() {
  return cardProducts.map((product) => ({
    slug: product.slug,
  }));
}

// Dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const card = getCardBySlug(slug);

  if (!card) {
    return { title: 'Card Not Found | Digitals Wedding Cards' };
  }

  return {
    title: `${card.name} — PKR ${card.base_price}/card | Digitals Wedding Cards`,
    description: card.description,
    openGraph: {
      title: `${card.name} | Digitals Wedding Cards`,
      description: card.description,
      images: card.images.length > 0 ? [card.images[0]] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const card = getCardBySlug(slug);

  if (!card) {
    notFound();
  }

  // Get related products (same category, exclude current)
  const related = cardProducts
    .filter((p) => p.category === card.category && p.id !== card.id)
    .slice(0, 3);

  return <ProductPageClient card={card} relatedCards={related} />;
}
