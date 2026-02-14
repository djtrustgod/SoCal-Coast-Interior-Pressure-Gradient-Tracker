# Changelog

All notable changes to this project will be documented in this file. Forgive the wordiness here, as this file is often edited by a verbose but helpful Agent.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Optimize `.github/copilot-instructions.md` from ~450 lines to ~112 lines — remove duplication, consolidate repeated sections (API endpoints, gradient thresholds, location limits, branch awareness), eliminate verbose documentation examples, and flatten structure for faster agent parsing

## [2.0.0] - 2026-02-14

### Added

- NOAA Weather API (METAR) integration replacing Open-Meteo grid-based forecasts for real airport observations
- ICAO code field (`icaoCode`) added to Location type and all 25 location entries
- New METAR API client at `lib/api/metar.ts` with Pascals-to-millibars conversion and pressure validation (950-1050 mb)
- NOAA METAR API `start` parameter: every fetch now requests observations from the past 24 hours with `limit=500`, guaranteeing full chart data on first load
- `FetchMSLPOptions` interface in `lib/api/metar.ts` for passing optional `start` time to fetch functions
- 24-hour persistent pressure history storage (`data/pressure-history.json`) that accumulates hourly MSLP readings for all 25 stations
- New `lib/data/pressure-history.ts` module with read, write, merge, prune, and enrich functions
- `PressureHistoryEntry` and `PressureHistoryFile` type definitions in `types/location.ts`
- Background station seeding: dashboard fire-and-forget fetches all remaining stations to pre-build history
- Module-level mutex for thread-safe concurrent writes to the history file
- Atomic file writes (write to `.tmp` then rename) for pressure history persistence
- Custom chart tooltip that displays both station pressures and the computed gradient (home − compare) on hover, with color coding
- Per-series limited data warnings on pressure trend charts — each station line individually warns when it has fewer than 6 hourly data points
- Thermal (KTRM) station replacing Indio/Thermal (IPX) which had no valid METAR station
- SVG favicon with green leaf design
- 🍃 leaf emoji added to application title in header
- Favicon metadata in app layout
- Backward compatibility ID migration in PATCH endpoint (vnr→vny, lbb→lgb)
- Pressure history file copied into Docker image alongside `locations.json`

### Changed

- Data source migrated from Open-Meteo API to NOAA Weather API (METAR observations)
- Pressure unit display changed from "hPa" to "mb" (millibars) throughout the UI
- All 25 locations are now verified METAR reporting airports with 4-letter ICAO codes
- METAR API `limit` increased from 25 to 48 observations for better 24-hour coverage and gap recovery
- Dashboard server component (`app/page.tsx`) now persists fresh readings and enriches time series with full 24-hour history
- Pressure API route (`app/api/pressure/route.ts`) now merges readings into persistent history store
- `PressureTrendChart` warning threshold lowered from 12 to 6 data points with "building history" message
- Pressure trend charts now handle variable-length time series from METAR data
- E2E testing approach updated: test runner prompt removed, test plan retained as reference only

### Fixed

- Fix gradient color coding so only significant gradients are visually highlighted (weak = muted, moderate = orange/blue, strong = red/bold blue)
- Add `./lib/**` to Tailwind CSS content paths so utility classes in `lib/` files are properly generated
- Ensure displayed pressures are true MSLP (Sea Level Pressure) instead of altimeter setting, eliminating 0.3-1.3 mb systematic error
- Fix pressure trend charts not showing home location line consistently across dashboard cards
- Align home and compare time series by rounding METAR timestamps to nearest hour
- Compute explicit Y-axis domain from both data series with 1 mb padding
- Add `connectNulls` to chart lines so occasional hourly gaps don't break line rendering
- Fix single METAR station failure causing all pressure data fetches to fail — now uses `Promise.allSettled` for isolation
- Pressure API returns partial results with per-station error details instead of blanket 500 error
- Van Nuys location code corrected from VNR to VNY (KVNY) with proper ICAO code
- Long Beach location code corrected from LBB to LGB (KLGB) with updated coordinates

### Removed

- Open-Meteo API dependency (replaced by NOAA METAR)
- Indio/Thermal (IPX) station — replaced by Thermal (KTRM)
- `e2e/` directory and all generated Playwright spec files
- `@playwright/test` devDependency
- `.github/prompts/test-playwright-e2e.prompt.md` (test runner prompt)

## [1.5.4] - 2026-01-19

### Fixed

- Fixed stale data issue after system hibernation - dashboard now forces dynamic rendering to ensure fresh data on every refresh

## [1.5.3] - 2026-01-08

### Fixed

- Fixed "Invalid location data" error when adding new locations - ID field is now auto-generated from the location code (lowercase)
- Location IDs are now automatically created from the code field (e.g., "SLC" becomes "slc") to ensure valid data submission

## [1.5.2] - 2026-01-05

### Fixed

- Add Location button in Settings now properly opens a dialog to create new locations
- EditLocationDialog now supports both "add" and "edit" modes with appropriate titles

### Changed

- Dockerfile improved with better layer caching and libc6-compat for Alpine Linux
- Docker image now includes embedded health checks for better monitoring
- Docker Compose configuration enhanced with resource limits and logging rotation
- `.dockerignore` expanded to exclude more unnecessary files for faster builds
- IMPLEMENTATION.md updated with Docker deployment section and version 1.5.1

### Improved

