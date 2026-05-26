import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { EVENT_LANDING } from '@/lib/events';
import type { EventLandingSlug } from '@/lib/events';
import { CATEGORY_LANDING } from '@/lib/categories';
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
import InfiniteCardGrid from '@/components/InfiniteCardGrid';

export const revalidate = 1800;

export function generateStaticParams() {
  return EVENT_LANDING.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = EVENT_LANDING.find((e) => e.slug === slug);
  if (!entry) return { title: 'Not Found' };

  return {
    title: entry.metaTitle,
    description: entry.metaDescription,
    keywords: [...entry.keywords],
    alternates: {
      canonical: `/event/${slug}`,
      languages: { 'en-PK': `/event/${slug}`, 'x-default': `/event/${slug}` },
    },
    openGraph: {
      title: entry.metaTitle,
      description: entry.metaDescription,
      url: `${SITE_URL}/event/${slug}`,
    },
  };
}

async function fetchEventCards(
  eventName: string,
): Promise<{ cards: CardProduct[]; total: number }> {
  try {
    await connectToDatabase();
    const [docs, total] = await Promise.all([
      Card.find({ events: eventName })
        .sort({ is_bestseller: -1, created_at: -1 })
        .limit(ITEMS_PER_PAGE)
        .lean(),
      Card.countDocuments({ events: eventName }),
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

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: EventLandingSlug }>;
}) {
  const { slug } = await params;
  const event = EVENT_LANDING.find((e) => e.slug === slug);
  if (!event) notFound();

  const { cards, total } = await fetchEventCards(event.event);
  const pageUrl = `${SITE_URL}/event/${slug}`;

  return (
    <>
      <Navbar />
      <JsonLd
        id={`ld-event-${slug}`}
        data={[
          collectionPageLd({
            name: event.h1,
            description: event.metaDescription,
            url: pageUrl,
            itemUrls: cards.map((c) => `${SITE_URL}/product/${c.slug}`),
          }),
          breadcrumbLd([
            { name: 'Home', url: SITE_URL },
            { name: 'Wedding Cards', url: SITE_URL },
            { name: event.h1, url: pageUrl },
          ]),
          faqPageLd([...event.faqs]),
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
            <li className="text-charcoal/80">{event.h1}</li>
          </ol>
        </nav>

        <section className="bg-ivory border-b border-cream-dark section-padding">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-champagne mb-4">
              {event.event} Collection
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-charcoal-dark mb-6">
              {event.h1}
            </h1>
            <div className="w-20 h-0.5 bg-gradient-to-r from-champagne to-champagne-light mx-auto mb-6" />
            <p className="text-charcoal/60 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              {event.intro}
            </p>
          </div>
        </section>

        <section className="section-padding bg-ivory">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/*
              InfiniteCardGrid receives server-rendered cards as initialCards so
              crawlers index them immediately. Additional batches are fetched
              client-side via /api/cards?event=... on scroll.
            */}
            <InfiniteCardGrid
              initialCards={cards}
              initialTotal={total}
              filterParam="event"
              filterValue={event.event}
            />

            {/* Cross-links to categories */}
            <div className="mt-16 pt-10 border-t border-cream-dark">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-champagne mb-4">
                Browse by style
              </p>
              <div className="flex flex-wrap gap-3">
                {CATEGORY_LANDING.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/category/${c.slug}`}
                    className="px-5 py-2 text-sm font-medium bg-cream text-charcoal/70 hover:bg-champagne hover:text-white rounded-full border border-cream-dark transition-all duration-300"
                  >
                    {c.h1.replace(' in Karachi', '')}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        {event.faqs.length > 0 && (
          <section className="section-padding bg-cream/30">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-charcoal-dark text-center mb-10">
                Frequently Asked Questions
              </h2>
              <div className="space-y-6">
                {event.faqs.map((faq) => (
                  <div key={faq.question} className="border-b border-cream-dark pb-6">
                    <h3 className="font-semibold text-charcoal-dark mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-charcoal/60 text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
