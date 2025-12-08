# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
