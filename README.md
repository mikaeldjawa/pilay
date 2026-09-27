# Peter's Guide & Safeguard

Counselor Management & Student Support Platform for SPK Saint Peter's School Jakarta.
See `docs/` for the full product requirements, entity relationship spec, and
tech stack decisions this build follows.

## Stack

Next.js (App Router) · TypeScript · Tailwind + shadcn/ui (Nova style) · Prisma 7
(Postgres, `@prisma/adapter-pg`) · Auth.js (Credentials) · Playwright (PDF
generation) · TanStack Query/Table · Recharts.

## Local setup

```bash
npm install
cp .env.example .env   # fill in SEED_COUNSELOR_PASSWORD at minimum
npm run db:up           # starts Postgres via docker-compose (port 5433)
npm run prisma:migrate  # applies migrations
npm run prisma:seed     # seeds roles, demo students, lookup data, report templates
npx playwright install chromium
npm run dev              # http://localhost:3010
```

Sign in with `SEED_COUNSELOR_EMAIL` / `SEED_COUNSELOR_PASSWORD` from `.env`.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Dev server on port 3010 |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run prisma:generate` | Regenerate the Prisma client after a schema change |
| `npm run prisma:migrate` | Create + apply a migration |
| `npm run prisma:seed` | Re-run `prisma/seed.ts` |
| `npm run db:up` / `db:down` | Start/stop the local Postgres container |
| `npm run db:backup` | Dump the local database to `./backups/` |
| `npm run playwright:install` | Install the Chromium build used for report PDFs |

## Architecture notes

- **Domain modules** live in `src/modules/<domain>/` (service, repository,
  schema, actions) and are consumed by `src/app/(dashboard)/*` pages/routes.
  Reusable UI lives in `src/components/`.
- **Local file storage** (`src/modules/documents/storage.service.ts`) is the
  seam for swapping to S3/R2 later — only that file changes.
- **Reports** are rendered to plain HTML strings (`src/modules/reports/renderers/`)
  and converted to PDF via Playwright (`pdf.service.ts`), synchronously — no
  queue/worker. Every generated report is snapshotted
  (`report_data_snapshots`) so historical PDFs stay reproducible even if the
  underlying case data changes later.
- **Chronic Minor rule**: 3+ occurrences of the same behavior code by the same
  student within 14 days, computed at read time (`src/lib/constants.ts`,
  `src/modules/behavior/behavior.service.ts`).

## Backup & recovery

`npm run db:backup` dumps the local dev database via `pg_dump` inside the
docker-compose Postgres container. Production backup strategy (frequency,
retention, encryption, restore testing) is deferred until a hosting provider
is chosen — `DATABASE_URL` and the storage seam above are both already
structured to swap to a hosted Postgres + S3-compatible store without code
changes.
