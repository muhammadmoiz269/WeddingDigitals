/**
 * Re-runnable script: pushes SEO.csv's Title / Meta Description / Image Alt Text
 * into the matching Card document's meta_title / meta_description / image_alt_text
 * fields, by card_code. Listing grids (InfiniteProductGrid, InfiniteCardGrid) read
 * these DB columns directly rather than the CSV-derived seo-products.ts.
 *
 * Run: npx tsx src/scripts/sync-csv-seo-to-db.ts
 */

import path from 'node:path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { SEO_PRODUCTS } from '../data/seo-products';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shahi-bulawa';

const CardSchema = new mongoose.Schema(
  { card_code: String, meta_title: String, meta_description: String, image_alt_text: String },
  { strict: false },
);
const CardModel = mongoose.models.Card || mongoose.model('Card', CardSchema);

async function main() {
  await mongoose.connect(MONGODB_URI);

  let updated = 0;
  const missingInDb: string[] = [];

  for (const p of SEO_PRODUCTS) {
    const result = await CardModel.findOneAndUpdate(
      { card_code: { $regex: new RegExp(`^${p.cardCode}$`, 'i') } },
      {
        $set: {
          meta_title: p.title,
          meta_description: p.metaDescription,
          image_alt_text: p.imageAlt,
        },
      },
    );

    if (!result) {
      missingInDb.push(p.cardCode);
      continue;
    }
    updated++;
  }

  console.log('\n── Sync report ──────────────────────────────');
  console.log(`  cards updated:   ${updated}`);
  console.log(`  missing-in-db:   ${missingInDb.length > 0 ? missingInDb.join(', ') : 'none'}`);
  console.log('─────────────────────────────────────────────');

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
