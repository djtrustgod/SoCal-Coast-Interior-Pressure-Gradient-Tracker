# Plan: Add `start` Parameter for 24-Hour METAR History Seeding

**TL;DR:** Add a `start` query parameter (set to 24 hours ago) to the NOAA METAR API calls so that even high-frequency stations like KVGT get full 24-hour history on first run. The existing merge/prune/enrich pipeline in `pressure-history.ts` already handles variable-length time series and de-duplicates by hour, so no storage changes are needed. The change is confined to the METAR client function signatures and URL construction, plus updating the three call sites.

**Steps**

1. **Add options parameter to `fetchMSLPForLocation`** in `lib/api/metar.ts` (L59): Change the signature from `(location: Location)` to `(location: Location, options?: { start?: string })`. At L63, modify the URL construction to append `&start=${options.start}` when provided. Also increase `limit` to `500` (API max) when `start` is provided, to ensure all observations within the window are returned. Keep `limit=48` as the default when no `start` is given (normal refresh).

2. **Propagate options through batch functions** in `lib/api/metar.ts`: Update `fetchMSLPForLocations` at L205 and `fetchMSLPForLocationsSettled` at L218 to accept and forward the same optional `{ start?: string }` parameter to each `fetchMSLPForLocation` call.

3. **Compute `start` in the dashboard** at `app/page.tsx` (L43): Before calling `fetchMSLPForLocationsSettled`, compute `start` as `new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()`. Pass `{ start }` to both the main fetch at L43 and the background fetch at L62. This ensures every station gets a full 24-hour window on every load — no special "first run" detection needed since the merge logic de-duplicates anyway.

4. **Pass `start` from the pressure API route** at `app/api/pressure/route.ts` (L39): Compute the same 24-hour-ago ISO string and pass `{ start }` to `fetchMSLPForLocationsSettled`. This ensures the `/api/pressure` endpoint also seeds full history when called.

5. **No changes needed** to `types/location.ts`, `lib/data/pressure-history.ts`, or `components/pressure-trend-chart.tsx`. The existing `mergeReadings` function already rounds timestamps to the nearest hour and de-duplicates, and `pruneOlderThan24Hours` already trims stale entries. More data in = more hourly entries merged = fuller chart.

6. **Update documentation** — Add entries to README.md (feature note), IMPLEMENTATION.md (technical detail), and CHANGELOG.md (`[Unreleased]` section) describing the `start` parameter addition and its effect on first-run seeding.

**Verification**
- Run `npx tsc --noEmit` to verify no type errors
- Run `npx next build` to verify production build
- Delete `data/pressure-history.json` (or replace with `{}`), restart the dev server, load the dashboard, then inspect the file — all stations should have ~24 hourly entries immediately
- Specifically check KVGT (Las Vegas) has more than 1-4 data points in the chart

**Decisions**
- **Always pass `start` vs. only on first run**: Always pass it. The merge logic de-duplicates, so there's no penalty, and it avoids needing first-run detection code.
- **`limit` when `start` is set**: Use `500` (API max) to guarantee all observations in the window are captured, even for 5-minute reporters. Use `48` when `start` is absent (backward-compatible normal refresh).
- **No new types needed**: The existing `options?` bag pattern keeps the API clean without a separate interface.
