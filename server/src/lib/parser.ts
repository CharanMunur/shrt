import { Request } from "express";
import { UAParser } from "ua-parser-js";
import geoip from "geoip-lite";
import { DeviceType, ReferrerCategory } from "../types/index.js";

const SEARCH_DOMAINS = [
  "google.",
  "bing.com",
  "yahoo.com",
  "duckduckgo.com",
  "baidu.com",
  "yandex.",
  "ecosia.org",
  "ask.com",
];

const SOCIAL_DOMAINS = [
  "twitter.com",
  "t.co",
  "x.com",
  "facebook.com",
  "fb.com",
  "instagram.com",
  "linkedin.com",
  "lnkd.in",
  "reddit.com",
  "youtube.com",
  "youtu.be",
  "tiktok.com",
  "pinterest.com",
  "threads.net",
  "whatsapp.com",
  "telegram.me",
  "t.me",
  "discord.com",
];

const EMAIL_DOMAINS = [
  "mail.google.com",
  "outlook.live.com",
  "outlook.office.com",
  "mail.yahoo.com",
  "proton.me",
  "mail.aol.com",
];

export function categorizeReferrer(rawReferrer?: string): { referrerDomain: string; category: ReferrerCategory } {
  if (!rawReferrer || rawReferrer.trim() === "") {
    return { referrerDomain: "Direct", category: "direct" };
  }

  try {
    const url = new URL(rawReferrer.startsWith("http") ? rawReferrer : `https://${rawReferrer}`);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");

    for (const s of SEARCH_DOMAINS) {
      if (hostname.includes(s)) {
        return { referrerDomain: hostname, category: "search" };
      }
    }

    for (const s of SOCIAL_DOMAINS) {
      if (hostname.includes(s)) {
        return { referrerDomain: hostname, category: "social" };
      }
    }

    for (const e of EMAIL_DOMAINS) {
      if (hostname.includes(e)) {
        return { referrerDomain: hostname, category: "email" };
      }
    }

    return { referrerDomain: hostname, category: "other" };
  } catch {
    return { referrerDomain: "Direct", category: "direct" };
  }
}

export function parseUserAgent(uaString?: string): {
  browser: string;
  browserVersion: string;
  os: string;
  deviceType: DeviceType;
} {
  if (!uaString) {
    return {
      browser: "Unknown",
      browserVersion: "Unknown",
      os: "Unknown",
      deviceType: "unknown",
    };
  }

  const parser = new UAParser(uaString);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  const device = parser.getDevice();

  let deviceType: DeviceType = "desktop";
  if (device.type === "mobile") {
    deviceType = "mobile";
  } else if (device.type === "tablet") {
    deviceType = "tablet";
  } else if (!device.type) {
    // If no device type is flagged, check OS
    const osName = (os.name || "").toLowerCase();
    if (osName.includes("android") || osName.includes("ios")) {
      deviceType = "mobile";
    } else {
      deviceType = "desktop";
    }
  }

  return {
    browser: browser.name || "Unknown",
    browserVersion: browser.version ? browser.version.split(".")[0] : "Unknown",
    os: os.name || "Unknown",
    deviceType,
  };
}

export function parseClientIp(req: Request): string | undefined {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }
  return req.socket?.remoteAddress;
}

export function parseGeoLocation(ip?: string): { country: string; region: string; city: string } {
  if (!ip) {
    return { country: "Unknown", region: "Unknown", city: "Unknown" };
  }

  // Filter loopback or private ranges
  if (ip === "::1" || ip === "127.0.0.1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
    return { country: "Local", region: "Development", city: "Localhost" };
  }

  try {
    const geo = geoip.lookup(ip);
    if (geo) {
      return {
        country: geo.country || "Unknown",
        region: geo.region || "Unknown",
        city: geo.city || "Unknown",
      };
    }
  } catch {
    // Fall through to unknown
  }

  return { country: "Unknown", region: "Unknown", city: "Unknown" };
}
