import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrder extends Document {
  order_id: string;
  card_slug: string;
  card_name: string;
  quantity: number;
  base_price: number;
  add_ons: { name: string; price: number }[];
  total: number;

  customization: {
    main_event: string;
    content: string;
    addon_events: { event_type: string; quantity: number; content: string }[];
  };

  customer: {
    name: string;
    whatsapp: string;
    area: string;
    address: string;
  };

  payment: {
    method: "full" | "deposit";
    amount_due: number;
    receipt_url: string;
    status: "pending_payment" | "confirmed" | "in_production" | "completed";
  };

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
    total: { type: Number, required: true, min: 0 },

    customization: {
      main_event: { type: String, required: true },
      content: { type: String, required: true },
      addon_events: [
        {
          event_type: { type: String, required: true },
          quantity: { type: Number, required: true },
          content: { type: String, default: '' },
        },
      ],
    },

    customer: {
      name: { type: String, required: true },
      whatsapp: { type: String, required: true },
      area: { type: String, required: true },
      address: { type: String, default: '' },
    },

    payment: {
      method: { type: String, enum: ["full", "deposit"], required: true },
      amount_due: { type: Number, required: true, min: 0 },
      receipt_url: { type: String, default: "" },
      status: {
        type: String,
        enum: ["pending_payment", "confirmed", "in_production", "completed"],
        default: "pending_payment",
      },
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// Delete cached model so schema changes apply on hot-reload in Next.js dev
delete mongoose.models.Order;

const Order: Model<IOrder> = mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
