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
    template: string;
    content: string;
    groom_name: string;
    bride_name: string;
    date: string;
    venue: string;
  };

  customer: {
    name: string;
    whatsapp: string;
    area: string;
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
      template: { type: String, required: true },
      content: { type: String, required: true },
      groom_name: { type: String, required: true },
      bride_name: { type: String, required: true },
      date: { type: String, required: true },
      venue: { type: String, required: true },
    },

    customer: {
      name: { type: String, required: true },
      whatsapp: { type: String, required: true },
      area: { type: String, required: true },
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

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
