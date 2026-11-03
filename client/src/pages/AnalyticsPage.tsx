import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  BarChart2,
  Calendar,
  Download,
  MousePointerClick,
  TrendingUp,
  Globe,
  Compass,
  Monitor,
  Share2,
  Tag,
  Loader2,
  Clock,
  Filter,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { StatCard } from "../components/StatCard.js";
import { TimeSeriesChart } from "../components/TimeSeriesChart.js";
import { BreakdownTable } from "../components/BreakdownTable.js";
import { CountryFlag, formatCountryName } from "../components/CountryFlag.js";
import { QrModal } from "../components/QrModal.js";
import { apiRequest } from "../lib/api.js";
import {
  getVisitorAvatarUrl,
  getDeviceVisual,
  getCategoryVisual,
} from "../lib/visuals.js";

export function AnalyticsPage() {
  const { code } = useParams<{ code?: string }>();
  const navigate = useNavigate();

  const [period, setPeriod] = useState<"7d" | "30d" | "all">("7d");
  const [linksList, setLinksList] = useState<any[]>([]);
  const [selectedCode, setSelectedCode] = useState<string>(code || "all");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  // Quick action states
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  // Events Table State (for specific link)
  const [events, setEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsPage, setEventsPage] = useState(1);
  const [eventsTotalPages, setEventsTotalPages] = useState(1);

  // Load user's links for selector dropdown
  useEffect(() => {
    apiRequest<any>("/links?limit=100")
      .then((res) => setLinksList(res.links || []))
      .catch((err) => console.error("Error loading links list:", err));
  }, []);

  // Sync selected code with URL param
  useEffect(() => {
    setSelectedCode(code || "all");
    setEventsPage(1);
  }, [code]);

  // Fetch Analytics Aggregations
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const path =
      selectedCode === "all"
        ? `/analytics?period=${period}`
        : `/links/${selectedCode}/analytics?period=${period}`;

    apiRequest<any>(path)
      .then((res) => {
        if (isMounted) setData(res);
      })
      .catch((err) => {
        console.error("Error loading analytics:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCode, period]);

  // Fetch Event Stream if a specific link is selected
  useEffect(() => {
    if (selectedCode === "all") {
      setEvents([]);
      return;
    }

    setEventsLoading(true);
    apiRequest<any>(`/links/${selectedCode}/events?page=${eventsPage}&limit=10`)
      .then((res) => {
        setEvents(res.events || []);
        setEventsTotalPages(res.pagination?.totalPages || 1);
      })
      .catch((err) => console.error("Failed to load events:", err))
      .finally(() => setEventsLoading(false));
  }, [selectedCode, eventsPage]);

  const handleLinkSelectChange = (newCode: string) => {
    if (newCode === "all") {
      navigate("/dashboard/analytics");
    } else {
      navigate(`/dashboard/analytics/${newCode}`);
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = (format: "csv" | "json") => {
    if (selectedCode === "all") {
      alert("Please select a specific short link from the dropdown to export its click stream.");
      return;
    }
    const url = `/api/v1/links/${selectedCode}/export?period=${period}&format=${format}`;
    window.open(url, "_blank");
  };

  const selectedLink =
    selectedCode !== "all" ? linksList.find((l) => l.code === selectedCode) : null;
  const topCountry = data?.breakdowns?.countries?.[0];

  return (
    <div className="space-y-7">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-semibold">Traffic Analytics</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Telemetry
            </span>
          </div>
          <p className="text-xs text-secondary mt-1">
            Real-time MongoDB aggregation without cached delays.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Link Selector */}
          <div className="bg-surface-1 border border-subtle rounded-full px-3 py-1.5 flex items-center gap-2 text-xs shadow-2xs">
            <span className="text-muted font-medium">Target:</span>
            <select
              value={selectedCode}
              onChange={(e) => handleLinkSelectChange(e.target.value)}
              className="bg-transparent text-primary font-medium outline-none cursor-pointer text-xs"
            >
              <option value="all">Entire Account (All Links)</option>
              {linksList.map((l) => (
                <option key={l._id} value={l.code}>
                  /{l.code} ({l.clicksCount} clicks)
                </option>
              ))}
            </select>
          </div>

          {/* Period Selector */}
          <div className="inline-flex p-1 rounded-full bg-surface-1 border border-subtle gap-1 shadow-2xs">
            {(["7d", "30d", "all"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 text-xs rounded-full font-medium uppercase transition-all ${
                  period === p
                    ? "bg-primary text-canvas shadow-xs"
                    : "text-muted hover:text-primary"
                }`}
              >
                {p === "all" ? "All Time" : p}
              </button>
            ))}
          </div>

          {/* Export Dropdown / Buttons */}
          {selectedCode !== "all" && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleExport("csv")}
                className="btn btn-secondary text-xs px-2.5 py-1.5 shadow-2xs"
                title="Download CSV export"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
              <button
                type="button"
                onClick={() => handleExport("json")}
                className="btn btn-secondary text-xs px-2.5 py-1.5 shadow-2xs"
                title="Download JSON export"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Selected Link Context Card */}
      {selectedLink && (
        <div className="card-minimal border-l-4 border-l-accent flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-primary">
                {window.location.origin}/{selectedLink.code}
              </span>
              <button
                type="button"
                onClick={() => handleCopyLink(`${window.location.origin}/${selectedLink.code}`)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-2 border border-subtle text-secondary hover:text-primary text-[11px] font-medium transition-colors"
                title="Copy short link"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
              <a
                href={selectedLink.destinationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-muted hover:text-primary transition-colors"
                title="Open original destination"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  selectedLink.isActive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-zinc-500/10 text-zinc-500"
                }`}
              >
                {selectedLink.isActive ? "Active" : "Disabled"}
              </span>
            </div>
            <p className="text-xs text-secondary truncate max-w-2xl">
              {selectedLink.destinationUrl}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowQr(true)}
              className="btn btn-secondary text-xs"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR Code</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard/links")}
              className="btn btn-secondary text-xs"
            >
              <span>Manage</span>
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-2 text-secondary text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span>Aggregating analytics data...</span>
        </div>
      ) : (
        <>
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Period Clicks"
              value={data?.summary?.totalClicks || 0}
              subtitle="Recorded within selected range"
              changePercentage={data?.summary?.changePercentage}
              icon={<MousePointerClick className="w-4 h-4" />}
            />
            <StatCard
              title="All-Time Total"
              value={data?.summary?.overallClicks || 0}
              subtitle="Lifetime clicks to date"
              icon={<BarChart2 className="w-4 h-4" />}
            />
            <StatCard
              title="Peak Day"
              value={data?.summary?.peakDay ? data.summary.peakDay.clicks : 0}
              subtitle={
                data?.summary?.peakDay
                  ? `Highest volume (${data.summary.peakDay.date})`
                  : "No recorded traffic"
              }
              icon={<TrendingUp className="w-4 h-4" />}
            />
            {topCountry ? (
              <StatCard
                title="Top Country"
                value={
                  <span className="inline-flex items-center gap-2 text-xl font-semibold">
                    <CountryFlag country={topCountry.name} />
                    <span className="truncate max-w-[140px]">
                      {formatCountryName(topCountry.name)}
                    </span>
                  </span>
                }
                subtitle={`${topCountry.count} clicks (${topCountry.percentage}% of volume)`}
                icon={<Globe className="w-4 h-4" />}
              />
            ) : (
              <StatCard
                title="Peak Hour"
                value={data?.summary?.peakHour ? `${data.summary.peakHour.hour}:00 UTC` : "—"}
                subtitle={
                  data?.summary?.peakHour
                    ? `${data.summary.peakHour.clicks} clicks recorded`
                    : "Even distribution"
                }
                icon={<Clock className="w-4 h-4" />}
              />
            )}
          </div>

          {/* Time Series Area Chart */}
          <div className="card-minimal">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-sm font-semibold text-primary">Clicks Over Time</h3>
                <p className="text-xs text-secondary mt-0.5">
                  Daily click frequency with continuous zero-activity day padding
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-secondary">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  {data?.timeSeries?.reduce((acc: number, curr: any) => acc + curr.clicks, 0) || 0} clicks plotted
                </span>
              </div>
            </div>
            <TimeSeriesChart data={data?.timeSeries || []} height={280} />
          </div>

          {/* Breakdown Grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <BreakdownTable
              title="Top Countries"
              items={data?.breakdowns?.countries || []}
              type="country"
              icon={<Globe className="w-4 h-4" />}
              emptyMessage="No geographic data yet"
            />
            <BreakdownTable
              title="Referrer Categories"
              items={data?.breakdowns?.categories || []}
              type="category"
              icon={<Compass className="w-4 h-4" />}
              emptyMessage="No referrers logged"
            />
            <BreakdownTable
              title="Top Referrer Domains"
              items={data?.breakdowns?.referrers || []}
              type="referrer"
              icon={<Share2 className="w-4 h-4" />}
              emptyMessage="No direct or external referrers"
            />
            <BreakdownTable
              title="Devices"
              items={data?.breakdowns?.devices || []}
              type="device"
              icon={<Monitor className="w-4 h-4" />}
              emptyMessage="No devices recorded"
            />
            <BreakdownTable
              title="Browsers"
              items={data?.breakdowns?.browsers || []}
              type="browser"
              icon={<Compass className="w-4 h-4" />}
              emptyMessage="No browser user-agents"
            />
            <BreakdownTable
              title="Operating Systems"
              items={data?.breakdowns?.operatingSystems || []}
              type="os"
              icon={<Monitor className="w-4 h-4" />}
              emptyMessage="No OS records"
            />
          </div>

          {/* UTM Campaign Breakdown if present */}
          {(data?.breakdowns?.utmSources?.length > 0 ||
            data?.breakdowns?.utmMediums?.length > 0 ||
            data?.breakdowns?.utmCampaigns?.length > 0) && (
            <div className="card-minimal">
              <h3 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
                <Tag className="w-4 h-4 text-muted" />
                <span>Campaign & UTM Parameters</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <BreakdownTable
                  title="UTM Sources"
                  items={data?.breakdowns?.utmSources || []}
                  emptyMessage="No UTM sources"
                />
                <BreakdownTable
                  title="UTM Mediums"
                  items={data?.breakdowns?.utmMediums || []}
                  emptyMessage="No UTM mediums"
                />
                <BreakdownTable
                  title="UTM Campaigns"
                  items={data?.breakdowns?.utmCampaigns || []}
                  emptyMessage="No UTM campaigns"
                />
              </div>
            </div>
          )}

          {/* Recent Clicks Stream (Available when a specific link is selected) */}
          {selectedCode !== "all" && (
            <div className="card-minimal">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-primary">Recent Click Stream</h3>
                  <p className="text-xs text-secondary mt-0.5">
                    Real-time visitor telemetry (IP addresses are discarded immediately after geo-lookup)
                  </p>
                </div>
              </div>

              {eventsLoading ? (
                <div className="py-12 flex items-center justify-center text-xs text-secondary gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span>Loading recent click events...</span>
                </div>
              ) : events.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted">
                  No clicks recorded for this link yet. Share the link to start collecting analytics.
                </div>
              ) : (
                <div className="space-y-2">
                  {events.map((ev) => (
                    <div
                      key={ev._id}
                      className="p-3 bg-surface-2 border border-subtle rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-text-primary/20 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Deterministic Notionists Avatar */}
                        <img
                          src={getVisitorAvatarUrl(ev._id)}
                          alt="Visitor avatar"
                          className="w-8 h-8 rounded-full bg-surface-3 object-cover shrink-0 border border-subtle"
                          loading="lazy"
                        />

                        <div className="space-y-0.5 overflow-hidden">
                          <div className="flex items-center gap-2">
                            <CountryFlag country={ev.country} />
                            <span className="font-semibold text-primary truncate">
                              {formatCountryName(ev.country)}
                              {ev.city && ev.city !== "Unknown" ? ` · ${ev.city}` : ""}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-muted">
                            <span className="inline-flex items-center gap-1">
                              {getDeviceVisual(ev.deviceType)}
                              <span>
                                {ev.browser} on {ev.os}
                              </span>
                            </span>
                            <span>·</span>
                            <span className="text-secondary">
                              {new Date(ev.clickedAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })}
                            </span>
                            <span>·</span>
                            <span className="text-[10px] text-muted">
                              {new Date(ev.clickedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-secondary text-[11px] self-start sm:self-center shrink-0">
                        <span className="inline-flex items-center gap-1.5 bg-surface-1 border border-subtle px-2.5 py-1 rounded-full font-medium">
                          {getCategoryVisual(ev.referrerCategory)}
                          <span className="truncate max-w-[140px]">{ev.referrer}</span>
                        </span>

                        {ev.utmSource && (
                          <span className="bg-surface-1 border border-subtle px-2 py-0.5 rounded-full text-muted text-[10px]">
                            utm: {ev.utmSource}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Events pagination */}
                  {eventsTotalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-subtle text-xs text-secondary">
                      <span>
                        Page {eventsPage} of {eventsTotalPages}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={eventsPage <= 1}
                          onClick={() => setEventsPage((p) => Math.max(1, p - 1))}
                          className="btn btn-secondary text-xs px-3 py-1"
                        >
                          Previous
                        </button>
                        <button
                          type="button"
                          disabled={eventsPage >= eventsTotalPages}
                          onClick={() => setEventsPage((p) => Math.min(eventsTotalPages, p + 1))}
                          className="btn btn-secondary text-xs px-3 py-1"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* QR Code Modal */}
      {showQr && selectedCode !== "all" && (
        <QrModal code={selectedCode} onClose={() => setShowQr(false)} />
      )}
    </div>
  );
}
