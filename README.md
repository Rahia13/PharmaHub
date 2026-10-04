# PharmaHub

Next.js 14 (App Router) + TypeScript + Tailwind CSS.

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## What's included in this step

- `components/TopBar.tsx`, `Header.tsx` — utility bar, search, nav, cart badge, profile button that opens the login modal
- `components/LoginModal.tsx` — login/register modal wired to `AuthContext`
- `components/Hero.tsx` — hero banner with trust icons and CTAs
- `components/FlashSale.tsx` — countdown + flash deal product grid
- `components/Categories.tsx` — shop-by-category grid
- `components/PopularProducts.tsx` — popular products grid
- `components/ProductCard.tsx` — shared product card (adds to cart via `CartContext`)
- `components/TrustBadges.tsx`, `Footer.tsx`
- `context/CartContext.tsx`, `context/AuthContext.tsx` — global state, ready for the Cart/Checkout step
- `types/index.ts`, `data/mockData.ts` — shared types and mock product/category data

Cart and auth state are already global (React Context) so the next steps (Product Details, Cart, Checkout) plug straight in.

## Step 2: Product Details & Cart

- `app/product/[slug]/page.tsx` — dynamic product route with gallery, buy box, tabs, frequently-bought-together
- `app/cart/page.tsx` — cart items, promo code, order summary; gates "Proceed to Delivery" behind login

## Step 3: Delivery Address & Payment

- `context/CheckoutContext.tsx` — shared address list, selected address, payment method, and promo code state used across Cart → Delivery → Payment
- `lib/useOrderTotals.ts` — single pricing calculation (subtotal, savings, promo, delivery charge, total) used by `OrderSummary` and the payment page so the total stays consistent across steps
- `app/checkout/delivery/page.tsx` — saved-address selector + "Add New Address" modal
- `app/checkout/payment/page.tsx` — COD / bKash / Nagad / Card selection, Server Price Lock note, Place Order
- `app/orders/page.tsx` — placeholder confirmation screen; full Live Order Tracking (stepper + rider details) is the next step

## Step 4: Live Order Tracking

- `context/OrderContext.tsx` — stores placed orders; `placeOrder` is called from the payment page, `advanceStatus` moves an order Placed → Processing → Out for Delivery → Delivered
- `app/orders/page.tsx` — "Orders & Tracking" with Live Order / Order History tabs (login-gated)
- `components/TrackingStepper.tsx`, `OrderCard.tsx`, `OrderStatusBadge.tsx`, `RiderCard.tsx`
- `lib/format.ts` — date/time helpers
- Header "Orders" now opens the login modal when signed out, otherwise routes to `/orders`

Status changes are simulated with the "Simulate Next Step" button. Replace `advanceStatus` with polling / SSE / WebSocket once a backend exists.

## Step 5: Search, Category Listing & Persistence

- `app/products/page.tsx` — one listing page driven by URL params: `q`, `category`, `sort`, `flash`, `instock`, `otc` (shareable/bookmarkable)
- `components/ProductFilters.tsx` — category, flash-only, in-stock, no-prescription filters
- Header search + category dropdown, nav links, Shop Now, View all, and category cards now all route to `/products`
- Catalog grew to 16 products across all six categories (`data/mockData.ts`); `Product` now has a `category` field
- `lib/usePersistentState.ts` — cart, orders and login now survive a page refresh (localStorage)

## Step 6: Prescription Upload

- `app/prescription/page.tsx` — login-gated upload page with a list of your prescriptions (Under review / Approved / Rejected)
- `components/PrescriptionUploader.tsx` — drag & drop, JPG/PNG/WebP/PDF only, 5 MB max, image preview
- `context/PrescriptionContext.tsx` — stores prescription metadata (persisted); the file itself is not stored yet
- `components/PrescriptionNotice.tsx` — cart and payment pages warn when the cart has prescription-only medicines; **Place Order is disabled until a prescription is uploaded**
- Hero, footer "Upload Prescription" / "Track Order" links now work

