import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEInvitation extends Document {
  couple: {
    groom_name: string;
    bride_name: string;
    event_title: string;
    seal_initials: string;
    monogram: string;
  };
  slug: string;
  wedding_at: Date;
  venue: {
    name: string;
    address: string;
    maps_embed_url: string;
  };
  media: {
    image_url: string;
    video_url: string;
    background_video_url: string;
    audio_url: string;
    event_card_url: string;
  };
  rsvp_contacts: { name: string; number: string }[];
  schedule: { time: string; title: string; description: string }[];
  faqs: { question: string; answer: string }[];
  status: "draft" | "published";
}

const EInvitationSchema = new Schema<IEInvitation>(
  {
    couple: {
      groom_name:    { type: String, required: true, trim: true },
      bride_name:    { type: String, required: true, trim: true },
      event_title:   { type: String, required: true, trim: true },
      seal_initials: { type: String, required: true, trim: true },
      monogram:      { type: String, required: true, trim: true },
    },

    slug:       { type: String, required: true, unique: true, trim: true, index: true },
    wedding_at: { type: Date, required: true },

    venue: {
      name:           { type: String, trim: true, default: "" },
      address:        { type: String, trim: true, default: "" },
      maps_embed_url: { type: String, trim: true, default: "" },
    },

    media: {
      image_url:            { type: String, trim: true, default: "" },
      video_url:            { type: String, trim: true, default: "" },
      background_video_url: { type: String, trim: true, default: "" },
      audio_url:            { type: String, trim: true, default: "" },
      event_card_url:       { type: String, trim: true, default: "" },
    },

    rsvp_contacts: [{ name: { type: String }, number: { type: String } }],
    schedule:      [{ time: { type: String }, title: { type: String }, description: { type: String, default: "" } }],
    faqs:          [{ question: { type: String }, answer: { type: String } }],

    status: { type: String, enum: ["draft", "published"], default: "draft" },
  },
  { timestamps: true }
);

// Delete cached model so schema changes apply on hot-reload in Next.js dev
delete mongoose.models.EInvitation;

const EInvitation: Model<IEInvitation> = mongoose.model<IEInvitation>(
  "EInvitation",
  EInvitationSchema
);

export default EInvitation;
