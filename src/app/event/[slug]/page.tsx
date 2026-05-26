import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { EVENT_LANDING } from '@/lib/events';
import type { EventLandingSlug } from '@/lib/events';
import { CATEGORY_LANDING } from '@/lib/categories';
import connectToDatabase from '@/lib/mongodb';
import Card from '@/lib/models/Card';
import type { CardProduct } from '@/types';
import { SITE_URL } from '@/lib/site';
import JsonLd from '@/components/JsonLd';
import { collectionPageLd, breadcrumbLd, faqPageLd } from '@/lib/jsonld';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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

async function fetchEventCards(eventName: string): Promise<CardProduct[]> {
  try {
    await connectToDatabase();
    const docs = await Card.find({ events: eventName })
      .sort({ is_bestseller: -1, created_at: -1 })
      .lean();
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
  } catch {
    return [];
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

  const cards = await fetchEventCards(event.event);
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
            {cards.length > 0 ? (
              <>
                <p className="text-sm text-charcoal/50 mb-8">
                  {cards.length} design{cards.length !== 1 ? 's' : ''} in this collection
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                  {cards.map((card) => (
                    <EventCardItem key={card.slug} card={card} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <p className="text-charcoal/50 text-lg mb-4">No cards in this collection yet.</p>
                <Link href="/" className="btn-secondary text-sm">Browse All Cards</Link>
              </div>
            )}

            {/* Cross-links to categories */}
            <div className="mt-16 pt-10 border-t border-cream-dark">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-champagne mb-4">Browse by style</p>
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
                    <h3 className="font-semibold text-charcoal-dark mb-2">{faq.question}</h3>
                    <p className="text-charcoal/60 text-sm leading-relaxed">{faq.answer}</p>
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

function EventCardItem({ card }: { card: CardProduct }) {
  const discount =
    card.original_price && card.original_price > card.base_price
      ? Math.round(
          ((card.original_price - card.base_price) / card.original_price) * 100,
        )
      : 0;
  const imageSrc = card.images?.[0] ?? null;

  return (
    <Link href={`/product/${card.slug}`} className="group block">
      <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-cream-dark/50 hover:border-champagne/30">
        <div className="relative aspect-[3/4] overflow-hidden bg-cream">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={card.image_alt_text || card.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              quality={90}
            />
          ) : (
            <div className="w-full h-full bg-cream" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {card.is_new && (
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-charcoal-dark text-white rounded-full">
                New
              </span>
            )}
            {card.is_bestseller && (
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-champagne text-white rounded-full">
                Bestseller
              </span>
            )}
            {discount > 0 && (
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-500 text-white rounded-full">
                -{discount}%
              </span>
            )}
          </div>
        </div>

        <div className="p-5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-champagne">
            {card.category}
          </span>
          <h2 className="font-heading text-lg font-semibold text-charcoal-dark mt-1 mb-3 leading-snug line-clamp-2 group-hover:text-champagne-dark transition-colors duration-300">
            {card.name}
          </h2>
          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-charcoal-dark">
                PKR {card.base_price.toLocaleString()}
              </span>
              {card.original_price && (
                <span className="text-sm text-charcoal/40 line-through">
                  PKR {card.original_price.toLocaleString()}
                </span>
              )}
              <span className="text-[10px] text-charcoal/50">/card</span>
            </div>
            <span className="text-[10px] text-charcoal/40 uppercase tracking-wider">
              Min. {card.min_order}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