Pharmacist review is simulated with the refresh icon on a pending prescription. Replace with a real review workflow on the backend.

## Step 7: Wishlist

- `context/WishlistContext.tsx` — saved product ids, persisted to localStorage
- `components/WishlistButton.tsx` — heart toggle used on product cards and the product gallery (filled when saved, `aria-pressed` for screen readers)
- `app/wishlist/page.tsx` — saved products grid with empty state and Clear all
- Header heart (desktop and mobile menu) shows a count badge and links to `/wishlist`; footer "My Wishlist" works too

## Step 8: Backend foundation (Prisma + PostgreSQL) — products & auth

### Run it

```bash
cp .env.example .env        # then set AUTH_SECRET (openssl rand -base64 32)
npm install                 # also runs `prisma generate`
npm run db:up               # starts Postgres via docker compose
npm run db:migrate -- --name init
npm run db:seed             # loads the 16 catalog products
npm run dev
```

### What moved server-side

- `prisma/schema.prisma` — User, Address, Product, Order, OrderItem, OrderEvent, Prescription (orders/prescriptions are modelled now; their API routes are the next backend step)
- **Products**: `GET /api/products` (params: `q`, `category`, `sort`, `flash`, `instock`, `otc`, `ids`) and `GET /api/products/[slug]`. Home and product-detail pages query the database directly; the listing and wishlist pages call the API.
- **Auth**: `POST /api/auth/register | login | logout`, `GET /api/auth/me`. Passwords are hashed with bcrypt (cost 12); sessions are a signed JWT in an `httpOnly`, `SameSite=Lax` cookie (7 days). Login errors are generic and timing-equalised.
- `AuthContext` now talks to these routes (real errors in the login modal, header profile menu with Log out).
- `lib/db.ts` (Prisma singleton), `lib/auth.ts`, `lib/validation.ts` (zod), `lib/mappers.ts`.

### Still client-side / not yet enforced

- Cart, wishlist and prescription list live in localStorage; **order totals are still computed in the browser**. The next step moves order placement server-side so prices are recomputed from the database ("Server Price Lock" for real).
- No rate limiting on login/register yet; add before going public.
- `data/mockData.ts` is now only the seed source plus static UI config (categories, nav, cities).

## Step 9: Server-side orders

Run the new migration (adds `Order.prescriptionId`):

```bash
npm run db:migrate -- --name orders
```

### What's authoritative on the server now

