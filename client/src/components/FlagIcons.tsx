import React from "react";

interface FlagProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export function IndiaFlagIcon({ size = 20, className = "", ...props }: FlagProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      {...props}
    >
      <g>
        <rect x="1" y="4" width="30" height="24" rx="4" ry="4" fill="#f7f7f7" />
        <path d="M1,8 C1,5.79 2.79,4 5,4 L27,4 C29.21,4 31,5.79 31,8 L31,12 L1,12 Z" fill="#ff9933" />
        <path d="M1,20 L31,20 L31,24 C31,26.21 29.21,28 27,28 L5,28 C2.79,28 1,26.21 1,24 Z" fill="#138808" />
        <circle cx="16" cy="16" r="3.2" fill="none" stroke="#000080" strokeWidth="0.8" />
        <circle cx="16" cy="16" r="0.8" fill="#000080" />
      </g>
    </svg>
  );
}

export function UsFlagIcon({ size = 20, className = "", ...props }: FlagProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      {...props}
    >
      <g>
        <rect x="1" y="4" width="30" height="24" rx="4" ry="4" fill="#bf0a30" />
        <rect x="1" y="7.5" width="30" height="3" fill="#ffffff" />
        <rect x="1" y="13.5" width="30" height="3" fill="#ffffff" />
        <rect x="1" y="19.5" width="30" height="3" fill="#ffffff" />
        <rect x="1" y="25.5" width="30" height="2.5" rx="0" ry="2" fill="#ffffff" />
        <path d="M1,8 C1,5.79 2.79,4 5,4 L14,4 L14,16 L1,16 Z" fill="#002868" />
        <circle cx="4" cy="7" r="0.8" fill="#fff" />
        <circle cx="8" cy="7" r="0.8" fill="#fff" />
        <circle cx="11" cy="7" r="0.8" fill="#fff" />
        <circle cx="6" cy="10" r="0.8" fill="#fff" />
        <circle cx="9.5" cy="10" r="0.8" fill="#fff" />
        <circle cx="4" cy="13" r="0.8" fill="#fff" />
        <circle cx="8" cy="13" r="0.8" fill="#fff" />
        <circle cx="11" cy="13" r="0.8" fill="#fff" />
      </g>
    </svg>
  );
}

export function UkFlagIcon({ size = 20, className = "", ...props }: FlagProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      {...props}
    >
      <g>
        <rect x="1" y="4" width="30" height="24" rx="4" ry="4" fill="#012169" />
        <polygon points="1,4 31,28 31,24 5,4" fill="#ffffff" />
        <polygon points="31,4 1,28 1,24 27,4" fill="#ffffff" />
        <polygon points="1,4 31,28 29,28 1,6" fill="#c8102e" />
        <polygon points="31,4 1,28 3,28 31,6" fill="#c8102e" />
        <rect x="13" y="4" width="6" height="24" fill="#ffffff" />
        <rect x="1" y="13" width="30" height="6" fill="#ffffff" />
        <rect x="14.5" y="4" width="3" height="24" fill="#c8102e" />
        <rect x="1" y="14.5" width="30" height="3" fill="#c8102e" />
      </g>
    </svg>
  );
}

export function GermanyFlagIcon({ size = 20, className = "", ...props }: FlagProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      {...props}
    >
      <g>
        <rect x="1" y="4" width="30" height="24" rx="4" ry="4" fill="#ffce00" />
        <path d="M1,8 C1,5.79 2.79,4 5,4 L27,4 C29.21,4 31,5.79 31,8 L31,12 L1,12 Z" fill="#151515" />
        <rect x="1" y="12" width="30" height="8" fill="#dd0000" />
      </g>
    </svg>
  );
}

export function JapanFlagIcon({ size = 20, className = "", ...props }: FlagProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      {...props}
    >
      <g>
        <rect x="1" y="4" width="30" height="24" rx="4" ry="4" fill="#ffffff" stroke="#e5e5e5" strokeWidth="0.5" />
        <circle cx="16" cy="16" r="6" fill="#bc002d" />
      </g>
    </svg>
  );
}

