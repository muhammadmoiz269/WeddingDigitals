import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICard extends Document {
  name: string;
  slug: string;
  card_code?: string;
  base_price: number;
  original_price?: number;
  category: "Nikkah" | "Barat" | "Valima" | "Mehndi" | "Luxury" | "Minimalist";
  description: string;
  images: string[];
  short_video_url?: string;
  is_new: boolean;
  is_bestseller: boolean;
  min_order: number;
  add_ons: {
    name: string;
    price: number;
    description: string;
  }[];
  created_at: Date;
  updated_at: Date;
}

const CardSchema = new Schema<ICard>(
  {
    name: {
      type: String,
      required: [true, "Card name is required"],
      trim: true,
      maxlength: [120, "Card name cannot exceed 120 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    card_code: {
      type: String,
      trim: true,
      uppercase: true,
      sparse: true,
    },
    base_price: {
      type: Number,
      required: [true, "Base price is required"],
      min: [0, "Price cannot be negative"],
    },
    original_price: {
      type: Number,
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Nikkah", "Barat", "Valima", "Mehndi", "Luxury", "Minimalist"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    images: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: "At least one image is required",
      },
    },
    short_video_url: {
      type: String,
      trim: true,
    },
    is_new: {
      type: Boolean,
      default: false,
    },
    is_bestseller: {
      type: Boolean,
      default: false,
    },
    min_order: {
      type: Number,
      default: 50,
      min: [1, "Minimum order must be at least 1"],
    },
    add_ons: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        description: { type: String, default: "" },
      },
    ],
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Indexes for fast queries
CardSchema.index({ category: 1 });
CardSchema.index({ slug: 1 });
CardSchema.index({ is_bestseller: 1 });
CardSchema.index({ card_code: 1 }, { sparse: true });

const Card: Model<ICard> =
  mongoose.models.Card || mongoose.model<ICard>("Card", CardSchema);

export default Card;
