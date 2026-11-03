import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPushCampaign extends Document {
  heading: string;
  description: string;
  bannerImageUrl: string;
  iconUrl: string;
  ctaLabel: string;
  ctaUrl: string;
  segment: {
    activeWithinDays: number | null; // null = all active subscriptions
  };
  status: "draft" | "sending" | "sent";
  target_count: number;
  delivered_count: number;
  opened_count: number;
  sent_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

const PushCampaignSchema = new Schema<IPushCampaign>(
  {
    heading: { type: String, required: [true, "Heading is required"], trim: true },
    description: { type: String, default: "", trim: true },
    bannerImageUrl: { type: String, default: "" },
    iconUrl: { type: String, default: "" },
    ctaLabel: { type: String, default: "View Now" },
    ctaUrl: { type: String, default: "/" },
    segment: {
      activeWithinDays: { type: Number, default: null }, // null = all active
    },
    status: {
      type: String,
      enum: ["draft", "sending", "sent"],
      default: "draft",
    },
    target_count: { type: Number, default: 0 },
    delivered_count: { type: Number, default: 0 },
    opened_count: { type: Number, default: 0 },
    sent_at: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const PushCampaign: Model<IPushCampaign> =
  mongoose.models.PushCampaign ||
  mongoose.model<IPushCampaign>("PushCampaign", PushCampaignSchema);

export default PushCampaign;
