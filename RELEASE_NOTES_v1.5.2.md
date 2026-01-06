# Release v1.5.2 - Docker Enhancements & Bug Fixes

## 🐛 Bug Fixes

- **Add Location button** in Settings now properly opens a dialog to create new locations
- **EditLocationDialog** now supports both "add" and "edit" modes with appropriate titles

## 🔧 Improvements

### Docker Enhancements
- **Better layer caching** in Dockerfile for faster rebuilds
- **Alpine Linux compatibility** with libc6-compat package
- **Embedded health checks** for better container monitoring
- **Resource limits** and logging rotation in Docker Compose
- **Multi-stage build optimization** for faster builds with improved caching
- **Reduced image size** to ~235MB (production build)

### Security
- **Non-root user** (nextjs:nodejs) for improved container security
- **Proper file permissions** for data directory
- **Environment variable support** expanded (HOSTNAME, TZ for timezone)

### Build Optimization
- Expanded `.dockerignore` to exclude unnecessary files
- Improved data directory initialization (works with and without volume mounts)

## 📦 What's Included

All features from previous releases:
- 24-hour pressure trend graphs
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
npm run dev
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

**Full Changelog**: https://github.com/djtrustgod/SoCal-Coast-Interior-Pressure-Gradient-Tracker/compare/v1.5.1...v1.5.2
