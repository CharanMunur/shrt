import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

export function RedirectPage() {
  const { code } = useParams<{ code: string }>();

  useEffect(() => {
    if (code) {
      window.location.replace(`/api/v1/redirect/${encodeURIComponent(code)}`);
    }
  }, [code]);

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="flex flex-col items-center gap-3 text-secondary text-xs">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span>Redirecting...</span>
      </div>
    </div>
  );
}
