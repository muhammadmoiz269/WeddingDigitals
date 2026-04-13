/**
 * Seed script — pushes card products + admin user into MongoDB.
 *
 * Run with:   npx tsx src/scripts/seed.ts
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";

// Load env from project root
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/paighaam";

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
      enum: ["Nikkah", "Barat", "Valima", "Mehndi", "Luxury", "Minimalist"],
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
        description: { type: String, default: "" },
      },
    ],
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const Card = mongoose.models.Card || mongoose.model("Card", CardSchema);

// ─── Admin schema ─────────────────────────────────────────────────────────────

const AdminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    session_token: { type: String, default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

// ─── Static seed data ─────────────────────────────────────────────────────────

const seedCards = [
  {
    slug: "mughal-floral-velvet",
    name: "Mughal Floral Velvet Card",
    base_price: 350,
    original_price: 500,
    category: "Luxury",
    description:
      "Hand-finished velvet card with intricate Mughal floral motifs and gold foil detailing. Includes matching envelope with wax seal. A timeless choice for grand Karachi weddings.",
    images: ["/images/card-1.jpg", "/images/card-1.jpg"],
    is_new: false,
    is_bestseller: true,
    min_order: 100,
    add_ons: [
      { name: "Gold Foil Stamping", price: 45, description: "Real 24K gold foil pressed onto card surface" },
      { name: "Custom Wax Seal", price: 30, description: "Personalized wax seal with your initials" },
      { name: "Satin Ribbon Tie", price: 20, description: "Premium satin ribbon in matching color" },
      { name: "Printed Envelope Liner", price: 25, description: "Custom pattern printed inside envelope" },
    ],
  },
  {
    slug: "minimalist-nikkah-invite",
    name: "Minimalist Nikkah Invite",
    base_price: 120,
    category: "Nikkah",
    description:
      "Clean, modern design with elegant Urdu typography on premium 300gsm cotton card stock. Perfect for intimate Nikkah ceremonies. Simplicity at its finest.",
    images: ["/images/card-2.jpg", "/images/card-2.jpg"],
    is_new: true,
    is_bestseller: false,
    min_order: 50,
    add_ons: [
      { name: "Gold Foil Stamping", price: 45, description: "Real 24K gold foil pressed onto card surface" },
      { name: "Custom Wax Seal", price: 30, description: "Personalized wax seal with your initials" },
      { name: "RSVP Insert Card", price: 35, description: "Matching RSVP card with pre-paid envelope" },
    ],
  },
  {
    slug: "royal-baroque-gold-foil",
    name: "Royal Baroque Gold Foil Card",
    base_price: 450,
    original_price: 600,
    category: "Barat",
    description:
      "Luxurious baroque-inspired design with real gold foil stamping on Italian imported textured paper. A statement of grandeur for your Barat procession.",
    images: ["/images/card-3.jpg", "/images/card-3.jpg"],
    is_new: false,
    is_bestseller: true,
    min_order: 100,
    add_ons: [
      { name: "Gold Foil Stamping", price: 45, description: "Real 24K gold foil pressed onto card surface" },
      { name: "Custom Wax Seal", price: 30, description: "Personalized wax seal with your initials" },
      { name: "Satin Ribbon Tie", price: 20, description: "Premium satin ribbon in matching color" },
      { name: "Gift Box Packaging", price: 60, description: "Each card arrives in a luxury presentation box" },
    ],
  },
  {
    slug: "pastel-garden-watercolor",
    name: "Pastel Garden Watercolor Invite",
    base_price: 180,
    category: "Valima",
    description:
      "Delicate watercolor florals in soft pastels printed on handmade recycled paper. Includes RSVP card and directions insert. Perfect for elegant Valima receptions.",
    images: ["/images/card-4.jpg", "/images/card-4.jpg"],
    is_new: true,
    is_bestseller: false,
    min_order: 50,
    add_ons: [
      { name: "Gold Foil Stamping", price: 45, description: "Real 24K gold foil pressed onto card surface" },
      { name: "Custom Wax Seal", price: 30, description: "Personalized wax seal with your initials" },
      { name: "RSVP Insert Card", price: 35, description: "Matching RSVP card with pre-paid envelope" },
    ],
  },
  {
    slug: "classic-urdu-calligraphy",
    name: "Classic Urdu Calligraphy Card",
    base_price: 200,
    original_price: 280,
    category: "Nikkah",
    description:
      "Traditional Nastaliq calligraphy by master calligraphers, digitally printed on satin-finish card stock with embossed border. A nod to our rich heritage.",
    images: ["/images/card-5.jpg", "/images/card-5.jpg"],
    is_new: false,
    is_bestseller: true,
    min_order: 100,
    add_ons: [
      { name: "Gold Foil Stamping", price: 45, description: "Real 24K gold foil pressed onto card surface" },
      { name: "Custom Wax Seal", price: 30, description: "Personalized wax seal with your initials" },
      { name: "Printed Envelope Liner", price: 25, description: "Custom pattern printed inside envelope" },
    ],
  },
  {
    slug: "modern-geometric-walima",
    name: "Modern Geometric Walima Card",
    base_price: 150,
    category: "Valima",
    description:
      "Contemporary geometric patterns with metallic champagne accents. Flat-printed on thick matte stock with matching envelope liner.",
    images: ["/images/card-6.jpg", "/images/card-6.jpg"],
    is_new: false,
    is_bestseller: false,
    min_order: 50,
    add_ons: [
      { name: "Gold Foil Stamping", price: 45, description: "Real 24K gold foil pressed onto card surface" },
      { name: "Custom Wax Seal", price: 30, description: "Personalized wax seal with your initials" },
    ],
  },
  {
    slug: "mehndi-night-festive",
    name: "Mehndi Night Festive Card",
    base_price: 130,
    category: "Mehndi",
    description:
      "Vibrant mehndi-inspired patterns in green and gold. Playful yet elegant design for your Mehndi celebration invites.",
    images: ["/images/card-7.jpg", "/images/card-7.jpg"],
    is_new: true,
    is_bestseller: false,
    min_order: 50,
    add_ons: [
      { name: "Gold Foil Stamping", price: 45, description: "Real 24K gold foil pressed onto card surface" },
      { name: "Custom Wax Seal", price: 30, description: "Personalized wax seal with your initials" },
      { name: "Satin Ribbon Tie", price: 20, description: "Premium satin ribbon in matching color" },
    ],
  },
  {
    slug: "ivory-laser-cut",
    name: "Ivory Laser-Cut Pocket Card",
    base_price: 380,
    original_price: 500,
    category: "Luxury",
    description:
      "Precision laser-cut ivory pocket folder with satin ribbon tie. Contains main invite, RSVP, menu card, and map insert. The ultimate luxury statement.",
    images: ["/images/card-8.jpg", "/images/card-8.jpg"],
    is_new: false,
    is_bestseller: true,
    min_order: 100,
    add_ons: [
      { name: "Gold Foil Stamping", price: 45, description: "Real 24K gold foil pressed onto card surface" },
      { name: "Custom Wax Seal", price: 30, description: "Personalized wax seal with your initials" },
      { name: "Satin Ribbon Tie", price: 20, description: "Premium satin ribbon in matching color" },
      { name: "Gift Box Packaging", price: 60, description: "Each card arrives in a luxury presentation box" },
    ],
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Connecting to MongoDB…");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected!\n");

  let created = 0;
  let updated = 0;

  for (const card of seedCards) {
    const result = await Card.findOneAndUpdate(
      { slug: card.slug },
      { $set: card },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    const wasNew = result.created_at?.getTime() === result.updated_at?.getTime();
    if (wasNew) {
      created++;
      console.log(`  ➕ Created: ${card.name}`);
    } else {
      updated++;
      console.log(`  ✏️  Updated: ${card.name}`);
    }
  }

  console.log(`\n🎉 Cards seeded! ${created} created, ${updated} updated.`);
  console.log(`📊 Total cards in DB: ${await Card.countDocuments()}`);

  // ─── Seed admin user ──────────────────────────────────────────────────────

  console.log("\n👤 Seeding admin user…");
  const adminEmail = "admin@gmail.com";
  const adminPassword = "Pass123!";

  const existingAdmin = await Admin.findOne({ email: adminEmail });
  if (existingAdmin) {
    console.log(`  ✅ Admin already exists: ${adminEmail}`);
  } else {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    await Admin.create({ email: adminEmail, password: hashedPassword });
    console.log(`  ➕ Created admin: ${adminEmail}`);
  }

  console.log("\n✨ All done!\n");

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
