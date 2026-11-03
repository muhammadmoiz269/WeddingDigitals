import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPushSubscription extends Document {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent: string;
  deviceType: "mobile" | "tablet" | "desktop";
  os: string;
  browser: string;
  pushEnabled: boolean;
  language: string;
  timezone: string;
  subscribed_page: string;
  referrer: string;
  ipAddress: string;
  geo: {
    country: string;
    region: string;
    city: string;
  };
  status: "active" | "expired";
  last_seen: Date;
  subscribed_at: Date;
  delivered_count: number;
  opened_count: number;
  last_opened: Date | null;
  created_at: Date;
  updated_at: Date;
}

const PushSubscriptionSchema = new Schema<IPushSubscription>(
  {
    endpoint: {
      type: String,
      required: [true, "Endpoint is required"],
      unique: true,
    },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    userAgent: { type: String, default: "" },
    deviceType: {
      type: String,
      enum: ["mobile", "tablet", "desktop"],
      default: "desktop",
    },
    os: { type: String, default: "" },
    browser: { type: String, default: "" },
    pushEnabled: { type: Boolean, default: true },
    language: { type: String, default: "" },
    timezone: { type: String, default: "" },
    subscribed_page: { type: String, default: "" },
    referrer: { type: String, default: "" },
    ipAddress: { type: String, default: "" },
    geo: {
      country: { type: String, default: "" },
      region: { type: String, default: "" },
      city: { type: String, default: "" },
    },
    status: {
      type: String,
      enum: ["active", "expired"],
      default: "active",
    },
    last_seen: { type: Date, default: Date.now },
    subscribed_at: { type: Date, default: Date.now },
    delivered_count: { type: Number, default: 0 },
    opened_count: { type: Number, default: 0 },
    last_opened: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Compound index for segment queries (active subscribers within N days)
PushSubscriptionSchema.index({ status: 1, last_seen: -1 });

const PushSubscription: Model<IPushSubscription> =
  mongoose.models.PushSubscription ||
  mongoose.model<IPushSubscription>("PushSubscription", PushSubscriptionSchema);

export default PushSubscription;