- `POST /api/orders` — requires login. Ignores any prices from the browser: it loads the products, **recomputes subtotal, promo, delivery charge and total**, checks the address belongs to you, checks stock, requires a prescription on file (pending/approved) for prescription-only items and links it to the order, **reserves stock atomically** (conditional decrement inside a transaction, so two buyers can't oversell the last units), snapshots names/prices onto the order, and returns the saved order.
- `POST /api/quote` — the server's price for a cart. The payment page shows this as the "Server Price Lock" total and warns if it differs from what the cart showed or if an item is no longer available.
- `GET /api/orders` — your orders (also polled every 10 s while one is in progress = live tracking).
- `GET/POST /api/addresses` — saved addresses now belong to your account.
- `GET/POST /api/prescriptions`, `DELETE /api/prescriptions/[code]` — prescriptions belong to your account.
- `lib/pricing.ts` holds the pricing rules used by both browser (instant estimate) and server (authoritative).

### Demo controls

`POST /api/orders/[code]/advance` and `POST /api/prescriptions/[code]/approve` stand in for the warehouse and the pharmacist. They work in development and are **disabled in production** unless `ENABLE_DEMO_TRACKING=true`; the UI hides the buttons when the server says they are off.

### Payments

No payment gateway is integrated. In production the server only accepts **Cash on Delivery**; bKash/Nagad/card are accepted in development so the flow can be exercised, but nothing is charged.

### Not done yet

- Payment gateways (bKash/Nagad/card), order cancellation, admin back-office, emails/SMS
- Rate limiting for auth and order endpoints

## Step 10: Prescription files & pharmacist review

Run the migration (adds `User.role` and review fields on `Prescription`):

```bash
npm run db:migrate -- --name prescription_review
```

### Files

- `POST /api/prescriptions` is now **multipart** (`file`, `patientName`, `notes`). The server checks size (5 MB), identifies the file **by its leading bytes** (JPEG/PNG/WebP/PDF; the browser's MIME type and file name are never trusted), generates its own storage key, and saves it privately via `lib/storage.ts`.
- Files are stored under `STORAGE_DIR` (default `./storage`, git-ignored, **never under `public/`**) and served only by `GET /api/prescriptions/[code]/file` to the owner or pharmacy staff (`Cache-Control: private, no-store`, `nosniff`). Missing and not-yours return the same 404.
- A prescription that supports an order can't be deleted by the customer.
- `lib/storage.ts` is a small adapter (`saveFile` / `readFile` / `deleteFile`). **Local disk does not survive on serverless hosts such as Vercel**; before deploying there, reimplement those three functions against S3/R2/Supabase Storage.

### Pharmacist review

- Roles: `customer` (default), `pharmacist`, `admin`. Promote an account (no default credentials are seeded):

  ```bash
  npm run user:set-role -- someone@example.com pharmacist
  ```
- `/pharmacist` (also in the profile menu for staff): queue of prescriptions awaiting review (oldest first), file preview, Approve / Reject with a required reason shown to the customer. APIs: `GET /api/pharmacist/prescriptions?status=…`, `POST /api/pharmacist/prescriptions/[code]/review` (staff only, pending → approved/rejected exactly once, records who and when).
- Customers see the rejection reason and can open their own file on `/prescription`.

### Known gaps

- Orders currently accept a *pending* prescription (the pharmacist is meant to verify before dispatch). Nothing yet **holds an order** if its prescription is later rejected; that needs a fulfilment/admin workflow.
- Prescriptions aren't yet matched line-by-line to the medicines in an order.
- No virus scanning, image re-encoding or retention policy for stored files.

## Step 11: Rate limiting & tests

- `lib/rateLimit.ts` — in-memory fixed-window limiter. Applied to `login` (10/5min, keyed by IP+email), `register` (5/hour/IP), `POST /api/orders` (20/hour/user) and prescription upload (20/hour/user). Returns `429` with `Retry-After`. **Single-process only** — see `DEPLOYMENT.md` for scaling it.
- `tests/` (Vitest) — unit tests for pricing (`computeTotals`, promo, free-delivery threshold), file-type sniffing (`detectFileType`, including rejecting a renamed text file), validation/`mergeLines`, and the rate limiter itself. Run with `npm test`.
- `DEPLOYMENT.md` — environment variables, migration command for CI/CD, and the two things that must change before shipping to a serverless host: prescription file storage (local disk → S3/R2/Supabase) and rate limiting (in-memory → shared store).

This closes out the backend hardening list. What's left before a real launch is payment gateway integration and order cancellation, which need real bKash/Nagad/card credentials to build against.

## Step 12: Product reviews

Run the migration (adds the `Review` table):

```bash
npm run db:migrate -- --name reviews
```

- `GET /api/products/[slug]/reviews` — latest reviews, the rating summary, and whether the signed-in customer may review.
- `POST /api/products/[slug]/reviews` — create or edit your review (1–5 stars + optional comment). **Only customers with a *delivered* order containing that product can review it** (shown as "Verified purchase"); one review per customer per product; rate-limited.
- The product's `rating` / `reviewCount` are adjusted incrementally so the seeded baseline is preserved.
- `components/ReviewsPanel.tsx` — used by the Reviews tab on the product page.
- Reviewer names are shortened ("Rahim K.").
