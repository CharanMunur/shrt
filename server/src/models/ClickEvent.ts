import mongoose, { Schema } from "mongoose";
import { IClickEvent } from "../types/index.js";

const ClickEventSchema = new Schema<IClickEvent>(
  {
    linkId: {
      type: Schema.Types.ObjectId,
      ref: "Link",
      required: true,
      index: true,
    },
    clickedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    referrer: {
      type: String,
      default: "direct",
      trim: true,
    },
    referrerCategory: {
      type: String,
      enum: ["direct", "search", "social", "email", "other"],
      default: "direct",
      index: true,
    },
    utmSource: {
      type: String,
      trim: true,
      default: undefined,
    },
    utmMedium: {
      type: String,
      trim: true,
      default: undefined,
    },
    utmCampaign: {
      type: String,
      trim: true,
      default: undefined,
    },
    country: {
      type: String,
      default: "Unknown",
      trim: true,
      index: true,
    },
    region: {
      type: String,
      default: "Unknown",
      trim: true,
    },
    city: {
      type: String,
      default: "Unknown",
      trim: true,
    },
    browser: {
      type: String,
      default: "Unknown",
      trim: true,
      index: true,
    },
    browserVersion: {
      type: String,
      default: "Unknown",
      trim: true,
    },
    os: {
      type: String,
      default: "Unknown",
      trim: true,
      index: true,
    },
    deviceType: {
      type: String,
      enum: ["desktop", "mobile", "tablet", "unknown"],
      default: "unknown",
      index: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

ClickEventSchema.index({ linkId: 1, clickedAt: -1 });

export const ClickEvent = mongoose.model<IClickEvent>("ClickEvent", ClickEventSchema);
