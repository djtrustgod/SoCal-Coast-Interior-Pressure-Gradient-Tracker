# Plan: 24-Hour Persistent Pressure METAR History

The app currently fetches pressure data from NOAA on every page load with `limit=25`, which covers only ~12-25 hours depending on station activity, and discards everything on restart. This plan adds a JSON-file-based persistent store that accumulates hourly MSLP readings for all 25 locations, merges fresh NOAA data on each dashboard load, prunes entries older than 24 hours, and feeds the full history into the existing `PressureTrendChart`. The Docker volume at `/app/data` already covers file persistence across container restarts.

## Steps

1. **Define new types** in `types/location.ts`: Add a `PressureHistoryEntry` interface (`{ timestamp: string; pressure: number; temperature?: number }`) and a `PressureHistoryFile` interface (`{ [locationId: string]: PressureHistoryEntry[] }`). These are simple — each location key maps to a sorted array of hourly readings.

2. **Create `lib/data/pressure-history.ts`** — New module with four functions:
   - `readPressureHistory(): Promise<PressureHistoryFile>` — Reads `data/pressure-history.json`, returns empty object if file doesn't exist
   - `writePressureHistory(data: PressureHistoryFile): Promise<void>` — Atomically writes file (write to `.tmp` then rename, matching the pattern in `locations.ts`)
   - `mergeReadings(history: PressureHistoryFile, readings: PressureReading[]): PressureHistoryFile` — For each reading, extracts its `timeSeries` entries plus the current reading, deduplicates by rounding timestamps to the nearest hour, appends new entries, and sorts chronologically
   - `pruneOlderThan24Hours(history: PressureHistoryFile): PressureHistoryFile` — Removes entries with timestamps > 24 hours old from each location array

3. **Increase METAR API limit** in `lib/api/metar.ts` (line 69): Change `limit=25` to `limit=48` in the NOAA request URL. This requests up to ~48 hours of observations, giving a better seed for the history store on first run and filling gaps after downtime. The extra data costs nothing — NOAA serves it freely.

4. **Integrate storage into the pressure fetch pipeline** in `app/page.tsx` (the server component): After calling `fetchMSLPForLocationsSettled()`, call `mergeReadings()` to fold the fresh NOAA data into the persistent history, then `pruneOlderThan24Hours()` to trim, then `writePressureHistory()` to persist. Replace the `timeSeries` in each `PressureReading` with the full 24-hour history from the store before passing to `calculateMultipleGradients()`. This keeps the on-demand + merge model — no background jobs needed.

5. **Also integrate into the pressure API route** at `app/api/pressure/route.ts`: Apply the same merge-prune-write cycle so that API consumers (like the debug section on the locations page) also contribute to and benefit from the persistent store.

6. **Seed all 25 locations on each fetch cycle**: When the dashboard loads, it currently only fetches home + dashboard locations (up to 4). To build history for all 25, add a **background fetch** that fires after the dashboard response: call `fetchMSLPForLocationsSettled()` for the remaining locations not already fetched, merge their data into the history file, but don't block the page render on this. This can be done via a fire-and-forget `Promise` in the server component or a new API route `/api/pressure/collect` called client-side after mount.

7. **Update `PressureTrendChart`** in `components/pressure-trend-chart.tsx`: The chart already handles variable-length time series. Adjustments needed:
   - Remove the `< 12 data points` warning threshold or lower it, since the store should consistently have 24 points
   - Optionally add hour gridlines/labels for all 24 hours instead of auto-ticking
   - The `roundToHour()` deduplication logic already handles merging — no structural change needed

8. **Handle concurrent writes safely**: Since Next.js can handle multiple requests concurrently, wrap the read-merge-prune-write cycle in a simple file-lock mechanism (e.g., a module-level `Promise` chain or `lockfile` package). For this scale (low traffic, single server), a module-level mutex is sufficient.

9. **Create empty seed file** `data/pressure-history.json` with content `{}` so the app starts cleanly. Update the `Dockerfile` to copy this file alongside `locations.json` into the data directory. The existing Docker volume mount at `/app/data` in `docker-compose.yml` will automatically persist it.

10. **Update documentation**: Add persistent storage description to `README.md`, `IMPLEMENTATION.md`, and add changelog entry to `CHANGELOG.md` per the project's documentation policy.

## Verification

- Start dev server, load dashboard, check that `data/pressure-history.json` is created and populated with entries for all 25 locations
- Wait one refresh cycle (or manually refresh), verify new readings are appended and duplicates are not created
- Restart the dev server, reload dashboard — verify history persists and chart shows continuous 24-hour data
- Run `npm run build` to confirm no TypeScript errors
- Inspect chart to confirm it renders 24 data points with proper time axis labeling
- Verify Docker build: `docker-compose build && docker-compose up -d`, check that pressure history survives `docker-compose down && docker-compose up -d`

## Decisions

- **JSON file over SQLite**: Consistent with existing `locations2.json` pattern, no new dependencies, sufficient for single-server low-concurrency use
- **On-demand merge over cron**: Simpler architecture — no background process management, data freshness tied to actual page views
- **All 25 locations**: Background-fetched after dashboard render so it doesn't slow down the page, ensures history is available if the user changes dashboard selections
- **`limit=48` over `limit=25`**: Better gap recovery after downtime, negligible performance cost
- **Module-level mutex over `lockfile` package**: Avoids adding a dependency for what is a single-process write scenario
