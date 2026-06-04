"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AddOn {
  name: string;
  price: number;
  description: string;
}

interface CardDoc {
  _id?: string;
  slug: string;
  name: string;
  card_code?: string;
  base_price: number;
  original_price?: number;
  category: string;
  description: string;
  images: string[];
  short_video_url?: string;
  is_new: boolean;
  is_bestseller: boolean;
  min_order: number;
  add_ons: AddOn[];
  meta_title?: string;
  meta_description?: string;
  image_alt_text?: string;
  created_at?: string;
}

const CATEGORIES = ["Luxury", "Classic", "Modern", "Minimalist", "Floral", "Textured"] as const;



// ─── Toast ────────────────────────────────────────────────────────────────────

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminClient() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [cards, setCards] = useState<CardDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<CardDoc | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");

  // ─── Orders state ─────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'cards' | 'orders'>('cards');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch('/api/orders');
      const json = await res.json();
      if (json.success) setOrders(json.data);
    } catch (e) {
      console.error('Failed to fetch orders', e);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    // Fetch orders eagerly on mount so the sidebar badge is always up-to-date
    fetchOrders();
  }, []);

  useEffect(() => {
    // Re-fetch if the user manually opens the tab and the list might be stale
    if (activeTab === 'orders') fetchOrders();
  }, [activeTab]);

  const getWhatsAppConfirmLink = (order: { order_id: string; card_name: string; quantity: number; total: number; customization: { main_event: string }; customer: { whatsapp: string; name: string; area: string }; payment: { method: string; amount_due: number } }) => {
    const msg = `Assalamu Alaikum ${order.customer.name}! 🌙\n\n` +
      `Your order *#${order.order_id}* has been *confirmed!* ✅\n\n` +
      `📋 *Card:* ${order.card_name}\n` +
      `🎉 *Event:* ${order.customization.main_event}\n` +
      `📦 *Quantity:* ${order.quantity} cards\n` +
      `💰 *Amount Due:* PKR ${order.payment.amount_due.toLocaleString()}\n\n` +
      `Please share the following details so we can design your card:\n` +
      `• Names (bride & groom)\n` +
      `• Date, time & venue of each event\n` +
      `• Contact numbers to print on card\n\n` +
      `Your cards will be designed, printed and dispatched to ${order.customer.area}, Karachi within *7-10 working days* after design approval.\n\n` +
      `We'll share a mockup for your approval before printing. Thank you for choosing Shahi Bulawa! 🤍`;
    const phone = order.customer.whatsapp.replace(/[^\d]/g, '');
    const fullPhone = phone.startsWith('0') ? '92' + phone.slice(1) : phone.startsWith('92') ? phone : '92' + phone;
    return `https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`;
  };

  // ─── Auth check ────────────────────────────────────────────────────────────

  useEffect(() => {
    fetch("/api/auth/check")
      .then((r) => r.json())
      .then((json) => {
        if (!json.authenticated) {
          router.replace("/admin/login");
        } else {
          setAuthenticated(true);
        }
      })
      .catch(() => router.replace("/admin/login"))
      .finally(() => setAuthChecking(false));
  }, [router]);

  // ─── Logout ─────────────────────────────────────────────────────────────────

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  // ─── Toast helpers ──────────────────────────────────────────────────────────

  const addToast = (message: string, type: "success" | "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  // ─── Fetch cards ────────────────────────────────────────────────────────────

  const fetchCards = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cards");
      const json = await res.json();
      setCards(json.data || []);
    } catch {
      addToast("Failed to load cards", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  // ─── Modal helpers ──────────────────────────────────────────────────────────

  // ─── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/cards/${deleteTarget.slug}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Delete failed");
      addToast("Card deleted", "success");
      setDeleteTarget(null);
      fetchCards();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      addToast(msg, "error");
    } finally {
      setDeleting(false);
    }
  };

  // ─── Filtered list ──────────────────────────────────────────────────────────

  const filtered = cards.filter((c) => {
    const matchesSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.card_code || "").toLowerCase().includes(search.toLowerCase());
    const matchesCat = filterCat === "All" || c.category === filterCat;
    return matchesSearch && matchesCat;
  });

  // ─── Render ─────────────────────────────────────────────────────────────────

  // Show nothing while checking auth
  if (authChecking || !authenticated) {
    return (
      <div style={{ minHeight: "100vh", background: "#0A0807", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, border: "3px solid rgba(201,169,110,0.2)", borderTopColor: "#C9A96E", borderRadius: "50%", animation: "admin-spin 0.6s linear infinite" }} />
        <style>{`@keyframes admin-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      {/* ── Toasts ── */}
      <div className="admin-toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`admin-toast admin-toast--${t.type}`}>
            {t.type === "success" ? "✓" : "✕"} {t.message}
          </div>
        ))}
      </div>

      <div className="admin-shell">
        {/* ── Sidebar ── */}
        <aside className="admin-sidebar">
          <div className="admin-logo">
            <span className="admin-logo__mark">P</span>
            <div>
              <p className="admin-logo__brand">Shahi Bulawa</p>
              <p className="admin-logo__sub">Admin Panel</p>
            </div>
          </div>
          <nav className="admin-nav">
            <button onClick={() => setActiveTab('cards')} className={`admin-nav__item ${activeTab === 'cards' ? 'admin-nav__item--active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              Cards
            </button>
            <button onClick={() => setActiveTab('orders')} className={`admin-nav__item ${activeTab === 'orders' ? 'admin-nav__item--active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              Orders
              {orders.filter(o => !['confirmed', 'in_production', 'completed'].includes(o.payment?.status)).length > 0 && (
                <span className="admin-nav__badge">{orders.filter(o => !['confirmed', 'in_production', 'completed'].includes(o.payment?.status)).length}</span>
              )}
            </button>
          </nav>
          <div className="admin-sidebar__footer">
            <a href="/" target="_blank" className="admin-view-site">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              View Site
            </a>
            <button onClick={handleLogout} className="admin-view-site admin-logout-btn" style={{ width: "100%", background: "none", border: "none", cursor: "pointer", marginTop: "0.5rem" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="admin-main">
          {activeTab === 'cards' ? (
            <>
              {/* Header */}
              <header className="admin-header">
                <div>
                  <h1 className="admin-header__title">Wedding Cards</h1>
                  <p className="admin-header__sub">
                    {loading ? "Loading…" : `${cards.length} card${cards.length !== 1 ? "s" : ""} in database`}
                  </p>
                </div>
                <button id="admin-add-card-btn" className="admin-btn admin-btn--primary" onClick={() => router.push('/admin/cards/new')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add New Card
                </button>
              </header>

              {/* Filters */}
              <div className="admin-filters">
                <div className="admin-search">
                  <svg className="admin-search__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    id="admin-search"
                    type="text"
                    placeholder="Search by name or code…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="admin-search__input"
                  />
                </div>
                <div className="admin-filter-cats">
                  {["All", ...CATEGORIES].map((cat) => (
                    <button
                      key={cat}
                      className={`admin-cat-pill${filterCat === cat ? " admin-cat-pill--active" : ""}`}
                      onClick={() => setFilterCat(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table / Empty */}
              {loading ? (
                <div className="admin-skeletons">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="admin-skeleton-row" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="admin-empty">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 17H7A5 5 0 017 7h2" />
                    <path d="M15 7h2a5 5 0 010 10h-2" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                  <p>{search || filterCat !== "All" ? "No cards match your filters." : "No cards yet. Add your first card!"}</p>
                  {!search && filterCat === "All" && (
                    <button className="admin-btn admin-btn--primary" onClick={() => router.push('/admin/cards/new')}>
                      Add First Card
                    </button>
                  )}
                </div>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Card</th>
                        <th>Code</th>
                        <th>Category</th>
                        <th>Base Price</th>
                        <th>Min Order</th>
                        <th>Badges</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((card) => (
                        <tr key={card.slug} className="admin-table__row">
                          <td>
                            <div className="admin-card-cell">
                              {card.images?.[0] ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={card.images[0]} alt={card.name} className="admin-card-thumb" />
                              ) : (
                                <div className="admin-card-thumb admin-card-thumb--placeholder">🃏</div>
                              )}
                              <div>
                                <p className="admin-card-name" title={card.name}>
                                  {card.name.length > 40 ? card.name.slice(0, 40) + '…' : card.name}
                                </p>
                                <p className="admin-card-slug">/{card.slug}</p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="admin-code">{card.card_code || "—"}</span>
                          </td>
                          <td>
                            <span className={`admin-cat-badge admin-cat-badge--${card.category.toLowerCase()}`}>
                              {card.category}
                            </span>
                          </td>
                          <td className="admin-price">PKR {card.base_price.toLocaleString()}</td>
                          <td className="admin-min-order">{card.min_order} pcs</td>
                          <td>
                            <div className="admin-badges">
                              {card.is_new && <span className="admin-badge admin-badge--new">New</span>}
                              {card.is_bestseller && <span className="admin-badge admin-badge--best">Best</span>}
                            </div>
                          </td>
                          <td>
                            <div className="admin-row-actions">
                              <button
                                id={`edit-${card.slug}`}
                                className="admin-btn admin-btn--ghost"
                                onClick={() => router.push(`/admin/cards/${card.slug}/edit`)}
                              >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                                Edit
                              </button>
                              <button
                                id={`delete-${card.slug}`}
                                className="admin-btn admin-btn--danger"
                                onClick={() => setDeleteTarget(card)}
                              >
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
            </>
          ) : (
            /* ── ORDERS TAB ── */
            <>
              <header className="admin-header">
                <div>
                  <h1 className="admin-header__title">Orders</h1>
                  <p className="admin-header__sub">
                    {ordersLoading ? "Loading…" : `${orders.length} order${orders.length !== 1 ? "s" : ""} total`}
                  </p>
                </div>
                <button className="admin-btn admin-btn--ghost" onClick={fetchOrders} disabled={ordersLoading}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
                  </svg>
                  Refresh
                </button>
              </header>

              {ordersLoading ? (
                <div className="admin-skeletons">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="admin-skeleton-row" />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="admin-empty">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <p>No orders yet.</p>
                </div>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Card</th>
                        <th>Qty</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.order_id || order._id} className="admin-table__row admin-table__row--clickable" onClick={() => router.push(`/admin/orders/${order.order_id}`)}>
                          <td>
                            <div>
                              <p className="admin-card-name">{order.order_id}</p>
                              <p className="admin-card-slug">{order.customization?.main_event} — {order.quantity} cards</p>
                            </div>
                          </td>
                          <td>
                            <div>
                              <p className="admin-card-name">{order.customer?.name}</p>
                              <p className="admin-card-slug">{order.customer?.whatsapp}</p>
                              <p className="admin-card-slug">{order.customer?.area}</p>
                            </div>
                          </td>
                          <td>
                            <span className="admin-code" title={order.card_name}>
                              {order.card_name && order.card_name.length > 40
                                ? order.card_name.slice(0, 40) + '…'
                                : order.card_name}
                            </span>
                          </td>
                          <td className="admin-min-order">{order.quantity} pcs</td>
                          <td className="admin-price">PKR {order.payment?.amount_due?.toLocaleString()}</td>

                          <td>
                            <span className={`admin-order-status admin-order-status--${order.payment?.status || 'pending_payment'}`}>
                              {order.payment?.status === 'confirmed' ? '✓ Confirmed' :
                                order.payment?.status === 'in_production' ? '🔄 In Production' :
                                  order.payment?.status === 'completed' ? '✅ Completed' :
                                    '⏳ Pending'}
                            </span>
                          </td>
                          <td>
                            <div className="admin-row-actions">
                              <button className="admin-btn admin-btn--ghost" onClick={(e) => { e.stopPropagation(); router.push(`/admin/orders/${order.order_id}`); }}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                                View
                              </button>
                              {order.payment?.status === 'confirmed' && (
                                <a
                                  href={getWhatsAppConfirmLink(order)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="admin-btn admin-btn--wa"
                                  onClick={e => e.stopPropagation()}
                                >
                                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                  </svg>
                                  WhatsApp
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </main>
      </div>



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
            <h3 className="admin-dialog__title">Delete Card?</h3>
            <p className="admin-dialog__body">
              You are about to permanently delete <strong>&ldquo;{deleteTarget.name}&rdquo;</strong>. This cannot be undone.
            </p>
            <div className="admin-dialog__actions">
              <button className="admin-btn admin-btn--ghost" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                Cancel
              </button>
              <button id="admin-confirm-delete-btn" className="admin-btn admin-btn--danger-solid" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}



      {/* ── Scoped Styles ── */}
      <style>{`
        /* ── Reset ── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Shell ── */
        .admin-shell {
          display: flex;
          min-height: 100vh;
          background: #0A0807;
          font-family: var(--font-body, 'Inter', system-ui, sans-serif);
          color: #EDE5D8;
        }

        /* ── Sidebar ── */
        .admin-sidebar {
          width: 220px;
          flex-shrink: 0;
          background: #111009;
          border-right: 1px solid rgba(201,169,110,0.12);
          display: flex;
          flex-direction: column;
          padding: 1.5rem 1rem;
          position: sticky;
          top: 0;
          height: 100vh;
        }
        .admin-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0.5rem 1.5rem;
          border-bottom: 1px solid rgba(201,169,110,0.1);
          margin-bottom: 1.25rem;
        }
        .admin-logo__mark {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: linear-gradient(135deg, #C9A96E, #D4B87A);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-heading, Georgia, serif);
          font-size: 1.125rem;
          font-weight: 700;
          color: #0A0807;
          flex-shrink: 0;
        }
        .admin-logo__brand {
          font-size: 0.875rem;
          font-weight: 600;
          color: #EDE5D8;
          line-height: 1;
        }
        .admin-logo__sub {
          font-size: 0.7rem;
          color: #8a7a6a;
          margin-top: 2px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .admin-nav { flex: 1; }
        .admin-nav__item {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0.625rem 0.75rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          color: #a09080;
          text-decoration: none;
          transition: all 0.2s;
        }
        .admin-nav__item:hover { background: rgba(201,169,110,0.08); color: #EDE5D8; }
        .admin-nav__item--active { background: rgba(201,169,110,0.15); color: #C9A96E; }
        .admin-sidebar__footer { border-top: 1px solid rgba(201,169,110,0.1); padding-top: 1rem; }
        .admin-view-site {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: #8a7a6a;
          text-decoration: none;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          transition: color 0.2s;
        }
        .admin-view-site:hover { color: #C9A96E; }

        /* ── Main ── */
        .admin-main {
          flex: 1;
          padding: 2rem 2.5rem;
          overflow-x: hidden;
        }

        /* ── Header ── */
        .admin-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1.75rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(201,169,110,0.1);
        }
        .admin-header__title {
          font-family: var(--font-heading, Georgia, serif);
          font-size: 1.75rem;
          font-weight: 700;
          color: #FAF8F5;
          margin: 0;
        }
        .admin-header__sub { font-size: 0.8125rem; color: #8a7a6a; margin-top: 4px; }

        /* ── Filters ── */
        .admin-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .admin-search {
          position: relative;
          flex: 1;
          min-width: 200px;
          max-width: 320px;
        }
        .admin-search__icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #6a5a4a;
          pointer-events: none;
        }
        .admin-search__input {
          width: 100%;
          padding: 0.5rem 0.75rem 0.5rem 2.25rem;
          background: #1C1916;
          border: 1px solid rgba(201,169,110,0.15);
          border-radius: 8px;
          color: #EDE5D8;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .admin-search__input:focus { border-color: rgba(201,169,110,0.45); }
        .admin-search__input::placeholder { color: #5a4a3a; }
        .admin-filter-cats { display: flex; flex-wrap: wrap; gap: 0.375rem; }
        .admin-cat-pill {
          padding: 0.3rem 0.75rem;
          border-radius: 999px;
          border: 1px solid rgba(201,169,110,0.2);
          background: transparent;
          color: #8a7a6a;
          font-size: 0.78rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .admin-cat-pill:hover { border-color: rgba(201,169,110,0.5); color: #C9A96E; }
        .admin-cat-pill--active { background: rgba(201,169,110,0.15); border-color: #C9A96E; color: #C9A96E; }

        /* ── Table ── */
        .admin-table-wrap { overflow-x: auto; border-radius: 12px; border: 1px solid rgba(201,169,110,0.1); }
        .admin-table { width: 100%; border-collapse: collapse; background: #111009; }
        .admin-table thead tr { border-bottom: 1px solid rgba(201,169,110,0.12); }
        .admin-table th {
          padding: 0.875rem 1rem;
          text-align: left;
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #6a5a4a;
        }
        .admin-table__row { border-bottom: 1px solid rgba(201,169,110,0.07); transition: background 0.15s; }
        .admin-table__row:last-child { border-bottom: none; }
        .admin-table__row:hover { background: rgba(201,169,110,0.05); }
        .admin-table td { padding: 0.875rem 1rem; font-size: 0.875rem; vertical-align: middle; }

        .admin-card-cell { display: flex; align-items: center; gap: 0.75rem; }
        .admin-card-thumb {
          width: 44px;
          height: 44px;
          border-radius: 6px;
          object-fit: cover;
          border: 1px solid rgba(201,169,110,0.15);
          flex-shrink: 0;
        }
        .admin-card-thumb--placeholder {
          background: #1C1916;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }
        .admin-card-name { font-weight: 500; color: #EDE5D8; font-size: 0.875rem; }
        .admin-card-slug { font-size: 0.72rem; color: #5a4a3a; margin-top: 2px; }
        .admin-code { font-family: monospace; font-size: 0.78rem; color: #C9A96E; background: rgba(201,169,110,0.08); padding: 2px 6px; border-radius: 4px; }
        .admin-price { font-weight: 600; color: #D4B87A; }
        .admin-min-order { color: #8a7a6a; }

        /* ── Cat Badge ── */
        .admin-cat-badge {
          display: inline-block;
          padding: 2px 10px;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          background: rgba(201,169,110,0.12);
          color: #C9A96E;
          border: 1px solid rgba(201,169,110,0.2);
        }
        .admin-cat-badge--nikkah { background: rgba(147,197,253,0.1); color: #93c5fd; border-color: rgba(147,197,253,0.2); }
        .admin-cat-badge--barat { background: rgba(252,165,165,0.1); color: #fca5a5; border-color: rgba(252,165,165,0.2); }
        .admin-cat-badge--valima { background: rgba(110,231,183,0.1); color: #6ee7b7; border-color: rgba(110,231,183,0.2); }
        .admin-cat-badge--mehndi { background: rgba(134,239,172,0.1); color: #86efac; border-color: rgba(134,239,172,0.2); }
        .admin-cat-badge--luxury { background: rgba(201,169,110,0.12); color: #C9A96E; border-color: rgba(201,169,110,0.25); }
        .admin-cat-badge--minimalist { background: rgba(209,213,219,0.08); color: #d1d5db; border-color: rgba(209,213,219,0.15); }

        /* ── Badges ── */
        .admin-badges { display: flex; gap: 4px; flex-wrap: wrap; }
        .admin-badge { padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
        .admin-badge--new { background: rgba(34,197,94,0.15); color: #4ade80; }
        .admin-badge--best { background: rgba(201,169,110,0.15); color: #C9A96E; }

        /* ── Row Actions ── */
        .admin-row-actions { display: flex; gap: 0.4rem; }

        /* ── Buttons ── */
        .admin-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .admin-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .admin-btn--primary {
          background: linear-gradient(135deg, #C9A96E, #D4B87A);
          color: #0A0807;
        }
        .admin-btn--primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #B8944D, #C9A96E);
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(201,169,110,0.35);
        }
        .admin-btn--ghost {
          background: rgba(255,255,255,0.05);
          color: #a09080;
          border: 1px solid rgba(201,169,110,0.12);
        }
        .admin-btn--ghost:hover:not(:disabled) { background: rgba(255,255,255,0.09); color: #EDE5D8; }
        .admin-btn--danger {
          background: rgba(220,38,38,0.1);
          color: #f87171;
          border: 1px solid rgba(220,38,38,0.2);
        }
        .admin-btn--danger:hover:not(:disabled) { background: rgba(220,38,38,0.2); }
        .admin-btn--danger-solid { background: #dc2626; color: #fff; }
        .admin-btn--danger-solid:hover:not(:disabled) { background: #b91c1c; }
        .admin-btn--outline-sm {
          background: transparent;
          border: 1px dashed rgba(201,169,110,0.3);
          color: #8a7a6a;
          font-size: 0.78rem;
          padding: 0.35rem 0.75rem;
        }
        .admin-btn--outline-sm:hover { border-color: #C9A96E; color: #C9A96E; }
        .admin-btn--icon-danger {
          background: transparent;
          border: none;
          color: #f87171;
          padding: 0.25rem 0.5rem;
          font-size: 0.85rem;
        }
        .admin-btn--icon-danger:hover { color: #dc2626; }

        /* ── Skeleton ── */
        .admin-skeletons { display: flex; flex-direction: column; gap: 0.5rem; }
        @keyframes admin-pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        .admin-skeleton-row {
          height: 58px;
          border-radius: 8px;
          background: linear-gradient(90deg, #1C1916 25%, #231e18 50%, #1C1916 75%);
          background-size: 200% 100%;
          animation: admin-pulse 1.8s ease infinite;
        }

        /* ── Empty ── */
        .admin-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 5rem 2rem;
          color: #5a4a3a;
          text-align: center;
        }
        .admin-empty p { font-size: 0.9375rem; }

        /* ── Overlay ── */
        .admin-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 2rem 1rem;
          overflow-y: auto;
        }

        /* ── Modal ── */
        .admin-modal {
          background: #141210;
          border: 1px solid rgba(201,169,110,0.15);
          border-radius: 16px;
          width: 100%;
          max-width: 760px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 60px rgba(0,0,0,0.6);
          animation: admin-slide-up 0.25s ease;
          margin: auto;
        }
        @keyframes admin-slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .admin-modal__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid rgba(201,169,110,0.1);
        }
        .admin-modal__title {
          font-family: var(--font-heading, Georgia, serif);
          font-size: 1.25rem;
          color: #FAF8F5;
          margin: 0;
        }
        .admin-modal__close {
          background: none;
          border: none;
          color: #6a5a4a;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          transition: color 0.2s;
        }
        .admin-modal__close:hover { color: #EDE5D8; }
        .admin-modal__body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; overflow-y: auto; max-height: 70vh; }
        .admin-modal__footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          border-top: 1px solid rgba(201,169,110,0.1);
        }

        /* ── Form ── */
        .admin-form-grid { display: grid; gap: 1rem; }
        .admin-form-grid--2 { grid-template-columns: 1fr 1fr; }
        @media (max-width: 540px) { .admin-form-grid--2 { grid-template-columns: 1fr; } }

        .admin-field { display: flex; flex-direction: column; gap: 0.375rem; }
        .admin-label { font-size: 0.8rem; font-weight: 600; color: #a09080; letter-spacing: 0.03em; }
        .admin-required { color: #C9A96E; }
        .admin-optional { color: #5a4a3a; font-weight: 400; }
        .admin-hint { font-size: 0.72rem; color: #5a4a3a; margin-top: 2px; }

        .admin-input, .admin-select, .admin-textarea {
          background: #1C1916;
          border: 1px solid rgba(201,169,110,0.15);
          border-radius: 8px;
          color: #EDE5D8;
          font-size: 0.875rem;
          padding: 0.6rem 0.75rem;
          outline: none;
          width: 100%;
          transition: border-color 0.2s;
          font-family: inherit;
        }
        .admin-input:focus, .admin-select:focus, .admin-textarea:focus {
          border-color: rgba(201,169,110,0.5);
          box-shadow: 0 0 0 3px rgba(201,169,110,0.08);
        }
        .admin-input::placeholder, .admin-textarea::placeholder { color: #3a2a1a; }
        .admin-input--mono { font-family: monospace; font-size: 0.82rem; }
        .admin-input--sm { max-width: 90px; }
        .admin-select { appearance: none; cursor: pointer; }
        .admin-textarea { resize: vertical; }

        /* ── URL List ── */
        .admin-url-list { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem; }
        .admin-url-row { display: flex; align-items: center; gap: 0.5rem; }
        .admin-url-preview {
          width: 36px;
          height: 36px;
          object-fit: cover;
          border-radius: 4px;
          border: 1px solid rgba(201,169,110,0.2);
          flex-shrink: 0;
        }

        /* ── Cloudinary Upload Zone ── */
        .admin-upload-zone {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1.5rem;
          border: 2px dashed rgba(201,169,110,0.25);
          border-radius: 12px;
          background: rgba(201,169,110,0.03);
          cursor: pointer;
          transition: all 0.2s;
          color: #8a7a6a;
          font-size: 0.875rem;
          font-weight: 500;
          width: 100%;
          margin-top: 0.25rem;
        }
        .admin-upload-zone:hover {
          border-color: rgba(201,169,110,0.5);
          background: rgba(201,169,110,0.06);
          color: #C9A96E;
        }
        .admin-upload-zone__hint {
          font-size: 0.72rem;
          color: #5a4a3a;
          font-weight: 400;
        }

        /* ── Image Preview Grid ── */
        .admin-image-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        .admin-image-card {
          position: relative;
          aspect-ratio: 3/4;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid rgba(201,169,110,0.15);
        }
        .admin-image-card__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .admin-image-card__remove {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(220,38,38,0.85);
          color: #fff;
          border: none;
          cursor: pointer;
          font-size: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .admin-image-card:hover .admin-image-card__remove { opacity: 1; }

        /* ── Video Preview ── */
        .admin-video-preview {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 0.25rem;
        }
        .admin-video-preview__player {
          width: 100%;
          max-height: 200px;
          border-radius: 10px;
          border: 1px solid rgba(201,169,110,0.15);
          background: #0A0807;
        }
        .admin-video-preview__actions {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        /* ── Toggle ── */
        .admin-toggle {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          cursor: pointer;
          padding: 0.75rem;
          border-radius: 8px;
          border: 1px solid rgba(201,169,110,0.1);
          background: #1C1916;
          transition: border-color 0.2s;
        }
        .admin-toggle:hover { border-color: rgba(201,169,110,0.25); }
        .admin-toggle input { position: absolute; opacity: 0; width: 0; height: 0; }
        .admin-toggle__track {
          width: 36px;
          height: 20px;
          border-radius: 999px;
          background: #2a2018;
          border: 1px solid rgba(201,169,110,0.2);
          position: relative;
          flex-shrink: 0;
          transition: background 0.2s;
        }
        .admin-toggle__track::after {
          content: '';
          position: absolute;
          left: 2px;
          top: 2px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #5a4a3a;
          transition: transform 0.2s, background 0.2s;
        }
        .admin-toggle input:checked ~ .admin-toggle__track {
          background: rgba(201,169,110,0.2);
          border-color: rgba(201,169,110,0.4);
        }
        .admin-toggle input:checked ~ .admin-toggle__track::after {
          background: #C9A96E;
          transform: translateX(16px);
        }
        .admin-toggle__label { font-size: 0.8125rem; color: #a09080; user-select: none; }

        /* ── Add-ons ── */
        .admin-addons-header { display: flex; justify-content: space-between; align-items: center; }
        .admin-addon-row { display: grid; grid-template-columns: 1fr 90px 1fr auto; gap: 0.5rem; align-items: center; }
        @media (max-width: 540px) { .admin-addon-row { grid-template-columns: 1fr 80px; } }

        /* ── Dialog ── */
        .admin-dialog {
          background: #141210;
          border: 1px solid rgba(220,38,38,0.2);
          border-radius: 16px;
          padding: 2rem;
          max-width: 420px;
          width: 100%;
          text-align: center;
          box-shadow: 0 25px 60px rgba(0,0,0,0.7);
          animation: admin-slide-up 0.25s ease;
          margin: auto;
        }
        .admin-dialog__icon { color: #f87171; margin-bottom: 1rem; display: flex; justify-content: center; }
        .admin-dialog__title { font-family: var(--font-heading, Georgia, serif); font-size: 1.25rem; color: #FAF8F5; margin-bottom: 0.625rem; }
        .admin-dialog__body { font-size: 0.875rem; color: #8a7a6a; line-height: 1.6; margin-bottom: 1.5rem; }
        .admin-dialog__body strong { color: #EDE5D8; }
        .admin-dialog__actions { display: flex; justify-content: center; gap: 0.75rem; }

        /* ── Toasts ── */
        .admin-toasts {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          pointer-events: none;
        }
        .admin-toast {
          padding: 0.75rem 1.125rem;
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 500;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
          animation: admin-slide-up 0.25s ease;
          pointer-events: auto;
          max-width: 320px;
        }
        .admin-toast--success { background: #1a2e1a; color: #4ade80; border: 1px solid rgba(74,222,128,0.2); }
        .admin-toast--error { background: #2e1a1a; color: #f87171; border: 1px solid rgba(248,113,113,0.2); }

        /* ── Spinner ── */
        @keyframes admin-spin { to { transform: rotate(360deg); } }
        .admin-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(0,0,0,0.2);
          border-top-color: #0A0807;
          border-radius: 50%;
          animation: admin-spin 0.6s linear infinite;
          display: inline-block;
        }
        /* ── Order status badges ── */
        .admin-order-status {
          padding: 0.25rem 0.625rem;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 600;
          white-space: nowrap;
        }
        .admin-order-status--confirmed {
          background: rgba(34,197,94,0.12);
          color: #166534;
          border: 1px solid rgba(34,197,94,0.2);
        }
        .admin-order-status--pending_payment {
          background: rgba(234,179,8,0.1);
          color: #92400e;
          border: 1px solid rgba(234,179,8,0.2);
        }
        .admin-order-status--in_production {
          background: rgba(59,130,246,0.1);
          color: #1e40af;
          border: 1px solid rgba(59,130,246,0.2);
        }
        .admin-order-status--completed {
          background: rgba(201,169,110,0.1);
          color: #96793f;
          border: 1px solid rgba(201,169,110,0.2);
        }

        /* ── WhatsApp admin button ── */
        .admin-btn--wa {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.75rem;
          background: #25D366;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.72rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .admin-btn--wa:hover { background: #20BD5A; transform: translateY(-1px); }

        /* ── Nav badge ── */
        .admin-nav__badge {
          padding: 0.125rem 0.4rem;
          background: #25D366;
          color: white;
          border-radius: 10px;
          font-size: 0.625rem;
          font-weight: 700;
          margin-left: auto;
        }
        .admin-nav__item { 
          background: none; 
          border: none; 
          font-family: inherit; 
          width: 100%;
          text-align: left;
          cursor: pointer;
        }
        .admin-table__row--clickable { cursor: pointer; }
        .admin-table__row--clickable:hover { background: rgba(201,169,110,0.08); }

        /* ── Order Detail Styles ── */
        .od-section {
          background: #1C1916;
          border: 1px solid rgba(201,169,110,0.1);
          border-radius: 12px;
          padding: 1.25rem;
        }
        .od-section__title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8125rem;
          font-weight: 700;
          color: #C9A96E;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin: 0 0 1rem;
          padding-bottom: 0.625rem;
          border-bottom: 1px solid rgba(201,169,110,0.1);
        }
        .od-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.875rem;
        }
        @media (max-width: 540px) { .od-grid { grid-template-columns: 1fr; } }
        .od-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .od-item--full {
          grid-column: 1 / -1;
        }
        .od-item__label {
          font-size: 0.7rem;
          font-weight: 600;
          color: #6a5a4a;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .od-item__value {
          font-size: 0.875rem;
          color: #EDE5D8;
          word-break: break-word;
        }
        .od-item__value--mono {
          font-family: monospace;
          color: #C9A96E;
          background: rgba(201,169,110,0.08);
          padding: 2px 6px;
          border-radius: 4px;
          width: fit-content;
        }
        .od-item__value--highlight {
          font-size: 1rem;
          font-weight: 600;
          color: #FAF8F5;
        }
        .od-item__value--price {
          font-size: 1rem;
          font-weight: 700;
          color: #D4B87A;
        }
        .od-card-preview {
          background: #0A0807;
          border: 1px solid rgba(201,169,110,0.15);
          border-radius: 8px;
          padding: 1.5rem 1.25rem;
          font-size: 0.875rem;
          line-height: 1.8;
          color: #EDE5D8;
          white-space: pre-line;
          max-height: 300px;
          overflow-y: auto;
        }
        .od-receipt {
          margin-top: 0.875rem;
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }
        .od-receipt__img {
          width: 120px;
          height: 120px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid rgba(201,169,110,0.2);
          transition: transform 0.2s;
        }
        .od-receipt__img:hover {
          transform: scale(1.05);
        }
        .od-addons {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .od-addon-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0.75rem;
          background: #0A0807;
          border-radius: 6px;
          font-size: 0.8125rem;
          color: #EDE5D8;
        }
      `}</style>
    </>
  );
}
