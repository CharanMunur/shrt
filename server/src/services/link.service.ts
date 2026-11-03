import { nanoid } from "nanoid";
import { Types } from "mongoose";
import { Link } from "../models/Link.js";
import { ClickEvent } from "../models/ClickEvent.js";
import { Counter, getNextSequence } from "../models/Counter.js";
import { toBase62 } from "../lib/base62.js";
import { hashPassword } from "../lib/argon.js";
import { isReservedCode } from "../lib/reservedCodes.js";
import { CreateLinkInput, UpdateLinkInput } from "../validators/link.validator.js";
import { env } from "../config/env.js";

export class LinkService {
  async generateUniqueCode(): Promise<string> {
    for (let attempts = 0; attempts < 50; attempts++) {
      const seq = await getNextSequence("link_code");
      const candidate = toBase62(seq);
      if (isReservedCode(candidate)) continue;
      const exists = await Link.exists({ code: candidate });
      if (!exists) return candidate;
    }
    throw new Error("Unable to generate unique short code. Please try again.");
  }

  async createLink(ownerId: Types.ObjectId, input: CreateLinkInput) {
    let code = input.code?.trim();

    if (code) {
      if (isReservedCode(code)) {
        const err: any = new Error("This short code is reserved by the system.");
        err.status = 400;
        err.code = "CODE_RESERVED";
        throw err;
      }
      const existing = await Link.findOne({ code });
      if (existing) {
        const err: any = new Error("This short code is already in use.");
        err.status = 409;
        err.code = "CODE_CONFLICT";
        throw err;
      }
    } else {
      code = await this.generateUniqueCode();
    }

    let passwordHash: string | null = null;
    if (input.password && input.password.trim() !== "") {
      passwordHash = await hashPassword(input.password);
    }

    const expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;
    const maxClicks = input.maxClicks && input.maxClicks > 0 ? input.maxClicks : null;

    const link = await Link.create({
      ownerId,
      code,
      destinationUrl: input.destinationUrl,
      iosUrl: input.iosUrl || undefined,
      androidUrl: input.androidUrl || undefined,
      expiresAt,
      maxClicks,
      passwordHash,
      isActive: true,
    });

    const doc = link.toJSON();
    return {
      ...doc,
      hasPassword: Boolean(passwordHash),
      shortUrl: `${env.BASE_URL}/${doc.code}`,
      clicksCount: 0,
    };
  }

  async getLinks(
    ownerId: Types.ObjectId,
    options: { page?: number; limit?: number; search?: string; status?: "all" | "active" | "inactive" }
  ) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const filter: any = { ownerId };

    if (options.status === "active") {
      filter.isActive = true;
    } else if (options.status === "inactive") {
      filter.isActive = false;
    }

    if (options.search && options.search.trim() !== "") {
      const q = options.search.trim();
      filter.$or = [
        { code: { $regex: q, $options: "i" } },
        { destinationUrl: { $regex: q, $options: "i" } },
      ];
    }

    const [links, total] = await Promise.all([
      Link.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Link.countDocuments(filter),
    ]);

    // Compute live click count derived from ClickEvents collection per Section 6
    const linkIds = links.map((l) => l._id);
    const clickCounts = await ClickEvent.aggregate([
      { $match: { linkId: { $in: linkIds } } },
      { $group: { _id: "$linkId", count: { $sum: 1 } } },
    ]);

    const countMap = new Map<string, number>();
    for (const c of clickCounts) {
      countMap.set(c._id.toString(), c.count);
    }

    const enrichedLinks = links.map((link) => {
      const totalClicks = countMap.get(link._id.toString()) || 0;
      return {
        ...link,
        hasPassword: Boolean(link.passwordHash),
        shortUrl: `${env.BASE_URL}/${link.code}`,
        clicksCount: totalClicks,
        isExpired: link.expiresAt ? new Date(link.expiresAt) < new Date() : false,
        isClickLimitReached: link.maxClicks ? totalClicks >= link.maxClicks : false,
      };
    });

    return {
      links: enrichedLinks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getLinkByCode(ownerId: Types.ObjectId, code: string) {
    const link = await Link.findOne({
      code: code.toLowerCase(),
      ownerId,
    }).lean();

    if (!link) {
      // Return 404 to never leak existence of another user's link
      const err: any = new Error("Link not found.");
      err.status = 404;
      err.code = "LINK_NOT_FOUND";
      throw err;
    }

    const totalClicks = await ClickEvent.countDocuments({ linkId: link._id });

    return {
      ...link,
      hasPassword: Boolean(link.passwordHash),
      shortUrl: `${env.BASE_URL}/${link.code}`,
      clicksCount: totalClicks,
      isExpired: link.expiresAt ? new Date(link.expiresAt) < new Date() : false,
      isClickLimitReached: link.maxClicks ? totalClicks >= link.maxClicks : false,
    };
  }

  async updateLink(ownerId: Types.ObjectId, code: string, input: UpdateLinkInput) {
    const link = await Link.findOne({ code: code.toLowerCase(), ownerId });
    if (!link) {
      const err: any = new Error("Link not found.");
      err.status = 404;
      err.code = "LINK_NOT_FOUND";
      throw err;
    }

    if (input.destinationUrl !== undefined) {
      link.destinationUrl = input.destinationUrl;
    }
    if (input.iosUrl !== undefined) {
      link.iosUrl = input.iosUrl || undefined;
    }
    if (input.androidUrl !== undefined) {
      link.androidUrl = input.androidUrl || undefined;
    }
    if (input.expiresAt !== undefined) {
      link.expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;
    }
    if (input.maxClicks !== undefined) {
      link.maxClicks = input.maxClicks && input.maxClicks > 0 ? input.maxClicks : null;
    }
    if (input.isActive !== undefined) {
      link.isActive = input.isActive;
    }
    if (input.password !== undefined) {
      if (input.password && input.password.trim() !== "") {
        link.passwordHash = await hashPassword(input.password);
      } else {
        link.passwordHash = null;
      }
    }

    await link.save();

    const totalClicks = await ClickEvent.countDocuments({ linkId: link._id });
    const doc = link.toJSON();

    return {
      ...doc,
      hasPassword: Boolean(link.passwordHash),
      shortUrl: `${env.BASE_URL}/${doc.code}`,
      clicksCount: totalClicks,
      isExpired: link.expiresAt ? new Date(link.expiresAt) < new Date() : false,
      isClickLimitReached: link.maxClicks ? totalClicks >= link.maxClicks : false,
    };
  }

  async deleteLink(ownerId: Types.ObjectId, code: string) {
    const link = await Link.findOne({ code: code.toLowerCase(), ownerId });
    if (!link) {
      const err: any = new Error("Link not found.");
      err.status = 404;
      err.code = "LINK_NOT_FOUND";
      throw err;
    }

    await Promise.all([
      Link.deleteOne({ _id: link._id }),
      ClickEvent.deleteMany({ linkId: link._id }),
    ]);

    return { success: true, message: "Link and associated analytics deleted successfully." };
  }
}

export const linkService = new LinkService();
