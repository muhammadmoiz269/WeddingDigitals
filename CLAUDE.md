# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Next dev server on http://localhost:3000
npm run build    # Production build
npm run start    # Run production build
npm run lint     # ESLint (eslint-config-next, core-web-vitals + typescript)
```

Seed MongoDB with starter cards and the admin user (`admin@gmail.com` / `Pass123!`):

```bash
npx tsx src/scripts/seed.ts
```

The seed script loads env from `.env.local` via `dotenv` and is upsert-safe (running it again updates existing cards by slug). No single-test runner — there is no test suite.

## Required env (`.env.local`)

- `MONGODB_URI` — Mongo connection string (Atlas in production).
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` / `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` — Cloudinary unsigned uploads happen in the browser via the Cloudinary upload widget (`https://upload-widget.cloudinary.com/global/all.js`), not server-side. There is no server-side Cloudinary SDK.
- `GEMINI_API_KEY` — Google Gemini API key for the AI template-customization chat (Epic C). Required by `POST /api/einvitations/[slug]/customize`. SDK: `@google/genai`, model: `gemini-2.5-flash`.

## Architecture

This is **Paighaam**, a Karachi-based wedding card e-commerce site. The order flow is **WhatsApp-driven** — there is no online payment integration; orders are placed in the DB and the admin contacts the customer via WhatsApp using pre-built message templates.

**Stack:** Next.js 16 App Router · React 19 · TypeScript · Tailwind v4 (`@import "tailwindcss"` in `globals.css`, theme tokens defined via `@theme inline`) · Mongoose 9 · framer-motion. Path alias `@/*` → `src/*`.

### Data layer

- `src/lib/mongodb.ts` — connection singleton stored on `global.mongooseCache` to survive Next.js hot reloads. Always call `await connectToDatabase()` at the top of any route handler / RSC that touches the DB.
- Models in `src/lib/models/`:
  - `Card` — products. Uses `mongoose.models.Card || mongoose.model(...)` pattern.
  - `Order` — customer orders. **Intentionally** runs `delete mongoose.models.Order` before redefining the model so schema edits apply on hot reload. Don't "fix" this to match the other two models without checking.
  - `Admin` — single admin user, bcrypt-hashed password + a `session_token` column written on login.

### Auth

Custom session-token auth (no NextAuth). `POST /api/auth/login` validates bcrypt, generates a random hex token, stores it on the Admin doc, and sets an HTTP-only `admin_session` cookie (7-day TTL). `GET /api/auth/check` looks up the cookie against the DB. `AdminClient` calls `/api/auth/check` on mount and `router.replace('/admin/login')` on 401. There is one admin row — collisions would log out the previous session.

### Category enum divergence (gotcha)

Three different "Category" lists exist in the codebase and they do not agree:

- `src/types/index.ts` Category: `All | Luxury | Minimalist | Nikkah | Walima | Mehndi | Baraat`
- `src/lib/models/Card.ts` enum: `Luxury | Classic | Modern | Minimalist | Floral | Textured`
- `src/scripts/seed.ts` enum: `Nikkah | Barat | Valima | Mehndi | Luxury | Minimalist`
- `src/lib/constants.ts` `CATEGORIES` (used for filter UI): matches the Card model

Mongoose validation is the source of truth at write time — adding a category requires updating the model enum, the constants list (for UI filters), and probably the TS Category union. Don't assume one of these alone is canonical.

### Pricing

`src/lib/pricing.ts` is the single source of truth for the price formula: `(base_price × quantity) + (add_on_price × quantity) − discount`, where discount is `10%` at `quantity ≥ 500` and `0%` below. `QuantityTier` in `src/types` (100 | 250 | 500) is informational only — checkout accepts any integer quantity.

### Checkout flow

Two-step client component in `src/app/checkout/`:

1. **Customize** (`CheckoutStep1.tsx`) — pick a main event (Wedding / Nikkah / Walima / Mehndi / Baraat), edit card text via `RichTextEditor`, optionally enable add-on events each with their own quantity and content.
2. **Details** (`CheckoutClient.tsx`) — name / WhatsApp (`/^(\+92|0)?3\d{9}$/`) / Karachi area dropdown / address / payment preference (`full` vs `deposit`).

`POST /api/orders` creates the order with `order_id` like `PGM-1234` (4-digit random with up to 5 collision retries). New orders default to `payment.status: 'pending_payment'` unless a `receipt_url` is provided.

