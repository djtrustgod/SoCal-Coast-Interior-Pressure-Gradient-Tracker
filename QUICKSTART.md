# Quick Start Guide

## Running the Application

1. **Install dependencies** (if not already done):
   \`\`\`bash
   npm install
   \`\`\`

2. **Start the development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

3. **Open your browser** to:
   [http://localhost:3000](http://localhost:3000)

## First Time Setup

The application comes pre-configured with 25 Southern California locations, including:
- **Home Location**: Santa Ana (SNA) - used as reference point
- **Default Comparisons**: Santa Barbara, Santa Maria, Barstow
- Additional coastal and interior locations available

## Key Features to Try

### 1. View Pressure Gradients
The dashboard automatically displays:
- Current MSLP at Santa Ana (home location)
- Pressure differences with comparison locations
- Color-coded interpretations (red = offshore, blue = onshore)
- Last update timestamp

### 2. Change Theme
Click the sun/moon icon in the top-right corner to toggle between light and dark themes.

### 3. Manage Locations
Click the Settings (gear) icon to:
- View all 25 configured locations
- See coastal vs. interior locations
- Delete locations (except home)
- View location details (coordinates, elevation)

### 4. Understanding the Data

**Pressure Gradient Colors:**
- 🔴 **Red/Orange** (Positive): Offshore flow potential (Santa Ana winds)
- 🔵 **Blue/Cyan** (Negative): Onshore flow (marine layer)
- ⚪ **Gray** (Near zero): Neutral conditions

**Typical Values:**
- \`+5 hPa\`: Strong offshore gradient
- \`+2 hPa\`: Moderate offshore gradient
- \`0 hPa\`: Neutral
- \`-2 hPa\`: Moderate onshore gradient
- \`-5 hPa\`: Strong onshore gradient

## Data Updates

- Pressure data refreshes every **1 hour** automatically
- Data is cached to reduce API calls
- Source: Open-Meteo API (free, no key required)

## Troubleshooting

### Server won't start
\`\`\`bash
# Clear Next.js cache
rm -rf .next
npm run dev
\`\`\`

### Port 3000 already in use
\`\`\`bash
# Use a different port
npx next dev -p 3001
\`\`\`

### TypeScript errors
\`\`\`bash
# Rebuild TypeScript definitions
npm run build
\`\`\`

## Production Build

To run in production mode:

\`\`\`bash
# Build the application
npm run build

# Start production server
npm start
\`\`\`

Production server will also run on [http://localhost:3000](http://localhost:3000)

## File Structure Overview

- \`app/page.tsx\` - Main dashboard
- \`app/locations/page.tsx\` - Location management
- \`data/locations.json\` - Location configurations (editable)
- \`components/\` - Reusable UI components
- \`lib/\` - API clients and calculations

## Next Steps

1. ✅ Customize the home location in \`data/locations.json\`
2. ✅ Add or remove locations via the UI
3. ✅ Monitor pressure gradients for wind forecasting
4. ✅ Use dark mode for nighttime viewing
5. ✅ Build for production when ready to deploy

## Support

For issues or questions:
- Check the main README.md
- Review the code documentation
- Open an issue on GitHub
