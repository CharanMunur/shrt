import React from "react";
import {
  getCountryFlagComponent,
  getDeviceVisual,
  getCategoryVisual,
  getBrowserVisual,
  getOsVisual,
} from "../lib/visuals.js";

interface BreakdownItem {
  name: string;
  count: number;
  percentage: number;
}

interface BreakdownTableProps {
  title: string;
  items: BreakdownItem[];
  type?: "category" | "country" | "browser" | "os" | "device" | "referrer" | "general";
  emptyMessage?: string;
  icon?: React.ReactNode;
}

export function BreakdownTable({
  title,
  items,
  type = "general",
  emptyMessage = "No data recorded",
  icon,
}: BreakdownTableProps) {
  const renderItemVisual = (name: string) => {
    switch (type) {
      case "country":
        return <span className="inline-flex shrink-0 mr-2">{getCountryFlagComponent(name, 18)}</span>;
      case "device":
        return <span className="text-muted mr-1.5">{getDeviceVisual(name)}</span>;
      case "category":
        return <span className="mr-1.5">{getCategoryVisual(name)}</span>;
      case "browser":
        return <span className="mr-1">{getBrowserVisual(name)}</span>;
      case "os":
        return <span className="mr-1">{getOsVisual(name)}</span>;
      default:
        return null;
    }
  };

  return (
    <div className="card-minimal flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
          {icon && <span className="text-muted">{icon}</span>}
          {title}
        </h4>
        <span className="text-xs text-muted font-mono">{items.reduce((s, i) => s + i.count, 0)} total</span>
      </div>

      {items.length === 0 ? (
        <div className="py-8 text-center text-xs text-muted">{emptyMessage}</div>
      ) : (
        <div className="space-y-2.5">
          {items.map((item, idx) => (
            <div key={idx} className="p-2.5 bg-surface-2 rounded-xl space-y-1.5 transition-colors">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center min-w-0 pr-2">
                  {renderItemVisual(item.name)}
                  {type !== "browser" && type !== "os" && (
                    <span className="text-primary font-medium truncate capitalize" title={item.name}>
                      {item.name || "Unknown"}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-xs font-semibold text-primary">
                    {item.count.toLocaleString()}
                  </span>
                  <span className="text-[11px] font-mono text-muted bg-surface-3 px-1.5 py-0.5 rounded-md">
                    {item.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1 bg-surface-3 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary/75 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(3, Math.min(100, item.percentage))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
