# Plan: Add 24-Hour Pressure Trend Graphs to Dashboard

Implement line charts on each dashboard gradient card showing 24-hour pressure trends for comparison locations. The Open-Meteo API already returns hourly data, but current code only extracts the most recent hour.

## Steps

1. **Install Recharts charting library** via `npm install recharts` for responsive, theme-aware chart rendering with TypeScript support.

2. **Modify Open-Meteo API client** at [lib/api/open-meteo.ts](lib/api/open-meteo.ts) to return full 24-hour pressure arrays instead of only extracting current hour from `hourly.pressure_msl[]`.

3. **Update type definitions** in [types/location.ts](types/location.ts) to add `PressureTimeSeries` interface with `time: string[]` and `pressure: number[]` arrays.

4. **Enhance server data fetching** in [app/page.tsx](app/page.tsx) to fetch and pass 24-hour time-series data alongside current pressure readings to [dashboard-content.tsx](components/dashboard-content.tsx).

5. **Create chart component** (new `PressureTrendChart.tsx`) as client component that renders Recharts `LineChart` with both light and dark mode support, responsive sizing, and timezone-aware X-axis labels.

6. **Integrate chart into GradientCard** at [components/gradient-card.tsx](components/gradient-card.tsx) by adding optional `timeSeries` prop and rendering chart below current pressure display.

## Further Considerations

1. **Chart display options:** Show only comparison location pressure, or overlay home location pressure for direct visual comparison, or show gradient trend over time?
2. **Data granularity:** Display all 24 hours or reduce to 12-hour intervals for cleaner visualization on mobile?
3. **Historical archive:** The unused `fetchHistoricalMSLP()` function in [lib/api/open-meteo.ts](lib/api/open-meteo.ts) could provide multi-day trends if extended historical views are desired.

## Technical Details

### Current State
- Open-Meteo API returns hourly arrays of 24 data points
- Current code only extracts the most recent hour (`hourly.time[hourly.time.length - 1]`)
- `fetchHistoricalMSLP()` function exists but is unused
- Server component architecture with client-side refresh logic

### Data Flow
```
Server (page.tsx)
  ↓ Fetch 24-hour data via modified API client
  ↓ Pass to DashboardContent
  ↓ Pass to individual GradientCard components
  ↓ Render chart (client-side)
```

### Type Additions Needed
```typescript
interface PressureTimeSeries {
  locationId: string;
  data: {
    time: string[];
    pressure: number[];
  }
}
```

### Chart Component Considerations
- **Client vs Server:** Chart rendering should happen client-side (requires `"use client"` or move chart to separate client component)
- **Performance:** 24 data points is lightweight; no pagination needed
- **Caching:** Current 5-minute revalidation is appropriate
- **Mobile Responsiveness:** Charts should be touch-friendly and responsive
- **Dark Mode:** Chart colors should adapt to theme using `useTheme()` hook
- **Accessibility:** Include proper labels, legends, and ARIA attributes

### API Modifications
- Modify `fetchCurrentMSLP()` to return full time series OR
- Create new `fetch24HourMSLP()` function specifically for graphing
- Consider creating unified data structure that includes both current value and time series

## Implementation Approach

### Option A: Minimal Changes
- Keep current data structure
- Add separate API call for time series data
- Pass time series as additional prop to GradientCard

### Option B: Comprehensive Refactor
- Modify API client to always return full time series
- Update all data structures to include time series
- Extract current value as `data.pressure[data.pressure.length - 1]`

**Recommendation:** Option A for incremental development, Option B for long-term maintainability.
