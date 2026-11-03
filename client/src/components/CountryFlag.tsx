import React from "react";
import { Terminal } from "lucide-react";

const COUNTRY_MAP: Record<string, string> = {
  india: "in",
  "united states": "us",
  "united states of america": "us",
  usa: "us",
  "united kingdom": "gb",
  uk: "gb",
  "great britain": "gb",
  england: "gb-eng",
  scotland: "gb-sct",
  wales: "gb-wls",
  germany: "de",
  deutschland: "de",
  japan: "jp",
  canada: "ca",
  france: "fr",
  brazil: "br",
  australia: "au",
  netherlands: "nl",
  holland: "nl",
  singapore: "sg",
  spain: "es",
  italy: "it",
  sweden: "se",
  switzerland: "ch",
  russia: "ru",
  china: "cn",
  "south korea": "kr",
  korea: "kr",
  indonesia: "id",
  mexico: "mx",
  turkey: "tr",
  poland: "pl",
  argentina: "ar",
  norway: "no",
  denmark: "dk",
  finland: "fi",
  ireland: "ie",
  portugal: "pt",
  belgium: "be",
  austria: "at",
  "new zealand": "nz",
  "united arab emirates": "ae",
  uae: "ae",
  "saudi arabia": "sa",
  "south africa": "za",
  egypt: "eg",
  israel: "il",
  philippines: "ph",
  malaysia: "my",
  vietnam: "vn",
  thailand: "th",
  taiwan: "tw",
  "hong kong": "hk",
  chile: "cl",
  colombia: "co",
  pakistan: "pk",
  bangladesh: "bd",
  nigeria: "ng",
  kenya: "ke",
  ukraine: "ua",
  greece: "gr",
  "czech republic": "cz",
  czechia: "cz",
  romania: "ro",
  hungary: "hu",
  "aaland islands": "ax",
  "åland islands": "ax",
  aland: "ax",
};

export const CODE_TO_COUNTRY_NAME: Record<string, string> = {
  in: "India",
  us: "United States",
  gb: "United Kingdom",
  de: "Germany",
  jp: "Japan",
  ca: "Canada",
  fr: "France",
  br: "Brazil",
  au: "Australia",
  nl: "Netherlands",
  sg: "Singapore",
  es: "Spain",
  it: "Italy",
  se: "Sweden",
  ch: "Switzerland",
  ru: "Russia",
  cn: "China",
  kr: "South Korea",
  id: "Indonesia",
  mx: "Mexico",
  tr: "Turkey",
  pl: "Poland",
  ar: "Argentina",
  no: "Norway",
  dk: "Denmark",
  fi: "Finland",
  ie: "Ireland",
  pt: "Portugal",
  be: "Belgium",
  at: "Austria",
  nz: "New Zealand",
  ae: "United Arab Emirates",
  sa: "Saudi Arabia",
  za: "South Africa",
  eg: "Egypt",
  il: "Israel",
  ph: "Philippines",
  my: "Malaysia",
  vn: "Vietnam",
  th: "Thailand",
  tw: "Taiwan",
  hk: "Hong Kong",
  cl: "Chile",
  co: "Colombia",
  pk: "Pakistan",
  bd: "Bangladesh",
  ng: "Nigeria",
  ke: "Kenya",
  ua: "Ukraine",
  gr: "Greece",
  cz: "Czechia",
  ro: "Romania",
  hu: "Hungary",
  ax: "Åland Islands",
};

export function formatCountryName(raw?: string): string {
  if (!raw) return "Unknown";
  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();

  if (
    lower === "local" ||
    lower === "localhost" ||
    lower.includes("development") ||
    lower === "127.0.0.1" ||
    lower === "::1"
  ) {
    return "Localhost";
  }

  if (trimmed.length === 2 && CODE_TO_COUNTRY_NAME[lower]) {
    return CODE_TO_COUNTRY_NAME[lower];
  }

  // If it's already a full capitalized or title-cased country name
  return trimmed;
}

export function resolveCountryCode(country?: string): { code: string; isLocal: boolean } {
  if (!country) return { code: "xx", isLocal: false };
  const normalized = country.trim().toLowerCase();

  if (
    normalized === "local" ||
    normalized === "localhost" ||
    normalized.includes("development") ||
    normalized === "127.0.0.1" ||
    normalized === "::1"
  ) {
    return { code: "local", isLocal: true };
  }

  // Exact 2-letter country code check
  if (normalized.length === 2 && /^[a-z]{2}$/.test(normalized)) {
    return { code: normalized, isLocal: false };
  }

  // Lookup table
  if (COUNTRY_MAP[normalized]) {
    return { code: COUNTRY_MAP[normalized], isLocal: false };
  }

  // Partial substring match in dictionary
  for (const [name, code] of Object.entries(COUNTRY_MAP)) {
    if (normalized.includes(name) || name.includes(normalized)) {
      return { code, isLocal: false };
    }
  }

  return { code: "xx", isLocal: false };
}

interface CountryFlagProps {
  country?: string;
  squared?: boolean;
  className?: string;
  title?: string;
}

/**
 * Standard Country Flag rendering via flag-icons CSS package
 * Example: <CountryFlag country="India" /> -> <span class="fi fi-in rounded-xs"></span>
 */
export function CountryFlag({
  country,
  squared = false,
  className = "",
  title,
}: CountryFlagProps) {
  const { code, isLocal } = resolveCountryCode(country);
  const displayTitle = title || country || "Country";

  if (isLocal) {
    return (
      <span
        title={displayTitle}
        className={`inline-flex items-center justify-center gap-1 px-1.5 py-0.5 rounded-sm bg-surface-3 border border-subtle text-[10px] font-medium text-secondary shrink-0 ${className}`}
      >
        <Terminal className="w-2.5 h-2.5 text-accent" />
        <span>LOC</span>
      </span>
    );
  }

  return (
    <span
      title={displayTitle}
      className={`inline-flex items-center justify-center shrink-0 overflow-hidden rounded-xs border border-subtle/80 shadow-2xs leading-none ${className}`}
      style={{ verticalAlign: "middle" }}
    >
      <span
        className={`fi fi-${code} ${squared ? "fis" : ""} block`}
        style={{ fontSize: "13px" }}
        aria-hidden="true"
      />
    </span>
  );
}

export function getCountryFlagComponent(country: string, _size?: number): React.ReactNode {
  return <CountryFlag country={country} />;
}
