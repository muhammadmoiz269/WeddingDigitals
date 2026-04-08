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
  | "Nikkah"
  | "Walima"
  | "Mehndi"
  | "Baraat"
  | "Luxury"
  | "Minimalist";

export interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface NavLink {
  label: string;
  href: string;
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
  category: "Nikkah" | "Barat" | "Valima" | "Mehndi" | "Luxury" | "Minimalist";
  description: string;
  images: string[];
  short_video_url?: string;
  is_new: boolean;
  is_bestseller: boolean;
  min_order: number;
  add_ons: AddOn[];
}

export type QuantityTier = 100 | 250 | 500;

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
