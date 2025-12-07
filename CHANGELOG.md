# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive `.gitignore` file with Next.js, TypeScript, Node.js, IDE, and OS-specific entries
- CHANGELOG.md for tracking project changes

### Fixed
- Next.js build error with `/api/pressure` route by adding `export const dynamic = 'force-dynamic'` to handle dynamic server rendering

### Changed
- Updated Copilot instructions workflow to include version number update guidance for significant changes

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
