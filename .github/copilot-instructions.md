# GitHub Copilot Instructions for SoCal Pressure Gradient Tracker

## Project Overview

Next.js 16 app tracking Mean Sea Level Pressure (MSLP) differences between coastal and interior Southern California locations to indicate offshore vs. onshore wind patterns.

**Stack**: Next.js 16 (App Router, Turbopack) · TypeScript (strict) · Tailwind CSS + shadcn/ui · NOAA METAR API · JSON file storage (`data/locations2.json` on branch `2.0`)

## Commands

```bash
npm run dev          # Dev server on localhost:3000
npm run build        # Production build (run before committing)
npm run start        # Start production server
npm run lint         # ESLint
npx tsc --noEmit     # Type check
```

## Code Conventions

- **TypeScript**: Strict mode, no `any`, use `@/` path alias, interfaces for objects, union types over enums
- **Components**: Functional only, server components by default, `"use client"` only when hooks/browser APIs/client state needed
- **Naming**: Components=PascalCase, utilities/types=camelCase, API routes=`route.ts` in named dirs
- **Styling**: Tailwind utilities, shadcn/ui components, `dark:` variants, semantic colors (`text-muted-foreground`, `bg-background`)
- **API routes**: Zod validation, `{ success: true, data }` / `{ error: "message" }` responses, try/catch with proper status codes
- **State**: No global state library — React state + server components. Client state only for UI interactions.

## Architecture

- Server components fetch data directly; client components handle interactivity
- API routes in `app/api/` handle CRUD and external API calls
- JSON file persistence via `fs` (server-side only, never in client components)
- `lib/data/locations.ts` determines which data file the app reads at runtime

## Key Pitfalls

**Next.js 16**: Use `export const dynamic = 'force-dynamic'` on pages/routes needing fresh data. Server components can be async, client cannot. Use `revalidatePath()` after mutations.

**NOAA API**: No API key needed but User-Agent header required. Pressure arrives in Pascals (÷100 for mb). Validate range 950–1050 mb. Handle failures gracefully — use `Promise.allSettled` so one station failure doesn't break the batch.

**Data**: Timestamps in user's local timezone via `toLocaleString()`. Most recent METAR observation used (hourly updates). 24-hour history window via `start` parameter on NOAA fetch.

## Branch Awareness

**CRITICAL**: Docker/production deploys from `main`. Never assume current branch code runs in Docker.

| Branch | Data File | API Source | Schema |
|--------|-----------|------------|--------|
| `main` | `data/locations.json` | Open-Meteo | No `icaoCode` field |
| `2.0`  | `data/locations2.json` | NOAA METAR | Includes `icaoCode` field |

- Use `git show main:<filepath>` or `git diff main -- <filepath>` to check main's state
- Use `git log --oneline main..HEAD` to see divergence
- Schema mismatches between branches are *expected*, not bugs
- The file referenced in `lib/data/locations.ts` determines runtime behavior

## Domain Rules

### Pressure Gradients

```
gradient = home.pressure - compare.pressure
```

- **Positive** → Onshore flow (marine layer) | **Negative** → Offshore flow (Santa Ana winds)

**Thresholds** (defined in `lib/calculations/gradient.ts` — DO NOT change without meteorological reference):

| Range | Interpretation |
|-------|---------------|
| > +5 mb | Strong Onshore |
| +2 to +5 | Moderate Onshore |
| +0.5 to +2 | Weak Onshore |
| −0.5 to +0.5 | Neutral |
| −2 to −0.5 | Weak Offshore |
| −5 to −2 | Moderate Offshore |
| < −5 mb | Strong Offshore |

### Constraints

- Max 25 locations, max 3 dashboard locations
- Location types: `"coast"` or `"interior"`
- Home location cannot be deleted while set as home
- Dashboard locations auto-removed on deletion
- API refresh: 60–3600 seconds (default 300), auto-refresh every 5 min in browser
- No authentication, no API keys, Zod validates all inputs

## Documentation Update Policy

After implementing features, fixing bugs, or making significant changes, update these files:

1. **README.md** — User-facing: features (with emoji), usage, API endpoints, project structure, config
2. **IMPLEMENTATION.md** — Technical: features, data layer, file structure, dependencies, known issues, metrics
3. **CHANGELOG.md** — Add to `[Unreleased]` section using Keep a Changelog format (Added/Changed/Fixed/etc., present tense)

**Skip docs for**: minor refactoring, comment changes, variable renames, trivial CSS tweaks.

**Workflow**: Implement → Test → Update all 3 docs → Commit together.

## Release Process

When user requests a release:

1. Ask for version number
2. Create `RELEASE_NOTES_vX.Y.Z.md` from CHANGELOG
3. Move `[Unreleased]` to dated version section in CHANGELOG.md
4. Update `package.json` version, `components/footer.tsx` version + build date
5. Commit, then `gh workflow run release.yml`
6. Redeploy Docker per `.github/copilot-docker-redeploy.md`

See `.github/prompts/release-automation.prompt.md` for full details.
