import mongoose, { Schema } from "mongoose";
import { ILink } from "../types/index.js";

const LinkSchema = new Schema<ILink>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    destinationUrl: {
      type: String,
      required: true,
      trim: true,
    },
    iosUrl: {
      type: String,
      trim: true,
      default: undefined,
    },
    androidUrl: {
      type: String,
      trim: true,
      default: undefined,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    maxClicks: {
      type: Number,
      default: null,
    },
    passwordHash: {
      type: String,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete (ret as any).passwordHash;
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

LinkSchema.index({ ownerId: 1, createdAt: -1 });

export const Link = mongoose.model<ILink>("Link", LinkSchema);
