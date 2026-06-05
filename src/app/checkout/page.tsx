import type { Metadata } from "next";
import { notFound } from "next/navigation";
import connectToDatabase from "@/lib/mongodb";
import Card from "@/lib/models/Card";
import type { CardProduct } from "@/types";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Customize and order your wedding cards.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/checkout" },
};

export const dynamic = "force-dynamic";

async function fetchCard(slug: string): Promise<CardProduct | null> {
  try {
    await connectToDatabase();
    const doc = await Card.findOne({ slug }).lean();
    if (!doc) return null;
    return {
      id: String(doc._id),
      slug: doc.slug,
      name: doc.name,
      base_price: doc.base_price,
      original_price: doc.original_price,
      inner_card_price: doc.inner_card_price,
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
    } as CardProduct;
  } catch (err) {
    console.error("Failed to fetch card for checkout:", err);
    return null;
  }
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const slug = typeof params.slug === "string" ? params.slug : "";
  let qty = typeof params.qty === "string" ? parseInt(params.qty, 10) : 100;
  if (isNaN(qty) || qty < 1) {
    qty = 100;
  } else {
    qty = Math.min(qty, 10000);
  }
  const addons =
    typeof params.addons === "string"
      ? params.addons.split(",").filter(Boolean)
      : [];

  if (!slug) notFound();

  const card = await fetchCard(slug);
  if (!card) notFound();

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <nav className="flex items-center gap-2 text-xs text-charcoal/50">
            <Link href="/" className="hover:text-champagne transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link
              href={`/product/${slug}`}
              className="hover:text-champagne transition-colors"
            >
              {card.name}
            </Link>
            <span>/</span>
            <span className="text-charcoal font-medium">Checkout</span>
          </nav>
        </div>
        <CheckoutClient card={card} initialQty={qty} initialAddOnIds={addons} />
      </main>
      <Footer />
    </>
  );
}
