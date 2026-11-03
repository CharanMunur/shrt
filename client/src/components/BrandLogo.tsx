import React from "react";
import { Link } from "react-router-dom";

export function BrandLogo({ className = "", to = "/" }: { className?: string; to?: string }) {
  return (
    <Link
      to={to}
      aria-label="shrt home"
      className={`inline-flex items-center select-none ${className}`}
    >
      <img
        src="/short-black.svg"
        alt="shrt"
        className="theme-logo-light h-6 w-auto object-contain"
      />
      <img
        src="/short-white.svg"
        alt="shrt"
        className="theme-logo-dark h-6 w-auto object-contain"
      />
    </Link>
  );
}
