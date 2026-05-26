/**
 * One-off script: syncs slugs in MongoDB to match SEO.csv (CSV slug wins).
 * Match is by card_code (case-insensitive).
 *
 * Run once after build-seo-data.ts:
 *   npm run build:seo && npx tsx src/scripts/sync-csv-slugs.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'node:path';
import { SEO_PRODUCTS } from '../data/seo-products';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shahi-bulawa';

const CardSchema = new mongoose.Schema(
  { card_code: String, slug: String, name: String },
  { strict: false }
);
const CardModel = mongoose.model('Card', CardSchema);

async function main() {
  await mongoose.connect(MONGODB_URI);

  let updated = 0;
  const missingInDb: string[] = [];
  const missingInCsv: string[] = [];

  for (const row of SEO_PRODUCTS) {
    const doc = await CardModel.findOne({
      card_code: { $regex: new RegExp(`^${row.cardCode}$`, 'i') },
    }).lean();

    if (!doc) {
      missingInDb.push(row.cardCode);
      continue;
    }

    const current = (doc as { slug?: string }).slug ?? '';
    if (current !== row.slug) {
      await CardModel.findOneAndUpdate(
        { card_code: { $regex: new RegExp(`^${row.cardCode}$`, 'i') } },
        { $set: { slug: row.slug } }
      );
      console.log(`  updated ${row.cardCode}: "${current}" → "${row.slug}"`);
      updated++;
    }
  }

  // Cards in DB with no CSV row
  const allCards = await CardModel.find({}, { card_code: 1, slug: 1 }).lean();
  const csvCodes = new Set(SEO_PRODUCTS.map((p) => p.cardCode.toUpperCase()));
  for (const card of allCards) {
    const code = ((card as { card_code?: string }).card_code ?? '').toUpperCase();
    if (code && !csvCodes.has(code)) {
      missingInCsv.push(code);
    }
  }

  console.log('\n── Sync report ──────────────────────────────');
  console.log(`  updated:         ${updated}`);
  console.log(`  missing-in-db:   ${missingInDb.length > 0 ? missingInDb.join(', ') : 'none'}`);
  console.log(`  missing-in-csv:  ${missingInCsv.length > 0 ? missingInCsv.join(', ') : 'none'}`);
  console.log('─────────────────────────────────────────────');

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
