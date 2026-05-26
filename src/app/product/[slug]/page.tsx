import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import connectToDatabase from '@/lib/mongodb';
import Card from '@/lib/models/Card';
import type { CardProduct } from '@/types';
import { getSeoBySlug } from '@/lib/seo';
import { breadcrumbLd } from '@/lib/jsonld';
import { SITE_URL, absoluteUrl } from '@/lib/site';
import { categoryToSlug } from '@/lib/categories';
import JsonLd from '@/components/JsonLd';
import ProductPageClient from './ProductPageClient';

// ISR: revalidate every 10 minutes
export const revalidate = 600;

// ─── Static params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const { SEO_PRODUCTS } = await import('@/data/seo-products');
  return SEO_PRODUCTS.map((p) => ({ slug: p.slug }));
}

// ─── Fetch helpers ────────────────────────────────────────────────────────────

// Wrap with cache() so generateMetadata and the page component share one DB round-trip
const fetchCardBySlug = cache(async (slug: string): Promise<(CardProduct & { card_code?: string }) | null> => {
  try {
    await connectToDatabase();
    const doc = await Card.findOne({ slug }).lean();
    if (doc) {
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
        meta_title: doc.meta_title,
        meta_description: doc.meta_description,
        image_alt_text: doc.image_alt_text,
        events: doc.events ?? [],
        card_code: doc.card_code,
      } as CardProduct & { card_code?: string };
    }
  } catch (err) {
    console.warn('MongoDB unavailable:', err);
  }
  return null;
});

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
        meta_title: doc.meta_title,
        meta_description: doc.meta_description,
        image_alt_text: doc.image_alt_text,
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

  // Try CSV-sourced SEO data first
  const seo = getSeoBySlug(slug);

  if (!seo && card) {
    console.warn('[seo] no CSV row for slug=', slug, 'card_code=', card.card_code);
  }

  if (!card && !seo) {
    return { title: 'Card Not Found | Shahi Bulawa' };
  }

  const plainTextDescription = card
    ? card.description.replace(/<[^>]+>/g, '').substring(0, 160)
    : '';

  const title = seo?.title ?? card?.meta_title ?? `${card?.name} — PKR ${card?.base_price}/card | Shahi Bulawa`;
  const description = seo?.metaDescription ?? card?.meta_description ?? plainTextDescription;
  const ogTitle = seo?.title ?? card?.meta_title ?? `${card?.name} | Shahi Bulawa`;
  const imageAlt = seo?.imageAlt ?? card?.image_alt_text ?? `${card?.name} Wedding Card`;
  const firstImage = card?.images && card.images.length > 0 ? card.images[0] : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: `/product/${slug}`,
      languages: {
        'en-PK': `/product/${slug}`,
        'x-default': `/product/${slug}`,
      },
    },
    openGraph: {
      title: ogTitle,
      description,
      images: firstImage ? [{ url: firstImage, alt: imageAlt }] : [],
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
    .slice(0, 4);

  // CSV-sourced SEO data
  const seo = getSeoBySlug(slug);
  const seoForClient = seo
    ? { h1: seo.h1, description: seo.description, imageAlt: seo.imageAlt }
    : null;

  // Build Product JSON-LD
  const rawImage = card.images.length > 0 ? card.images[0] : undefined;
  const imageUrl = rawImage
    ? rawImage.startsWith('http')
      ? rawImage
      : absoluteUrl(rawImage)
    : undefined;

  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: card.name,
    description: (seo?.description ?? card.description).replace(/<[^>]+>/g, '').substring(0, 500),
    ...(card.card_code ? { sku: card.card_code } : {}),
    ...(imageUrl ? { image: imageUrl } : {}),
    brand: { '@type': 'Brand', name: 'Shahi Bulawa' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'PKR',
      price: card.base_price,
      priceValidUntil: '2026-12-31',
      availability: 'https://schema.org/MadeToOrder',
      url: absoluteUrl(`/product/${card.slug}`),
      seller: { '@type': 'Organization', name: 'Shahi Bulawa' },
      shippingDetails: [
        {
          '@type': 'OfferShippingDetails',
          shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'PKR' },
          shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'PK', addressRegion: ['SD'] },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3, unitCode: 'DAY' },
            transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 2, unitCode: 'DAY' },
          },
        },
        {
          '@type': 'OfferShippingDetails',
          shippingRate: { '@type': 'MonetaryAmount', value: '250', currency: 'PKR' },
          shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'PK' },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3, unitCode: 'DAY' },
            transitTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 5, unitCode: 'DAY' },
          },
        },
      ],
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'PK',
        returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
      },
    },
  };

  // Build BreadcrumbList JSON-LD
  const catSlug = categoryToSlug(card.category);
  const breadcrumb = breadcrumbLd([
    { name: 'Home', url: SITE_URL },
    ...(catSlug ? [{ name: card.category, url: absoluteUrl(`/category/${catSlug}`) }] : []),
    { name: card.name, url: absoluteUrl(`/product/${card.slug}`) },
  ]);

  return (
    <>
      <JsonLd id={`ld-product-${slug}`} data={[productLd, breadcrumb]} />
      <ProductPageClient card={card} relatedCards={related} seo={seoForClient} />
    </>
  );
}
