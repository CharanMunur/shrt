import { Request } from "express";
import { Link } from "../models/Link.js";
import { ClickEvent } from "../models/ClickEvent.js";
import {
  categorizeReferrer,
  parseClientIp,
  parseGeoLocation,
  parseUserAgent,
} from "../lib/parser.js";
import { verifyPassword } from "../lib/argon.js";

export interface RedirectResult {
  status: "redirect" | "password_required" | "unavailable";
  destinationUrl?: string;
  reason?: "not_found" | "inactive" | "expired" | "limit_reached" | "invalid_password";
  code?: string;
}

export class RedirectService {
  async resolveLink(code: string, req: Request, providedPassword?: string): Promise<RedirectResult> {
    const trimmedCode = code.trim();
    const link =
      (await Link.findOne({ code: trimmedCode }).select("+passwordHash")) ||
      (await Link.findOne({ code: trimmedCode.toLowerCase() }).select("+passwordHash"));

    if (!link) {
      return { status: "unavailable", reason: "not_found", code: trimmedCode };
    }

    if (!link.isActive) {
      return { status: "unavailable", reason: "inactive", code };
    }

    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return { status: "unavailable", reason: "expired", code };
    }

    // Check click limit if set
    if (link.maxClicks && link.maxClicks > 0) {
      const clickCount = await ClickEvent.countDocuments({ linkId: link._id });
      if (clickCount >= link.maxClicks) {
        return { status: "unavailable", reason: "limit_reached", code };
      }
    }

    // Password verification if link is password protected
    if (link.passwordHash) {
      if (!providedPassword) {
        return { status: "password_required", code };
      }
      const isMatch = await verifyPassword(link.passwordHash, providedPassword);
      if (!isMatch) {
        return { status: "unavailable", reason: "invalid_password", code };
      }
    }

    // Determine target URL based on device
    const uaString = req.headers["user-agent"] || "";
    const parsedUa = parseUserAgent(uaString);

    let targetUrl = link.destinationUrl;
    const osLower = parsedUa.os.toLowerCase();

    if (osLower.includes("ios") && link.iosUrl) {
      targetUrl = link.iosUrl;
    } else if (osLower.includes("android") && link.androidUrl) {
      targetUrl = link.androidUrl;
    }

    // Asynchronously record click event per documented policy:
    // If persistence fails, log and continue so visitor redirect is never blocked.
    this.recordClick(link._id, req, parsedUa).catch((err) => {
      console.error(`[Analytics Warning] Failed to persist click for link ${code}:`, err.message);
    });

    return {
      status: "redirect",
      destinationUrl: targetUrl,
      code,
    };
  }

  private async recordClick(linkId: any, req: Request, parsedUa: ReturnType<typeof parseUserAgent>): Promise<void> {
    const rawReferrer = (req.headers["referer"] || req.headers["referrer"] || "") as string;
    const { referrerDomain, category } = categorizeReferrer(rawReferrer);

    const clientIp = parseClientIp(req);
    const { country, region, city } = parseGeoLocation(clientIp);

    // Extract UTM parameters from query
    const utmSource = typeof req.query.utm_source === "string" ? req.query.utm_source.slice(0, 100) : undefined;
    const utmMedium = typeof req.query.utm_medium === "string" ? req.query.utm_medium.slice(0, 100) : undefined;
    const utmCampaign = typeof req.query.utm_campaign === "string" ? req.query.utm_campaign.slice(0, 100) : undefined;

    await ClickEvent.create({
      linkId,
      clickedAt: new Date(),
      referrer: referrerDomain,
      referrerCategory: category,
      utmSource,
      utmMedium,
      utmCampaign,
      country,
      region,
      city,
      browser: parsedUa.browser,
      browserVersion: parsedUa.browserVersion,
      os: parsedUa.os,
      deviceType: parsedUa.deviceType,
    });
  }
}

export const redirectService = new RedirectService();
