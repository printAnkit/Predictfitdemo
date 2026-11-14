# Predict — live demo

The full Predict platform (Operations console, clinic panel, patient site) running on **fictional data**.
Nothing leaves a demo deploy: WhatsApp, Meta, SMS, Google and email calls are answered locally with a fake
success, uploads stay inline, and the database is wiped and re-seeded every night.

| App | Folder | What it is |
|---|---|---|
| Operations | `apps/automation` | Leads, call queue, WhatsApp inbox and automation, reports, ad ROI |
| Clinic | `apps/clinic` | Patients, appointments, therapy courses, billing, stock, health reports |
| Patient site | `apps/web` | The patient-facing app (optional for the demo) |

## How demo mode works

- `DEMO_MODE=1` (server) and `NEXT_PUBLIC_DEMO_MODE=1` (browser) switch it on.
- `packages/db/src/demo-mode.ts` — a network guard installed at server start (`src/instrumentation.ts` in each
  app) that answers every call to Meta / WhatsApp / MSG91 / Twilio / Google / Resend / Razorpay with a fake
  success. Email is logged, uploads become inline data URLs (2 MB cap), and the ad report gets stable fake spend.
- `packages/db/src/demo-seed.ts` — the fictional world: 2 clinics, 6 staff accounts, ~300 leads from 7 ads,
  ~30 patients, courses, payments, medicine bills and 1,300+ WhatsApp messages. Refuses to run unless `DEMO_MODE=1`.
- `packages/ui/src/components/demo-mode.tsx` — the demo banner (closable) and the "Try the demo" buttons.

## Demo accounts

All use the password `predict-demo-2026` (or `NEXT_PUBLIC_DEMO_PASSWORD`), and the login pages sign in with one click.

| Role | Email | App |
|---|---|---|
| Operations manager | `ops@demo.predict.fit` | Operations |
| Telecaller | `caller@demo.predict.fit` | Operations |
| Clinic admin | `admin@demo.predict.fit` | Clinic |
| Front desk | `desk@demo.predict.fit` | Clinic |
| Doctor | `doctor@demo.predict.fit` | Clinic |
| Predict (diagnosis) | `predict@demo.predict.fit` | Clinic |

## Run it locally

```bash
pnpm install
# 1. A Postgres database for the demo ONLY (e.g. a new Neon database).
#    Put its URLs in packages/db/.env and each app's .env (see the variables below).
pnpm --filter @workspace/db db:push                          # create the tables
pnpm --filter @workspace/db exec tsx scripts/seed-care-plan-catalog.ts
pnpm --filter @workspace/db demo:seed                         # the fictional world (also sets role permissions)
pnpm --filter automation dev                                  # http://localhost:3001/login
pnpm --filter clinic dev                                      # http://localhost:3002/auth/login
```

## Deploy on Vercel

One Git repo, **one Vercel project per app**. For each of `apps/automation` and `apps/clinic`
(and `apps/web` if you want the patient site):

1. **New Project** → import this repo.
2. **Root Directory**: `apps/automation` (or `apps/clinic`, `apps/web`). Framework: Next.js.
   Vercel detects pnpm and the workspace; leave the build command as `next build`.
3. **Environment variables** (same database for all three projects):

| Variable | Value |
|---|---|
| `DATABASE_URL` | Demo database, **pooled** URL (Neon: the `-pooler` host) |
| `DIRECT_URL` | Demo database, direct URL |
| `DEMO_MODE` | `1` |
| `NEXT_PUBLIC_DEMO_MODE` | `1` |
| `BETTER_AUTH_SECRET` | a long random string (same in all three projects) |
| `BETTER_AUTH_URL` | this project's own URL, e.g. `https://predict-ops-demo.vercel.app` |
| `NEXT_PUBLIC_OPERATIONS_URL` | the Operations project's URL |
| `NEXT_PUBLIC_CLINIC_URL` | the Clinic project's URL |
| `NEXT_PUBLIC_PATIENT_URL` / `NEXT_PUBLIC_APP_URL` | the patient site's URL (or the clinic URL if you skip it) |
| `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_WABA_ID`, `WHATSAPP_APP_ID`, `META_PAGE_ACCESS_TOKEN` | `demo` (dummy — the guard answers) |
| `EMAIL_PROVIDER` / `RESEND_API_KEY` / `EMAIL_FROM` | `resend` / `demo` / `Predict Demo <demo@example.com>` |
| `CRON_SECRET` | a random string — **Operations project only** (protects the nightly reset) |

   **Never** put real keys (WhatsApp, Meta, AWS, Resend) or a production database URL in a demo project.

4. Deploy. Then seed once from your machine (`pnpm --filter @workspace/db demo:seed` with the demo database in
   `packages/db/.env`), or call the reset endpoint below.

### Nightly reset

`apps/automation/vercel.json` schedules `GET /api/demo/reset` at 21:30 UTC (03:00 IST). With `CRON_SECRET` set,
Vercel sends it as a bearer token; the route wipes the demo database and re-seeds it, shifted to the current date.
To reset by hand:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://<your-ops-demo>.vercel.app/api/demo/reset
```

## What is not in the demo

The background worker (BullMQ + Redis) and the WhatsApp webhook do not run on Vercel, so flows do not advance and
no inbound messages arrive. The seed already contains a realistic history of both, so every report and inbox has
data to show.
