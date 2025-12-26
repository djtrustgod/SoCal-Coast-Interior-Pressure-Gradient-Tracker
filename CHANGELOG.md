# Changelog

All notable changes to this project will be documented in this file. Forgive the wordiness here, as this file is often edited by a verbose but helpful Agent.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
