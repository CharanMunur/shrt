import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { BrandLogo } from "../components/BrandLogo.js";
import { ThemeToggle } from "../components/ThemeToggle.js";
import { useAuth } from "../context/AuthContext.js";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { ApiError } from "../lib/api.js";

export function SignUpPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialUrl = searchParams.get("url") || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (username.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      await register(username.trim(), password);
      if (initialUrl) {
        navigate(`/dashboard/shorten?url=${encodeURIComponent(initialUrl)}`, { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err: any) {
      const apiErr = err as ApiError;
      setError(apiErr.message || "Could not complete registration.");
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
          <h1 className="text-2xl font-semibold mb-2 text-primary">Create account</h1>
          <p className="text-xs text-alt mb-6">No email or verification required. Just choose a username.</p>

          {error && (
            <div className="bg-rose-500/10 text-rose-500 text-xs p-3 rounded-xl mb-4 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-alt mb-1.5" htmlFor="reg-username">
                Username
              </label>
              <input
                id="reg-username"
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="letters, numbers, hyphens"
                className="input-minimal"
              />
              <span className="text-[11px] text-muted mt-1 block">Min. 3 characters (alphanumeric)</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-alt mb-1.5" htmlFor="reg-password">
                Password
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
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
              <span className="text-[11px] text-muted mt-1 block">Secured with Argon2id</span>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full mt-2">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <span>Get started</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 text-center text-xs text-alt">
            Already have an account?{" "}
            <Link to="/signin" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>

      <footer className="text-center text-xs text-muted max-w-5xl mx-auto w-full">
        Shrtn · Clean links, zero friction
      </footer>
    </div>
  );
}
