import React from "react";
import {
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Compass,
  Laptop,
  Share2,
  Mail,
  Search,
  Cpu,
  Terminal,
} from "lucide-react";
import { getCountryFlagComponent, CountryFlag } from "../components/CountryFlag.js";

export { getCountryFlagComponent, CountryFlag };

export function getDeviceVisual(type: string) {
  const t = (type || "").toLowerCase();
  if (t === "mobile") return <Smartphone className="w-3.5 h-3.5" />;
  if (t === "tablet") return <Tablet className="w-3.5 h-3.5" />;
  return <Monitor className="w-3.5 h-3.5" />;
}

export function getCategoryVisual(category: string) {
  const c = (category || "").toLowerCase();
  if (c === "search") return <Search className="w-3.5 h-3.5 text-blue-500" />;
  if (c === "social") return <Share2 className="w-3.5 h-3.5 text-indigo-500" />;
  if (c === "email") return <Mail className="w-3.5 h-3.5 text-amber-500" />;
  if (c === "direct") return <Compass className="w-3.5 h-3.5 text-emerald-500" />;
  return <Globe className="w-3.5 h-3.5 text-muted" />;
}

// Clean Browser SVG Icons (no emojis!)
export function getBrowserVisual(name: string) {
  const n = (name || "").toLowerCase();

  if (n.includes("chrome")) {
    return (
      <span className="inline-flex items-center gap-1.5 font-medium text-xs">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#ea4335" strokeWidth="2" />
          <circle cx="12" cy="12" r="4" fill="#4285f4" />
          <path d="M12 2a10 10 0 0 1 8.66 5l-7.66 4.42" stroke="#fbbc05" strokeWidth="2" />
          <path d="M12 22a10 10 0 0 1-8.66-5l7.66-4.42" stroke="#34a853" strokeWidth="2" />
        </svg>
        <span>Chrome</span>
      </span>
    );
  }

  if (n.includes("safari")) {
    return (
      <span className="inline-flex items-center gap-1.5 font-medium text-xs">
        <Compass className="w-3.5 h-3.5 text-blue-500" />
        <span>Safari</span>
      </span>
    );
  }

  if (n.includes("firefox")) {
    return (
      <span className="inline-flex items-center gap-1.5 font-medium text-xs">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#ff7139" strokeWidth="2" />
          <path d="M7 14c1.5 3 5 3 7 1s1-4-1-6" stroke="#ff9400" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span>Firefox</span>
      </span>
    );
  }

  if (n.includes("edge")) {
    return (
      <span className="inline-flex items-center gap-1.5 font-medium text-xs">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
          <path d="M3 13c0 4.5 4 8 9 8s9-3.5 9-8c0-3.5-3-6-6-6-2.5 0-4.5 1.5-5.5 3.5" stroke="#0078d7" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span>Edge</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 font-medium text-xs">
      <Globe className="w-3.5 h-3.5 text-muted" />
      <span>{name || "Unknown"}</span>
    </span>
  );
}

// Clean OS SVG Icons (no emojis!)
export function getOsVisual(name: string) {
  const n = (name || "").toLowerCase();

  if (n.includes("mac") || n.includes("ios") || n.includes("apple")) {
    return (
      <span className="inline-flex items-center gap-1.5 font-medium text-xs">
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.64-.78 1.08-1.87.96-2.96-.93.04-2.05.62-2.71 1.4-.58.67-1.09 1.76-.95 2.83 1.04.08 2.08-.53 2.7-1.27z" />
        </svg>
        <span>{name}</span>
      </span>
    );
  }

  if (n.includes("win")) {
    return (
      <span className="inline-flex items-center gap-1.5 font-medium text-xs">
        <svg className="w-3.5 h-3.5 fill-current text-[#00a4ef]" viewBox="0 0 24 24">
          <path d="M3 5.55L10.5 4.5v7.05H3V5.55zM11.5 4.35L21 3v8.55h-9.5V4.35zM3 18.45l7.5 1.05V12.45H3v6zM11.5 19.65L21 21v-8.55h-9.5v7.2z" />
        </svg>
        <span>{name}</span>
      </span>
    );
  }

  if (n.includes("linux")) {
    return (
      <span className="inline-flex items-center gap-1.5 font-medium text-xs">
        <Terminal className="w-3.5 h-3.5 text-amber-500" />
        <span>Linux</span>
      </span>
    );
  }

  if (n.includes("android")) {
    return (
      <span className="inline-flex items-center gap-1.5 font-medium text-xs">
        <Cpu className="w-3.5 h-3.5 text-emerald-500" />
        <span>Android</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 font-medium text-xs">
      <Monitor className="w-3.5 h-3.5 text-muted" />
      <span>{name || "Unknown"}</span>
    </span>
  );
}

export function getVisitorAvatarUrl(seed: string): string {
  const cleanSeed = encodeURIComponent(seed || "shrtn-visitor");
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${cleanSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}
