# Copilot Instructions — SoCal Pressure Gradient Tracker

## Stack & Purpose

Next.js 16 (App Router, Turbopack) · TypeScript strict · Tailwind CSS + shadcn/ui · NOAA METAR API · JSON file storage

Tracks MSLP differences between coastal and interior SoCal locations → offshore vs. onshore wind patterns.

## Commands

```bash
npm run dev       # Dev server :3000
npm run build     # Production build (run before committing)
npm run lint      # ESLint
npx tsc --noEmit  # Type check
```

## Code Conventions

| Area | Rules |
|------|-------|
| TypeScript | Strict, no `any`, `@/` alias, interfaces for objects, union types over enums |
| Components | Functional only, server by default, `"use client"` only for hooks/browser APIs |
| Naming | Components → PascalCase, utils/types → camelCase, API routes → `route.ts` in named dirs |
| Styling | Tailwind utilities, shadcn/ui, `dark:` variants, semantic colors |
| API routes | Zod validation, `{ success, data }` / `{ error }` responses, try/catch |
| State | React state + server components only — no global state library |

## Architecture

- Server components fetch data; client components handle interactivity
- API routes (`app/api/`) handle CRUD + external calls
- JSON file persistence via `fs` (server-side only)
- `lib/data/locations.ts` determines runtime data file

## Key Pitfalls

- **Next.js 16**: `export const dynamic = 'force-dynamic'` for fresh data. Server components async OK, client not. `revalidatePath()` after mutations.
- **NOAA API**: No key needed, User-Agent required. Pressure in Pascals (÷100 → mb). Validate 950–1050 mb. Use `Promise.allSettled` — one station failure must not break the batch.
- **Data**: Local timezone via `toLocaleString()`. Most recent METAR used (hourly). 24h history via `start` param.

## Domain: Pressure Gradients

`gradient = home.pressure - compare.pressure`

**Positive → Onshore (marine layer) · Negative → Offshore (Santa Ana winds)**

Thresholds in `lib/calculations/gradient.ts` — DO NOT change without meteorological reference:

| mb | Meaning |
|----|---------|
| > +5 | Strong Onshore |
| +2 to +5 | Moderate Onshore |
| +0.5 to +2 | Weak Onshore |
| ±0.5 | Neutral |
| −0.5 to −2 | Weak Offshore |
| −2 to −5 | Moderate Offshore |
| < −5 | Strong Offshore |

## Constraints

- Max 25 locations, max 3 on dashboard
- Types: `"coast"` | `"interior"`
- Home location cannot be deleted while set; dashboard locations auto-removed on delete
- Refresh: 60–3600s (default 300), auto-refresh 5 min in browser
- No auth, no API keys, Zod validates all inputs

## Documentation Policy

After significant changes, update **all three** together:
1. **README.md** — User-facing (features, usage, API, structure)
2. **IMPLEMENTATION.md** — Technical (architecture, data layer, dependencies)
3. **CHANGELOG.md** — `[Unreleased]` section, Keep a Changelog format

Skip for: minor refactors, comment edits, variable renames, trivial CSS.

## Release Process

See `.github/prompts/release-automation.prompt.md` for detailed steps. Summary:

1. Read version from `package.json`
2. Create `RELEASE_NOTES_vX.Y.Z.md` from CHANGELOG `[Unreleased]`
3. Move `[Unreleased]` → dated version section in CHANGELOG.md
4. Update `package.json` version + `components/footer.tsx` version/build date
5. Commit + push → `gh workflow run release.yml`
6. Redeploy Docker per `.github/copilot-docker-redeploy.md`
