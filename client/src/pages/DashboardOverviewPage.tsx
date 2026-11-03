import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Link2,
  MousePointerClick,
  TrendingUp,
  PlusCircle,
  Copy,
  Check,
  QrCode,
  ArrowRight,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { StatCard } from "../components/StatCard.js";
import { TimeSeriesChart } from "../components/TimeSeriesChart.js";
import { QrModal } from "../components/QrModal.js";
import { apiRequest } from "../lib/api.js";

export function DashboardOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [selectedQrCode, setSelectedQrCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [quickUrl, setQuickUrl] = useState("");
  const [quickShortening, setQuickShortening] = useState(false);
  const [createdLink, setCreatedLink] = useState<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, linksRes] = await Promise.all([
        apiRequest<any>("/analytics?period=7d"),
        apiRequest<any>("/links?limit=5"),
      ]);
      setStats(analyticsRes);
      setLinks(linksRes.links || []);
    } catch (err) {
      console.error("Dashboard overview fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCopy = (code: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleQuickShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickUrl.trim()) return;

    try {
      setQuickShortening(true);
      const res = await apiRequest<{ link: any }>("/links", {
        method: "POST",
        body: { destinationUrl: quickUrl.trim() },
      });
      setCreatedLink(res.link);
      setQuickUrl("");
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to create short link.");
    } finally {
      setQuickShortening(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center text-xs text-secondary gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
        <span>Loading overview...</span>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">Overview</h1>
          <p className="text-xs text-secondary mt-1">Live traffic metrics and link activity across your account.</p>
        </div>

        <Link to="/dashboard/shorten" className="btn btn-primary text-xs self-start sm:self-auto">
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New short link</span>
        </Link>
      </div>

      {/* Quick Shorten Bar */}
      <div className="card-minimal">
        <form onSubmit={handleQuickShorten} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="url"
            required
            placeholder="Paste a long destination URL to shorten instantly..."
            value={quickUrl}
            onChange={(e) => setQuickUrl(e.target.value)}
            className="input-minimal flex-1 text-xs"
          />
          <button type="submit" disabled={quickShortening} className="btn btn-primary text-xs">
            {quickShortening ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlusCircle className="w-3.5 h-3.5" />}
            <span>Shorten</span>
          </button>
        </form>

        {createdLink && (
          <div className="mt-4 p-3 bg-surface-2 border border-subtle rounded-xl flex items-center justify-between text-xs animate-in fade-in">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-muted text-[11px]">Short URL:</span>
              <span className="font-medium text-primary truncate">{createdLink.shortUrl}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopy(createdLink.code, createdLink.shortUrl)}
                className="btn btn-secondary text-xs py-1 px-2.5"
              >
                {copiedCode === createdLink.code ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode === createdLink.code ? "Copied" : "Copy"}</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedQrCode(createdLink.code)}
                className="btn btn-secondary text-xs py-1 px-2.5"
                title="View QR Code"
              >
                <QrCode className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Links"
          value={links.length}
          subtitle="Active on your account"
          icon={<Link2 className="w-4 h-4" />}
        />
        <StatCard
          title="Total Clicks"
          value={stats?.summary?.overallClicks || 0}
          subtitle="All-time across all links"
          icon={<MousePointerClick className="w-4 h-4" />}
        />
        <StatCard
          title="Past 7 Days"
          value={stats?.summary?.totalClicks || 0}
          subtitle="Clicks recorded this week"
          changePercentage={stats?.summary?.changePercentage}
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <StatCard
          title="Peak Volume"
          value={stats?.summary?.peakHour ? `${stats.summary.peakHour.hour}:00 UTC` : "—"}
          subtitle={
            stats?.summary?.peakDay
              ? `${stats.summary.peakDay.clicks} clicks on ${stats.summary.peakDay.date}`
              : "No recorded traffic"
          }
          icon={<TrendingUp className="w-4 h-4" />}
        />
      </div>

      {/* 7-Day Traffic Chart */}
      <div className="card-minimal">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-primary">Traffic Trend (Past 7 Days)</h3>
            <p className="text-xs text-secondary mt-0.5">Continuous daily click volume with zero-day padding</p>
          </div>
          <Link to="/dashboard/analytics" className="text-xs text-secondary hover:text-primary inline-flex items-center gap-1 font-medium transition-colors">
            <span>Detailed analytics</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <TimeSeriesChart data={stats?.timeSeries || []} height={220} />
      </div>

      {/* Recent Links */}
      <div className="card-minimal">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-primary">Recent Short Links</h3>
            <p className="text-xs text-secondary mt-0.5">Most recently created short links</p>
          </div>
          <Link to="/dashboard/links" className="text-xs text-secondary hover:text-primary inline-flex items-center gap-1 font-medium transition-colors">
            <span>View all links</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {links.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted">
            No short links yet. Shorten your first URL above to see metrics.
          </div>
        ) : (
          <div className="space-y-2">
            {links.map((link) => (
              <div
                key={link._id}
                className="p-3 bg-surface-2 border border-subtle rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-text-primary/20 transition-all"
              >
                <div className="overflow-hidden space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-primary">/{link.code}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        link.isActive
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-zinc-500/10 text-zinc-500"
                      }`}
                    >
                      {link.isActive ? "Active" : "Disabled"}
                    </span>
                    {link.hasPassword && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-3 text-secondary font-medium">
                        Protected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted truncate max-w-md">{link.destinationUrl}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <div className="text-right text-xs bg-surface-1 px-2.5 py-1 rounded-lg border border-subtle">
                    <span className="font-semibold text-primary">{link.clicksCount}</span>
                    <span className="text-muted ml-1 text-[11px]">clicks</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(link.code, link.shortUrl)}
                    className="w-8 h-8 rounded-lg bg-surface-1 border border-subtle text-secondary hover:text-primary hover:bg-surface-3 flex items-center justify-center transition-colors"
                    title="Copy short URL"
                  >
                    {copiedCode === link.code ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedQrCode(link.code)}
                    className="w-8 h-8 rounded-lg bg-surface-1 border border-subtle text-secondary hover:text-primary hover:bg-surface-3 flex items-center justify-center transition-colors"
                    title="QR Code"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                  </button>

                  <Link
                    to={`/dashboard/analytics/${link.code}`}
                    className="w-8 h-8 rounded-lg bg-surface-1 border border-subtle text-secondary hover:text-primary hover:bg-surface-3 flex items-center justify-center transition-colors"
                    title="View Analytics"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <QrModal code={selectedQrCode} onClose={() => setSelectedQrCode(null)} />
    </div>
  );
}
