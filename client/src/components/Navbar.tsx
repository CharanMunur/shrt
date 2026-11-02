import React from "react";
import { Link } from "react-router-dom";
import { BrandLogo } from "./BrandLogo.js";
import { ThemeToggle } from "./ThemeToggle.js";
import { useAuth } from "../context/AuthContext.js";

export function Navbar() {
  const { user } = useAuth();

  return (
    <header className="w-full bg-canvas sticky top-0 z-40 transition-colors">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <BrandLogo />

        <div className="flex items-center gap-4">
          <ThemeToggle compact />

          {user ? (
            <Link to="/dashboard" className="btn btn-primary text-xs">
              Open Dashboard
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/signin" className="text-sm text-alt hover:text-primary font-medium px-2 py-1">
                Sign in
              </Link>
              <Link to="/signup" className="btn btn-primary text-xs">
                Get started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
