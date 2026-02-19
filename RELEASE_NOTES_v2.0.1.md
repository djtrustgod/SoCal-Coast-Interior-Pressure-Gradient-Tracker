# Release Notes - v2.0.1

**Release Date:** February 18, 2026

## 🐛 Bug Fixes

- **Auto-Retry on METAR API Failure** — Replace static full-screen error when NOAA METAR API is unavailable with an auto-retry component that counts down and retries automatically (15s initial, exponential backoff up to 2min), with a manual "Retry Now" button

## 🔧 Improvements

- **Optimized Copilot Instructions** — Compress `.github/copilot-instructions.md` from ~450 lines to ~112 lines — remove duplication, consolidate repeated sections (API endpoints, gradient thresholds, location limits, branch awareness), eliminate verbose documentation examples, and flatten structure for faster agent parsing

## 📦 What's Included

- SoCal Pressure Gradient Tracker with NOAA METAR API integration
- 25 verified METAR reporting stations (coast + interior)
- 24-hour persistent pressure history with hourly readings
- Auto-retry error handling for resilient API connectivity
- Dark/light theme support with responsive design

## 🚀 Getting Started

### Docker (Recommended)
```bash
docker-compose up -d
```

### Standard
```bash
npm install && npm run build && npm start
```

## 📚 Documentation

- **README.md** — Setup and usage
- **IMPLEMENTATION.md** — Technical details
- **CHANGELOG.md** — Full history

## 🙏 Acknowledgments

- [NOAA Weather API](https://www.weather.gov/documentation/services-web-api) · [shadcn/ui](https://ui.shadcn.com/) · [Next.js](https://nextjs.org/)

---

**Full Changelog**: https://github.com/djtrustgod/SoCal-Coast-Interior-Pressure-Gradient-Tracker/compare/v2.0.0...v2.0.1