export function CanadaFlagIcon({ size = 20, className = "", ...props }: FlagProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      {...props}
    >
      <g>
        <rect x="1" y="4" width="30" height="24" rx="4" ry="4" fill="#ffffff" />
        <path d="M1,8 C1,5.79 2.79,4 5,4 L9,4 L9,28 L5,28 C2.79,28 1,26.21 1,24 Z" fill="#ff0000" />
        <path d="M23,4 L27,4 C29.21,4 31,5.79 31,8 L31,24 C31,26.21 29.21,28 27,28 L23,28 Z" fill="#ff0000" />
        <polygon points="16,10 17,14 19,13 18,16 20,18 17.5,18 16.5,21 15.5,21 14.5,18 12,18 14,16 13,13 15,14" fill="#ff0000" />
      </g>
    </svg>
  );
}

export function FranceFlagIcon({ size = 20, className = "", ...props }: FlagProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      {...props}
    >
      <g>
        <rect x="1" y="4" width="30" height="24" rx="4" ry="4" fill="#ffffff" />
        <path d="M1,8 C1,5.79 2.79,4 5,4 L11,4 L11,28 L5,28 C2.79,28 1,26.21 1,24 Z" fill="#002395" />
        <path d="M21,4 L27,4 C29.21,4 31,5.79 31,8 L31,24 C31,26.21 29.21,28 27,28 L21,28 Z" fill="#ed2939" />
      </g>
    </svg>
  );
}

export function BrazilFlagIcon({ size = 20, className = "", ...props }: FlagProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      {...props}
    >
      <g>
        <rect x="1" y="4" width="30" height="24" rx="4" ry="4" fill="#009c3b" />
        <polygon points="16,7 28,16 16,25 4,16" fill="#fedf00" />
        <circle cx="16" cy="16" r="4.2" fill="#002776" />
      </g>
    </svg>
  );
}

export function LocalFlagIcon({ size = 20, className = "", ...props }: FlagProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      {...props}
    >
      <g>
        <rect x="1" y="4" width="30" height="24" rx="4" ry="4" fill="#18181b" />
        <rect x="5" y="8" width="22" height="13" rx="1.5" fill="#27272a" />
        <circle cx="16" cy="24" r="1.2" fill="#71717a" />
        <path d="M10,13 L13,15 L10,17" stroke="#3b82f6" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <line x1="15" y1="17" x2="18" y2="17" stroke="#71717a" strokeWidth="1.2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function GlobeFlagIcon({ size = 20, className = "", ...props }: FlagProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      {...props}
    >
      <g>
        <rect x="1" y="4" width="30" height="24" rx="4" ry="4" fill="#27272a" />
        <circle cx="16" cy="16" r="7" fill="none" stroke="#71717a" strokeWidth="1.2" />
        <ellipse cx="16" cy="16" rx="3.5" ry="7" fill="none" stroke="#71717a" strokeWidth="1" />
        <line x1="9" y1="16" x2="23" y2="16" stroke="#71717a" strokeWidth="1" />
      </g>
    </svg>
  );
}

export function getCountryFlagComponent(country: string, size = 18): React.ReactNode {
  if (!country) return <GlobeFlagIcon size={size} />;
  const c = country.toLowerCase().trim();

  if (c.includes("india")) return <IndiaFlagIcon size={size} />;
  if (c.includes("united states") || c === "us" || c === "usa") return <UsFlagIcon size={size} />;
  if (c.includes("united kingdom") || c === "uk" || c === "great britain") return <UkFlagIcon size={size} />;
  if (c.includes("germany") || c === "deutschland") return <GermanyFlagIcon size={size} />;
  if (c.includes("japan")) return <JapanFlagIcon size={size} />;
  if (c.includes("canada")) return <CanadaFlagIcon size={size} />;
  if (c.includes("france")) return <FranceFlagIcon size={size} />;
  if (c.includes("brazil")) return <BrazilFlagIcon size={size} />;
  if (c === "local" || c === "localhost" || c.includes("development")) return <LocalFlagIcon size={size} />;

  return <GlobeFlagIcon size={size} />;
}
