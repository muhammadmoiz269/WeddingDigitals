import type { Faq } from '@/lib/faqs';

interface Props {
  faqs: Faq[];
  heading?: string;
}

export default function FaqAccordion({ faqs, heading = 'Frequently Asked Questions' }: Props) {
  return (
    <section className="section-padding bg-ivory border-t border-cream-dark" aria-label={heading}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-champagne mb-3">
            FAQ
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-charcoal-dark">
            {heading}
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-champagne to-champagne-light mx-auto mt-4" />
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="group bg-white rounded-xl border border-cream-dark/60 overflow-hidden"
            >
              <summary className="flex items-center justify-between gap-4 px-6 py-4 cursor-pointer text-sm font-semibold text-charcoal-dark hover:text-champagne-dark transition-colors duration-200 list-none [&::-webkit-details-marker]:hidden">
                <span>{faq.question}</span>
                <svg
                  className="w-4 h-4 text-champagne flex-shrink-0 transition-transform duration-300 group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 pb-5 pt-1 text-sm text-charcoal/65 leading-relaxed border-t border-cream-dark/40">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
