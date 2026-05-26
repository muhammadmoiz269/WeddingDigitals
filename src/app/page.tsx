import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import FaqAccordion from "@/components/FaqAccordion";
import JsonLd from "@/components/JsonLd";
import { FAQ_HOME } from "@/lib/faqs";
import { faqPageLd } from "@/lib/jsonld";

interface HomeProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const initialPage = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  return (
    <>
      <JsonLd id="ld-faq-home" data={[faqPageLd(FAQ_HOME)]} />
      <Navbar />
      <main className="flex-1">
        <Hero />
        <ProductGrid initialPage={initialPage} />
        <Features />
        <FaqAccordion faqs={FAQ_HOME} heading="Frequently Asked Questions" />
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
