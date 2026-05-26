/**
 * Backfill events field on existing Card documents.
 *
 * Run with:   npx tsx src/scripts/backfill-events.ts
 *
 * Infers which wedding events each card applies to based on its name and slug.
 * Generic cards (no specific event keyword) are assigned Baraat and Valima.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/shahi-bulawa';

// ─── Inline schema (avoids Next.js alias issues in standalone script) ─────────

const CardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    card_code: { type: String, trim: true, uppercase: true, sparse: true },
    base_price: { type: Number, required: true, min: 0 },
    original_price: { type: Number, min: 0 },
    category: {
      type: String,
      required: true,
      enum: ['Luxury', 'Classic', 'Modern', 'Minimalist', 'Floral', 'Textured'],
    },
    description: { type: String, required: true },
    images: { type: [String], required: true },
    short_video_url: { type: String, trim: true },
    is_new: { type: Boolean, default: false },
    is_bestseller: { type: Boolean, default: false },
    min_order: { type: Number, default: 50, min: 1 },
    add_ons: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        description: { type: String, default: '' },
      },
    ],
    events: {
      type: [String],
      enum: ['Nikkah', 'Valima', 'Mehndi', 'Baraat', 'Engagement'],
      default: [],
    },
    meta_title: { type: String, trim: true },
    meta_description: { type: String, trim: true },
    image_alt_text: { type: String, trim: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

const Card = mongoose.models.Card || mongoose.model('Card', CardSchema);

// ─── Event inference ──────────────────────────────────────────────────────────

function inferEvents(card: { name: string; slug: string }): string[] {
  const text = `${card.name} ${card.slug}`.toLowerCase();
  const events: string[] = [];
  if (/nikkah|nikah/.test(text)) events.push('Nikkah');
  if (/walima|valima/.test(text)) events.push('Valima');
  if (/mehndi|mehendi/.test(text)) events.push('Mehndi');
  if (/barat|baraat|wedding/.test(text)) events.push('Baraat');
  if (/engagement|nisbat|mangni/.test(text)) events.push('Engagement');
  if (events.length === 0) events.push('Baraat', 'Valima'); // generic cards suit both
  return events;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Connecting to MongoDB…');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected!\n');

  const cards = await Card.find({}).lean() as Array<{ _id: unknown; name: string; slug: string; events?: string[] }>;

  if (cards.length === 0) {
    console.log('No cards found in database. Run the seed script first.');
    await mongoose.disconnect();
    process.exit(0);
  }

  console.log(`Found ${cards.length} card(s). Inferring events...\n`);

  // Print header
  const colW = [40, 30, 30];
  const header = [
    'Card Name'.padEnd(colW[0]),
    'Old Events'.padEnd(colW[1]),
    'New Events'.padEnd(colW[2]),
  ].join(' | ');
  console.log(header);
  console.log('-'.repeat(header.length));

  let updated = 0;
  let unchanged = 0;

  for (const card of cards) {
    const oldEvents = Array.isArray(card.events) ? card.events : [];
    const newEvents = inferEvents(card);

    const oldStr = oldEvents.length > 0 ? oldEvents.join(', ') : '(none)';
    const newStr = newEvents.join(', ');

    console.log(
      [
        card.name.slice(0, colW[0] - 1).padEnd(colW[0]),
        oldStr.slice(0, colW[1] - 1).padEnd(colW[1]),
        newStr.slice(0, colW[2] - 1).padEnd(colW[2]),
      ].join(' | '),
    );

    await Card.updateOne(
      { _id: card._id },
      { $set: { events: newEvents } },
    );

    const changed =
      oldEvents.length !== newEvents.length ||
      newEvents.some((e) => !oldEvents.includes(e));

    if (changed) {
      updated++;
    } else {
      unchanged++;
    }
  }

  console.log('\n' + '-'.repeat(header.length));
  console.log(`\nBackfill complete.`);
  console.log(`  Total cards processed : ${cards.length}`);
  console.log(`  Cards updated         : ${updated}`);
  console.log(`  Cards already current : ${unchanged}`);

  // Summary by event
  const eventCounts: Record<string, number> = {
    Nikkah: 0,
    Valima: 0,
    Mehndi: 0,
    Baraat: 0,
    Engagement: 0,
  };
  for (const card of cards) {
    const events = inferEvents(card);
    for (const e of events) {
      if (e in eventCounts) eventCounts[e]++;
    }
  }
  console.log('\nCards per event (after backfill):');
  for (const [event, count] of Object.entries(eventCounts)) {
    console.log(`  ${event.padEnd(12)}: ${count}`);
  }

  console.log('\nDone!\n');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