- Multi-stage Docker build optimized for faster builds with better caching
- Production Docker image size reduced to ~235MB
- Security hardened with non-root user (nextjs:nodejs) and proper file permissions
- Data directory initialization improved to work with and without volume mounts
- Environment variables expanded (HOSTNAME, TZ for timezone support)

## [1.5.1] - 2026-01-01

### Added

- Docker support for containerized deployment
- Multi-stage Dockerfile for optimized production builds
- Docker Compose configuration with health checks and automatic restarts
- Volume mounting for persistent data storage
- `.dockerignore` file for efficient Docker builds

### Changed

- Next.js config updated with `output: 'standalone'` for Docker optimization
- README.md expanded with comprehensive Docker deployment instructions

## [1.5.0] - 2025-12-26

### Added

- 24-hour pressure trend graphs for each comparison location on dashboard
- Interactive line charts using Recharts library with responsive design
- Light and dark mode theme support for charts
- Time series data collection from Open-Meteo API (24 hourly data points)
- Dual-line chart option showing both home and comparison location pressure trends
- Timezone-aware X-axis labels (12-hour format with AM/PM)
- Chart tooltips with formatted pressure values and timestamps
- New `PressureTrendChart` component with theme-aware styling

### Changed

- Open-Meteo API client now returns full 24-hour time series data instead of only current hour
- `PressureReading` interface updated to include optional `timeSeries` object
- `PressureGradient` interface updated to include optional `homeTimeSeries` and `compareTimeSeries` objects
- Gradient calculation functions now pass through time series data
- Dashboard cards expanded to display trend charts below pressure data
- Chart container now uses explicit height values to prevent Recharts dimension warnings

### Dependencies

- Added Recharts (^3.6.0) for charting functionality

## [1.1.0] - 2025-12-13

### Fixed

- **Critical bug**: Static imports of `locations.json` cached data at build time, preventing runtime location updates from appearing without rebuild
- Dashboard and pressure API now read location data from file system at runtime using `fs.readFile()`

### Added

- Shared file system utility module `lib/data/locations.ts` with `readLocationsFile()` and `writeLocationsFile()` functions
- `LocationSettings` return type annotation for type safety across location data readers

### Changed

- `app/page.tsx` now reads locations at runtime instead of using static import
- `app/api/pressure/route.ts` now reads locations at runtime instead of using static import
- `app/api/locations/route.ts` refactored to use shared file system utilities
- Location changes now immediately reflected in dashboard without requiring rebuild

## [1.0.2] - 2025-12-07

### Added

- Footer component with version number, build date, and CC0-1.0 license information

### Fixed

- **Critical bug**: Corrected gradient interpretation logic - positive gradients (coast pressure > inland) now correctly show "Onshore Flow" instead of "Offshore Flow", and negative gradients (inland pressure > coast) now correctly show "Offshore Flow" instead of "Onshore Flow"

## [1.0.1] - 2025-12-07

### Added

- Comprehensive `.gitignore` file with Next.js, TypeScript, Node.js, IDE, and OS-specific entries
- CHANGELOG.md for tracking project changes
- API refresh interval setting UI (1, 5, 10, 15, 30, 60 minutes) for user preference tracking
- Auto-refresh dashboard feature - automatically refreshes every 5 minutes using `useEffect` and `setInterval`
- Select dropdown in Settings to configure and store API refresh interval preference
- `LocationSettings` TypeScript interface to include `apiRefreshInterval` field
- API validation for refresh interval (minimum 60 seconds, maximum 3600 seconds)
- User notification when API refresh interval preference is updated

### Fixed

- Next.js build error with `/api/pressure` route by adding `export const dynamic = 'force-dynamic'` to handle dynamic server rendering

### Changed

- Updated Copilot instructions workflow to include version number update guidance for significant changes
- Updated Copilot instructions to include CHANGELOG.md in documentation update workflow
- API refresh interval fixed at 300 seconds (5 minutes) for Next.js build compatibility
- `/api/locations` GET endpoint now returns `apiRefreshInterval` preference setting
- `/api/locations` PATCH endpoint now accepts and validates `apiRefreshInterval` preference
- Dashboard auto-refreshes to keep data current even when browser tab is open for extended periods

### Technical Notes

- API refresh interval is stored as user preference but currently fixed at 5 minutes due to Next.js static export limitations
- Future enhancement: Implement runtime-configurable caching when using dynamic hosting

## [1.0.0] - 2025-12-07

### Added

- Initial release of SoCal Coast-Interior Pressure Gradient Tracker
- Real-time pressure gradient calculation between coastal and interior locations
- Interactive dashboard with location selection
- Multiple Southern California locations (Santa Barbara, Oxnard, Camarillo, Palmdale, Lancaster)
- Location management system (add, edit, delete locations)
- Home location configuration
- Debug mode for viewing raw API data
- Dark/light theme toggle
- Responsive UI with Tailwind CSS and shadcn/ui components
- Integration with Open-Meteo API for weather data
- RESTful API endpoints (`/api/locations`, `/api/pressure`)
- TypeScript implementation with Next.js 16 App Router
- Automatic data caching (1-hour revalidation)

### Technical Stack

- Next.js 16.0.7 with Turbopack
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Zod for validation
- Open-Meteo Weather API

---

## Changelog Guidelines

### Types of Changes

- **Added** - New features
- **Changed** - Changes in existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Vulnerability fixes

### Version Format

- **Major** (X.0.0) - Breaking changes
- **Minor** (0.X.0) - New features, backward compatible
- **Patch** (0.0.X) - Bug fixes, backward compatible
