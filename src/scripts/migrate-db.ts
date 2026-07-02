/**
 * Migrate data from an old MongoDB instance into the current one.
 *
 * Copies cards, einvitations, savedtemplates, promocodes, and orders.
 * `admins` is intentionally excluded — the target keeps its own admin user
 * (create one with the seed script if needed).
 *
 * Upserts by _id, so the script is safely re-runnable: docs already copied
 * are overwritten with the source version, and docs that exist only in the
 * target are left untouched.
 *
 * Run with:
 *   OLD_MONGODB_URI='mongodb+srv://...old-instance...' npx tsx src/scripts/migrate-db.ts
 *
 * The target is MONGODB_URI from .env.local.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const OLD_URI = process.env.OLD_MONGODB_URI;
const NEW_URI = process.env.MONGODB_URI;

const COLLECTIONS = ["cards", "einvitations", "savedtemplates", "promocodes", "orders"];

async function main() {
  if (!OLD_URI) {
    console.error("❌ Set OLD_MONGODB_URI to the source instance's connection string.");
    process.exit(1);
  }
  if (!NEW_URI) {
    console.error("❌ MONGODB_URI (target) is missing from .env.local.");
    process.exit(1);
  }

  console.log("🔌 Connecting to source and target…");
  const oldConn = await mongoose.createConnection(OLD_URI).asPromise();
  const newConn = await mongoose.createConnection(NEW_URI).asPromise();
  console.log("✅ Connected!\n");

  for (const name of COLLECTIONS) {
    const docs = await oldConn.db!.collection(name).find({}).toArray();
    if (docs.length === 0) {
      console.log(`  ${name}: nothing to copy`);
      continue;
    }
    let copied = 0;
    for (const doc of docs) {
      await newConn.db!.collection(name).replaceOne({ _id: doc._id }, doc, { upsert: true });
      copied++;
    }
    console.log(`  ${name}: copied ${copied} docs`);
  }

  console.log("\n📊 Target DB counts after migration:");
  for (const name of COLLECTIONS) {
    console.log(`  ${name}: ${await newConn.db!.collection(name).countDocuments()}`);
  }

  await oldConn.close();
  await newConn.close();
  console.log("\n✨ All done!\n");
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
