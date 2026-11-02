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
        className="w-8 h-8 rounded-full bg-surface-1 text-alt hover:text-primary flex items-center justify-center transition-colors"
        title={`Current theme: ${theme}. Click to switch.`}
        aria-label="Toggle theme"
      >
        {theme === "light" && <Sun className="w-4 h-4" />}
        {theme === "dark" && <Moon className="w-4 h-4" />}
        {theme === "system" && <Laptop className="w-4 h-4" />}
      </button>
    );
  }

  return (
    <div className="inline-flex p-1 rounded-full bg-surface-1 gap-1">
      {(["light", "dark", "system"] as ThemeMode[]).map((mode) => {
        const active = theme === mode;
        return (
          <button
            key={mode}
            type="button"
            onClick={() => setTheme(mode)}
            className={`px-3 py-1 text-xs rounded-full capitalize transition-all ${
              active
                ? "bg-primary text-canvas font-medium shadow-none"
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
