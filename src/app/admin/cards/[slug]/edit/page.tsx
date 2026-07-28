"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Script from "next/script";
import RichTextEditor from "@/components/RichTextEditor";

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
  /** Per-card price for small inner cards added for extra ceremonies */
  inner_card_price?: number;
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
}

const CATEGORIES = [
  "Luxury",
  "Classic",
  "Modern",
  "Minimalist",
  "Floral",
  "Textured",
  "Acrylic",
] as const;
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";
const EMPTY: Omit<CardDoc, "_id"> = {
  slug: "",
  name: "",
  card_code: "",
  base_price: 0,
  original_price: undefined,
  inner_card_price: undefined,
  category: "Luxury",
  description: "",
  images: [""],
  short_video_url: "",
  is_new: false,
  is_bestseller: false,
  min_order: 50,
  add_ons: [],
  meta_title: "",
  meta_description: "",
  image_alt_text: "",
};

function toSlug(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function EditCardPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Omit<CardDoc, "_id">>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);
  const [showUrls, setShowUrls] = useState(false);
  const cloudinaryLoaded = useRef(false);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Auth
  useEffect(() => {
    fetch("/api/auth/check")
      .then((r) => r.json())
      .then((j) => {
        if (!j.authenticated) router.replace("/admin/login");
        else setAuthenticated(true);
      })
      .catch(() => router.replace("/admin/login"))
      .finally(() => setAuthChecking(false));
  }, [router]);

  // Load card
  useEffect(() => {
    if (!authenticated) return;
    fetch(`/api/cards/${slug}`)
      .then((r) => r.json())
      .then((j) => {
        const c: CardDoc = j.data;
        if (!c) {
          router.replace("/admin");
          return;
        }
        setForm({
          slug: c.slug,
          name: c.name,
          card_code: c.card_code || "",
          base_price: c.base_price,
          original_price: c.original_price,
          inner_card_price: c.inner_card_price,
          category: c.category,
          description: c.description,
          images: c.images.length > 0 ? c.images : [""],
          short_video_url: c.short_video_url || "",
          is_new: c.is_new,
          is_bestseller: c.is_bestseller,
          min_order: c.min_order,
          add_ons: c.add_ons,
          meta_title: c.meta_title || "",
          meta_description: c.meta_description || "",
          image_alt_text: c.image_alt_text || "",
        });
      })
      .catch(() => router.replace("/admin"))
      .finally(() => setLoading(false));
  }, [slug, authenticated, router]);

  const openWidget = useCallback((mode: "image" | "video") => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cld = (window as any).cloudinary;
    if (!cld || !CLOUD_NAME || !UPLOAD_PRESET) {
      showToast("Cloudinary not configured", "error");
      return;
    }
    const w = cld.createUploadWidget(
      {
        cloudName: CLOUD_NAME,
        uploadPreset: UPLOAD_PRESET,
        sources: ["local", "url", "camera"],
        multiple: mode === "image",
        maxFiles: mode === "image" ? 10 : 1,
        resourceType: mode === "image" ? "image" : "video",
        clientAllowedFormats:
          mode === "image"
            ? ["jpg", "jpeg", "png", "webp", "avif"]
            : ["mp4", "webm", "mov"],
        maxFileSize: mode === "image" ? 10000000 : 50000000,
        // TODO: folder name kept for historical asset compatibility — visible brand is Shahi Bulawa
        folder: mode === "image" ? "paighaam/cards" : "paighaam/videos",
        cropping: mode === "image",
        theme: "minimal",
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err: any, res: any) => {
        if (err) {
          showToast(`Upload failed: ${err.message || "error"}`, "error");
          return;
        }
        if (res?.event === "success" && res.info?.secure_url) {
          const url: string = res.info.secure_url;
          if (mode === "image")
            setForm((f) => {
              const imgs = [...f.images];
              const idx = imgs.findIndex((u) => !u.trim());
              if (idx >= 0) imgs[idx] = url;
              else imgs.push(url);
              return { ...f, images: imgs };
            });
          else setForm((f) => ({ ...f, short_video_url: url }));
          showToast("Uploaded!", "success");
        }
      },
    );
    w.open();
  }, []);

  const handleSave = async () => {
    if (
      !form.name.trim() ||
      !form.base_price ||
      !form.category ||
      !form.description.trim()
    ) {
      showToast("Fill all required fields", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        images: form.images.filter((u) => u.trim() !== ""),
        // Send null explicitly so JSON.stringify keeps the key and the API can $unset it
        original_price: form.original_price || null,
        inner_card_price: form.inner_card_price || null,
        short_video_url: form.short_video_url?.trim() || undefined,
        card_code: form.card_code?.trim() || undefined,
        meta_title: form.meta_title?.trim() || "",
        meta_description: form.meta_description?.trim() || "",
        image_alt_text: form.image_alt_text?.trim() || "",
      };
      const res = await fetch(`/api/cards/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.error || "Unknown error");
      showToast("Card updated!", "success");
      setTimeout(() => router.push("/admin"), 1200);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  if (authChecking || !authenticated)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0A0807",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: "3px solid rgba(201,169,110,0.2)",
            borderTopColor: "#C9A96E",
            borderRadius: "50%",
            animation: "spin 0.6s linear infinite",
          }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0A0807",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#C9A96E",
          fontFamily: "inherit",
        }}
      >
        Loading card…
      </div>
    );

  const setImage = (i: number, v: string) =>
    setForm((f) => {
      const imgs = [...f.images];
      imgs[i] = v;
      return { ...f, images: imgs };
    });
  const addImage = () => setForm((f) => ({ ...f, images: [...f.images, ""] }));
  const removeImage = (i: number) =>
    setForm((f) => ({ ...f, images: f.images.filter((_, j) => j !== i) }));
  const setAddOn = (i: number, k: keyof AddOn, v: string | number) =>
    setForm((f) => {
      const a = [...f.add_ons];
      a[i] = { ...a[i], [k]: v };
      return { ...f, add_ons: a };
    });
  const addAddOn = () =>
    setForm((f) => ({
      ...f,
      add_ons: [...f.add_ons, { name: "", price: 0, description: "" }],
    }));
  const removeAddOn = (i: number) =>
    setForm((f) => ({ ...f, add_ons: f.add_ons.filter((_, j) => j !== i) }));

  return (
    <>
      <Script
        src="https://upload-widget.cloudinary.com/global/all.js"
        strategy="lazyOnload"
        onLoad={() => {
          cloudinaryLoaded.current = true;
        }}
      />

      {toast && (
        <div className={`ec-toast ec-toast--${toast.type}`}>
          {toast.type === "success" ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      <div className="ec-page">
        {/* Header */}
        <header className="ec-header">
          <button className="ec-back" onClick={() => router.push("/admin")}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back
          </button>
          <h1 className="ec-title">
            Edit: <span>{form.name || slug}</span>
          </h1>
        </header>

        {/* Form */}
        <div className="ec-body">
          <div className="ec-form">
            {/* Name + Code */}
            <div className="ec-grid2">
              <div className="ec-field">
                <label className="ec-label">
                  Card Name <span className="ec-req">*</span>
                </label>
                <input
                  className="ec-input"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      name: e.target.value,
                      slug: toSlug(e.target.value),
                    }))
                  }
                  placeholder="e.g. Royal Mughal Velvet"
                />
              </div>
              <div className="ec-field">
                <label className="ec-label">Card Code</label>
                <input
                  className="ec-input"
                  value={form.card_code || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, card_code: e.target.value }))
                  }
                  placeholder="e.g. WC-001"
                />
              </div>
            </div>

            {/* Slug */}
            <div className="ec-field">
              <label className="ec-label">
                Slug <span className="ec-req">*</span>
              </label>
              <input
                className="ec-input ec-input--mono"
                value={form.slug}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                  }))
                }
              />
              <p className="ec-hint">URL: /product/{form.slug || "…"}</p>
            </div>

            {/* Category + Min Order */}
            <div className="ec-grid2">
              <div className="ec-field">
                <label className="ec-label">
                  Category <span className="ec-req">*</span>
                </label>
                <select
                  className="ec-select"
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ec-field">
                <label className="ec-label">Min Order (pcs)</label>
                <input
                  className="ec-input"
                  type="number"
                  min={1}
                  value={form.min_order}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      min_order: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>

            {/* Prices */}
            <div className="ec-grid2">
              <div className="ec-field">
                <label className="ec-label">
                  Base Price (PKR/card) <span className="ec-req">*</span>
                </label>
                <input
                  className="ec-input"
                  type="number"
                  min={0}
                  value={form.base_price || ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      base_price: Number(e.target.value),
                    }))
                  }
                  placeholder="e.g. 350"
                />
              </div>
              <div className="ec-field">
                <label className="ec-label">
                  Original Price <span className="ec-opt">(strikethrough)</span>
                </label>
                <input
                  className="ec-input"
                  type="number"
                  min={0}
                  value={form.original_price || ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      original_price: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    }))
                  }
                  placeholder="e.g. 500"
                />
              </div>
            </div>

            {/* Inner Card Price */}
            <div className="ec-field">
              <label className="ec-label">
                Inner Card Price (PKR/card){" "}
                <span className="ec-opt">(for extra ceremony inner cards at checkout)</span>
              </label>
              <input
                className="ec-input"
                type="number"
                min={0}
                value={form.inner_card_price || ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    inner_card_price: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
                placeholder="e.g. 40"
              />
              <p className="ec-hint">
                📍 Net price per inner card when customer orders extra event cards (Valima, Nikkah, etc.) during checkout. Not related to product add-ons.
              </p>
            </div>

            {/* Description */}
            <div className="ec-field">
              <label className="ec-label">
                Description <span className="ec-req">*</span>
              </label>
              <RichTextEditor
                value={form.description}
                onChange={(html) =>
                  setForm((f) => ({ ...f, description: html }))
                }
                placeholder="Brief description of the card…"
                maxLength={5000}
                minRows={5}
              />
            </div>

            {/* Images */}
            <div className="ec-field">
              <div className="ec-field-header">
                <label className="ec-label">Card Images</label>
                <button
                  type="button"
                  className="ec-btn-sm"
                  onClick={() => setShowUrls((v) => !v)}
                >
                  {showUrls ? "Hide URLs" : "Paste URL"}
                </button>
              </div>
              <button
                type="button"
                className="ec-upload-zone"
                onClick={() => openWidget("image")}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>Click to upload images</span>
                <span className="ec-upload-hint">
                  JPG, PNG, WebP — max 10 MB
                </span>
              </button>
              {form.images.filter((u) => u.trim()).length > 0 && (
                <div className="ec-img-grid">
                  {form.images.map((url, i) =>
                    url.trim() ? (
                      <div key={i} className="ec-img-card">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt=""
                          className="ec-img-card__img"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <button
                          type="button"
                          className="ec-img-card__remove"
                          onClick={() => removeImage(i)}
                        >
                          ✕
                        </button>
                      </div>
                    ) : null,
                  )}
                </div>
              )}
              {showUrls && (
                <div className="ec-url-list">
                  {form.images.map((url, i) => (
                    <div key={i} className="ec-url-row">
                      <input
                        type="url"
                        className="ec-input"
                        value={url}
                        onChange={(e) => setImage(i, e.target.value)}
                        placeholder="https://res.cloudinary.com/…"
                      />
                      {form.images.length > 1 && (
                        <button
                          type="button"
                          className="ec-btn-danger"
                          onClick={() => removeImage(i)}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="ec-btn-sm"
                    onClick={addImage}
                  >
                    + Add URL
                  </button>
                </div>
              )}
            </div>

            {/* Video */}
            <div className="ec-field">
              <label className="ec-label">
                Short Preview Video{" "}
                <span className="ec-opt">(optional, ~5 sec)</span>
              </label>
              {form.short_video_url ? (
                <div className="ec-video-wrap">
                  <video
                    src={form.short_video_url}
                    className="ec-video"
                    controls
                    muted
                    playsInline
                    loop
                  />
                  <div className="ec-video-actions">
                    <button
                      type="button"
                      className="ec-btn-sm"
                      onClick={() => openWidget("video")}
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      className="ec-btn-danger"
                      onClick={() =>
                        setForm((f) => ({ ...f, short_video_url: "" }))
                      }
                    >
                      ✕ Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="ec-upload-zone"
                  onClick={() => openWidget("video")}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <polygon points="23 7 16 12 23 17 23 7" />
                    <rect x="1" y="5" width="15" height="14" rx="2" />
                  </svg>
                  <span>Click to upload video</span>
                  <span className="ec-upload-hint">
                    MP4, WebM, MOV — max 50 MB
                  </span>
                </button>
              )}
              {showUrls && (
                <input
                  type="url"
                  className="ec-input"
                  style={{ marginTop: "0.5rem" }}
                  value={form.short_video_url || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, short_video_url: e.target.value }))
                  }
                  placeholder="Or paste video URL…"
                />
              )}
            </div>

            {/* Toggles */}
            <div className="ec-grid2">
              <label className="ec-toggle">
                <input
                  type="checkbox"
                  checked={form.is_new}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, is_new: e.target.checked }))
                  }
                />
                <span className="ec-toggle__track" />
                <span className="ec-toggle__label">Mark as New</span>
              </label>
              <label className="ec-toggle">
                <input
                  type="checkbox"
                  checked={form.is_bestseller}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, is_bestseller: e.target.checked }))
                  }
                />
                <span className="ec-toggle__track" />
                <span className="ec-toggle__label">Mark as Bestseller</span>
              </label>
            </div>

            <div className="ec-field">
              <label className="ec-label">
                SEO Meta Title <span className="ec-opt">(optional)</span>
              </label>
              <input
                className="ec-input"
                value={form.meta_title || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, meta_title: e.target.value }))
                }
                placeholder="e.g. Royal Mughal Velvet Wedding Card | Shahi Bulawa"
              />
            </div>

            <div className="ec-field">
              <label className="ec-label">
                SEO Meta Description <span className="ec-opt">(optional)</span>
              </label>
              <textarea
                className="ec-input"
                style={{ resize: "vertical", minHeight: "80px" }}
                value={form.meta_description || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, meta_description: e.target.value }))
                }
                placeholder="Brief summary for search engines…"
              />
            </div>

            <div className="ec-field">
              <label className="ec-label">
                Image Alt Text <span className="ec-opt">(optional)</span>
              </label>
              <input
                className="ec-input"
                value={form.image_alt_text || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, image_alt_text: e.target.value }))
                }
                placeholder="e.g. Red velvet wedding card with gold foil"
              />
            </div>

            {/* Add-ons */}
            <div className="ec-field">
              <div className="ec-field-header">
                <label className="ec-label">Add-ons</label>
                <button type="button" className="ec-btn-sm" onClick={addAddOn}>
                  + Add Row
                </button>
              </div>
              {form.add_ons.length === 0 && (
                <p className="ec-hint">No add-ons yet.</p>
              )}
              {form.add_ons.map((ao, i) => (
                <div key={i} className="ec-addon-row">
                  <input
                    className="ec-input"
                    placeholder="Name (e.g. Gold Foil)"
                    value={ao.name}
                    onChange={(e) => setAddOn(i, "name", e.target.value)}
                  />
                  <input
                    className="ec-input ec-input--sm"
                    type="number"
                    placeholder="Price"
                    min={0}
                    value={ao.price}
                    onChange={(e) =>
                      setAddOn(i, "price", Number(e.target.value))
                    }
                  />
                  <input
                    className="ec-input"
                    placeholder="Description"
                    value={ao.description}
                    onChange={(e) => setAddOn(i, "description", e.target.value)}
                  />
                  <button
                    type="button"
                    className="ec-btn-danger"
                    onClick={() => removeAddOn(i)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Bottom save */}
            <div className="ec-footer">
              <button
                className="ec-cancel"
                onClick={() => router.push("/admin")}
              >
                Cancel
              </button>
              <button
                className="ec-save-btn"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{background:#0A0807;}
        .ec-page{min-height:100vh;background:#0A0807;font-family:inherit;color:#EDE5D8;}
        .ec-header{display:flex;align-items:center;gap:1rem;padding:1rem 1.5rem;background:#111009;border-bottom:1px solid rgba(201,169,110,0.12);position:sticky;top:0;z-index:10;}
        .ec-back{display:flex;align-items:center;gap:0.4rem;background:none;border:1px solid rgba(201,169,110,0.2);color:#a09080;padding:0.4rem 0.75rem;border-radius:7px;cursor:pointer;font-size:0.8rem;transition:all .15s;}
        .ec-back:hover{border-color:#C9A96E;color:#C9A96E;}
        .ec-title{flex:1;font-size:1.1rem;font-weight:600;color:#EDE5D8;} .ec-title span{color:#C9A96E;}
        .ec-body{max-width:860px;margin:0 auto;padding:2rem 1.5rem 4rem;}
        .ec-form{display:flex;flex-direction:column;gap:1.25rem;}
        .ec-grid2{display:grid;grid-template-columns:1fr 1fr;gap:1rem;}
        @media(max-width:600px){.ec-grid2{grid-template-columns:1fr;}}
        .ec-field{display:flex;flex-direction:column;gap:0.375rem;}
        .ec-field-header{display:flex;align-items:center;justify-content:space-between;}
        .ec-label{font-size:0.8rem;font-weight:600;color:#a09080;letter-spacing:.03em;}
        .ec-req{color:#C9A96E;} .ec-opt{color:#5a4a3a;font-weight:400;}
        .ec-hint{font-size:0.72rem;color:#5a4a3a;margin-top:2px;}
        .ec-input,.ec-select{background:#1C1916;border:1px solid rgba(201,169,110,0.15);border-radius:8px;color:#EDE5D8;font-size:0.875rem;padding:0.6rem 0.75rem;outline:none;width:100%;transition:border-color .2s;font-family:inherit;}
        .ec-input:focus,.ec-select:focus{border-color:rgba(201,169,110,0.5);box-shadow:0 0 0 3px rgba(201,169,110,0.08);}
        .ec-input::placeholder{color:#3a2a1a;}
        .ec-input--mono{font-family:monospace;font-size:.82rem;}
        .ec-input--sm{max-width:90px;}
        .ec-select{appearance:none;cursor:pointer;}
        .ec-upload-zone{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0.5rem;width:100%;padding:1.5rem;background:#1C1916;border:1.5px dashed rgba(201,169,110,0.25);border-radius:10px;color:#a09080;cursor:pointer;transition:all .2s;font-family:inherit;}
        .ec-upload-zone:hover{border-color:#C9A96E;color:#C9A96E;}
        .ec-upload-hint{font-size:0.72rem;color:#5a4a3a;}
        .ec-img-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:0.5rem;margin-top:.5rem;}
        .ec-img-card{position:relative;aspect-ratio:1;border-radius:8px;overflow:hidden;border:1px solid rgba(201,169,110,0.15);}
        .ec-img-card__img{width:100%;height:100%;object-fit:cover;}
        .ec-img-card__remove{position:absolute;top:4px;right:4px;width:20px;height:20px;border-radius:50%;background:rgba(220,38,38,.85);border:none;color:#fff;font-size:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;}
        .ec-url-list{display:flex;flex-direction:column;gap:.5rem;margin-top:.5rem;}
        .ec-url-row{display:flex;gap:.5rem;align-items:center;}
        .ec-video-wrap{display:flex;flex-direction:column;gap:.5rem;}
        .ec-video{width:100%;max-height:220px;border-radius:8px;background:#000;}
        .ec-video-actions{display:flex;gap:.5rem;}
        .ec-toggle{display:flex;align-items:center;gap:.625rem;cursor:pointer;padding:.6rem 0;}
        .ec-toggle input{display:none;}
        .ec-toggle__track{width:36px;height:20px;border-radius:10px;background:#2a2018;border:1px solid rgba(201,169,110,0.2);position:relative;transition:background .2s;flex-shrink:0;}
        .ec-toggle__track::after{content:'';position:absolute;left:2px;top:2px;width:14px;height:14px;border-radius:50%;background:#5a4a3a;transition:all .2s;}
        .ec-toggle input:checked~.ec-toggle__track{background:#C9A96E;}
        .ec-toggle input:checked~.ec-toggle__track::after{left:18px;background:#fff;}
        .ec-toggle__label{font-size:.8375rem;color:#a09080;}
        .ec-addon-row{display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;}
        .ec-btn-sm{background:transparent;border:1px solid rgba(201,169,110,0.25);color:#a09080;padding:.3rem .65rem;border-radius:6px;font-size:.775rem;cursor:pointer;transition:all .15s;font-family:inherit;}
        .ec-btn-sm:hover{border-color:#C9A96E;color:#C9A96E;}
        .ec-btn-danger{background:transparent;border:1px solid rgba(220,38,38,.3);color:#ef4444;padding:.3rem .6rem;border-radius:6px;font-size:.775rem;cursor:pointer;transition:all .15s;font-family:inherit;}
        .ec-btn-danger:hover{background:rgba(220,38,38,.1);}
        .ec-footer{display:flex;justify-content:flex-end;gap:.75rem;padding-top:.5rem;border-top:1px solid rgba(201,169,110,0.1);margin-top:.5rem;}
        .ec-cancel{background:transparent;border:1px solid rgba(201,169,110,0.2);color:#a09080;padding:.55rem 1.25rem;border-radius:8px;cursor:pointer;font-size:.875rem;font-family:inherit;transition:all .15s;}
        .ec-cancel:hover{border-color:#C9A96E;color:#C9A96E;}
        .ec-save-btn{background:linear-gradient(135deg,#C9A96E,#B8944D);color:#fff;border:none;padding:.55rem 1.5rem;border-radius:8px;font-size:.875rem;font-weight:600;cursor:pointer;transition:opacity .15s;font-family:inherit;}
        .ec-save-btn:disabled{opacity:.6;cursor:not-allowed;}
        .ec-toast{position:fixed;top:1.25rem;right:1.25rem;z-index:9999;padding:.7rem 1.25rem;border-radius:9px;font-size:.875rem;font-weight:500;color:#fff;animation:slideIn .2s ease;}
        .ec-toast--success{background:#166534;border:1px solid #16a34a;}
        .ec-toast--error{background:#7f1d1d;border:1px solid #dc2626;}
        @keyframes slideIn{from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:translateY(0);}}
      `}</style>
    </>
  );
}
