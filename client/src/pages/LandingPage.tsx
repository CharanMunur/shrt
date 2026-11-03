import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar.js";
import { ArrowRight, BarChart2, ShieldCheck, Smartphone, QrCode } from "lucide-react";
import { useAuth } from "../context/AuthContext.js";

export function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [urlInput, setUrlInput] = useState("");

  const handleQuickShorten = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    if (user) {
      navigate(`/dashboard/shorten?url=${encodeURIComponent(urlInput.trim())}`);
    } else {
      navigate(`/signup?url=${encodeURIComponent(urlInput.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col text-primary">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-6 py-16 md:py-24 w-full">
        {/* Hero Section per minimal-skill guidelines */}
        <section className="text-center max-w-3xl mx-auto mb-24">
          <h1 className="text-4xl sm:text-6xl font-semibold mb-6">
            Make every link <span className="text-alt">go further.</span>
          </h1>
          <p className="text-base sm:text-lg text-alt max-w-xl mx-auto mb-10 leading-relaxed">
            Shorten URLs, share QR codes, and inspect click traffic with clean analytics.
          </p>

          <form onSubmit={handleQuickShorten} className="max-w-xl mx-auto mb-6 flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              required
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste a long URL (e.g. https://...)"
              className="input-minimal flex-1"
            />
            <button type="submit" className="btn btn-primary">
              <span>Shorten URL</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center justify-center gap-6 text-xs text-muted">
            <span>Free and fast</span>
            <span>·</span>
            <span>Zero tracking bloat</span>
            <span>·</span>
            <span>Instant redirects</span>
          </div>
        </section>

        {/* Feature Cards Grid (1 column on mobile, 3 columns on desktop per minimal-skill) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          <div className="card-minimal flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center mb-4 text-primary">
                <BarChart2 className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold mb-2">Live Click Analytics</h2>
              <p className="text-sm text-alt leading-relaxed">
                Inspect clicks over time, referrer categories, UTM campaign tags, devices, and countries without cached delay.
              </p>
            </div>
          </div>

          <div className="card-minimal flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center mb-4 text-primary">
                <QrCode className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold mb-2">Built-in QR Codes</h2>
              <p className="text-sm text-alt leading-relaxed">
                Generate high-resolution PNG and SVG QR codes for print, slides, or digital sharing with one click.
              </p>
            </div>
          </div>

          <div className="card-minimal flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center mb-4 text-primary">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold mb-2">Custom & Protected Links</h2>
              <p className="text-sm text-alt leading-relaxed">
                Set custom short aliases, expiration dates, click limits, or password protection for sensitive destinations.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="bg-surface-1 rounded-2xl p-8 sm:p-12 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-4">Ready to simplify your links?</h2>
          <p className="text-sm text-alt max-w-md mx-auto mb-8">
            Create an account in seconds with just a username and password.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/signup" className="btn btn-primary">
              Create free account
            </Link>
            <Link to="/signin" className="btn btn-secondary">
              Sign in
            </Link>
          </div>
        </section>
      </main>

      <footer className="w-full bg-canvas py-16 text-center text-xs text-muted relative overflow-hidden">
        {/* Half logo with blur in footer */}
        <div className="absolute left-1/2 -bottom-14 sm:-bottom-20 md:-bottom-28 -translate-x-1/2 pointer-events-none select-none opacity-20 dark:opacity-25 blur-[2px] transition-opacity">
          <img
            src="/short-black.svg"
            alt=""
            className="theme-logo-light w-[480px] sm:w-[680px] md:w-[900px] max-w-none"
          />
          <img
            src="/short-white.svg"
            alt=""
            className="theme-logo-dark w-[480px] sm:w-[680px] md:w-[900px] max-w-none"
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>Thoughtfully brief. © shrt</p>
          <p className="text-muted">MongoDB · Express · React · Node.js</p>
        </div>
      </footer>
    </div>
  );
}
