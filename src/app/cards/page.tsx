import type { Metadata } from 'next';
import Link from 'next/link';
import connectToDatabase from '@/lib/mongodb';
import Card from '@/lib/models/Card';
import { SITE_URL, absoluteUrl } from '@/lib/site';
import { CATEGORY_LANDING } from '@/lib/categories';
import { EVENT_LANDING } from '@/lib/events';
import CardTileSlider from '@/components/CardTileSlider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';
import { collectionPageLd, breadcrumbLd } from '@/lib/jsonld';

export const revalidate = 1800;

export const metadata: Metadata = {
  title: 'All Wedding Cards',
  description:
    'Browse every wedding card design from Shahi Bulawa — Nikkah, Valima, Mehndi & Baraat invitations in every style, printed in Karachi from PKR 120/card.',
  alternates: {
    canonical: '/cards',
    languages: { 'en-PK': '/cards', 'x-default': '/cards' },
  },
};

interface CardLink {
  slug: string;
  name: string;
  category: string;
  base_price: number;
  images: string[];
}

async function fetchAllCardLinks(): Promise<CardLink[]> {
  try {
    await connectToDatabase();
    const docs = await Card.find({}, 'slug name category base_price images')
      .sort({ name: 1 })
      .lean();
    return docs.map((doc) => ({
      slug: doc.slug,
      name: doc.name,
      category: doc.category,
      base_price: doc.base_price,
      images: doc.images ?? [],
    }));
  } catch {
    return [];
  }
}

export default async function AllCardsPage() {
  const cards = await fetchAllCardLinks();
  const pageUrl = `${SITE_URL}/cards`;

  return (
    <>
      <Navbar />
      <JsonLd
        id="ld-all-cards"
        data={[
          collectionPageLd({
            name: 'All Wedding Cards',
            description: metadata.description as string,
            url: pageUrl,
            itemUrls: cards.map((c) => absoluteUrl(`/product/${c.slug}`)),
          }),
          breadcrumbLd([
            { name: 'Home', url: SITE_URL },
            { name: 'All Wedding Cards', url: pageUrl },
          ]),
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
            <li className="text-charcoal/80">All Wedding Cards</li>
          </ol>
        </nav>

        <section className="bg-ivory border-b border-cream-dark section-padding">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-charcoal-dark mb-6">
              All Wedding Cards
            </h1>
            <p className="text-charcoal/60 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              Every Shahi Bulawa design in one place — {cards.length} cards across Nikkah,
              Valima, Mehndi and Baraat, in Floral, Modern, Classic, Luxury, Minimalist and
              Textured styles.
            </p>
          </div>
        </section>

        <section className="section-padding bg-ivory">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {cards.map((c) => (
                <Link
                  key={c.slug}
                  href={`/product/${c.slug}`}
                  className="group block rounded-xl overflow-hidden border border-cream-dark/50 hover:border-champagne/30 hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative aspect-[3/4] bg-cream">
                    <CardTileSlider images={c.images} alt={c.name} />
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-champagne">
                        {c.category}
                      </span>
                      <span className="text-sm font-bold text-black whitespace-nowrap">
                        PKR {c.base_price.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-charcoal-dark mt-1 leading-snug line-clamp-2">
                      {c.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-16 pt-10 border-t border-cream-dark">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-champagne mb-4">
                Browse by style
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
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

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-champagne mb-4">
                Browse by event
              </p>
              <div className="flex flex-wrap gap-3">
                {EVENT_LANDING.map((e) => (
                  <Link
                    key={e.slug}
                    href={`/event/${e.slug}`}
                    className="px-5 py-2 text-sm font-medium bg-cream text-charcoal/70 hover:bg-champagne hover:text-white rounded-full border border-cream-dark transition-all duration-300"
                  >
                    {e.h1.replace(' in Karachi', '')}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
