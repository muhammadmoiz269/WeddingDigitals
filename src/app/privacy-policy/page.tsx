import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BRAND, NAP } from '@/lib/site';
import { WHATSAPP_DISPLAY } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Shahi Bulawa collects, uses and protects your information when you order wedding cards via our website and WhatsApp.',
  alternates: {
    canonical: '/privacy-policy',
    languages: { 'en-PK': '/privacy-policy', 'x-default': '/privacy-policy' },
  },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <nav
          aria-label="Breadcrumb"
          className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4"
        >
          <ol className="flex items-center gap-2 text-xs text-charcoal/50">
            <li>
              <Link href="/" className="hover:text-champagne transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-charcoal/80">Privacy Policy</li>
          </ol>
        </nav>

        <section className="section-padding bg-ivory">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-charcoal-dark mb-8">
              Privacy Policy
            </h1>

            <div className="space-y-8 text-sm sm:text-base text-charcoal/70 leading-relaxed">
              <p>
                {BRAND.legalName} (&quot;{BRAND.name}&quot;, &quot;we&quot;, &quot;us&quot;)
                operates {NAP.city}-based wedding card design and printing services. This
                Privacy Policy explains what information we collect when you use our website
                or place an order, and how we use it.
              </p>

              <div>
                <h2 className="font-heading text-xl font-semibold text-charcoal-dark mb-3">
                  Information we collect
                </h2>
                <p>
                  When you place an order or contact us, we collect the details you provide:
                  your name, WhatsApp number, delivery address, the area of {NAP.city} you are
                  in, your card customisation text, and your preferred payment option. We do
                  not collect payment card details — orders are confirmed and paid for directly
                  with our team over WhatsApp.
                </p>
              </div>

              <div>
                <h2 className="font-heading text-xl font-semibold text-charcoal-dark mb-3">
                  How we use your information
                </h2>
                <p>
                  We use your details to process and fulfil your order, to contact you on
                  WhatsApp about your order status, design proofs and delivery, and to improve
                  our products and service. We do not sell your personal information to third
                  parties.
                </p>
              </div>

              <div>
                <h2 className="font-heading text-xl font-semibold text-charcoal-dark mb-3">
                  Cookies &amp; analytics
                </h2>
                <p>
                  Our website uses cookies and similar technologies from Google Analytics,
                  Vercel Analytics and Meta (Facebook) Pixel to understand how visitors use the
                  site and to measure the effectiveness of our advertising. These tools collect
                  anonymised usage data such as pages viewed and general location; they do not
                  give us access to your WhatsApp messages or order details.
                </p>
              </div>

              <div>
                <h2 className="font-heading text-xl font-semibold text-charcoal-dark mb-3">
                  Image uploads
                </h2>
                <p>
                  If you upload reference images during checkout, these are stored securely via
                  Cloudinary and used only to prepare your card design.
                </p>
              </div>

              <div>
                <h2 className="font-heading text-xl font-semibold text-charcoal-dark mb-3">
                  Data retention &amp; your rights
                </h2>
                <p>
                  We retain order information for as long as needed to fulfil your order and
                  meet our accounting obligations. You can ask us to update or delete your
                  information at any time by messaging us on WhatsApp at {WHATSAPP_DISPLAY}.
                </p>
              </div>

              <div>
                <h2 className="font-heading text-xl font-semibold text-charcoal-dark mb-3">
                  Contact us
                </h2>
                <p>
                  For any questions about this policy or your data, reach us on WhatsApp at{' '}
                  {WHATSAPP_DISPLAY} or by post at {NAP.street}, {NAP.city}, {NAP.region},
                  Pakistan.
                </p>
              </div>

              <p className="text-xs text-charcoal/40">Last updated: 2026.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
