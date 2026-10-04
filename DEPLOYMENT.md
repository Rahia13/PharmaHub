# Deploying PharmaHub

This app needs three things in production: a Postgres database, a place to
store prescription files, and a few environment variables. Nothing here is
tied to one host — pick what your team already uses.

## 1. Environment variables

Set these wherever the app runs (never commit `.env`):

| Variable | Notes |
|---|---|
| `DATABASE_URL` | Postgres connection string. Use a managed instance (Neon, Supabase, RDS, Railway) — don't run `docker-compose.yml` in production. |
| `AUTH_SECRET` | Random string, 32+ chars. Generate with `openssl rand -base64 32`. Rotating it logs everyone out. |
| `STORAGE_DIR` | Only used by the local-disk storage adapter — see the storage section below. |
| `ENABLE_DEMO_TRACKING` | Leave unset (or `false`) in production. Only set `true` for a demo/staging environment. |

## 2. Database

```bash
npx prisma migrate deploy   # applies committed migrations, doesn't prompt
npm run db:seed             # optional: loads the mock catalog
npm run user:set-role -- you@example.com pharmacist   # to access /pharmacist
```

Run `migrate deploy` (not `migrate dev`) in CI/CD or as a release step —
`dev` is for local iteration only.

## 3. Prescription file storage — action required

`lib/storage.ts` ships with a **local-disk adapter**. That's fine for a
single long-running server with a persistent disk. It will **silently lose
files** on serverless/ephemeral hosts (Vercel, most container platforms
without a mounted volume), because the filesystem resets between deploys
and often between requests.

Before deploying to a serverless host, replace the three functions in
`lib/storage.ts` (`saveFile`, `readFile`, `deleteFile`) with calls to
S3, Cloudflare R2, or Supabase Storage. Nothing else in the app touches the
filesystem directly — the API routes only import these three functions —
so this is a self-contained swap. Keep the bucket **private**; files are
already only ever served through the authenticated
`/api/prescriptions/[code]/file` route, not a public URL.

## 4. Rate limiting — action required at scale

`lib/rateLimit.ts` is an in-memory limiter. It works correctly on a single
server process. On multiple instances (most serverless/autoscaled setups)
each instance has its own memory, so the effective limit multiplies by the
instance count. Before scaling out, swap it for a shared store such as
Upstash Redis (`@upstash/ratelimit` is a drop-in for this exact pattern) —
only `lib/rateLimit.ts` needs to change.

## 5. Build & run

```bash
npm install
npm run build
npm start
```

`npm run build` runs `prisma generate` automatically via the `postinstall`
script — make sure `DATABASE_URL` is available at build time on whatever
platform you use.

## 6. Before going live — checklist

- [ ] Real payment gateway integrated (bKash/Nagad/card). Until then, keep
      only Cash on Delivery enabled — the order API already rejects other
      methods when `NODE_ENV=production`.
- [ ] `lib/storage.ts` points at real object storage, not local disk.
- [ ] `lib/rateLimit.ts` backed by a shared store if running more than one instance.
- [ ] `AUTH_SECRET` set to a strong, unique value (not the example).
- [ ] HTTPS enforced (most hosts do this for you); cookies are already
      marked `secure` when `NODE_ENV=production`.
- [ ] `ENABLE_DEMO_TRACKING` unset.
- [ ] A real pharmacist/admin account created via `user:set-role`; no
      default credentials are seeded.
- [ ] Backups configured on the database.
- [ ] `npm run test` passing in CI.
