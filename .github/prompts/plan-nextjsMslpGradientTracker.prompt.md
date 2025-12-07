# Plan: Next.js MSLP Gradient Tracker

A React/Next.js web application that displays Mean Sea Level Pressure (MSLP) differences between a home location (Santa Ana) and up to three comparison locations from a configurable list of 25 Southern California locations. Uses Open-Meteo API for live weather data, stores location configs in JSON files, and features a modern light/dark theme UI built with Tailwind CSS and shadcn/ui.

## Steps

1. **Initialize Next.js project** with TypeScript, App Router, Tailwind CSS, and shadcn/ui; install dependencies including `next-themes`, `recharts`, `date-fns`, and `zod`.

2. **Create data layer** with `data/locations.json` containing 25 locations (starting with SNA, SBA, SMX, DAG, LAS), `lib/api/open-meteo.ts` for API client, and `lib/calculations/gradient.ts` for pressure difference calculations.

3. **Build theme system** in `app/layout.tsx` with `next-themes` provider, configure Tailwind dark mode variants, and add shadcn/ui components (card, button, chart, select).

4. **Implement dashboard** in `app/page.tsx` as server component fetching MSLP data for selected locations, displaying pressure gradients with comparison cards, and showing historical trend charts.

5. **Create location management** page at `app/locations/page.tsx` allowing users to view, add, edit, and delete locations (max 25), persisting changes to `data/locations.json` via API route `app/api/locations/route.ts`.

6. **Add API routes** at `app/api/pressure/route.ts` to fetch and cache Open-Meteo data with 1-hour revalidation, handling multiple location requests efficiently.

## Further Considerations

1. **Home location selection** -  "Home" should configurable by user.

2. **Data refresh strategy** - Manual refresh button or auto-refresh every 5 minutes.  Auto-refresh value should be configurable.

3. **Historical data scope** - Display only current readings.  No historical data functionality needed.

## Future Enhancements

1. Edit location details (name, coordinates) in UI.
2. Select home location from list.