### Admin

`/admin` (gated by `AdminClient` auth check) has two tabs: **Cards** (CRUD via `/api/cards`) and **Orders** (read-only list + per-order detail at `/admin/orders/[orderId]`). The Orders tab includes a pre-built WhatsApp confirmation deeplink generator that normalises Pakistani numbers (strips non-digits, prepends `92` if needed).

### Page conventions

- Product pages (`src/app/product/[slug]/page.tsx`) use `export const dynamic = 'force-dynamic'` to always read live MongoDB data. They map Mongoose docs into the `CardProduct` TS shape and derive `AddOn.id` from the name (`name.toLowerCase().replace(/\s+/g, '-')`).
- `src/lib/constants.ts` centralises the WhatsApp number (`WHATSAPP_NUMBER` / `WHATSAPP_DISPLAY`) and `sortCards` for client-side sorting; the API does Mongo-side sorting via `buildMongoSort` in `src/app/api/cards/route.ts`. Keep these in sync if adding a new sort key.
- Admin UI uses inline `<style>{...}` blocks with `admin-*` and `co-*` class prefixes rather than Tailwind — don't refactor unprompted.
- `next.config.ts` only whitelists `res.cloudinary.com` for `next/image`. Adding another image host requires extending `remotePatterns`.

### Infinite scroll (SEO pattern)

Card listing pages use **server-rendered first batch + client-side infinite scroll**, not pagination. This ensures crawlers index real cards on first load without executing JS.

- **Homepage** (`src/app/page.tsx`) — `async` server component with `revalidate = 1800`. Fetches `ITEMS_PER_PAGE` cards from MongoDB directly, passes them as `initialCards` / `initialTotal` to `InfiniteProductGrid` (client component). Supports category + sort filters.
- **Category pages** (`src/app/category/[slug]/page.tsx`) — same ISR pattern; passes first batch to `CategoryProductGrid` → `InfiniteCardGrid`.
- **Event pages** (`src/app/event/[slug]/page.tsx`) — same ISR pattern; passes first batch to `InfiniteCardGrid` with `filterParam="event"`.
- **`InfiniteProductGrid`** (`src/components/InfiniteProductGrid.tsx`) — homepage grid with category/sort UI. `IntersectionObserver` on a sentinel `<div>` triggers `/api/cards?page=N&limit=12&sort=…&category=…` calls. Filter changes call `resetAndFetch` which refetches page 1.
- **`InfiniteCardGrid`** (`src/components/InfiniteCardGrid.tsx`) — simpler grid for category/event pages with a fixed filter. Uses the same observer pattern.
- **`/api/cards`** supports `?category=`, `?event=`, `?page=`, `?limit=`, `?sort=` for incremental loads.
- Do **not** reintroduce `?page=N` URL-based pagination on listing pages — Google would only crawl page 1 anyway and the pattern was removed intentionally.

### Canonical + hreflang — MUST override on every new page

The root layout (`src/app/layout.tsx`) sets `alternates.canonical: '/'` globally. **Without a page-level override, Next.js emits `canonical: /` on every URL**, which causes Google to treat all pages as duplicates of the homepage and deindex them.

Every new indexable route MUST set its own `alternates` in `generateMetadata` or the static `metadata` export:

```ts
alternates: {
  canonical: '/your-path',
  languages: { 'en-PK': '/your-path', 'x-default': '/your-path' },
},
```

| Route | Canonical set | Notes |
|---|---|---|
| `src/app/product/[slug]/page.tsx` | ✅ `/product/${slug}` | Phase 8 |
| `src/app/category/[slug]/page.tsx` | ✅ `/category/${slug}` | Phase 9 |
| `src/app/event/[slug]/page.tsx` | ✅ `/event/${slug}` | Phase 10 |
| `src/app/checkout/page.tsx` | ✅ `/checkout` | noindex, still set |
| `src/app/admin/page.tsx` | — | noindex, exempt |
| `src/app/locations/[slug]/page.tsx` | ⬜ pending | Phase 18 |
| `src/app/blog/page.tsx` | ⬜ pending | Phase 24 |
| `src/app/blog/[slug]/page.tsx` | ⬜ pending | Phase 24 |
| `src/app/preferred-vendors/page.tsx` | ⬜ pending | Phase 27 |
