import { CardProduct } from "@/types";

/**
 * Enriched product data matching the MongoDB Card schema.
 * Used as seed data and as a fallback when MongoDB is unavailable.
 */
export const cardProducts: CardProduct[] = [
  {
    id: "mughal-floral-velvet",
    slug: "mughal-floral-velvet",
    name: "Mughal Floral Velvet Card",
    base_price: 350,
    original_price: 500,
    category: "Luxury",
    description:
      "Hand-finished velvet card with intricate Mughal floral motifs and gold foil detailing. Includes matching envelope with wax seal. A timeless choice for grand Karachi weddings.",
    images: ["/images/card-1.jpg", "/images/card-1.jpg"],
    short_video_url: "https://res.cloudinary.com/demo/video/upload/v1/wedding-cards/mughal-floral-preview.mp4",
    is_new: false,
    is_bestseller: true,
    min_order: 100,
    add_ons: [
      { id: "gold-foil", name: "Gold Foil Stamping", price: 45, description: "Real 24K gold foil pressed onto card surface" },
      { id: "wax-seal", name: "Custom Wax Seal", price: 30, description: "Personalized wax seal with your initials" },
      { id: "ribbon", name: "Satin Ribbon Tie", price: 20, description: "Premium satin ribbon in matching color" },
      { id: "envelope-liner", name: "Printed Envelope Liner", price: 25, description: "Custom pattern printed inside envelope" },
    ],
  },
  {
    id: "minimalist-nikkah-invite",
    slug: "minimalist-nikkah-invite",
    name: "Minimalist Nikkah Invite",
    base_price: 120,
    category: "Nikkah",
    description:
      "Clean, modern design with elegant Urdu typography on premium 300gsm cotton card stock. Perfect for intimate Nikkah ceremonies. Simplicity at its finest.",
    images: ["/images/card-2.jpg", "/images/card-2.jpg"],
    short_video_url: "https://res.cloudinary.com/demo/video/upload/v1/wedding-cards/minimalist-nikkah-preview.mp4",
    is_new: true,
    is_bestseller: false,
    min_order: 50,
    add_ons: [
      { id: "gold-foil", name: "Gold Foil Stamping", price: 45, description: "Real 24K gold foil pressed onto card surface" },
      { id: "wax-seal", name: "Custom Wax Seal", price: 30, description: "Personalized wax seal with your initials" },
      { id: "rsvp-insert", name: "RSVP Insert Card", price: 35, description: "Matching RSVP card with pre-paid envelope" },
    ],
  },
  {
    id: "royal-baroque-gold-foil",
    slug: "royal-baroque-gold-foil",
    name: "Royal Baroque Gold Foil Card",
    base_price: 450,
    original_price: 600,
    category: "Barat",
    description:
      "Luxurious baroque-inspired design with real gold foil stamping on Italian imported textured paper. A statement of grandeur for your Barat procession.",
    images: ["/images/card-3.jpg", "/images/card-3.jpg"],
    short_video_url: "https://res.cloudinary.com/demo/video/upload/v1/wedding-cards/baroque-gold-preview.mp4",
    is_new: false,
    is_bestseller: true,
    min_order: 100,
    add_ons: [
      { id: "gold-foil", name: "Gold Foil Stamping", price: 45, description: "Real 24K gold foil pressed onto card surface" },
      { id: "wax-seal", name: "Custom Wax Seal", price: 30, description: "Personalized wax seal with your initials" },
      { id: "ribbon", name: "Satin Ribbon Tie", price: 20, description: "Premium satin ribbon in matching color" },
      { id: "box", name: "Gift Box Packaging", price: 60, description: "Each card arrives in a luxury presentation box" },
    ],
  },
  {
    id: "pastel-garden-watercolor",
    slug: "pastel-garden-watercolor",
    name: "Pastel Garden Watercolor Invite",
    base_price: 180,
    category: "Valima",
    description:
      "Delicate watercolor florals in soft pastels printed on handmade recycled paper. Includes RSVP card and directions insert. Perfect for elegant Valima receptions.",
    images: ["/images/card-4.jpg", "/images/card-4.jpg"],
    short_video_url: "https://res.cloudinary.com/demo/video/upload/v1/wedding-cards/pastel-garden-preview.mp4",
    is_new: true,
    is_bestseller: false,
    min_order: 50,
    add_ons: [
      { id: "gold-foil", name: "Gold Foil Stamping", price: 45, description: "Real 24K gold foil pressed onto card surface" },
      { id: "wax-seal", name: "Custom Wax Seal", price: 30, description: "Personalized wax seal with your initials" },
      { id: "rsvp-insert", name: "RSVP Insert Card", price: 35, description: "Matching RSVP card with pre-paid envelope" },
    ],
  },
  {
    id: "classic-urdu-calligraphy",
    slug: "classic-urdu-calligraphy",
    name: "Classic Urdu Calligraphy Card",
    base_price: 200,
    original_price: 280,
    category: "Nikkah",
    description:
      "Traditional Nastaliq calligraphy by master calligraphers, digitally printed on satin-finish card stock with embossed border. A nod to our rich heritage.",
    images: ["/images/card-5.jpg", "/images/card-5.jpg"],
    short_video_url: "https://res.cloudinary.com/demo/video/upload/v1/wedding-cards/urdu-calligraphy-preview.mp4",
    is_new: false,
    is_bestseller: true,
    min_order: 100,
    add_ons: [
      { id: "gold-foil", name: "Gold Foil Stamping", price: 45, description: "Real 24K gold foil pressed onto card surface" },
      { id: "wax-seal", name: "Custom Wax Seal", price: 30, description: "Personalized wax seal with your initials" },
      { id: "envelope-liner", name: "Printed Envelope Liner", price: 25, description: "Custom pattern printed inside envelope" },
    ],
  },
  {
    id: "modern-geometric-walima",
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
      { id: "gold-foil", name: "Gold Foil Stamping", price: 45, description: "Real 24K gold foil pressed onto card surface" },
      { id: "wax-seal", name: "Custom Wax Seal", price: 30, description: "Personalized wax seal with your initials" },
    ],
  },
  {
    id: "mehndi-night-festive",
    slug: "mehndi-night-festive",
    name: "Mehndi Night Festive Card",
    base_price: 130,
    category: "Mehndi",
    description:
      "Vibrant mehndi-inspired patterns in green and gold. Playful yet elegant design for your Mehndi celebration invites.",
    images: ["/images/card-7.jpg", "/images/card-7.jpg"],
    short_video_url: "https://res.cloudinary.com/demo/video/upload/v1/wedding-cards/mehndi-festive-preview.mp4",
    is_new: true,
    is_bestseller: false,
    min_order: 50,
    add_ons: [
      { id: "gold-foil", name: "Gold Foil Stamping", price: 45, description: "Real 24K gold foil pressed onto card surface" },
      { id: "wax-seal", name: "Custom Wax Seal", price: 30, description: "Personalized wax seal with your initials" },
      { id: "ribbon", name: "Satin Ribbon Tie", price: 20, description: "Premium satin ribbon in matching color" },
    ],
  },
  {
    id: "ivory-laser-cut",
    slug: "ivory-laser-cut",
    name: "Ivory Laser-Cut Pocket Card",
    base_price: 380,
    original_price: 500,
    category: "Luxury",
    description:
      "Precision laser-cut ivory pocket folder with satin ribbon tie. Contains main invite, RSVP, menu card, and map insert. The ultimate luxury statement.",
    images: ["/images/card-8.jpg", "/images/card-8.jpg"],
    short_video_url: "https://res.cloudinary.com/demo/video/upload/v1/wedding-cards/laser-cut-preview.mp4",
    is_new: false,
    is_bestseller: true,
    min_order: 100,
    add_ons: [
      { id: "gold-foil", name: "Gold Foil Stamping", price: 45, description: "Real 24K gold foil pressed onto card surface" },
      { id: "wax-seal", name: "Custom Wax Seal", price: 30, description: "Personalized wax seal with your initials" },
      { id: "ribbon", name: "Satin Ribbon Tie", price: 20, description: "Premium satin ribbon in matching color" },
      { id: "box", name: "Gift Box Packaging", price: 60, description: "Each card arrives in a luxury presentation box" },
    ],
  },
];

/**
 * Get a single card product by slug
 */
export function getCardBySlug(slug: string): CardProduct | undefined {
  return cardProducts.find((p) => p.slug === slug);
}

/**
 * Get all card products, optionally filtered by category
 */
export function getCardsByCategory(category?: string): CardProduct[] {
  if (!category || category === "All") return cardProducts;
  return cardProducts.filter((p) => p.category === category);
}
