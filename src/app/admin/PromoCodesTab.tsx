"use client";

import { useState, useEffect, useCallback } from "react";
import { PromoCode } from "@/types";

interface PromoFormState {
  code: string;
  type: "percent" | "fixed";
  value: string;
  min_order_amount: string;
  usage_limit: string;
  valid_from: string;
  valid_until: string;
  active: boolean;
}

const EMPTY_FORM: PromoFormState = {
  code: "",
  type: "percent",
  value: "",
  min_order_amount: "",
  usage_limit: "",
  valid_from: "",
  valid_until: "",
  active: true,
};

/** Convert an ISO date string to the value format of <input type="datetime-local"> */
function toLocalInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatValidity(promo: PromoCode): string {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
  if (!promo.valid_from && !promo.valid_until) return "Always";
  if (promo.valid_from && promo.valid_until) return `${fmt(promo.valid_from)} → ${fmt(promo.valid_until)}`;
  if (promo.valid_from) return `From ${fmt(promo.valid_from)}`;
  return `Until ${fmt(promo.valid_until!)}`;
}

interface Props {
  addToast: (message: string, type: "success" | "error") => void;
}

export default function PromoCodesTab({ addToast }: Props) {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PromoCode | null>(null);
  const [form, setForm] = useState<PromoFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PromoCode | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPromos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/promo-codes");
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to load promo codes");
      setPromos(json.data || []);
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : "Failed to load promo codes", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (promo: PromoCode) => {
    setEditTarget(promo);
    setForm({
      code: promo.code,
      type: promo.type,
      value: String(promo.value),
      min_order_amount: promo.min_order_amount ? String(promo.min_order_amount) : "",
      usage_limit: promo.usage_limit === null ? "" : String(promo.usage_limit),
      valid_from: toLocalInputValue(promo.valid_from),
      valid_until: toLocalInputValue(promo.valid_until),
      active: promo.active,
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    const value = Number(form.value);
    if (!/^[A-Za-z0-9_-]{3,32}$/.test(form.code.trim())) {
      setFormError("Code must be 3-32 characters (letters, numbers, _ or -)");
      return;
    }
    if (!Number.isFinite(value) || value < 1) {
      setFormError("Discount value must be at least 1");
      return;
    }
    if (form.type === "percent" && value > 100) {
      setFormError("Percentage discount cannot exceed 100");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value,
        min_order_amount: form.min_order_amount,
        usage_limit: form.usage_limit,
        valid_from: form.valid_from ? new Date(form.valid_from).toISOString() : null,
        valid_until: form.valid_until ? new Date(form.valid_until).toISOString() : null,
        active: form.active,
      };
      const res = await fetch(
        editTarget ? `/api/promo-codes/${editTarget._id}` : "/api/promo-codes",
        {
          method: editTarget ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Save failed");
      addToast(editTarget ? "Promo code updated" : "Promo code created", "success");
      setModalOpen(false);
      fetchPromos();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (promo: PromoCode) => {
    try {
      const res = await fetch(`/api/promo-codes/${promo._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: promo.type,
          value: promo.value,
          min_order_amount: promo.min_order_amount,
          usage_limit: promo.usage_limit,
          valid_from: promo.valid_from,
          valid_until: promo.valid_until,
          active: !promo.active,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Update failed");
      addToast(`Code ${promo.code} ${!promo.active ? "activated" : "deactivated"}`, "success");
      fetchPromos();
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : "Update failed", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/promo-codes/${deleteTarget._id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Delete failed");
      addToast("Promo code deleted", "success");
      setDeleteTarget(null);
      fetchPromos();
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : "Delete failed", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <header className="admin-header">
        <div>
          <h1 className="admin-header__title">Promo Codes</h1>
          <p className="admin-header__sub">
            {loading ? "Loading…" : `${promos.length} code${promos.length !== 1 ? "s" : ""} total`}
          </p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={openCreate}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Promo Code
        </button>
      </header>

      {loading ? (
        <div className="admin-skeletons">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="admin-skeleton-row" />
          ))}
        </div>
      ) : promos.length === 0 ? (
        <div className="admin-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
          <p>No promo codes yet. Create your first one!</p>
          <button className="admin-btn admin-btn--primary" onClick={openCreate}>
            Add First Code
          </button>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Min Order</th>
                <th>Usage</th>
                <th>Validity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {promos.map((promo) => (
                <tr key={promo._id} className="admin-table__row">
                  <td>
                    <span className="admin-code">{promo.code}</span>
                  </td>
                  <td className="admin-price">
                    {promo.type === "percent" ? `${promo.value}%` : `PKR ${promo.value.toLocaleString()}`}
                  </td>
                  <td className="admin-min-order">
                    {promo.min_order_amount > 0 ? `PKR ${promo.min_order_amount.toLocaleString()}` : "—"}
                  </td>
                  <td className="admin-min-order">
                    {promo.usage_count} / {promo.usage_limit === null ? "∞" : promo.usage_limit}
                  </td>
                  <td className="admin-min-order">{formatValidity(promo)}</td>
                  <td>
                    <button
                      className={`admin-promo-toggle ${promo.active ? "admin-promo-toggle--on" : ""}`}
                      onClick={() => handleToggleActive(promo)}
                      title={promo.active ? "Click to deactivate" : "Click to activate"}
                    >
                      {promo.active ? "● Active" : "○ Inactive"}
                    </button>
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      <button className="admin-btn admin-btn--ghost" onClick={() => openEdit(promo)}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit
                      </button>
                      <button className="admin-btn admin-btn--danger" onClick={() => setDeleteTarget(promo)}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      {modalOpen && (
        <div className="admin-overlay">
          <div className="admin-dialog admin-promo-dialog">
            <h3 className="admin-dialog__title">{editTarget ? `Edit ${editTarget.code}` : "New Promo Code"}</h3>

            <div className="admin-promo-form">
              <div className="admin-promo-field">
                <label>Code *</label>
                <input
                  type="text"
                  placeholder="e.g. EID25"
                  maxLength={32}
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                />
              </div>

              <div className="admin-promo-row">
                <div className="admin-promo-field">
                  <label>Type *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as "percent" | "fixed" }))}
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed amount (PKR)</option>
                  </select>
                </div>
                <div className="admin-promo-field">
                  <label>{form.type === "percent" ? "Percent off *" : "Amount off (PKR) *"}</label>
                  <input
                    type="number"
                    min={1}
                    max={form.type === "percent" ? 100 : undefined}
                    placeholder={form.type === "percent" ? "e.g. 10" : "e.g. 500"}
                    value={form.value}
                    onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                  />
                </div>
              </div>

              <div className="admin-promo-row">
                <div className="admin-promo-field">
                  <label>Min order amount (PKR)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="No minimum"
                    value={form.min_order_amount}
                    onChange={(e) => setForm((f) => ({ ...f, min_order_amount: e.target.value }))}
                  />
                </div>
                <div className="admin-promo-field">
                  <label>Usage limit</label>
                  <input
                    type="number"
                    min={1}
                    placeholder="Unlimited"
                    value={form.usage_limit}
                    onChange={(e) => setForm((f) => ({ ...f, usage_limit: e.target.value }))}
                  />
                </div>
              </div>

              <div className="admin-promo-row">
                <div className="admin-promo-field">
                  <label>Valid from</label>
                  <input
                    type="datetime-local"
                    value={form.valid_from}
                    onChange={(e) => setForm((f) => ({ ...f, valid_from: e.target.value }))}
                  />
                </div>
                <div className="admin-promo-field">
                  <label>Valid until</label>
                  <input
                    type="datetime-local"
                    value={form.valid_until}
                    onChange={(e) => setForm((f) => ({ ...f, valid_until: e.target.value }))}
                  />
                </div>
              </div>

              <label className="admin-promo-check">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                />
                Active
              </label>

              {editTarget && (
                <p className="admin-promo-usage-note">
                  Used {editTarget.usage_count} time{editTarget.usage_count !== 1 ? "s" : ""} so far.
                </p>
              )}

              {formError && <p className="admin-promo-error">{formError}</p>}
            </div>

            <div className="admin-dialog__actions">
              <button className="admin-btn admin-btn--ghost" onClick={() => setModalOpen(false)} disabled={saving}>
                Cancel
              </button>
              <button className="admin-btn admin-btn--primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : editTarget ? "Save Changes" : "Create Code"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Dialog ── */}
      {deleteTarget && (
        <div className="admin-overlay">
          <div className="admin-dialog">
            <div className="admin-dialog__icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3 className="admin-dialog__title">Delete Promo Code?</h3>
            <p className="admin-dialog__body">
              You are about to permanently delete <strong>{deleteTarget.code}</strong>. Past orders keep their
              discount; this only stops future use. Consider deactivating instead.
            </p>
            <div className="admin-dialog__actions">
              <button className="admin-btn admin-btn--ghost" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                Cancel
              </button>
              <button className="admin-btn admin-btn--danger-solid" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Scoped Styles ── */}
      <style>{`
        /* compound selector so this outranks the base .admin-dialog rule
           (equal specificity would lose to AdminClient's later style block) */
        .admin-dialog.admin-promo-dialog {
          max-width: 640px;
          width: 100%;
          text-align: left;
          border-color: rgba(201,169,110,0.25);
        }
        .admin-promo-form {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
          margin: 1.25rem 0;
        }
        .admin-promo-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.9rem;
        }
        @media (max-width: 560px) {
          .admin-dialog.admin-promo-dialog { padding: 1.25rem; }
          .admin-promo-row { grid-template-columns: 1fr; }
        }
        .admin-promo-field {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          min-width: 0;
        }
        .admin-promo-field label {
          font-size: 0.75rem;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: rgba(237,229,216,0.6);
        }
        .admin-promo-field input,
        .admin-promo-field select {
          width: 100%;
          background: rgba(237,229,216,0.05);
          border: 1px solid rgba(201,169,110,0.25);
          border-radius: 8px;
          padding: 0.55rem 0.75rem;
          color: #EDE5D8;
          font-size: 0.9rem;
          outline: none;
        }
        .admin-promo-field input:focus,
        .admin-promo-field select:focus {
          border-color: #C9A96E;
        }
        .admin-promo-field select {
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23C9A96E' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 14px;
          padding-right: 2.4rem;
          cursor: pointer;
        }
        .admin-promo-field select option {
          background: #0A0807;
        }
        .admin-promo-check {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #EDE5D8;
          cursor: pointer;
        }
        .admin-promo-check input {
          accent-color: #C9A96E;
        }
        .admin-promo-usage-note {
          font-size: 0.8rem;
          color: rgba(237,229,216,0.5);
        }
        .admin-promo-error {
          font-size: 0.85rem;
          color: #f87171;
        }
        .admin-promo-toggle {
          background: rgba(237,229,216,0.06);
          border: 1px solid rgba(237,229,216,0.15);
          color: rgba(237,229,216,0.55);
          border-radius: 999px;
          padding: 0.3rem 0.8rem;
          font-size: 0.78rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .admin-promo-toggle--on {
          background: rgba(34,197,94,0.12);
          border-color: rgba(34,197,94,0.3);
          color: #4ade80;
        }
      `}</style>
    </>
  );
}
