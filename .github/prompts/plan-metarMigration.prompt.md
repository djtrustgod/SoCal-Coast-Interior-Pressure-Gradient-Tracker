# Plan: Migrate to Official Airport METAR Data

Your application currently uses Open-Meteo's grid-based forecasts with lat/long coordinates. This plan switches to **NOAA Weather API** for real airport METAR observations while removing/fixing locations without valid METAR reporting, preserving coastal/interior coverage and the 24-hour pressure trend charts with proper unit conversion to millibars (mb) and ID migration handling.

## Steps

1. **Clean up location data** in [data/locations.json](data/locations.json) - **Remove 4 invalid locations** (VIS-Visalia, RIV-Riverside, SBD-San Bernardino, IPX-Indio/Thermal with wrong code), **fix 2 incorrect codes** (VNR→VNY for Van Nuys, LBB→LGB for Long Beach with updated coordinates), **add 3 replacement airports** (KPTV-Porterville for Central Valley, KREI-Redlands for Inland Empire, KTRM-Thermal for Coachella Valley), **add `icaoCode` field** to [types/location.ts](types/location.ts) and populate all 22 remaining locations with 4-letter ICAO codes (KSNA, KLAX, KDAG, etc.)

2. **Create new METAR API client** at [lib/api/metar.ts](lib/api/metar.ts) - implement functions matching current `fetchMSLPForLocation()` and `fetchMSLPForLocations()` signatures, using NOAA Weather API endpoint `https://api.weather.gov/stations/{ICAO}/observations` with required User-Agent header, parse METAR JSON to extract pressure and **convert from Pascals to millibars** (divide by 100, note: 1 mb = 1 hPa), **add validation to ensure pressure is in reasonable range** (950-1050 mb, throw error if outside bounds), extract temperature and timestamp into existing `PressureReading` format with pressure values in mb

3. **Update API imports and add ID migration** in [app/page.tsx](app/page.tsx#L7) and [app/api/pressure/route.ts](app/api/pressure/route.ts#L5) - change from `@/lib/api/open-meteo` to `@/lib/api/metar` (function signatures remain identical), in [app/api/locations/route.ts](app/api/locations/route.ts) add **backward compatibility logic to PATCH endpoint** that automatically maps old IDs (vnr→vny, lbb→lgb) to new IDs when updating homeLocationId or dashboardLocationIds, preventing user disruption

4. **Update pressure unit display** in [components/gradient-card.tsx](components/gradient-card.tsx) and [components/pressure-trend-chart.tsx](components/pressure-trend-chart.tsx) - change all pressure labels from "hPa" to "mb" throughout the UI, update chart tooltips to display "mb" units, update gradient difference display to show "mb" (note: no calculation changes needed since 1 hPa = 1 mb), handle variable-length time series and add fallback message "Limited historical data available" when <12 hours of data

5. **Update documentation** - modify [README.md](README.md) to reference NOAA Weather API with pressure values displayed in millibars (mb), note all locations are verified METAR reporting airports with pressure validation (950-1050 mb), update [IMPLEMENTATION.md](IMPLEMENTATION.md) with METAR station validation and mb terminology, add [CHANGELOG.md](CHANGELOG.md#L12) entries under "Changed" for METAR migration, pressure unit display changed to mb, and pressure validation, under "Removed" for cleaned-up locations, under "Fixed" for VNR/LBB code corrections with backward compatibility

## Further Considerations

1. **Extended location coverage** - After cleanup, we'll have 22 locations (down from 25) but 100% valid METAR stations maintaining 10 coastal and 12 interior locations. Should we add 2-3 more strategic airports to reach 25 again (suggestions: KBIH-Bishop for high desert, KMMH-Mammoth for Sierra Nevada reference, KNID-China Lake for Mojave Desert)?
