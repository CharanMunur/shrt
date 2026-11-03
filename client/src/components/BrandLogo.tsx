import React from "react";
import { Link } from "react-router-dom";

export function BrandLogo({ className = "", to = "/" }: { className?: string; to?: string }) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2 text-primary font-semibold text-lg select-none ${className}`}
    >
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-primary text-canvas text-xs font-bold">
        s
      </span>
      <span>shrt</span>
    </Link>
  );
}
