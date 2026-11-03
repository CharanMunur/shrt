import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface DataPoint {
  date: string;
  clicks: number;
}

interface TimeSeriesChartProps {
  data: DataPoint[];
  height?: number;
}

export function TimeSeriesChart({ data, height = 280 }: TimeSeriesChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className="w-full flex items-center justify-center text-xs text-muted bg-surface-2 border border-subtle rounded-xl"
        style={{ height }}
      >
        No activity recorded for this period
      </div>
    );
  }

  const formattedData = data.map((d) => {
    const parts = d.date.split("-");
    const label = parts.length === 3 ? `${parts[1]}/${parts[2]}` : d.date;
    return {
      ...d,
      displayDate: label,
    };
  });

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={formattedData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <XAxis
            dataKey="displayDate"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            allowDecimals={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "var(--surface-3)", opacity: 0.35, radius: 4 }}
          />
          <Bar
            dataKey="clicks"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
            maxBarSize={36}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-surface-1 border border-subtle px-3 py-2 rounded-xl text-xs shadow-lg">
        <p className="text-muted text-[11px] mb-0.5">{item.date}</p>
        <p className="font-semibold text-primary">
          {item.clicks.toLocaleString()} {item.clicks === 1 ? "click" : "clicks"}
        </p>
      </div>
    );
  }
  return null;
}
