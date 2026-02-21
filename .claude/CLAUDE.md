# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SoCal Coast-Interior Pressure Gradient Tracker — a Next.js app that tracks Mean Sea Level Pressure (MSLP) differences between coastal and interior Southern California locations to visualize offshore vs. onshore wind patterns using NOAA METAR airport observations.

## Commands

```bash
npm run dev       # Dev server on localhost:3000 (Turbopack)
npm run build     # Production build (standalone output for Docker)
npm run start     # Production server
npm run lint      # ESLint
npx tsc --noEmit  # Type check (run before committing)
```

No test framework is configured. There are no unit or integration tests.

## Architecture

### Tech Stack
Next.js 16 (App Router, Turbopack) · TypeScript strict · Tailwind CSS + shadcn/ui · Recharts · NOAA METAR API (no API key) · JSON file-based persistence

### Server/Client Split
- **Server components** fetch data and render the dashboard (`app/page.tsx` is `force-dynamic`)
- **Client components** (`"use client"`) handle interactivity: refresh logic, theme toggle, location management, charts
- **API routes** (`app/api/`) handle CRUD operations and external NOAA calls

### Data Flow
1. `app/page.tsx` reads `data/locations.json` for station config (home + 3 dashboard locations)
2. Fetches 24-hour METAR observations via `lib/api/metar.ts` (Pascals ÷ 100 → millibars)
3. Persists readings to `data/pressure-history.json` via `lib/data/pressure-history.ts` (atomic writes with module-level mutex)
4. Calculates pressure gradients in `lib/calculations/gradient.ts` (home − compare)
5. Renders gradient cards with 24-hour trend charts

### Key Modules
- **`lib/api/metar.ts`** — NOAA METAR client. Converts Pa→mb, validates 950–1050 range, builds time series. User-Agent header required.
- **`lib/calculations/gradient.ts`** — Gradient math and interpretation thresholds. DO NOT change thresholds without meteorological reference.
- **`lib/data/pressure-history.ts`** — 24-hour history persistence with merge/prune/enrich. Atomic `.tmp` → rename writes. Module-level mutex prevents concurrent write races.
- **`lib/data/locations.ts`** — File I/O for locations.json. Determines runtime data file (critical for branch differences).
- **`types/location.ts`** — All TypeScript interfaces (Location, PressureReading, PressureGradient, LocationSettings, PressureHistoryEntry)

### Data Files (in `data/`)
- **`locations.json`** — 25 verified METAR stations, homeLocationId, dashboardLocationIds (max 3), apiRefreshInterval
- **`pressure-history.json`** — Accumulated hourly readings per station, pruned to 24 hours

### API Endpoints
- `GET /api/pressure?ids=sna,sba,dag` — Fetch MSLP for multiple stations (resilient: `Promise.allSettled`)
- `GET /api/locations` — All locations + settings
- `POST /api/locations` — Add location (max 25, Zod validated)
- `PATCH /api/locations` — Update settings (home, dashboard, refresh interval)
- `PUT /api/locations` — Update location details
- `DELETE /api/locations?id=xxx` — Delete location (prevents home deletion)

All API responses use `{ success, data }` / `{ error }` shape.

## Branch Awareness

**CRITICAL**: Two branches with different data sources and schemas.

| Branch | Data File | API Source | Schema Difference |
|--------|-----------|------------|-------------------|
| `main` | `data/locations.json` | Open-Meteo | No `icaoCode` field |
| `2.0` | `data/locations2.json` | NOAA METAR | Has `icaoCode` field |

Schema mismatches between branches are expected. Use `git show main:<path>` to inspect main branch files. `lib/data/locations.ts` determines which data file is used at runtime.

## Domain: Pressure Gradients

```
gradient = home.pressure - compare.pressure
Positive → Onshore flow (marine layer, higher pressure at coast)
Negative → Offshore flow (Santa Ana winds, higher pressure inland)
```

Thresholds: `> ±5 mb` = Strong, `±2–5 mb` = Moderate, `±0.5–2 mb` = Weak, `±0.5 mb` = Neutral

## Code Conventions

- **TypeScript**: Strict mode, no `any`, `@/` path alias, interfaces for objects, union types over enums
- **Components**: Functional only, server by default, `"use client"` only when hooks/browser APIs needed
- **Naming**: PascalCase components, camelCase utils/types, `route.ts` in named directories
- **Styling**: Tailwind utilities + `dark:` variants, shadcn/ui components, HSL CSS variables
- **API routes**: Zod validation on all inputs, try/catch, `force-dynamic` for fresh data
- **State**: React hooks + server components only — no global state library
- **Resilience**: `Promise.allSettled` for multi-station fetches — one failure must not break the batch

## Constraints

- Max 25 locations total, max 3 on dashboard
- Location types: `"coast"` | `"interior"`
- Home location cannot be deleted while set as home
- API refresh interval: 60–3600 seconds (default 300)
- NOAA API requires no key but needs User-Agent header

## Documentation Policy

After significant changes, update **all three** together:
1. **README.md** — User-facing
2. **IMPLEMENTATION.md** — Technical architecture
3. **CHANGELOG.md** — `[Unreleased]` section, Keep a Changelog format

## Release Process

See `.github/prompts/release-automation.prompt.md`. Summary: bump `package.json` version + `components/footer.tsx` version/date, create release notes from CHANGELOG, commit, push, `gh workflow run release.yml`, redeploy Docker per `.github/copilot-docker-redeploy.md`.

## Docker Deployment

```bash
docker-compose down && docker-compose build --no-cache && docker-compose up -d
docker ps                                    # Should show "healthy"
docker logs --tail 20 socal-pressure-tracker # Should show "Ready in Xms"
```

Data in `./data` persists across redeploys via volume mount.
