import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.js";
import { ProtectedRoute } from "./components/ProtectedRoute.js";
import { DashboardLayout } from "./components/DashboardLayout.js";

import { LandingPage } from "./pages/LandingPage.js";
import { SignInPage } from "./pages/SignInPage.js";
import { SignUpPage } from "./pages/SignUpPage.js";
import { DashboardOverviewPage } from "./pages/DashboardOverviewPage.js";
import { ShortenPage } from "./pages/ShortenPage.js";
import { LinksPage } from "./pages/LinksPage.js";
import { AnalyticsPage } from "./pages/AnalyticsPage.js";
import { QrGalleryPage } from "./pages/QrGalleryPage.js";
import { SettingsPage } from "./pages/SettingsPage.js";

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* Authenticated Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardOverviewPage />} />
            <Route path="shorten" element={<ShortenPage />} />
            <Route path="links" element={<LinksPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="analytics/:code" element={<AnalyticsPage />} />
            <Route path="qrcodes" element={<QrGalleryPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="personal-info" element={<Navigate to="/dashboard/settings" replace />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
