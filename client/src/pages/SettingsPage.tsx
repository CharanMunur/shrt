import React, { useState } from "react";
import { ThemeToggle } from "../components/ThemeToggle.js";
import { useAuth } from "../context/AuthContext.js";
import { KeyRound, User, Palette, Check, AlertCircle, Loader2 } from "lucide-react";
import { apiRequest, ApiError } from "../lib/api.js";

export function SettingsPage() {
  const { user, refetchUser } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      setPasswordLoading(true);
      await apiRequest("/users/me/password", {
        method: "PATCH",
        body: { currentPassword, newPassword },
      });

      setPasswordSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const apiErr = err as ApiError;
      setPasswordError(apiErr.message || "Failed to update password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Account Settings</h1>
        <p className="text-xs text-alt mt-1">Manage your theme preferences and security.</p>
      </div>

      {/* Account Info */}
      <div className="card-minimal space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-primary">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-primary">Account Identity</h2>
            <p className="text-xs text-alt">Authenticated via username and password</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-3 bg-surface-2 rounded-xl">
            <span className="text-[11px] text-muted block mb-0.5">Username</span>
            <span className="text-xs font-mono font-medium text-primary">{user?.username}</span>
          </div>

          <div className="p-3 bg-surface-2 rounded-xl">
            <span className="text-[11px] text-muted block mb-0.5">Member Since</span>
            <span className="text-xs font-medium text-primary">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Today"}
            </span>
          </div>
        </div>
      </div>

      {/* Theme Preference */}
      <div className="card-minimal space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-primary">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-primary">Appearance</h2>
            <p className="text-xs text-alt">Select your preferred color theme</p>
          </div>
        </div>

        <div className="pt-2">
          <ThemeToggle />
        </div>
      </div>

      {/* Change Password Form */}
      <div className="card-minimal space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-primary">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-primary">Security & Password</h2>
            <p className="text-xs text-alt">Update your account password</p>
          </div>
        </div>

        {passwordSuccess && (
          <div className="p-3 bg-emerald-500/10 text-emerald-500 text-xs rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="p-3 bg-rose-500/10 text-rose-500 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-alt mb-1.5" htmlFor="current-pass">
              Current Password
            </label>
            <input
              id="current-pass"
              type="password"
              required
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="input-minimal text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-alt mb-1.5" htmlFor="new-pass">
              New Password (min. 8 characters)
            </label>
            <input
              id="new-pass"
              type="password"
              required
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="input-minimal text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-alt mb-1.5" htmlFor="confirm-pass">
              Confirm New Password
            </label>
            <input
              id="confirm-pass"
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="input-minimal text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="btn btn-primary text-xs mt-2"
          >
            {passwordLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Updating password...</span>
              </>
            ) : (
              <span>Update password</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
