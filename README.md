# Animal Rescue Dhaka

A modern web app that coordinates animal rescues across Dhaka. Anyone can report an animal in need without an account; staff triage the case, dispatch a volunteer rescuer, and the reporter follows every step with a private tracking code.

> Originally a university PHP/MySQL project, rebuilt as a secure, bilingual (English / বাংলা), production-ready application.

## Features

**Public**
- Report an animal in under two minutes (no account), with Dhaka area picker, condition triage, optional photo (shrunk on-device), optional GPS location and donation pledge
- Private tracking by code **+ phone number** with a live timeline, rescuer contact and estimated arrival
- English and Bangla UI, light and dark themes, fully responsive and keyboard accessible

**Staff console** (`/admin`)
- Dashboard with a triage queue (serious cases first) and recent activity
- Filterable, searchable, paginated request list
- Assign / re-assign rescuers with ETA, complete with outcome, cancel, reopen, add public timeline notes
- Live updates: new-request toasts, pending badge and auto-refreshing lists
- Overdue flags by severity, possible-duplicate warnings, rescuers sorted by area match and workload
- Manage rescuers, reporters and team members; analytics for the last 30 days; CSV export
- Printable reporter slip and rescuer receipt

**Engineering**
- Next.js (App Router) + TypeScript, Tailwind CSS 4, Drizzle ORM on SQLite/libSQL
- Server Actions with Zod validation, bcrypt-hashed staff passwords, signed HTTP-only session cookies
- Rate limiting and a honeypot on public forms, no secrets or stack traces exposed to users
- Explicit status workflow (`pending → assigned → completed`, plus cancel/reopen) with an append-only audit timeline
- Unit tests (Vitest) and GitHub Actions CI (typecheck, test, migrate, build)

## Quick start

```bash
npm install
cp .env.example .env.local      # then set SESSION_SECRET and admin credentials
npm run db:migrate              # create tables
npm run db:seed                 # first admin + demo data (SEED_DEMO=false to skip demo data)
npm run dev                     # http://localhost:3000
```

Sign in at `/login` with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from your env file.

### Scripts

| Command | Purpose |
|---|---|
| `npm run dev` / `build` / `start` | Develop, build, run in production |
| `npm run typecheck` / `npm test` | Static checks and unit tests |
| `npm run db:generate` | Generate a migration after editing `src/db/schema.ts` |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Create the admin (and demo data) |

## Deploying to production

The app runs anywhere Node 20+ runs. The simplest setup is **Vercel + Turso**:

1. Create a [Turso](https://turso.tech) database and copy its URL and auth token.
2. Set these environment variables in Vercel:
   - `DATABASE_URL` (`libsql://…`), `DATABASE_AUTH_TOKEN`
   - `SESSION_SECRET` (`openssl rand -base64 32`)
   - `NEXT_PUBLIC_SITE_URL` (your public URL)
3. Run migrations and create the admin once from your machine with the production variables set:
   ```bash
   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-strong-password' SEED_DEMO=false \
     npm run db:migrate && npm run db:seed
   ```
4. Deploy. For a VPS or Docker, use `npm run build && npm start` behind HTTPS.

### Production checklist
- [ ] Strong `SESSION_SECRET` and admin password (the seed refuses the default password in production)
- [ ] HTTPS enabled (cookies are `Secure` in production)
- [ ] The in-memory rate limiter is per instance; put a WAF or shared store in front for multi-region scale
- [ ] Back up the database regularly (Turso offers point-in-time recovery)

## Project structure

```
src/
  app/            routes: public pages, /admin console, server actions
  components/     shared UI (forms, badges, navigation)
  db/             Drizzle schema and client
  i18n/           English and Bangla dictionaries
  lib/            validation, workflow rules, sessions, queries, formatting
scripts/          migrate, seed, reset
drizzle/          generated SQL migrations
```

## What changed from the PHP version

| Before | Now |
|---|---|
| Anyone could delete users or requests via URL | Staff authentication; all mutations require a session |
| No CSRF protection, raw DB errors shown | Server Actions (origin-checked), generic user-facing errors |
| Default `root` DB user, public `setup.php` | Env-based config, migration scripts, no public setup |
| Rescuer assigned to "user's latest pending request" | Assignment targets a specific request with ETA and audit trail |
| Double-escaped input, racy sequential user codes | Validated input stored raw and escaped on render; random tracking codes |
| Substring check for "Dhaka" | Fixed list of Dhaka areas |
| English-only, desktop-first UI | Bilingual, responsive, accessible, dark mode |
