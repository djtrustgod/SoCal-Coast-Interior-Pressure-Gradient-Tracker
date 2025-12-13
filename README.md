# SoCal Coast-Interior Pressure Gradient Tracker

A Next.js web application that tracks and displays Mean Sea Level Pressure (MSLP) differences between coastal and interior Southern California locations. This tool helps visualize pressure gradients that indicate offshore vs. onshore wind patterns.

## Features

- 🌡️ **Real-time MSLP Data**: Fetches current pressure data from Open-Meteo API
- 📊 **Pressure Gradient Visualization**: Displays pressure differences between home location and up to 3 comparison locations
- 🎨 **Modern UI**: Clean, responsive design with light/dark theme support
- 📍 **24 Pre-configured Locations**: Includes major coastal and interior SoCal locations
- ⚙️ **Location Management**: Add, edit, and delete locations (max 25)
- 🏠 **Set Home Location**: Choose any location as your home base from the Settings UI
- 👁️ **Dashboard Customization**: Select up to 3 locations to display on the dashboard
- 🔄 **Manual Refresh**: On-demand refresh button to fetch the latest pressure data
- 🔁 **Auto-Refresh Dashboard**: Dashboard automatically refreshes every 5 minutes in the browser
- ⚙️ **Configurable API Refresh**: Set API data refresh interval from 1 to 60 minutes
- 🕐 **Timezone-Aware Timestamps**: All timestamps automatically converted to your local timezone
- 💾 **Persistent Storage**: JSON-based data storage for location configurations
- ⏱️ **Smart Data Updates**: Data cached with configurable revalidation (default 5 minutes), shows current hour readings

## Technology Stack

