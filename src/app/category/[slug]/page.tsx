import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CATEGORY_LANDING } from '@/lib/categories';
import type { CategoryLandingSlug } from '@/lib/categories';
import connectToDatabase from '@/lib/mongodb';
import Card from '@/lib/models/Card';
import type { CardProduct } from '@/types';
import { SITE_URL } from '@/lib/site';
import { ITEMS_PER_PAGE } from '@/lib/constants';
import JsonLd from '@/components/JsonLd';
import { collectionPageLd, breadcrumbLd, faqPageLd } from '@/lib/jsonld';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CategoryProductGrid from '@/components/CategoryProductGrid';
import FaqAccordion from '@/components/FaqAccordion';
import { FAQ_HOME } from '@/lib/faqs';

export const revalidate = 1800;

export function generateStaticParams() {
  return CATEGORY_LANDING.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = CATEGORY_LANDING.find((c) => c.slug === slug);
  if (!cat) return { title: 'Not Found' };

  return {
    title: cat.metaTitle,
    description: cat.metaDescription,
    keywords: [...cat.keywords],
    alternates: {
      canonical: `/category/${slug}`,
      languages: { 'en-PK': `/category/${slug}`, 'x-default': `/category/${slug}` },
    },
    openGraph: {
      title: cat.metaTitle,
      description: cat.metaDescription,
      url: `${SITE_URL}/category/${slug}`,
    },
  };
}

async function fetchCategoryCards(
  category: string,
): Promise<{ cards: CardProduct[]; total: number }> {
  try {
    await connectToDatabase();
    const [docs, total] = await Promise.all([
      Card.find({ category })
        .sort({ is_bestseller: -1, is_new: -1, created_at: -1 })
        .limit(ITEMS_PER_PAGE)
        .lean(),
      Card.countDocuments({ category }),
    ]);

    const cards: CardProduct[] = docs.map((doc) => ({
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
      add_ons: doc.add_ons.map(
        (a: { name: string; price: number; description: string }) => ({
          id: a.name.toLowerCase().replace(/\s+/g, '-'),
          name: a.name,
          price: a.price,
          description: a.description,
        }),
      ),
      meta_title: doc.meta_title,
      meta_description: doc.meta_description,
      image_alt_text: doc.image_alt_text,
    })) as CardProduct[];

    return { cards, total };
  } catch {
    return { cards: [], total: 0 };
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: CategoryLandingSlug }>;
}) {
  const { slug } = await params;
  const cat = CATEGORY_LANDING.find((c) => c.slug === slug);
  if (!cat) notFound();

  const { cards, total } = await fetchCategoryCards(cat.category);
  const siblings = CATEGORY_LANDING.filter((c) => c.slug !== slug);

  const pageUrl = `${SITE_URL}/category/${slug}`;

  return (
    <>
      <Navbar />
      <JsonLd
        id={`ld-category-${slug}`}
        data={[
          collectionPageLd({
            name: cat.h1,
            description: cat.metaDescription,
            url: pageUrl,
            itemUrls: cards.map((c) => `${SITE_URL}/product/${c.slug}`),
          }),
          breadcrumbLd([
            { name: 'Home', url: SITE_URL },
            { name: 'Wedding Cards', url: SITE_URL },
            { name: cat.h1, url: pageUrl },
          ]),
          faqPageLd(FAQ_HOME),
        ]}
      />
      <main className="pt-20">
        <nav
          aria-label="Breadcrumb"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"
        >
          <ol className="flex items-center gap-2 text-xs text-charcoal/50">
            <li>
              <Link href="/" className="hover:text-champagne transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/" className="hover:text-champagne transition-colors">
                Wedding Cards
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-charcoal/80">{cat.h1}</li>
          </ol>
        </nav>

        <section className="bg-ivory border-b border-cream-dark section-padding">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-champagne mb-4">
              {cat.category} Collection
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-charcoal-dark mb-6">
              {cat.h1}
            </h1>
            <div className="w-20 h-0.5 bg-gradient-to-r from-champagne to-champagne-light mx-auto mb-6" />
            <p className="text-charcoal/60 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              {cat.intro}
            </p>
          </div>
        </section>

        <CategoryProductGrid
          cards={cards}
          total={total}
          category={cat.category}
          siblings={siblings}
        />
        <FaqAccordion faqs={FAQ_HOME} heading="Frequently Asked Questions" />
      </main>
      <Footer />
    </>
  );
}
