import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrder extends Document {
  order_id: string;
  card_slug: string;
  card_name: string;
  quantity: number;
  base_price: number;
  add_ons: { name: string; price: number }[];
  /** Order total before any discount (server-computed gross) */
  subtotal_before_discount?: number;
  /** Present when a discount was applied; `total` is always the final discounted amount */
  discount?: {
    source: "promo" | "quantity";
    code?: string;
    amount: number;
  };
  total: number;

  customization: {
    main_event: string;
    addon_events: { event_type: string; quantity: number; price_per_card?: number }[];
  };

  customer: {
    name: string;
    whatsapp: string;
    city?: string;
    area?: string;
    address: string;
  };

  payment: {
    method: "full" | "deposit";
    amount_due: number;
    receipt_url: string;
    /** "confirmed" is legacy — the workflow is pending_payment → in_production → out_for_delivery → completed */
    status: "pending_payment" | "confirmed" | "in_production" | "out_for_delivery" | "completed";
  };

  /** Internal admin note — not shown to customers */
  note?: string;

  created_at: Date;
  updated_at: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    order_id: {
      type: String,
      required: true,
      unique: true,
    },
    card_slug: { type: String, required: true },
    card_name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    base_price: { type: Number, required: true, min: 0 },
    add_ons: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
      },
    ],
    subtotal_before_discount: { type: Number, min: 0 },
    discount: {
      source: { type: String, enum: ["promo", "quantity"] },
      code: { type: String },
      amount: { type: Number, min: 0 },
    },
    total: { type: Number, required: true, min: 0 },

    customization: {
      main_event: { type: String, required: true },
      addon_events: [
        {
          event_type: { type: String, required: true },
          quantity: { type: Number, required: true },
          price_per_card: { type: Number, default: 0 },
        },
      ],
    },

    customer: {
      name: { type: String, required: true },
      whatsapp: { type: String, required: true },
      city: { type: String },
      area: { type: String },
      address: { type: String, default: '' },
    },

    payment: {
      method: { type: String, enum: ["full", "deposit"], required: true },
      amount_due: { type: Number, required: true, min: 0 },
      receipt_url: { type: String, default: "" },
      status: {
        type: String,
        enum: ["pending_payment", "confirmed", "in_production", "out_for_delivery", "completed"],
        default: "pending_payment",
      },
    },

    /** Internal admin note — not shown to customers */
    note: { type: String, default: "" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// Delete cached model so schema changes apply on hot-reload in Next.js dev
delete mongoose.models.Order;

const Order: Model<IOrder> = mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
