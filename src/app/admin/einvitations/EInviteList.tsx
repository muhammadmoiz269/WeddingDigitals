"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface InvitationRow {
  _id: string;
  slug: string;
  couple: {
    groom_name: string;
    bride_name: string;
  };
  wedding_at: string;
  status: "draft" | "published";
}

export default function EInviteList() {
  const router = useRouter();
  const [invitations, setInvitations] = useState<InvitationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/einvitations");
      const json = await res.json();
      if (json.success) setInvitations(json.data);
    } catch (e) {
      console.error("Failed to fetch invitations", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleDelete = async (slug: string, coupleName: string) => {
    if (!window.confirm(`Delete invitation for "${coupleName}"? This cannot be undone.`)) return;
    setDeletingSlug(slug);
    try {
      const res = await fetch(`/api/einvitations/${slug}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Delete failed");
      fetchInvitations();
    } catch (e) {
      console.error("Delete failed", e);
    } finally {
      setDeletingSlug(null);
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-PK", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  return (
    <>
      {/* Header */}
      <header className="admin-header">
        <div>
          <h1 className="admin-header__title">E-Invitations</h1>
          <p className="admin-header__sub">
            {loading ? "Loading…" : `${invitations.length} invitation${invitations.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          className="admin-btn admin-btn--primary"
          onClick={() => router.push("/admin/einvitations/new")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add New Invitation
        </button>
      </header>

      {/* Content */}
      {loading ? (
        <div className="admin-skeletons">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="admin-skeleton-row" />
          ))}
        </div>
      ) : invitations.length === 0 ? (
        <div className="admin-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p>No e-invitations yet. Create your first one!</p>
          <button
            className="admin-btn admin-btn--primary"
            onClick={() => router.push("/admin/einvitations/new")}
          >
            Add First Invitation
          </button>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Couple</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Wedding Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invitations.map((inv) => {
                const coupleName = `${inv.couple.groom_name} & ${inv.couple.bride_name}`;
                return (
                  <tr key={inv.slug} className="admin-table__row">
                    <td>
                      <p className="admin-card-name">{coupleName}</p>
                    </td>
                    <td>
                      <span className="admin-code">/{inv.slug}</span>
                    </td>
                    <td>
                      <span
                        className="admin-badge"
                        style={
                          inv.status === "published"
                            ? { background: "rgba(34,197,94,0.15)", color: "#4ade80" }
                            : { background: "rgba(234,179,8,0.1)", color: "#fbbf24" }
                        }
                      >
                        {inv.status === "published" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="admin-min-order">{formatDate(inv.wedding_at)}</td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          className="admin-btn admin-btn--ghost"
                          onClick={() => window.open(`/admin/einvitations/${inv.slug}/preview`, "_blank")}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          View
                        </button>
                        <button
                          className="admin-btn admin-btn--ghost"
                          onClick={() => router.push(`/admin/einvitations/${inv.slug}/edit`)}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          className="admin-btn admin-btn--danger"
                          disabled={deletingSlug === inv.slug}
                          onClick={() => handleDelete(inv.slug, coupleName)}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                          </svg>
                          {deletingSlug === inv.slug ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
