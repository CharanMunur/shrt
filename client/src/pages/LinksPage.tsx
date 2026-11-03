import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Copy,
  Check,
  QrCode,
  BarChart3,
  Edit2,
  Trash2,
  Power,
  ExternalLink,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { QrModal } from "../components/QrModal.js";
import { Modal } from "../components/Modal.js";
import { apiRequest } from "../lib/api.js";

export function LinksPage() {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedQrCode, setSelectedQrCode] = useState<string | null>(null);

  // Edit Link State
  const [editingLink, setEditingLink] = useState<any>(null);
  const [editDestination, setEditDestination] = useState("");
  const [editIosUrl, setEditIosUrl] = useState("");
  const [editAndroidUrl, setEditAndroidUrl] = useState("");
  const [editExpiresAt, setEditExpiresAt] = useState("");
  const [editMaxClicks, setEditMaxClicks] = useState<number | "">("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [editPassword, setEditPassword] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  // Delete Link State
  const [deletingLink, setDeletingLink] = useState<any>(null);
  const [deleteConfirming, setDeleteConfirming] = useState(false);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15",
        status: statusFilter,
      });
      if (search.trim()) params.append("search", search.trim());

      const data = await apiRequest<any>(`/links?${params.toString()}`);
      setLinks(data.links || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch links:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLinks();
  };

  const handleCopy = (code: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleToggleActive = async (link: any) => {
    try {
      const updated = await apiRequest<{ link: any }>(`/links/${link.code}`, {
        method: "PATCH",
        body: { isActive: !link.isActive },
      });
      setLinks((prev) => prev.map((l) => (l.code === link.code ? updated.link : l)));
    } catch (err: any) {
      alert(err.message || "Failed to update link status");
    }
  };

  const openEditModal = (link: any) => {
    setEditingLink(link);
    setEditDestination(link.destinationUrl || "");
    setEditIosUrl(link.iosUrl || "");
    setEditAndroidUrl(link.androidUrl || "");
    setEditExpiresAt(
      link.expiresAt ? new Date(link.expiresAt).toISOString().slice(0, 16) : ""
    );
    setEditMaxClicks(link.maxClicks || "");
    setEditIsActive(link.isActive);
    setEditPassword("");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink) return;

    try {
      setEditSaving(true);
      const payload: any = {
        destinationUrl: editDestination.trim(),
        iosUrl: editIosUrl.trim() || null,
        androidUrl: editAndroidUrl.trim() || null,
        expiresAt: editExpiresAt ? new Date(editExpiresAt).toISOString() : null,
        maxClicks: editMaxClicks && Number(editMaxClicks) > 0 ? Number(editMaxClicks) : null,
        isActive: editIsActive,
      };
      if (editPassword) payload.password = editPassword;

      const updated = await apiRequest<{ link: any }>(`/links/${editingLink.code}`, {
        method: "PATCH",
        body: payload,
      });

      setLinks((prev) => prev.map((l) => (l.code === editingLink.code ? updated.link : l)));
      setEditingLink(null);
    } catch (err: any) {
      alert(err.message || "Failed to save link updates.");
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingLink) return;

    try {
      setDeleteConfirming(true);
      await apiRequest(`/links/${deletingLink.code}`, { method: "DELETE" });
      setLinks((prev) => prev.filter((l) => l.code !== deletingLink.code));
      setDeletingLink(null);
    } catch (err: any) {
      alert(err.message || "Failed to delete short link.");
    } finally {
      setDeleteConfirming(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">My Links</h1>
          <p className="text-xs text-secondary mt-1">Manage, edit, and track your active short URLs.</p>
        </div>

        <Link to="/dashboard/shorten" className="btn btn-primary text-xs self-start sm:self-auto">
          Shorten new URL
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-minimal flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by code or destination URL..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-minimal pl-9 text-xs"
            />
          </div>
          <button type="submit" className="btn btn-secondary text-xs">
            Search
          </button>
        </form>

        <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-full border border-subtle self-start md:self-auto">
          {(["all", "active", "inactive"] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => {
                setStatusFilter(filter);
                setPage(1);
              }}
              className={`px-3 py-1 text-xs rounded-full capitalize transition-colors ${
                statusFilter === filter
                  ? "bg-primary text-canvas font-medium shadow-xs"
                  : "text-muted hover:text-primary"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Links List */}
      <div className="card-minimal">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2 text-secondary text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span>Loading short links...</span>
          </div>
        ) : links.length === 0 ? (
          <div className="py-16 text-center text-xs text-muted space-y-3">
            <p>No short links found matching your search.</p>
            <Link to="/dashboard/shorten" className="btn btn-primary text-xs inline-flex">
              Create a link now
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {links.map((link) => (
              <div
                key={link._id}
                className="p-3.5 bg-surface-2 border border-subtle rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all hover:border-text-primary/20"
              >
                {/* Info block */}
                <div className="space-y-1.5 overflow-hidden">
                  <div className="flex flex-wrap items-center gap-2">
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
                    {link.isExpired && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-medium">
                        Expired
                      </span>
                    )}
                    {link.isClickLimitReached && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium">
                        Limit Reached
                      </span>
                    )}
                    {link.hasPassword && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-3 text-secondary font-medium">
                        Password Protected
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted truncate max-w-xl">{link.destinationUrl}</p>

                  <div className="flex items-center gap-4 text-[11px] text-muted pt-0.5">
                    <span>Created {new Date(link.createdAt).toLocaleDateString()}</span>
                    {link.expiresAt && (
                      <span>Expires {new Date(link.expiresAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                {/* Metrics & Actions */}
                <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0 pt-2 lg:pt-0">
                  <div className="text-right px-2.5 py-1 bg-surface-1 rounded-lg border border-subtle">
                    <span className="font-semibold text-xs text-primary">{link.clicksCount}</span>
                    <span className="text-muted ml-1 text-[11px]">clicks</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopy(link.code, link.shortUrl)}
                      className="w-8 h-8 rounded-lg bg-surface-1 border border-subtle text-secondary hover:text-primary hover:bg-surface-3 flex items-center justify-center transition-colors"
                      title="Copy short link"
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
                      title="Show QR Code"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                    </button>

                    <Link
                      to={`/dashboard/analytics/${link.code}`}
                      className="w-8 h-8 rounded-lg bg-surface-1 border border-subtle text-secondary hover:text-primary hover:bg-surface-3 flex items-center justify-center transition-colors"
                      title="View Click Analytics"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => openEditModal(link)}
                      className="w-8 h-8 rounded-lg bg-surface-1 border border-subtle text-secondary hover:text-primary hover:bg-surface-3 flex items-center justify-center transition-colors"
                      title="Edit link settings"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleActive(link)}
                      className={`w-8 h-8 rounded-lg bg-surface-1 border border-subtle flex items-center justify-center transition-colors ${
                        link.isActive ? "text-emerald-500" : "text-muted hover:text-primary"
                      }`}
                      title={link.isActive ? "Click to disable link" : "Click to enable link"}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingLink(link)}
                      className="w-8 h-8 rounded-lg bg-surface-1 border border-subtle text-secondary hover:text-rose-500 hover:bg-rose-500/10 flex items-center justify-center transition-colors"
                      title="Delete link"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-subtle text-xs text-secondary">
                <span>
                  Page {page} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="btn btn-secondary text-xs px-3 py-1"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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

      <QrModal code={selectedQrCode} onClose={() => setSelectedQrCode(null)} />

      {/* Edit Link Modal */}
      <Modal
        isOpen={Boolean(editingLink)}
        onClose={() => setEditingLink(null)}
        title={`Edit /${editingLink?.code}`}
        description="Update destination URL or modify advanced link limits."
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-secondary mb-1" htmlFor="edit-dest">
              Destination URL
            </label>
            <input
              id="edit-dest"
              type="url"
              required
              value={editDestination}
              onChange={(e) => setEditDestination(e.target.value)}
              className="input-minimal text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-secondary mb-1" htmlFor="edit-ios">
                iOS URL
              </label>
              <input
                id="edit-ios"
                type="url"
                value={editIosUrl}
                onChange={(e) => setEditIosUrl(e.target.value)}
                placeholder="Optional"
                className="input-minimal text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-secondary mb-1" htmlFor="edit-android">
                Android URL
              </label>
              <input
                id="edit-android"
                type="url"
                value={editAndroidUrl}
                onChange={(e) => setEditAndroidUrl(e.target.value)}
                placeholder="Optional"
                className="input-minimal text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-secondary mb-1" htmlFor="edit-expiry">
                Expires At
              </label>
              <input
                id="edit-expiry"
                type="datetime-local"
                value={editExpiresAt}
                onChange={(e) => setEditExpiresAt(e.target.value)}
                className="input-minimal text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-secondary mb-1" htmlFor="edit-max">
                Max Clicks
              </label>
              <input
                id="edit-max"
                type="number"
                min={1}
                value={editMaxClicks}
                onChange={(e) => setEditMaxClicks(e.target.value ? Number(e.target.value) : "")}
                placeholder="Optional"
                className="input-minimal text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-secondary mb-1" htmlFor="edit-pass">
              New Password (leave empty to keep current)
            </label>
            <input
              id="edit-pass"
              type="password"
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
              placeholder="Enter new password"
              className="input-minimal text-xs"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              id="edit-active"
              type="checkbox"
              checked={editIsActive}
              onChange={(e) => setEditIsActive(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="edit-active" className="text-xs text-primary font-medium cursor-pointer">
              Link is active and reachable
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setEditingLink(null)}
              className="btn btn-secondary text-xs"
            >
              Cancel
            </button>
            <button type="submit" disabled={editSaving} className="btn btn-primary text-xs">
              {editSaving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingLink)}
        onClose={() => setDeletingLink(null)}
        title="Delete Short Link?"
        description={`Are you sure you want to delete /${deletingLink?.code}?`}
      >
        <div className="space-y-4">
          <div className="p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs rounded-xl flex items-start gap-2 border border-rose-500/20">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              This will permanently delete the short link and all associated click analytics data.
              This action cannot be undone.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setDeletingLink(null)}
              className="btn btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleteConfirming}
              onClick={handleDelete}
              className="btn bg-rose-500 text-white hover:bg-rose-600 text-xs"
            >
              {deleteConfirming ? "Deleting..." : "Permanently delete"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
