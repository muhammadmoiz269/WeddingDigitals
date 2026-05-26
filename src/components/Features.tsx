import { features } from '@/data/features';
import FeatureCards from './FeatureCards';

export default function Features() {
  return (
    <section id="about" className="section-padding bg-cream">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-champagne mb-4">
            The Shahi Bulawa Promise
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-charcoal-dark mb-4">
            Where Every Detail Tells{' '}
            <span className="text-gold-gradient">Your Story</span>
          </h2>
          <div className="w-20 h-0.5 bg-gradient-to-r from-champagne to-champagne-light mx-auto mb-6" />
          <p className="max-w-lg mx-auto text-charcoal/60 text-sm sm:text-base">
            Boutique craftsmanship, transparent pricing, and a personal touch —
            because your wedding invitation is the first chapter of your love story.
          </p>
        </div>
        <FeatureCards features={features} />
      </div>
    </section>
  );
}
