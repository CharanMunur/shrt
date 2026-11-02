import React, { useEffect, useState } from "react";
import { Modal } from "./Modal.js";
import { apiRequest } from "../lib/api.js";
import { Download, Copy, Check, Loader2 } from "lucide-react";

interface QrModalProps {
  code: string | null;
  onClose: () => void;
}

export function QrModal({ code, onClose }: QrModalProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    code: string;
    shortUrl: string;
    destinationUrl: string;
    dataUrl: string;
    svg: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!code) {
      setData(null);
      return;
    }

    let isMounted = true;
    setLoading(true);

    apiRequest<{
      code: string;
      shortUrl: string;
      destinationUrl: string;
      dataUrl: string;
      svg: string;
    }>(`/links/${code}/qr`)
      .then((res) => {
        if (isMounted) setData(res);
      })
      .catch((err) => {
        console.error("Failed to load QR code:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [code]);

  const handleCopyLink = () => {
    if (!data) return;
    navigator.clipboard.writeText(data.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPng = () => {
    if (!data) return;
    const a = document.createElement("a");
    a.href = data.dataUrl;
    a.download = `shrtn-${data.code}-qr.png`;
    a.click();
  };

  const downloadSvg = () => {
    if (!data) return;
    const blob = new Blob([data.svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shrtn-${data.code}-qr.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      isOpen={Boolean(code)}
      onClose={onClose}
      title="Link QR Code"
      description={data?.shortUrl || "Scan to open short link"}
    >
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3 text-alt text-sm">
          <Loader2 className="w-5 h-5 animate-spin" />
          Generating QR code...
        </div>
      ) : data ? (
        <div className="flex flex-col items-center">
          <div className="p-4 bg-white rounded-xl my-4">
            <img
              src={data.dataUrl}
              alt={`QR code for ${data.code}`}
              className="w-56 h-56 object-contain"
            />
          </div>

          <div className="w-full bg-surface-2 rounded-xl p-3 mb-6 text-center">
            <span className="font-mono text-xs text-primary break-all">{data.shortUrl}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 w-full">
            <button
              type="button"
              onClick={handleCopyLink}
              className="btn btn-secondary text-xs flex-1 min-w-[120px]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy link"}
            </button>
            <button
              type="button"
              onClick={downloadPng}
              className="btn btn-secondary text-xs flex-1 min-w-[120px]"
            >
              <Download className="w-3.5 h-3.5" />
              Download PNG
            </button>
            <button
              type="button"
              onClick={downloadSvg}
              className="btn btn-primary text-xs flex-1 min-w-[120px]"
            >
              <Download className="w-3.5 h-3.5" />
              Download SVG
            </button>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-sm text-muted">
          Could not load QR code.
        </div>
      )}
    </Modal>
  );
}
