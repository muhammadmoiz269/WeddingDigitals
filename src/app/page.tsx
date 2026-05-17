import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

interface HomeProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const initialPage = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <ProductGrid initialPage={initialPage} />
        <Features />
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
