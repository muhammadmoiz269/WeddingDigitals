/**
 * Assign curated cards to event pages.
 *
 * Run with:   npx tsx src/scripts/assign-event-cards.ts
 *
 * backfill-events.ts only tags these events when the card name contains the
 * keyword, which left /event/nikkah-cards-karachi, /event/mehndi-cards-karachi
 * and /event/engagement-cards-karachi empty, and cards added after the backfill
 * had no events at all. This script adds a hand-picked set of suitable cards
 * to each event using $addToSet, so existing event tags are kept and the
 * script is safe to re-run.
 *
 * NOTE: re-running backfill-events.ts afterwards will overwrite these tags,
 * because it $sets events from the card name alone.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/shahi-bulawa';

// ─── Curated assignments (by slug) ────────────────────────────────────────────

const ASSIGNMENTS: Record<
  'Nikkah' | 'Mehndi' | 'Engagement' | 'Baraat' | 'Valima',
  string[]
> = {
  // Formal, gold-accented, monogram / Mughal / geometric designs
  Nikkah: [
    'black-and-gold-foil-nikkah-card-and-wedding-invitation-with-geometric-leaf-wreath',
    'ivory-gold-foil-monogram-crest-shadi-card-with-tassel',
    'mughal-arch-wedding-card-with-gold-foil-printing-in-karachi-shahi-bulawa',
    'black-acrylic-wedding-card-with-gold-foil-printing-in-karachi-shahi-bulawa',
    'clear-acrylic-wedding-card-with-gold-foil-flowers-in-karachi-shahi-bulawa',
    'marble-gold-monogram-wreath-wedding-card-karachi',
    'gold-wreath-ring-rose-wedding-invitation-card-karachi',
    'quatrefoil-lattice-wedding-ceremony-card-karachi',
    'sage-green-floral-spray-wedding-invitation-card-karachi',
    'embossed-grid-navy-velvet-invitation-card-karachi',
  ],
  // Colourful, festive, green / floral / playful designs
  Mehndi: [
    'arch-shaped-white-rose-mehndi-invitation-card-with-dholak-and-bride-illustrations',
    'green-frosted-acrylic-wedding-card-with-gold-arch-vines-in-karachi-shahi-bulawa',
    'lilac-vellum-wedding-card-with-mix-flowers-print-in-karachi-shahi-bulawa',
    'royal-blue-and-pink-floral-wedding-card-with-wave-cut-pouch-in-karachi-shahi-bulawa',
    'terracotta-floral-wedding-card-with-arch-frame-in-karachi-shahi-bulawa',
    'watercolor-floral-wedding-card-with-ornate-frame-in-karachi-shahi-bulawa',
    'die-cut-window-floral-wedding-card-with-gold-foil-in-karachi-shahi-bulawa',
    'eucalyptus-bottlebrush-landscape-wedding-card-karachi',
    'love-heart-tree-landscape-wedding-card-set-karachi',
    'red-rose-velvet-band-invitation-card-karachi',
  ],
  // Romantic, couple-themed and save-the-date designs
  Engagement: [
    'watercolour-couple-floral-arch-wedding-card',
    'floral-arch-couple-watercolour-wedding-card',
    'lakeside-dock-save-the-date-wedding-card',
    'sage-circle-monogram-save-the-date-card-karachi',
    'marble-cherry-blossom-save-the-date-card-karachi',
    'single-tulip-stem-monogram-save-the-date-card-karachi',
    'gold-diamond-frame-rose-save-the-date-card-karachi',
    'blush-rose-wedding-invitation-card-shahi-bulawa-karachi',
    'blush-pink-and-blue-floral-wedding-card-with-oval-frame-in-karachi-shahi-bulawa',
    'pastel-floral-wedding-card-with-gold-foil-window-in-karachi-shahi-bulawa',
    'minimalist-save-the-date-wedding-card-with-gold-leaf-pouch-in-karachi-shahi-bulawa',
  ],
  // Previously untagged main wedding invitations
  Baraat: [
    'watercolour-wildflower-barat-invitation-card-with-dried-flowers-and-wooden-monogram',
    'red-frosted-acrylic-wedding-card-with-gold-foil-vines-in-karachi-shahi-bulawa',
    'dark-maroon-vellum-wedding-card-with-plum-flowers-print-in-karachi-shahi-bulawa',
    'blue-watercolor-wedding-card-with-elegant-floral-envelope-in-karachi-shahi-bulawa',
    'blue-watercolor-floral-wedding-card-with-gold-highlights-in-karachi-shahi-bulawa',
    'frosted-acrylic-wedding-card-with-textured-navy-pouch-in-karachi-shahi-bulawa',
    'elegant-floral-shadi-card-with-vellum-and-dried-flowers-shahi-bulawa-krachi',
    'travel-themed-wedding-passport-invitation-with-boarding-pass-event-tickets',
    'frosted-pvc-wedding-invitation-with-gold-foil-lily-and-smoky-grey-jacket',
    'clear-pvc-wedding-invitation-with-white-vines-and-charcoal-save-the-date-sleeve',
    'white-rose-gazebo-gatefold-pakistani-wedding-invitation-card',
  ],
  // Previously untagged Walima invitations
  Valima: [
    'clear-pvc-walima-card-with-dried-flower-save-the-date-calendar-sleeve',
    'navy-blue-pocket-folder-walima-invitation-with-gold-foil-lily-and-watercolour-roses',
    'burgundy-gold-foil-monogram-crest-walima-invitation-card',
    'blush-pink-floral-wreath-save-the-date-envelope-and-walima-invitation',
    'cherry-blossom-watercolour-save-the-date-and-walima-invitation-with-gold-foil',
    'terracotta-envelope-folder-walima-invitation-with-blush-watercolour-and-gold-foil-leaves',
  ],
};

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Connecting to MongoDB…');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected!\n');

  const cards = mongoose.connection.collection('cards');
  let missing = 0;

  for (const [event, slugs] of Object.entries(ASSIGNMENTS)) {
    const found = await cards
      .find({ slug: { $in: slugs } }, { projection: { slug: 1 } })
      .toArray();
    const foundSlugs = new Set(found.map((c) => c.slug as string));
    for (const slug of slugs) {
      if (!foundSlugs.has(slug)) {
        console.warn(`  [${event}] slug not found: ${slug}`);
        missing++;
      }
    }

    const res = await cards.updateMany(
      { slug: { $in: slugs } },
      { $addToSet: { events: event } },
    );
    const total = await cards.countDocuments({ events: event });
    console.log(
      `${event.padEnd(12)}: matched ${res.matchedCount}, updated ${res.modifiedCount}, now ${total} card(s)`,
    );
  }

  if (missing > 0) console.warn(`\n${missing} slug(s) were not found.`);
  console.log('\nDone!\n');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Assignment failed:', err);
  process.exit(1);
});
