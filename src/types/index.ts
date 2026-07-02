export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  image: string;
  category: Category;
  isNew?: boolean;
  isBestseller?: boolean;
  minOrder?: number;
}

export type Category =
  | "All"
  | "Luxury"
  | "Classic"
  | "Modern"
  | "Minimalist"
  | "Floral"
  | "Textured"
  | "Nikkah"
  | "Walima"
  | "Mehndi"
  | "Baraat";

export interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface NavLink {
  label: string;
  href: string;
  target?: string;
}

// ─── Product Engine Types ───

export interface AddOn {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface CardProduct {
  id: string;
  slug: string;
  name: string;
  base_price: number;
  original_price?: number;
  /** Per-card price for small inner cards added for extra ceremonies (e.g. Valima, Nikkah) */
  inner_card_price?: number;
  category: Category;
  description: string;
  images: string[];
  short_video_url?: string;
  is_new: boolean;
  is_bestseller: boolean;
  min_order: number;
  add_ons: AddOn[];
  meta_title?: string;
  meta_description?: string;
  image_alt_text?: string;
  events?: ('Nikkah' | 'Valima' | 'Mehndi' | 'Baraat' | 'Engagement')[];
}

export type QuantityTier = 100 | 250 | 500;

// ─── E-Invitation Types ───

export interface RsvpContact {
  name: string;
  number: string;
}

export interface ScheduleItem {
  time: string;
  title: string;
  description?: string;
}

export interface Faq {
  question: string;
  answer: string;
}

export interface ComponentConfig {
  [key: string]: unknown;

  // Hero
  hero_intro_text?: string;      // default: "You are cordially invited to attend"
  bg_video_opacity?: number;     // 0–1, default: 0.1

  // Countdown
  show_countdown?: boolean;      // default: true
  countdown_heading?: string;    // default: "Count Down"

  // Schedule
  show_schedule?: boolean;       // default: true (still gated by data presence)

  // RSVP
  show_rsvp?: boolean;           // default: true (still gated by data presence)
  rsvp_message?: string;         // default: "Kindly confirm your attendance via WhatsApp"

  // Footer
  footer_tagline?: string;       // default: "with love"
}

export interface EInvitation {
  _id: string;
  couple: {
    groom_name: string;
    bride_name: string;
    event_title: string;
    seal_initials: string;
    monogram: string;
  };
  slug: string;
  wedding_at: string; // ISO date string on the client side
  venue: { name: string; address: string; maps_embed_url: string };
  media: { image_url: string; video_url: string; background_video_url: string; audio_url: string };
  rsvp_contacts: RsvpContact[];
  schedule: ScheduleItem[];
  faqs: Faq[];
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
}

// ─── Promo Code Types ───

export interface PromoCode {
  _id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  min_order_amount: number;
  usage_limit: number | null;
  usage_count: number;
  valid_from: string | null;
  valid_until: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

/** Successful response payload from POST /api/promo/validate */
export interface PromoValidationResult {
  code: string;
  type: "percent" | "fixed";
  value: number;
  discount_amount: number;
  gross_total: number;
  new_total: number;
}

export interface PriceBreakdown {
  basePrice: number;
  quantity: number;
  subtotal: number;
  discount: number;
  discountPercent: number;
  addOnsTotal: number;
  selectedAddOns: AddOn[];
  total: number;
}
