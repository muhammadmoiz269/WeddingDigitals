import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BRAND, NAP } from '@/lib/site';
import { WHATSAPP_DISPLAY } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Terms and conditions for ordering wedding cards from Shahi Bulawa — pricing, customisation, payment, delivery and returns.',
  alternates: {
    canonical: '/terms',
    languages: { 'en-PK': '/terms', 'x-default': '/terms' },
  },
};

export default function TermsPage() {
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
            <li className="text-charcoal/80">Terms of Service</li>
          </ol>
        </nav>

        <section className="section-padding bg-ivory">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-charcoal-dark mb-8">
              Terms of Service
            </h1>

            <div className="space-y-8 text-sm sm:text-base text-charcoal/70 leading-relaxed">
              <p>
                These terms apply to orders placed with {BRAND.legalName} (&quot;
                {BRAND.name}&quot;) through our website or via WhatsApp. By placing an order,
                you agree to the terms below.
              </p>

              <div>
                <h2 className="font-heading text-xl font-semibold text-charcoal-dark mb-3">
                  Orders &amp; customisation
                </h2>
                <p>
                  Orders are placed by submitting your card details through our checkout flow.
                  We confirm your order, design and quantity directly with you over WhatsApp
                  before printing begins. A free digital mockup is shared for your approval; we
                  do not begin printing until you confirm the proof.
                </p>
              </div>

              <div>
                <h2 className="font-heading text-xl font-semibold text-charcoal-dark mb-3">
                  Pricing &amp; payment
                </h2>
                <p>
                  Prices shown on the website are per card and exclude any add-on events or
                  customisations selected at checkout. We do not process online payments —
                  payment (full or deposit, as agreed) is collected directly by our team via
                  the methods we share with you on WhatsApp once your order is confirmed.
                </p>
              </div>

              <div>
                <h2 className="font-heading text-xl font-semibold text-charcoal-dark mb-3">
                  Delivery
                </h2>
                <p>
                  We print and dispatch from our {NAP.city} studio with a typical turnaround of
                  3–7 working days from design approval, depending on quantity and finish.
                  Delivery timelines for areas outside {NAP.city} may vary and will be
                  confirmed at the time of order.
                </p>
              </div>

              <div>
                <h2 className="font-heading text-xl font-semibold text-charcoal-dark mb-3">
                  Cancellations &amp; returns
                </h2>
                <p>
                  Because every card is custom-printed with your names and event details,
                  orders cannot be cancelled or returned once you have approved the design
                  proof and printing has started. If you notice a printing error that does not
                  match your approved proof, contact us within 48 hours of delivery and we will
                  arrange a reprint at no extra cost.
                </p>
              </div>

              <div>
                <h2 className="font-heading text-xl font-semibold text-charcoal-dark mb-3">
                  Contact us
                </h2>
                <p>
                  Questions about an order or these terms can be sent to us on WhatsApp at{' '}
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
