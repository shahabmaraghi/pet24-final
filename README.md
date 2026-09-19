# Pet24 — Next.js + shadcn/ui + Tailwind v4 + TypeScript

Full implementation of the Pet24 pet-shop design, rebuilt as a production-style Next.js 15 (App Router) codebase.

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000. Requires Node 18.18+ (Node 20+ recommended).

## Stack

- Next.js 15 (App Router), React 19, TypeScript 5.7, strict mode
- Tailwind CSS v4 (CSS-first config — theme tokens live in `app/globals.css` via `@theme`, no `tailwind.config.ts` needed)
- shadcn/ui primitives in `components/ui/` (button, input, textarea, select, label, card, badge, table, dialog, tabs, sheet)
- react-hook-form + zod for every form in the app (checkout, blog comments, admin login/product, account login/profile/address) — schema-validated with inline error messages
- lucide-react icons, Vazirmatn font, RTL (`dir="rtl"` on `<html>`)

## Structure

- `app/(shop)/` — storefront route group sharing the header/footer layout: home, `category/[id]`, `product/[id]`, `cart`, `checkout` + `checkout/success`, `blog` + `blog/[id]`, `about`
- `app/admin/page.tsx` — admin login + dashboard (products, categories, slider, orders, blog posts, comments moderation, users) as a tabbed single-page panel
- `app/account/page.tsx` — customer login + profile, addresses, orders, payments, wishlist
- `lib/data.ts` — shared product/category/blog/shipping data (ported verbatim from the original design)
- `lib/cart-store.tsx` — cart state via React context, persisted to `localStorage`
- `components/` — `site-header.tsx` (search, cart badge, mobile `Sheet` drawer nav), `site-footer.tsx`, `hero-slider.tsx` (autoplay carousel), `product-card.tsx`, `category-icon.tsx`, `paw-logo.tsx`

## Backend / API

Full-stack layer added on top of the original static prototype:

- **Database**: MongoDB via Mongoose (`lib/db.ts`, models in `lib/models/`) — Product, Category, BlogPost, Review, BlogComment, Order, Slide, Cart, User.
- **Auth**: NextAuth (`lib/auth.ts`, `app/api/auth/[...nextauth]/route.ts`) — Google OAuth, email/password (Credentials), and passwordless magic-link email. JWT sessions; role (`user`/`admin`) embedded in the token. `middleware.ts` protects `/admin/**` (admin role only) and `/account/**` (any signed-in user).
- **APIs** (all under `app/api/`): `products`, `categories`, `blog`, `reviews` (submit + admin approve/reject/reply), `blog-comments` (same moderation pattern), `orders`, `slider`, `users`, `cart` (server-side, tied to the signed-in user), `upload` (Cloudinary), `checkout` + `checkout/verify` (Zarinpal sandbox payment flow).
- **Login/register pages**: `app/login`, `app/register` — react-hook-form + zod, Google button, magic-link option.

### Setup

1. Copy `.env.example` to `.env.local` and fill in: `MONGODB_URI`, `NEXTAUTH_SECRET` (`openssl rand -base64 32`), Google OAuth credentials, SMTP creds for magic-link email, Cloudinary keys, and a Zarinpal sandbox merchant ID (get one free at zarinpal.com sandbox).
2. `npm install`
3. `npm run seed` — populates MongoDB from the existing static catalog in `lib/data.ts` and creates a default admin (`SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD`, printed to console).
4. `npm run dev`

### Still to wire up

The storefront pages (`app/page.tsx`, `category/[id]`, `product/[id]`, blog, cart, checkout, admin panel) still read from the static `lib/data.ts` arrays and the `localStorage` cart/review stores built earlier — the API layer above is ready but the pages haven't been switched over to fetch from it yet. Say the word and I'll wire each page to its API (products/categories/blog from the DB, reviews/comments through the moderation endpoints, cart through `/api/cart`, checkout through `/api/checkout`, admin panel through the CRUD routes with `useSession()` gating).

