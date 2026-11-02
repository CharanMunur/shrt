import { Types } from "mongoose";

export type ThemePreference = "light" | "dark" | "system";

export interface IUser {
  _id: Types.ObjectId;
  username: string;
  normalizedUsername: string;
  passwordHash: string;
  preferences?: {
    theme?: ThemePreference;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ILink {
  _id: Types.ObjectId;
  ownerId: Types.ObjectId;
  code: string;
  destinationUrl: string;
  iosUrl?: string;
  androidUrl?: string;
  expiresAt?: Date | null;
  isActive: boolean;
  maxClicks?: number | null;
  passwordHash?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ReferrerCategory = "direct" | "search" | "social" | "email" | "other";
export type DeviceType = "desktop" | "mobile" | "tablet" | "unknown";

export interface IClickEvent {
  _id: Types.ObjectId;
  linkId: Types.ObjectId;
  clickedAt: Date;
  referrer: string;
  referrerCategory: ReferrerCategory;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  country: string;
  region: string;
  city: string;
  browser: string;
  browserVersion: string;
  os: string;
  deviceType: DeviceType;
}

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
