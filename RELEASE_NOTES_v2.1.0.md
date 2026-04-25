# Release Notes - v2.1.0

**Release Date:** April 25, 2026

## ✨ New Features

- **Windows GUI Launcher** — A small WinForms launcher under `tools/` (`server-gui.ps1` + `server-gui.bat`) opens a window with Start / Stop / Open-in-Browser buttons, a Dev/Prod toggle, and a live log pane. Includes a production-build-missing check that offers to run `npm run build` first.
- **Pinnable Desktop Shortcut** — `tools/create-shortcut.ps1` creates a Desktop shortcut that targets `powershell.exe` (Windows 11 only pins `.exe`-targeted shortcuts), so you can right-click → *Show more options* → *Pin to taskbar*.
- **Multi-Size Favicon** — `tools/make-icon.js` rasterizes a path-based Twemoji 🍃 SVG into `public/favicon.ico` at 16/32/48/64/128/256 sizes, fixing icon rendering on Windows shortcuts and legacy browsers (the project's emoji-based `favicon.svg` requires system color-emoji fonts that librsvg and WPF don't support).

## 🐛 Bug Fixes

- **Adopt Already-Running Server** — Reopening the GUI launcher while the Next.js server is still running used to leave the Stop button disabled and fail the next Start click with `EADDRINUSE`. The launcher now probes port 3000 at startup (and again as a race-guard inside the Start handler), adopts any responsive listener, lights up the Stop button, and tree-kills it via `taskkill /T /F` when clicked. Closing the launcher leaves adopted servers running — only GUI-spawned processes get the on-close stop prompt.
- **Decoupled Server Logs from GUI Lifetime** — The launcher now redirects the server's stdout/stderr to `%TEMP%\socal-pressure-server.log` via `cmd`-level redirection rather than a PowerShell pipe. Next.js no longer blocks on `console.log()` if the GUI window closes unexpectedly. The GUI tails the log file on a 300 ms timer for live display, and any unhandled GUI exception is written to `%TEMP%\socal-pressure-gui-crash.log` for post-mortem.

## 📦 What's Included

- SoCal Pressure Gradient Tracker with NOAA METAR API integration
- 25 verified METAR reporting stations (coast + interior)
- 24-hour persistent pressure history with hourly readings
- Auto-retry error handling for resilient API connectivity
- Dark/light theme support with responsive design
- Windows GUI launcher with adopt-existing-server, log streaming, and crash logging

## 🚀 Getting Started

### Docker (Recommended)
```bash
docker-compose up -d
```

### Standard
```bash
npm install && npm run build && npm start
```

### Windows GUI Launcher
```text
Double-click tools/server-gui.bat
```
Or run `powershell -ExecutionPolicy Bypass -File tools/create-shortcut.ps1` once to create a Desktop shortcut, then pin it to the taskbar.

## 📚 Documentation

- **README.md** — Setup and usage
- **IMPLEMENTATION.md** — Technical details
- **CHANGELOG.md** — Full history

## 🙏 Acknowledgments

- [NOAA Weather API](https://www.weather.gov/documentation/services-web-api) · [shadcn/ui](https://ui.shadcn.com/) · [Next.js](https://nextjs.org/) · [Twemoji](https://twemoji.twitter.com/) (CC-BY 4.0)

---

**Full Changelog**: https://github.com/djtrustgod/SoCal-Coast-Interior-Pressure-Gradient-Tracker/compare/v2.0.3...v2.1.0
