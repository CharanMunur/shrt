import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Loader2,
  BarChart3,
  Monitor,
  Smartphone,
  Bot,
  Maximize2,
  X,
  Copy,
  ExternalLink,
  Check,
  Download,
  TrendingUp,
  TrendingDown,
  Compass,
  Clock,
  Globe,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { WorldMap } from "../components/WorldMap.js";
import {
  getBrowserIcon,
  getOsIcon,
  getDeviceType,
  getCountryCode,
  type IconData,
} from "../lib/icons.js";
import { apiRequest } from "../lib/api.js";

function formatRelativeTime(dateString?: string | null): string {
  if (!dateString) return "—";
  const d = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

export function AnalyticsPage() {
  const { code } = useParams<{ code?: string }>();
  const navigate = useNavigate();

  const [linksList, setLinksList] = useState<any[]>([]);
  const [selectedCode, setSelectedCode] = useState<string>(code || "");
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "all">("7d");
  const [tabEnvironment, setTabEnvironment] = useState<
    "browsers" | "os" | "devices" | "sources"
  >("browsers");
  const [tabLocation, setTabLocation] = useState<
    "countries" | "regions" | "cities"
  >("countries");
  const [expandedTab, setExpandedTab] = useState<
    "browsers" | "os" | "devices" | "sources" | "countries" | "regions" | "cities" | null
  >(null);
  const [copied, setCopied] = useState(false);

  // Load links for selector
  useEffect(() => {
    apiRequest<any>("/links?limit=100")
      .then((res) => {
        const list = res.links || [];
        setLinksList(list);
        if (!selectedCode && list.length > 0) {
          setSelectedCode(list[0].code);
        }
      })
      .catch((err) => console.error("Error loading links:", err));
  }, []);

  // Sync selectedCode when route param changes
  useEffect(() => {
    if (code) {
      setSelectedCode(code);
    }
  }, [code]);

  // Fetch analytics for selected link
  useEffect(() => {
    if (!selectedCode) return;

    let isMounted = true;
    setIsLoading(true);
    setError("");

    apiRequest<any>(`/links/${selectedCode}/analytics?period=${timeRange}`)
      .then((data) => {
        if (isMounted) setAnalytics(data);
      })
      .catch((err: any) => {
        if (isMounted) setError(err.message || "Failed to load link analytics.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCode, timeRange]);

  const handleCopyShortUrl = () => {
    if (!analytics) return;
    const fullUrl = `${window.location.origin}/${analytics.shortCode || selectedCode}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = () => {
    if (!analytics) return;
    const headers = [
      "Timestamp",
      "IP Address",
      "Country",
      "Region",
      "City",
      "Browser",
      "OS",
      "Device",
      "Referrer",
      "UTM Source",
      "UTM Medium",
      "UTM Campaign",
    ];

    const rows = (analytics.lastClicks || []).map((click: any) => [
      click.clickedAt,
      click.ipAddress || "Anonymous",
      click.country || "",
      click.region || "",
      click.city || "",
      click.browser || "",
      click.os || "",
      click.deviceType || "",
      `"${(click.referrer || "").replace(/"/g, '""')}"`,
      click.utmSource || "",
      click.utmMedium || "",
      click.utmCampaign || "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e: any[]) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `analytics_${selectedCode}_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const chartData = useMemo(() => {
    if (!analytics?.clicksByDate) return [];

    const data: { date: string; label: string; clicks: number }[] = [];
    const today = new Date();
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 0;

    if (days > 0) {
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        const label = d.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        });
        data.push({
          date: dateStr,
          label,
          clicks: analytics.clicksByDate[dateStr] || 0,
        });
      }
    } else {
      const dates = Object.keys(analytics.clicksByDate).sort();
      if (dates.length === 0) return [];

      const minDate = new Date(dates[0]);
      const maxDate = new Date();
      const curDate = new Date(minDate);
      while (curDate <= maxDate) {
        const dateStr = curDate.toISOString().split("T")[0];
        const label = curDate.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        });
        data.push({
          date: dateStr,
          label,
          clicks: analytics.clicksByDate[dateStr] || 0,
        });
        curDate.setDate(curDate.getDate() + 1);
      }
    }
    return data;
  }, [analytics, timeRange]);

  function topEntries(record: Record<string, number>, max = 8): [string, number][] {
    return Object.entries(record ?? {})
      .sort(([, a], [, b]) => b - a)
      .slice(0, max);
  }

  const browserEntries = analytics ? topEntries(analytics.browserBreakdown) : [];
  const osEntries = analytics ? topEntries(analytics.osBreakdown) : [];
  const deviceEntries = analytics ? topEntries(analytics.deviceBreakdown) : [];
  const countryEntries = analytics ? topEntries(analytics.countryBreakdown) : [];
  const regionEntries = analytics ? topEntries(analytics.regionBreakdown) : [];
  const cityEntries = analytics ? topEntries(analytics.cityBreakdown) : [];
  const referrerCategoryEntries = analytics ? topEntries(analytics.referrerCategories ?? {}) : [];
  const total = analytics?.totalClicks ?? 0;

  return (
    <div className="space-y-6">
      {/* Page Title Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold">Traffic Analytics</h1>
        <p className="text-xs text-secondary mt-1">
          Traffic performance and audience telemetry across your links
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-xs text-rose-500">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-24 gap-2 text-secondary text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span>Loading telemetry...</span>
        </div>
      ) : !analytics ? (
        <EmptyState linksList={linksList} />
      ) : (
        <div className="space-y-6">
          {/* Section 1: Link Bar */}
          <div className="card-minimal flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted font-medium">Link:</span>
                <select
                  value={selectedCode}
                  onChange={(e) => {
                    const newCode = e.target.value;
                    setSelectedCode(newCode);
                    navigate(`/dashboard/analytics/${newCode}`);
                  }}
                  className="bg-surface-2 border border-subtle px-2.5 py-1 rounded-lg text-xs font-semibold text-primary outline-none cursor-pointer"
                >
                  {linksList.map((l) => (
                    <option key={l._id} value={l.code}>
                      /{l.code}
                    </option>
                  ))}
                </select>
              </div>

              {analytics.originalUrl && (
                <p className="text-xs text-secondary truncate max-w-xl">
                  {analytics.originalUrl}
                </p>
              )}
            </div>

            {/* Quick Actions: Copy link, Export CSV, Visit */}
            <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
              <button
                type="button"
                onClick={handleCopyShortUrl}
                className="btn btn-secondary text-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy link"}</span>
              </button>
              <button
                type="button"
                onClick={handleExportCSV}
                className="btn btn-secondary text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              {analytics.originalUrl && (
                <a
                  href={analytics.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary text-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Visit</span>
                </a>
              )}
            </div>
          </div>

          {/* Section 2: Summary Cards */}
          {(() => {
            const topCountry = countryEntries[0];
            const topCountryPct = topCountry && total ? Math.round((topCountry[1] / total) * 100) : 0;
            const growth = analytics.clickGrowthPercent ?? 0;
            const isPositive = growth >= 0;

            return (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <MetricCard
                  label="Total clicks"
                  value={total.toLocaleString()}
                  subText={
                    <span className="inline-flex items-center gap-1">
                      {isPositive ? (
                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-rose-500" />
                      )}
                      <span className={isPositive ? "text-emerald-500" : "text-rose-500"}>
                        {isPositive ? `+${growth}%` : `${growth}%`}
                      </span>
                      <span className="text-muted">vs prior 7d</span>
                    </span>
                  }
                />
                <MetricCard
                  label="Peak window"
                  value={analytics.peakTime || "No traffic"}
                  subText="Highest activity"
                />
                <MetricCard
                  label="Daily average"
                  value={`${analytics.avgDailyClicks ?? 0}`}
                  subText="Clicks / active day"
                />
                <MetricCard
                  label="Top location"
                  value={topCountry ? topCountry[0] : "None"}
                  subText={
                    topCountry
                      ? `${topCountry[1].toLocaleString()} (${topCountryPct}%)`
                      : "No location"
                  }
                />
                <MetricCard
                  label="Referrers"
                  value={Object.keys(analytics.referrerCategories || {}).length.toString()}
                  subText={`${Object.keys(analytics.referrerBreakdown || {}).length} unique sources`}
                />
              </div>
            );
          })()}

          {/* Section 3: Click Volume Chart */}
          <div className="card-minimal">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <h3 className="text-sm font-semibold text-primary">Click volume</h3>
                <p className="text-xs text-secondary mt-0.5">
                  Daily registered visits for the selected timeframe
                </p>
              </div>

              {/* Time range selector */}
              <div className="flex items-center bg-surface-2 p-1 rounded-full border border-subtle self-start sm:self-auto gap-1">
                {(["7d", "30d", "all"] as const).map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 text-xs rounded-full font-medium transition-colors cursor-pointer ${
                      timeRange === range
                        ? "bg-primary text-canvas shadow-xs"
                        : "text-muted hover:text-primary"
                    }`}
                  >
                    {range === "7d" ? "7 days" : range === "30d" ? "30 days" : "All time"}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                  />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="clicks" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Section 4 & 5: Client Environment & Geographic Origin */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Section 4: Client Environment Panel */}
            <div className="card-minimal p-0 overflow-hidden flex flex-col h-[400px]">
              <div className="px-4 py-3 border-b border-subtle flex items-center justify-between shrink-0">
                <span className="text-xs font-semibold text-primary">Client environment</span>
                <button
                  type="button"
                  onClick={() => setExpandedTab(tabEnvironment)}
                  className="flex items-center gap-1 text-[11px] text-secondary hover:text-primary transition-colors cursor-pointer"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>View all</span>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-subtle bg-surface-2 px-4 gap-4 shrink-0">
                {(["browsers", "os", "devices", "sources"] as const).map((tab) => {
                  const active = tabEnvironment === tab;
                  const label =
                    tab === "browsers"
                      ? "Browser"
                      : tab === "os"
                      ? "Operating system"
                      : tab === "devices"
                      ? "Device"
                      : "Referrers";
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setTabEnvironment(tab)}
                      className={`text-xs py-2.5 border-b-2 font-medium transition-colors cursor-pointer ${
                        active
                          ? "border-primary text-primary"
                          : "border-transparent text-muted hover:text-primary"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Table Content */}
              <div className="flex-1 min-h-0 overflow-y-auto">
                {tabEnvironment === "browsers" && (
                  <BreakdownTable
                    title="Browser"
                    entries={browserEntries.slice(0, 5)}
                    total={total}
                    getIcon={getBrowserIcon}
                  />
                )}
                {tabEnvironment === "os" && (
                  <BreakdownTable
                    title="Operating system"
                    entries={osEntries.slice(0, 5)}
                    total={total}
                    getIcon={getOsIcon}
                  />
                )}
                {tabEnvironment === "devices" && (
                  <BreakdownTable
                    title="Device"
                    entries={deviceEntries.slice(0, 5)}
                    total={total}
                    renderIcon={(name) => {
                      const k = name.toLowerCase();
                      if (k.includes("bot")) return <Bot className="w-4 h-4 text-muted" />;
                      if (k.includes("mobile")) return <Smartphone className="w-4 h-4 text-muted" />;
                      return <Monitor className="w-4 h-4 text-muted" />;
                    }}
                  />
                )}
                {tabEnvironment === "sources" && (
                  <BreakdownTable
                    title="Source category"
                    entries={referrerCategoryEntries.slice(0, 5)}
                    total={total}
                    renderIcon={() => <Compass className="w-4 h-4 text-muted" />}
                  />
                )}
              </div>
            </div>

            {/* Section 5: Geographic Origin Panel */}
            <div className="card-minimal p-0 overflow-hidden flex flex-col h-[400px]">
              <div className="px-4 py-3 border-b border-subtle flex items-center justify-between shrink-0">
                <span className="text-xs font-semibold text-primary">Geographic origin</span>
                <button
                  type="button"
                  onClick={() => setExpandedTab(tabLocation)}
                  className="flex items-center gap-1 text-[11px] text-secondary hover:text-primary transition-colors cursor-pointer"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>View all</span>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-subtle bg-surface-2 px-4 gap-4 shrink-0">
                {(["countries", "regions", "cities"] as const).map((tab) => {
                  const active = tabLocation === tab;
                  const label =
                    tab === "countries" ? "Countries" : tab === "regions" ? "Regions" : "Cities";
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setTabLocation(tab)}
                      className={`text-xs py-2.5 border-b-2 font-medium transition-colors cursor-pointer ${
                        active
                          ? "border-primary text-primary"
                          : "border-transparent text-muted hover:text-primary"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Table Content */}
              <div className="flex-1 min-h-0 overflow-y-auto">
                {tabLocation === "countries" && (
                  <BreakdownTable
                    title="Country"
                    entries={countryEntries.slice(0, 5)}
                    total={total}
                    renderIcon={(name) => {
                      const code = getCountryCode(name);
                      if (code) {
                        return <span className={`fi fi-${code} rounded-xs`} />;
                      }
                      return (
                        <div className="w-4 h-4 rounded-xs bg-surface-3 text-[10px] text-muted flex items-center justify-center">
                          {name.charAt(0)}
                        </div>
                      );
                    }}
                  />
                )}
                {tabLocation === "regions" && (
                  <BreakdownTable
                    title="Region"
                    entries={regionEntries.slice(0, 5)}
                    total={total}
                  />
                )}
                {tabLocation === "cities" && (
                  <BreakdownTable
                    title="City"
                    entries={cityEntries.slice(0, 5)}
                    total={total}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Section 6 & 7: Geographic Density (World Map) & Hourly Density (Heatmap) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            <div className="lg:col-span-2 card-minimal flex flex-col gap-3">
              <div>
                <h3 className="text-sm font-semibold text-primary">Geographic density</h3>
                <p className="text-xs text-secondary mt-0.5">
                  Visitor distribution across global regions
                </p>
              </div>
              <div className="h-[460px] bg-surface-2 rounded-xl border border-subtle overflow-hidden">
                <WorldMap countryBreakdown={analytics ? analytics.countryBreakdown : {}} />
              </div>
            </div>

            <div className="lg:col-span-1">
              <TrafficHeatmap heatmap={analytics.trafficHeatmap} />
            </div>
          </div>

          {/* Section 8: Telemetry Stream (No profile/visitor avatars!) */}
          <div className="card-minimal p-0 overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-subtle flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-primary">Telemetry stream</h3>
                <p className="text-xs text-secondary mt-0.5">
                  Latest edge routing events for this URL
                </p>
              </div>
              <span className="text-xs text-muted">
                {analytics.lastClicks ? analytics.lastClicks.length : 0} events
              </span>
            </div>

            <div className="divide-y divide-subtle">
              {!analytics.lastClicks || analytics.lastClicks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted">
                  <Clock className="w-5 h-5 opacity-40 mb-2" />
                  <p className="text-xs">No click events recorded</p>
                </div>
              ) : (
                analytics.lastClicks.slice(0, 10).map((click: any, i: number) => {
                  const ua = click.userAgent || "";
                  const browserInfo = getBrowserIcon(click.browser || ua);
                  const osInfo = getOsIcon(click.os || ua);
                  const deviceLabel = getDeviceType(click.deviceType || ua);
                  const countryCode = click.country ? getCountryCode(click.country) : null;
                  const relTime = formatRelativeTime(click.clickedAt);

                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-4 px-4 py-2.5 hover:bg-surface-2 transition-colors text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="text-muted shrink-0 w-24 truncate">
                          {click.ipAddress || "Anonymous"}
                        </span>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {countryCode ? (
                            <span className={`fi fi-${countryCode} rounded-xs`} title={click.country} />
                          ) : (
                            <span className="text-[10px] text-muted">{click.country || "—"}</span>
                          )}
                          <span className="text-primary truncate max-w-[140px] hidden sm:inline">
                            {click.city && click.city !== "Unknown" ? `${click.city}, ` : ""}
                            {click.country || "Unknown"}
                          </span>
                        </div>

                        <div className="hidden md:flex items-center gap-2 text-muted shrink-0">
                          <span>•</span>
                          <span>{browserInfo?.label || click.browser || "Browser"}</span>
                          <span>/</span>
                          <span>{osInfo?.label || click.os || "OS"}</span>
                          <span>•</span>
                          <span className="capitalize">{deviceLabel}</span>
                        </div>

                        {click.referrer && click.referrer !== "Direct / Unknown" && (
                          <span className="text-muted truncate hidden lg:inline ml-auto">
                            via {click.referrer}
                          </span>
                        )}
                      </div>

                      <span className="text-secondary shrink-0 text-right">{relTime}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Expanded Modal for "View all" */}
      {expandedTab !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="card-minimal w-full max-w-3xl flex flex-col h-[75vh] shadow-xl p-0 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-4 py-3 border-b border-subtle shrink-0">
              <h3 className="font-semibold text-sm text-primary capitalize">{expandedTab}</h3>
              <button
                type="button"
                onClick={() => setExpandedTab(null)}
                className="p-1 hover:bg-surface-2 text-muted hover:text-primary rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {expandedTab === "browsers" && (
                <BreakdownTable
                  title="Browser"
                  entries={analytics ? topEntries(analytics.browserBreakdown, 100) : []}
                  total={total}
                  getIcon={getBrowserIcon}
                />
              )}
              {expandedTab === "os" && (
                <BreakdownTable
                  title="Operating system"
                  entries={analytics ? topEntries(analytics.osBreakdown, 100) : []}
                  total={total}
                  getIcon={getOsIcon}
                />
              )}
              {expandedTab === "sources" && (
                <BreakdownTable
                  title="Traffic source"
                  entries={referrerCategoryEntries}
                  total={total}
                  renderIcon={() => <Compass className="w-4 h-4 text-muted" />}
                />
              )}
              {expandedTab === "devices" && (
                <BreakdownTable
                  title="Device"
                  entries={analytics ? topEntries(analytics.deviceBreakdown, 100) : []}
                  total={total}
                  renderIcon={(name) => {
                    const k = name.toLowerCase();
                    if (k.includes("bot")) return <Bot className="w-4 h-4 text-muted" />;
                    if (k.includes("mobile")) return <Smartphone className="w-4 h-4 text-muted" />;
                    return <Monitor className="w-4 h-4 text-muted" />;
                  }}
                />
              )}
              {expandedTab === "countries" && (
                <BreakdownTable
                  title="Country"
                  entries={analytics ? topEntries(analytics.countryBreakdown, 100) : []}
                  total={total}
                  renderIcon={(name) => {
                    const code = getCountryCode(name);
                    if (code) return <span className={`fi fi-${code} rounded-xs`} />;
                    return null;
                  }}
                />
              )}
              {expandedTab === "regions" && (
                <BreakdownTable
                  title="Region"
                  entries={analytics ? topEntries(analytics.regionBreakdown, 100) : []}
                  total={total}
                />
              )}
              {expandedTab === "cities" && (
                <BreakdownTable
                  title="City"
                  entries={analytics ? topEntries(analytics.cityBreakdown, 100) : []}
                  total={total}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  subText,
}: {
  label: string;
  value: string;
  subText?: React.ReactNode;
}) {
  return (
    <div className="card-minimal flex flex-col justify-between">
      <span className="text-xs text-muted font-medium">{label}</span>
      <div className="mt-2">
        <p className="text-xl sm:text-2xl font-semibold text-primary truncate" title={value}>
          {value}
        </p>
        {subText && <div className="text-[11px] text-secondary mt-1 truncate">{subText}</div>}
      </div>
    </div>
  );
}

function BreakdownTable({
  title,
  entries,
  total,
  getIcon,
  renderIcon,
}: {
  title: string;
  entries: [string, number][];
  total: number;
  getIcon?: (name: string) => IconData | null;
  renderIcon?: (name: string) => React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 text-xs font-medium text-muted border-b border-subtle bg-surface-2">
        <span>{title}</span>
        <span>Clicks</span>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-subtle">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center gap-1 py-10 text-muted">
            <p className="text-xs">No records available</p>
          </div>
        ) : (
          entries.map(([fullName, count]) => {
            const [displayName, countryName] = fullName.includes(":")
              ? fullName.split(":")
              : [fullName, ""];
            const iconData = getIcon ? getIcon(displayName) : null;
            const totalPct = total ? Math.round((count / total) * 100) : 0;
            const regionCityFlagCode = countryName ? getCountryCode(countryName) : null;

            return (
              <div
                key={fullName}
                className="flex items-center gap-3 px-4 py-2 hover:bg-surface-2 transition-colors text-xs"
              >
                <div className="flex w-4 h-4 shrink-0 items-center justify-center">
                  {renderIcon ? (
                    renderIcon(displayName)
                  ) : regionCityFlagCode ? (
                    <span className={`fi fi-${regionCityFlagCode} rounded-xs`} />
                  ) : iconData ? (
                    <img
                      src={iconData.url}
                      alt={iconData.label}
                      className="w-3.5 h-3.5 object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-[10px] text-muted">{displayName.charAt(0)}</span>
                  )}
                </div>

                <span className="flex-1 font-medium text-primary truncate">
                  {displayName || "Unknown"}
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-primary font-medium">{count.toLocaleString()}</span>
                  <span className="text-secondary text-[11px] w-8 text-right">{totalPct}%</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function TrafficHeatmap({ heatmap }: { heatmap: number[][] }) {
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const HOURS = [
    "12a", "1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a",
    "12p", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p",
  ];

  const localHeatmap = useMemo(() => {
    const shifted = Array.from({ length: 7 }, () => Array(24).fill(0));
    if (!heatmap) return shifted;

    const timezoneOffsetMinutes = new Date().getTimezoneOffset();

    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        const count = heatmap[d]?.[h] ?? 0;
        if (count > 0) {
          let totalMinutes = (d * 24 + h) * 60 + 30 - timezoneOffsetMinutes;
          totalMinutes = ((totalMinutes % 10080) + 10080) % 10080;
          const totalHours = Math.floor(totalMinutes / 60);
          const localD = Math.floor(totalHours / 24);
          const localH = totalHours % 24;
          shifted[localD][localH] += count;
        }
      }
    }
    return shifted;
  }, [heatmap]);

  const maxClicks = useMemo(() => {
    let m = 1;
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        if (localHeatmap[d][h] > m) {
          m = localHeatmap[d][h];
        }
      }
    }
    return m;
  }, [localHeatmap]);

  return (
    <div className="card-minimal p-0 overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-subtle">
        <h3 className="text-sm font-semibold text-primary">Hourly density</h3>
        <p className="text-xs text-secondary mt-0.5">Distribution across the weekly cycle</p>
      </div>

      <div className="p-3">
        <div className="space-y-1">
          <div className="grid grid-cols-[36px_1fr] items-center gap-x-2 mb-1">
            <span className="text-[10px] text-muted text-right pr-1">Time</span>
            <div className="grid grid-cols-7 text-center text-[10px] text-muted">
              {DAYS.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
          </div>

          {Array.from({ length: 24 }).map((_, hIdx) => {
            const showLabel = hIdx % 3 === 0;
            return (
              <div key={hIdx} className="grid grid-cols-[36px_1fr] items-center gap-x-2">
                <span className="text-[10px] text-muted text-right pr-1 shrink-0 leading-none">
                  {showLabel ? HOURS[hIdx] : ""}
                </span>

                <div className="grid grid-cols-7 justify-items-center">
                  {Array.from({ length: 7 }).map((_, dIdx) => {
                    const count = localHeatmap[dIdx][hIdx];
                    const intensity = count / maxClicks;
                    const opacity = count > 0 ? 0.25 + intensity * 0.75 : 1;

                    return (
                      <div
                        key={dIdx}
                        className="flex items-center justify-center w-full h-3.5 group relative"
                        title={count > 0 ? `${DAYS[dIdx]} ${HOURS[hIdx]}: ${count} clicks` : undefined}
                      >
                        <div
                          className={`rounded-xs transition-colors ${
                            count > 0 ? "bg-primary" : "bg-surface-3"
                          }`}
                          style={{
                            width: "12px",
                            height: "10px",
                            opacity: opacity,
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ linksList }: { linksList: any[] }) {
  if (linksList.length === 0) {
    return (
      <div className="card-minimal flex flex-col items-center justify-center py-20 gap-2 text-center">
        <BarChart3 className="w-6 h-6 text-muted" />
        <p className="text-sm font-semibold text-primary">No links available</p>
        <p className="text-xs text-secondary max-w-xs">
          Shorten a URL to start collecting engagement telemetry.
        </p>
      </div>
    );
  }
  return (
    <div className="card-minimal flex flex-col items-center justify-center py-20 gap-2 text-center text-muted">
      <BarChart3 className="w-6 h-6 text-muted" />
      <p className="text-sm font-semibold text-primary">No telemetry recorded yet</p>
      <p className="text-xs text-secondary max-w-xs">
        Share your short link to capture visitor routing analytics.
      </p>
    </div>
  );
}

function ChartTooltipContent({ active, payload }: any) {
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
