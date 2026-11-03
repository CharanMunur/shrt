import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { QrCode, Download, Copy, Check, ExternalLink, Loader2, PlusCircle } from "lucide-react";
import { apiRequest } from "../lib/api.js";
import { QrModal } from "../components/QrModal.js";

export function QrGalleryPage() {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQrCode, setSelectedQrCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<any>("/links?limit=50&status=active")
      .then((res) => setLinks(res.links || []))
      .catch((err) => console.error("Error loading links for QR:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = (code: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">QR Codes</h1>
          <p className="text-xs text-secondary mt-1">High-resolution QR codes for all your active short links.</p>
        </div>

        <Link to="/dashboard/shorten" className="btn btn-primary text-xs self-start sm:self-auto">
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New short link</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2 text-secondary text-xs">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span>Loading QR codes...</span>
        </div>
      ) : links.length === 0 ? (
        <div className="card-minimal py-16 text-center text-xs text-muted space-y-3">
          <p>No active short links found. Create one to generate a QR code.</p>
          <Link to="/dashboard/shorten" className="btn btn-primary text-xs inline-flex">
            Create link
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {links.map((link) => (
            <div key={link._id} className="card-minimal flex flex-col justify-between hover:border-text-primary/20 transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-xs text-primary">/{link.code}</span>
                  <span className="text-[11px] text-muted bg-surface-2 border border-subtle px-2 py-0.5 rounded-md">
                    {link.clicksCount} clicks
                  </span>
                </div>

                <p className="text-xs text-muted truncate mb-4">{link.destinationUrl}</p>
              </div>

              <div className="pt-4 flex items-center justify-between gap-2 border-t border-subtle">
                <button
                  type="button"
                  onClick={() => handleCopy(link.code, link.shortUrl)}
                  className="btn btn-secondary text-xs flex-1"
                >
                  {copiedCode === link.code ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedCode === link.code ? "Copied" : "Copy"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedQrCode(link.code)}
                  className="btn btn-primary text-xs flex-1"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Inspect QR</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <QrModal code={selectedQrCode} onClose={() => setSelectedQrCode(null)} />
    </div>
  );
}
