import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Link2,
  Copy,
  Check,
  QrCode,
  Shield,
  Smartphone,
  Calendar,
  Layers,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { QrModal } from "../components/QrModal.js";
import { apiRequest, ApiError } from "../lib/api.js";

export function ShortenPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [destinationUrl, setDestinationUrl] = useState(searchParams.get("url") || "");
  const [code, setCode] = useState("");
  const [iosUrl, setIosUrl] = useState("");
  const [androidUrl, setAndroidUrl] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [maxClicks, setMaxClicks] = useState<number | "">("");
  const [password, setPassword] = useState("");

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdLink, setCreatedLink] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: any = { destinationUrl: destinationUrl.trim() };
      if (code.trim()) payload.code = code.trim();
      if (iosUrl.trim()) payload.iosUrl = iosUrl.trim();
      if (androidUrl.trim()) payload.androidUrl = androidUrl.trim();
      if (expiresAt) payload.expiresAt = new Date(expiresAt).toISOString();
      if (maxClicks && Number(maxClicks) > 0) payload.maxClicks = Number(maxClicks);
      if (password.trim()) payload.password = password.trim();

      const res = await apiRequest<{ link: any }>("/links", {
        method: "POST",
        body: payload,
      });

      setCreatedLink(res.link);
    } catch (err: any) {
      const apiErr = err as ApiError;
      setError(apiErr.message || "Failed to create short link.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!createdLink) return;
    navigator.clipboard.writeText(createdLink.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setDestinationUrl("");
    setCode("");
    setIosUrl("");
    setAndroidUrl("");
    setExpiresAt("");
    setMaxClicks("");
    setPassword("");
    setCreatedLink(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Shorten URL</h1>
        <p className="text-xs text-alt mt-1">Create a clean short link with optional rules and redirects.</p>
      </div>

      {createdLink ? (
        <div className="card-minimal space-y-6 animate-in fade-in">
          <div className="text-center py-4">
            <span className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 inline-flex items-center justify-center mb-3">
              <Check className="w-6 h-6" />
            </span>
            <h2 className="text-xl font-semibold">Short Link Ready!</h2>
            <p className="text-xs text-alt mt-1">Share your short link anywhere.</p>
          </div>

          <div className="p-4 bg-surface-2 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="overflow-hidden w-full sm:w-auto">
              <p className="text-xs text-muted mb-0.5">Short URL</p>
              <p className="font-mono font-semibold text-primary text-base truncate">{createdLink.shortUrl}</p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleCopy}
                className="btn btn-primary text-xs flex-1 sm:flex-initial"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowQr(true)}
                className="btn btn-secondary text-xs flex-1 sm:flex-initial"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QR Code</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-3 text-xs">
            <button
              type="button"
              onClick={resetForm}
              className="text-alt hover:text-primary transition-colors"
            >
              ← Shorten another URL
            </button>

            <button
              type="button"
              onClick={() => navigate(`/dashboard/analytics/${createdLink.code}`)}
              className="text-primary font-medium hover:underline inline-flex items-center gap-1"
            >
              <span>View link analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card-minimal space-y-6">
          {error && (
            <div className="bg-rose-500/10 text-rose-500 text-xs p-3 rounded-xl font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-alt mb-1.5" htmlFor="dest">
              Destination URL <span className="text-rose-500">*</span>
            </label>
            <input
              id="dest"
              type="url"
              required
              value={destinationUrl}
              onChange={(e) => setDestinationUrl(e.target.value)}
              placeholder="https://example.com/your-very-long-url..."
              className="input-minimal"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-alt mb-1.5" htmlFor="custom-code">
              Custom Short Code (optional)
            </label>
            <div className="flex items-center">
              <span className="px-3 py-2.5 bg-surface-2 text-muted text-xs font-mono rounded-l-xl">
                shrtn/
              </span>
              <input
                id="custom-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                placeholder="my-link"
                className="input-minimal rounded-l-none"
              />
            </div>
            <span className="text-[11px] text-muted mt-1 block">
              Leave blank to automatically generate a random short code.
            </span>
          </div>

          {/* Toggle Advanced Options */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1.5"
            >
              <span>{showAdvanced ? "− Hide advanced options" : "+ Show advanced options (device routing, expiry, limits, password)"}</span>
            </button>
          </div>

          {showAdvanced && (
            <div className="space-y-4 pt-2 border-t-0 bg-surface-2/40 p-4 rounded-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-alt mb-1.5" htmlFor="ios-url">
                    iOS Device Destination
                  </label>
                  <input
                    id="ios-url"
                    type="url"
                    value={iosUrl}
                    onChange={(e) => setIosUrl(e.target.value)}
                    placeholder="https://apps.apple.com/..."
                    className="input-minimal text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-alt mb-1.5" htmlFor="android-url">
                    Android Device Destination
                  </label>
                  <input
                    id="android-url"
                    type="url"
                    value={androidUrl}
                    onChange={(e) => setAndroidUrl(e.target.value)}
                    placeholder="https://play.google.com/..."
                    className="input-minimal text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-alt mb-1.5" htmlFor="expires">
                    Expiration Date & Time
                  </label>
                  <input
                    id="expires"
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="input-minimal text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-alt mb-1.5" htmlFor="max-clicks">
                    Max Allowed Clicks
                  </label>
                  <input
                    id="max-clicks"
                    type="number"
                    min={1}
                    value={maxClicks}
                    onChange={(e) => setMaxClicks(e.target.value ? Number(e.target.value) : "")}
                    placeholder="e.g. 500"
                    className="input-minimal text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-alt mb-1.5" htmlFor="link-pass">
                  Password Protection (optional)
                </label>
                <input
                  id="link-pass"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Require visitors to enter a password"
                  className="input-minimal text-xs"
                />
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary w-full py-2.5">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating short link...</span>
              </>
            ) : (
              <span>Create short link</span>
            )}
          </button>
        </form>
      )}

      {createdLink && (
        <QrModal
          code={showQr ? createdLink.code : null}
          onClose={() => setShowQr(false)}
        />
      )}
    </div>
  );
}
