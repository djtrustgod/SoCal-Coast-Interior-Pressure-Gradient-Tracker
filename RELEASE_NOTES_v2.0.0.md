# Release Notes - v2.0.0

**Release Date:** February 14, 2026

## 🎉 Major Release: NOAA METAR API Migration & Pressure History

Version 2.0.0 is a complete overhaul of the data layer, migrating from Open-Meteo grid-based forecasts to real NOAA METAR airport observations, adding persistent 24-hour pressure history, and significantly improving chart accuracy and resilience.

---

### ✨ New Features

- **NOAA METAR API Integration** — Real airport observations replace Open-Meteo grid-based forecasts for accurate, station-level pressure data
- **24-Hour Persistent Pressure History** — Hourly MSLP readings for all 25 stations stored in `data/pressure-history.json` with automatic pruning
- **Custom Chart Tooltips** — Hover displays both station pressures and computed gradient with color coding (blue onshore, orange offshore)
- **Per-Series Data Warnings** — Each station line individually warns when it has fewer than 6 hourly data points
- **Background Station Seeding** — Dashboard fire-and-forget fetches all remaining stations to pre-build history
- **ICAO Code Support** — All 25 locations now have verified 4-letter ICAO station codes
- **SVG Favicon** — New green leaf design favicon
- **Zulu Clock** — UTC time display in footer for verifying against LAX gradient reports

### 🔧 Improvements

- METAR API fetches 24 hours of observations with `limit=500` for full chart data on first load
- True MSLP (Sea Level Pressure) used instead of altimeter setting, eliminating 0.3-1.3 mb systematic error at higher elevations
- Time series aligned by rounding timestamps to nearest hour instead of requiring exact index match
- Explicit Y-axis domain with 1 mb padding ensures both lines are always visible
- `connectNulls` on chart lines prevents gaps from breaking line rendering
- Individual station failures isolated with `Promise.allSettled` — partial results returned instead of blanket 500 errors
- Gradient color coding refined: weak gradients use muted colors, moderate use orange/medium blue, strong use red/bold blue
- Tailwind CSS content paths updated to include `lib/**` for proper utility class generation

### 🐛 Bug Fixes

- Fix pressure trend charts not showing home location line consistently
- Fix single station failure (e.g., Yuma/KYUM) causing all fetches to fail
- Fix gradient color coding so weak gradients don't use attention-grabbing colors
- Fix Tailwind JIT silently dropping dynamic color classes defined in `lib/` files
- Correct Van Nuys location code (VNR → VNY) and Long Beach code (LBB → LGB) with backward compatibility
- Replace Indio/Thermal (IPX) with Thermal (KTRM) for valid METAR station

### 📦 Technical Details

- **New modules:** `lib/api/metar.ts`, `lib/data/pressure-history.ts`
- **New types:** `PressureHistoryEntry`, `PressureHistoryFile`
- **Thread-safe writes:** Module-level mutex for concurrent history file access
- **Atomic file writes:** Write to `.tmp` then rename for data integrity
- **Docker:** Pressure history file included in image alongside `locations.json`

### 🗑️ Removed

- Open-Meteo API dependency (replaced by NOAA METAR)
- Playwright E2E test files and runner prompt
- `@playwright/test` devDependency

---

**Full Changelog:** See [CHANGELOG.md](CHANGELOG.md) for complete details.
