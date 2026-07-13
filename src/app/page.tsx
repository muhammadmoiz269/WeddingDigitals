import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import InfiniteProductGrid from "@/components/InfiniteProductGrid";
import NoScriptProductLinks from "@/components/NoScriptProductLinks";
import Footer from "@/components/Footer";
import FaqAccordion from "@/components/FaqAccordion";
import GoogleReviews from "@/components/GoogleReviews";
import JsonLd from "@/components/JsonLd";
import { FAQ_HOME } from "@/lib/faqs";
import { faqPageLd } from "@/lib/jsonld";
import connectToDatabase from "@/lib/mongodb";
import Card from "@/lib/models/Card";
import type { CardProduct } from "@/types";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { fetchGoogleReviews } from "@/lib/server/googleReviews";

async function fetchAllSlugs(): Promise<{ slug: string; name: string }[]> {
  try {
    await connectToDatabase();
    const docs = await Card.find({}, "slug name").lean();
    return docs.map((doc) => ({ slug: doc.slug, name: doc.name }));
  } catch {
    return [];
  }
}

// ISR: revalidate every 30 minutes so new/updated cards appear without a
// full redeploy while the initial HTML (with the first batch) stays cached.
export const revalidate = 1800;

async function fetchInitialCards(): Promise<{
  cards: CardProduct[];
  total: number;
}> {
  try {
    await connectToDatabase();
    const [docs, total] = await Promise.all([
      Card.find({})
        .sort({ is_bestseller: -1, is_new: -1, created_at: -1 })
        .limit(ITEMS_PER_PAGE)
        .lean(),
      Card.countDocuments({}),
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
          id: a.name.toLowerCase().replace(/\s+/g, "-"),
          name: a.name,
          price: a.price,
          description: a.description,
        }),
      ),
      meta_title: doc.meta_title,
      meta_description: doc.meta_description,
      image_alt_text: doc.image_alt_text,
    }));

    return { cards, total };
  } catch {
    return { cards: [], total: 0 };
  }
}

export default async function Home() {
  const [{ cards: initialCards, total: initialTotal }, allSlugs, reviewData] =
    await Promise.all([fetchInitialCards(), fetchAllSlugs(), fetchGoogleReviews()]);

  console.log("REVIEWS", reviewData)

  return (
    <>
      <JsonLd id="ld-faq-home" data={[faqPageLd(FAQ_HOME)]} />
      <Navbar />
      <main className="flex-1">
        <Hero />
        <InfiniteProductGrid
          initialCards={initialCards}
          initialTotal={initialTotal}
        />
        <NoScriptProductLinks cards={allSlugs} />
        <Features />
        <GoogleReviews
          reviews={reviewData.reviews}
          rating={reviewData.rating}
          totalRatings={reviewData.totalRatings}
        />
        <FaqAccordion faqs={FAQ_HOME} />
      </main>
      <Footer />
    </>
  );
}
