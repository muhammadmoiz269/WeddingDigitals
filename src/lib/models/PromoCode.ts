import mongoose, { Schema, Document, Model } from "mongoose";

export const PROMO_CODE_PATTERN = /^[A-Z0-9_-]{3,32}$/;

export interface IPromoCode extends Document {
  code: string;
  type: "percent" | "fixed";
  value: number;
  min_order_amount: number;
  /** null = unlimited uses */
  usage_limit: number | null;
  usage_count: number;
  /** null = active immediately */
  valid_from: Date | null;
  /** null = never expires */
  valid_until: Date | null;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

const PromoCodeSchema = new Schema<IPromoCode>(
  {
    code: {
      type: String,
      required: [true, "Promo code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      match: [PROMO_CODE_PATTERN, "Code must be 3-32 characters (A-Z, 0-9, _ or -)"],
    },
    type: {
      type: String,
      enum: ["percent", "fixed"],
      required: [true, "Discount type is required"],
    },
    value: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [1, "Discount value must be at least 1"],
      validate: {
        // `this` is the document on create/save; update paths are validated
        // separately in parsePromoFields (src/lib/server/promo.ts)
        validator: function (v: number) {
          const doc = this as unknown as IPromoCode;
          return doc.type !== "percent" || v <= 100;
        },
        message: "Percentage discount cannot exceed 100",
      },
    },
    min_order_amount: {
      type: Number,
      default: 0,
      min: [0, "Minimum order amount cannot be negative"],
    },
    usage_limit: {
      type: Number,
      default: null,
      min: [1, "Usage limit must be at least 1"],
    },
    usage_count: {
      type: Number,
      default: 0,
      min: 0,
    },
    valid_from: {
      type: Date,
      default: null,
    },
    valid_until: {
      type: Date,
      default: null,
      validate: {
        validator: function (v: Date | null) {
          const doc = this as unknown as IPromoCode;
          return !v || !doc.valid_from || v > doc.valid_from;
        },
        message: "Expiry date must be after the start date",
      },
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const PromoCode: Model<IPromoCode> =
  mongoose.models.PromoCode || mongoose.model<IPromoCode>("PromoCode", PromoCodeSchema);

export default PromoCode;
