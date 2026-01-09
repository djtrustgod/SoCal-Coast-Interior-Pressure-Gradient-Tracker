# Release v1.5.3 - Bug Fixes

## 🐛 Bug Fixes

- **Fixed pressure trend charts** to display only historical data up to current hour, removing confusing future forecast times
- **Charts now correctly filter** time series data in Pacific timezone to show only past/current pressure readings
- **Fixed "Invalid location data" error** when adding new locations - ID field is now auto-generated from the location code (lowercase)
- **Location IDs are now automatically created** from the code field (e.g., "SLC" becomes "slc") to ensure valid data submission

## 📦 What's Included

All features from previous releases:
- 24-hour pressure trend graphs (now with corrected historical data display)
- Real-time MSLP tracking
- Dashboard customization (up to 3 locations)
- Location management (add/edit/delete up to 25 locations)
- Configurable API refresh intervals (1-60 minutes)
- Light/dark theme support
- Docker deployment with Docker Compose

## 🚀 Getting Started

### Docker Deployment (Recommended)

```bash
# Clone and navigate to the project
git clone https://github.com/djtrustgod/SoCal-Coast-Interior-Pressure-Gradient-Tracker.git
cd SoCal-Coast-Interior-Pressure-Gradient-Tracker

# Start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f
```

The app will be available at `http://localhost:3000`

### Standard Installation

```bash
npm install
npm run build
npm run start
```

## 📚 Documentation

- [README.md](README.md) - Complete setup and usage guide
- [IMPLEMENTATION.md](IMPLEMENTATION.md) - Technical implementation details
- [CHANGELOG.md](CHANGELOG.md) - Full version history

## 🙏 Acknowledgments

- Weather data provided by [Open-Meteo](https://open-meteo.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Built with [Next.js](https://nextjs.org/)

---

**Full Changelog**: https://github.com/djtrustgod/SoCal-Coast-Interior-Pressure-Gradient-Tracker/compare/v1.5.2...v1.5.3
