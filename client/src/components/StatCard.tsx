import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  changePercentage?: number | null;
  icon?: React.ReactNode;
}

export function StatCard({ title, value, subtitle, changePercentage, icon }: StatCardProps) {
  const hasChange = changePercentage !== undefined && changePercentage !== null;
  const isPositive = hasChange && changePercentage >= 0;

  return (
    <div className="card-minimal flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted font-medium">{title}</span>
        {icon && <span className="text-muted">{icon}</span>}
      </div>

      <div className="flex items-baseline gap-2.5">
        <span className="text-2xl sm:text-3xl font-semibold text-primary">
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>

        {hasChange && (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
              isPositive
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
            }`}
          >
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(changePercentage)}%
          </span>
        )}
      </div>

      {subtitle && <p className="text-xs text-secondary mt-2">{subtitle}</p>}
    </div>
  );
}
