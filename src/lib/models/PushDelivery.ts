import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPushDelivery extends Document {
  campaign: Types.ObjectId;
  subscription: Types.ObjectId;
  delivered: boolean;
  opened: boolean;
  delivered_at: Date | null;
  opened_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

const PushDeliverySchema = new Schema<IPushDelivery>(
  {
    campaign: {
      type: Schema.Types.ObjectId,
      ref: "PushCampaign",
      required: true,
    },
    subscription: {
      type: Schema.Types.ObjectId,
      ref: "PushSubscription",
      required: true,
    },
    delivered: { type: Boolean, default: false },
    opened: { type: Boolean, default: false },
    delivered_at: { type: Date, default: null },
    opened_at: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Unique per campaign+subscription — ensures idempotent upserts
PushDeliverySchema.index({ campaign: 1, subscription: 1 }, { unique: true });

const PushDelivery: Model<IPushDelivery> =
  mongoose.models.PushDelivery ||
  mongoose.model<IPushDelivery>("PushDelivery", PushDeliverySchema);

export default PushDelivery;
