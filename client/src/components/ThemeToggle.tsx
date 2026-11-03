import React from "react";
import { Sun, Moon, Laptop } from "lucide-react";
import { useAuth, ThemeMode } from "../context/AuthContext.js";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useAuth();

  const cycleTheme = () => {
    if (theme === "system") setTheme("dark");
    else if (theme === "dark") setTheme("light");
    else setTheme("system");
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={cycleTheme}
        className="w-7 h-7 rounded-lg bg-surface-2 border border-subtle text-secondary hover:text-primary flex items-center justify-center transition-colors"
        title={`Current theme: ${theme}. Click to switch.`}
        aria-label="Toggle theme"
      >
        {theme === "light" && <Sun className="w-3.5 h-3.5" />}
        {theme === "dark" && <Moon className="w-3.5 h-3.5" />}
        {theme === "system" && <Laptop className="w-3.5 h-3.5" />}
      </button>
    );
  }

  return (
    <div className="inline-flex p-1 rounded-full bg-surface-2 border border-subtle gap-1">
      {(["light", "dark", "system"] as ThemeMode[]).map((mode) => {
        const active = theme === mode;
        return (
          <button
            key={mode}
            type="button"
            onClick={() => setTheme(mode)}
            className={`px-3 py-1 text-xs rounded-full capitalize transition-all ${
              active
                ? "bg-primary text-canvas font-medium shadow-xs"
                : "text-muted hover:text-primary"
            }`}
          >
            {mode}
          </button>
        );
      })}
    </div>
  );
}