- **Framework**: Next.js 16.0.7 (Turbopack, App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Data Source**: Open-Meteo API (free, no API key required)
- **Icons**: Lucide React
- **Theme**: next-themes (light/dark mode)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`
git clone https://github.com/djtrustgod/SoCal-Coast-Interior-Pressure-Gradient-Tracker.git
cd SoCal-Coast-Interior-Pressure-Gradient-Tracker
\`\`\`

2. Install dependencies:
\`\`\`
npm install
\`\`\`

3. Run the development server:
\`\`\`
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Dashboard

The main dashboard displays:
- Current MSLP for the home location (customizable)
- Pressure gradients for up to 3 comparison locations (customizable)
- Color-coded interpretations (offshore flow, onshore flow, neutral)
- Last update timestamps in your local timezone (e.g., "Dec 6, 2025, 8:00 PM PST")
- Manual refresh button to fetch the latest data on-demand
- Automatic browser refresh every 5 minutes to keep data current
- Configurable API data caching (1-60 minutes)

### Interpreting Gradients

- **Positive values (red/orange)**: Higher pressure inland → Offshore flow (Santa Ana wind potential)
- **Negative values (blue/cyan)**: Higher pressure at coast → Onshore flow (typical marine layer conditions)
- **Near zero (gray)**: Neutral conditions, minimal pressure gradient

### Location Management

Navigate to the Settings (gear icon) to:
- View all configured locations (coastal vs. interior)
- **Set Home Location**: Click the home icon next to any location to set it as your home base
- **Select Dashboard Locations**: Click the eye icon to add/remove locations from dashboard display (max 3)
- **Configure API Refresh Interval**: Set how often data is fetched from Open-Meteo API (1, 5, 10, 15, 30, or 60 minutes)
- Add new locations (up to 25 total)
- Edit existing locations (name, code, coordinates, type, elevation)
- Delete locations (locations in use as home cannot be deleted)
- See location details with visual badges (HOME, DASHBOARD)
- Location counter shows current usage (e.g., "24 of 25 locations configured")

## Project Structure

```
├── app/
│   ├── layout.tsx           # Root layout with theme provider
│   ├── page.tsx             # Main dashboard (server component)
│   ├── locations/
│   │   └── page.tsx         # Location management page
│   └── api/
│       ├── pressure/        # Pressure data API endpoint
│       └── locations/       # Location CRUD API endpoint (GET/POST/PATCH/PUT/DELETE)
├── components/
│   ├── ui/                  # shadcn/ui components (Button, Card, Dialog, Select)
│   ├── dashboard-content.tsx # Client component with refresh functionality
│   ├── gradient-card.tsx    # Pressure gradient display card with timestamps
│   ├── edit-location-dialog.tsx # Dialog for editing location details
│   ├── header.tsx           # App header with navigation
│   ├── location-selector.tsx # Location comparison selector (unused)
│   ├── theme-provider.tsx   # Theme context provider
│   └── theme-toggle.tsx     # Light/dark mode toggle
├── lib/
│   ├── api/
│   │   └── open-meteo.ts    # Open-Meteo API client
│   ├── calculations/
│   │   └── gradient.ts      # Pressure gradient calculations
│   ├── data/
│   │   └── locations.ts     # Shared file reader utilities for locations.json
│   └── utils.ts             # Utility functions
├── data/
│   └── locations.json       # Location configurations
├── types/
│   └── location.ts          # TypeScript type definitions
└── public/                  # Static assets
```

## API Endpoints

### GET /api/pressure
Fetch MSLP data for specified locations.

**Query Parameters:**
- `ids`: Comma-separated location IDs

**Example:**
\`\`\`
GET /api/pressure?ids=sna,sba,dag
\`\`\`

### GET /api/locations
Get all configured locations, home location ID, and dashboard location IDs.

**Response:**
\`\`\`json
{
  "homeLocationId": "sna",
  "dashboardLocationIds": ["sba", "smx", "dag"],
  "locations": [...]
}
\`\`\`

### POST /api/locations
Add a new location.

**Body:**
\`\`\`json
{
  "id": "location-id",
  "name": "Location Name",
  "code": "CODE",
  "latitude": 34.0,
  "longitude": -118.0,
  "type": "coast" | "interior",
  "elevation": 100
}
\`\`\`

### PATCH /api/locations
Update home location, dashboard location selections, or API refresh interval.

**Body (Set Home):**
\`\`\`json
{
  "homeLocationId": "sba"
}
\`\`\`

**Body (Set Dashboard Locations):**
\`\`\`json
{
  "dashboardLocationIds": ["sba", "smx", "dag"]
}
\`\`\`

**Body (Set API Refresh Interval):**
\`\`\`json
{
  "apiRefreshInterval": 300
}
\`\`\`
*Note: Value in seconds, minimum 60, maximum 3600*

### PUT /api/locations
Update an existing location's details.

**Body:**
\`\`\`json
{
  "id": "location-id",
  "name": "Updated Name",
  "code": "CODE",
  "latitude": 34.0,
  "longitude": -118.0,
  "type": "coast",
  "elevation": 100
}
\`\`\`

### DELETE /api/locations?id=location-id
Delete a location (cannot delete home location or locations in dashboard).

## Configuration

### Changing the Home Location

**Via UI (Recommended):**
1. Navigate to Settings (gear icon)
2. Find the location you want to set as home
3. Click the home icon next to that location
4. Confirm in the dialog

**Manual Edit:**
Edit `data/locations.json`:
\`\`\`json
{
  "homeLocationId": "sna",  // Change to any location ID
  "dashboardLocationIds": ["sba", "smx", "dag"],  // Up to 3 location IDs
  "locations": [...]
}
\`\`\`

### Adding Custom Locations

Either use the UI or manually edit `data/locations.json`:
\`\`\`json
{
  "id": "custom-id",
  "name": "Custom Location",
  "code": "CUS",
  "latitude": 34.0,
  "longitude": -118.0,
  "type": "coast",
  "elevation": 50
}
\`\`\`

## Data Caching

- **Pressure data**: Revalidated every 1 hour
- **Location config**: Read from file system (instant updates)

## Building for Production

npm run build

npm run start

The NextJS app runs on `http://localhost:3000` by default.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is released under the CC0 1.0 Universal (Public Domain) license. See LICENSE file for details.

## Acknowledgments

- Weather data provided by [Open-Meteo](https://open-meteo.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Built with [Next.js](https://nextjs.org/)

## Support

For issues or questions, please open an issue on GitHub.
