# SoCal Coast-Interior Pressure Gradient Tracker

A Next.js web application that tracks and displays Mean Sea Level Pressure (MSLP) differences between coastal and interior Southern California locations. This tool helps visualize pressure gradients that indicate offshore vs. onshore wind patterns.

## Features

- 🌡️ **Real-time MSLP Data**: Fetches current pressure data from Open-Meteo API
- 📊 **Pressure Gradient Visualization**: Displays pressure differences between home location and up to 3 comparison locations
- 🎨 **Modern UI**: Clean, responsive design with light/dark theme support
- 📍 **25 Pre-configured Locations**: Includes major coastal and interior SoCal locations
- ⚙️ **Location Management**: Add, edit, and delete locations (max 25)
- 💾 **Persistent Storage**: JSON-based data storage for location configurations
- 🔄 **Auto-refresh**: Data cached with 1-hour revalidation

## Technology Stack

- **Framework**: Next.js 14+ (App Router)
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
\`\`\`bash
git clone https://github.com/djtrustgod/SoCal-Coast-Interior-Pressure-Gradient-Tracker.git
cd SoCal-Coast-Interior-Pressure-Gradient-Tracker
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Dashboard

The main dashboard displays:
- Current MSLP for the home location (Santa Ana by default)
- Pressure gradients for up to 3 comparison locations
- Color-coded interpretations (offshore flow, onshore flow, neutral)
- Last update timestamp

### Interpreting Gradients

- **Positive values (red/orange)**: Higher pressure inland → Offshore flow (Santa Ana wind potential)
- **Negative values (blue/cyan)**: Higher pressure at coast → Onshore flow (typical marine layer conditions)
- **Near zero (gray)**: Neutral conditions, minimal pressure gradient

### Location Management

Navigate to the Settings (gear icon) to:
- View all configured locations (coastal vs. interior)
- Add new locations (up to 25 total)
- Delete locations (except home location)
- See location details (coordinates, elevation, type)

## Project Structure

\`\`\`
├── app/
│   ├── layout.tsx           # Root layout with theme provider
│   ├── page.tsx             # Main dashboard
│   ├── locations/
│   │   └── page.tsx         # Location management page
│   └── api/
│       ├── pressure/        # Pressure data API endpoint
│       └── locations/       # Location CRUD API endpoint
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── gradient-card.tsx    # Pressure gradient display card
│   ├── header.tsx           # App header with navigation
│   ├── location-selector.tsx # Location comparison selector
│   ├── theme-provider.tsx   # Theme context provider
│   └── theme-toggle.tsx     # Light/dark mode toggle
├── lib/
│   ├── api/
│   │   └── open-meteo.ts    # Open-Meteo API client
│   ├── calculations/
│   │   └── gradient.ts      # Pressure gradient calculations
│   └── utils.ts             # Utility functions
├── data/
│   └── locations.json       # Location configurations
├── types/
│   └── location.ts          # TypeScript type definitions
└── public/                  # Static assets
\`\`\`

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
Get all configured locations.

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

### DELETE /api/locations?id=location-id
Delete a location (cannot delete home location).

## Configuration

### Changing the Home Location

Edit `data/locations.json`:
\`\`\`json
{
  "homeLocationId": "sna",  // Change to any location ID
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

\`\`\`bash
npm run build
npm run start
\`\`\`

The app runs on `http://localhost:3000` by default.

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
