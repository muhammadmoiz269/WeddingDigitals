import { Product } from "@/types";

export const products: Product[] = [
  {
    id: "mughal-floral-velvet",
    name: "Mughal Floral Velvet Card",
    price: 350,
    originalPrice: 500,
    description:
      "Hand-finished velvet card with intricate Mughal floral motifs and gold foil detailing. Includes matching envelope with wax seal.",
    image: "/images/card-1.jpg",
    category: "Luxury",
    isBestseller: true,
    minOrder: 100,
  },
  {
    id: "minimalist-nikkah-invite",
    name: "Minimalist Nikkah Invite",
    price: 120,
    description:
      "Clean, modern design with elegant Urdu typography on premium 300gsm cotton card stock. Perfect for intimate Nikkah ceremonies.",
    image: "/images/card-2.jpg",
    category: "Nikkah",
    isNew: true,
    minOrder: 50,
  },
  {
    id: "royal-baroque-gold-foil",
    name: "Royal Baroque Gold Foil Card",
    price: 450,
    originalPrice: 600,
    description:
      "Luxurious baroque-inspired design with real gold foil stamping on Italian imported textured paper. A statement of grandeur.",
    image: "/images/card-3.jpg",
    category: "Baraat",
    isBestseller: true,
    minOrder: 100,
  },
  {
    id: "pastel-garden-watercolor",
    name: "Pastel Garden Watercolor Invite",
    price: 180,
    description:
      "Delicate watercolor florals in soft pastels printed on handmade recycled paper. Includes RSVP card and directions insert.",
    image: "/images/card-4.jpg",
    category: "Walima",
    isNew: true,
    minOrder: 50,
  },
  {
    id: "classic-urdu-calligraphy",
    name: "Classic Urdu Calligraphy Card",
    price: 200,
    originalPrice: 280,
    description:
      "Traditional Nastaliq calligraphy by master calligraphers, digitally printed on satin-finish card stock with embossed border.",
    image: "/images/card-5.jpg",
    category: "Nikkah",
    isBestseller: true,
    minOrder: 100,
  },
  {
    id: "modern-geometric-walima",
    name: "Modern Geometric Walima Card",
    price: 150,
    description:
      "Contemporary geometric patterns with metallic champagne accents. Flat-printed on thick matte stock with matching envelope liner.",
    image: "/images/card-6.jpg",
    category: "Walima",
    minOrder: 50,
  },
  {
    id: "mehndi-night-festive",
    name: "Mehndi Night Festive Card",
    price: 130,
    description:
      "Vibrant mehndi-inspired patterns in green and gold. Playful yet elegant design for your Mehndi celebration invites.",
    image: "/images/card-7.jpg",
    category: "Mehndi",
    isNew: true,
    minOrder: 50,
  },
  {
    id: "ivory-laser-cut",
    name: "Ivory Laser-Cut Pocket Card",
    price: 380,
    originalPrice: 500,
    description:
      "Precision laser-cut ivory pocket folder with satin ribbon tie. Contains main invite, RSVP, menu card, and map insert.",
    image: "/images/card-8.jpg",
    category: "Luxury",
    isBestseller: true,
    minOrder: 100,
  },
];

export const categories = [
  "All",
  "Nikkah",
  "Walima",
  "Mehndi",
  "Baraat",
  "Luxury",
  "Minimalist",
] as const;
