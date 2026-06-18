/**
 * One-off script: rewrites the `URL Slug` column in SEO.csv to match the LIVE
 * MongoDB slugs (CSV slugs currently use a `<descriptive>-<cardcode>` pattern
 * that diverges from the indexed `<descriptive>-karachi` live slugs).
 *
 * Match is by card_code (case-insensitive) — slug bases are not a reliable
 * string transform between the two systems, so card_code is the only safe join.
 *
 * Run: npx tsx src/scripts/sync-slugs-to-csv.ts
 */

import fs from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shahi-bulawa';
const CSV_PATH = path.resolve(process.cwd(), 'SEO.csv');
// Optional override so this can be run read-only against SEO.csv and write
// the result elsewhere (e.g. when SEO.csv isn't writable by the current user).
const OUT_PATH = process.argv[2] ? path.resolve(process.argv[2]) : CSV_PATH;

// ── RFC-4180 state-machine CSV parser (same as build-seo-data.ts) ───────────

function parseCsv(raw: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuote = false;

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    const next = raw[i + 1];

    if (inQuote) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuote = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuote = true;
      } else if (ch === ',') {
        row.push(field);
        field = '';
      } else if (ch === '\r' && next === '\n') {
        row.push(field);
        field = '';
        rows.push(row);
        row = [];
        i++;
      } else if (ch === '\n') {
        row.push(field);
        field = '';
        rows.push(row);
        row = [];
      } else {
        field += ch;
      }
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

// ── Serialise back to RFC-4180 (quote every field containing comma/quote/newline) ──

function serialiseCsv(rows: string[][]): string {
  return rows
    .map((row) =>
      row
        .map((field) => {
          if (/[",\n\r]/.test(field)) {
            return `"${field.replace(/"/g, '""')}"`;
          }
          return field;
        })
        .join(','),
    )
    .join('\r\n');
}

const CardSchema = new mongoose.Schema(
  { card_code: String, slug: String },
  { strict: false },
);
const CardModel = mongoose.models.Card || mongoose.model('Card', CardSchema);

async function main() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`SEO.csv not found at ${CSV_PATH}`);
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);

  const cards = await CardModel.find({}, { card_code: 1, slug: 1 }).lean();
  const slugByCode = new Map<string, string>();
  for (const c of cards) {
    const code = ((c as { card_code?: string }).card_code ?? '').trim().toUpperCase();
    const slug = (c as { slug?: string }).slug ?? '';
    if (code) slugByCode.set(code, slug);
  }

  const raw = fs.readFileSync(CSV_PATH, 'utf-8');
  const [headerRow, ...dataRows] = parseCsv(raw);

  const codeIdx = headerRow.indexOf('Card Code');
  const slugIdx = headerRow.indexOf('URL Slug');
  if (codeIdx === -1 || slugIdx === -1) {
    console.error('Could not find "Card Code" or "URL Slug" column in SEO.csv header');
    process.exit(1);
  }

  let updated = 0;
  const missingInDb: string[] = [];

  for (const row of dataRows) {
    const code = (row[codeIdx] ?? '').trim().toUpperCase();
    if (!code) continue; // skip blank trailing rows

    const liveSlug = slugByCode.get(code);
    if (!liveSlug) {
      missingInDb.push(code);
      continue;
    }

    const newValue = `/product/${liveSlug}`;
    if (row[slugIdx] !== newValue) {
      console.log(`  ${code}: "${row[slugIdx]}" -> "${newValue}"`);
      row[slugIdx] = newValue;
      updated++;
    }
  }

  // Cards in DB with no CSV row at all
  const csvCodes = new Set(
    dataRows.map((r) => (r[codeIdx] ?? '').trim().toUpperCase()).filter(Boolean),
  );
  const missingInCsv: string[] = [];
  for (const [code] of slugByCode) {
    if (!csvCodes.has(code)) missingInCsv.push(code);
  }

  fs.writeFileSync(OUT_PATH, serialiseCsv([headerRow, ...dataRows]), 'utf-8');
  console.log(`\nWrote updated CSV to: ${OUT_PATH}`);

  console.log('\n── Sync report ──────────────────────────────');
  console.log(`  rows updated:    ${updated}`);
  console.log(`  missing-in-db:   ${missingInDb.length > 0 ? missingInDb.join(', ') : 'none'}`);
  console.log(`  missing-in-csv:  ${missingInCsv.length > 0 ? missingInCsv.join(', ') : 'none'}`);
  console.log('─────────────────────────────────────────────');

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
