import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="flex items-center gap-3 text-alt text-sm">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Loading shrt...
        </div>
      </div>
    );
  }

  if (!user) {
    // Preserve requested return path safely
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/signin?returnTo=${returnUrl}`} replace />;
  }

  return <>{children}</>;
}
