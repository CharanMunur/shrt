import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { BrandLogo } from "../components/BrandLogo.js";
import { ThemeToggle } from "../components/ThemeToggle.js";
import { useAuth } from "../context/AuthContext.js";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { ApiError } from "../lib/api.js";

export function SignInPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const returnTo = searchParams.get("returnTo") || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(username.trim(), password);
      // Validate safe relative return path
      const target = returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/dashboard";
      navigate(target, { replace: true });
    } catch (err: any) {
      const apiErr = err as ApiError;
      setError(apiErr.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-between p-6">
      <header className="flex items-center justify-between max-w-5xl mx-auto w-full">
        <BrandLogo />
        <ThemeToggle compact />
      </header>

      <div className="max-w-sm w-full mx-auto my-12">
        <div className="card-minimal">
          <h1 className="text-2xl font-semibold mb-2 text-primary">Sign in</h1>
          <p className="text-xs text-secondary mb-6">Enter your username and password to continue.</p>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs p-3 rounded-xl mb-4 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-secondary mb-1.5" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your username"
                className="input-minimal"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-secondary mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-minimal pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full mt-2">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-subtle text-center text-xs text-secondary">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-primary font-semibold hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>

      <footer className="text-center text-xs text-muted max-w-5xl mx-auto w-full">
        shrt · Clean links, zero friction
      </footer>
    </div>
  );
}
