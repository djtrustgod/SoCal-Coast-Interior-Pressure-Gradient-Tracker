import { Location, PressureReading } from "@/types/location";

/**
 * NOAA Weather API METAR observation response types
 */
interface NOAAObservationProperties {
  timestamp: string;
  barometricPressure: {
    unitCode: string;
    value: number | null;
    qualityControl: string;
  };
  seaLevelPressure: {
    unitCode: string;
    value: number | null;
    qualityControl: string;
  };
  temperature: {
    unitCode: string;
    value: number | null;
    qualityControl: string;
  };
}

interface NOAAObservation {
  properties: NOAAObservationProperties;
}

interface NOAAObservationsResponse {
  features: NOAAObservation[];
}

const NOAA_USER_AGENT = "(SoCal Pressure Gradient Tracker, github.com/djtrustgod/SoCal-Coast-Interior-Pressure-Gradient-Tracker)";

/**
 * Validate that pressure is within a reasonable range (950-1050 mb)
 */
function validatePressure(pressureMb: number, locationName: string): void {
  if (pressureMb < 950 || pressureMb > 1050) {
    throw new Error(
      `Pressure ${pressureMb.toFixed(1)} mb for ${locationName} is outside valid range (950-1050 mb)`
    );
  }
}

/**
 * Convert Pascals to millibars (1 mb = 1 hPa = 100 Pa)
 */
function pascalsToMillibars(pascals: number): number {
  return pascals / 100;
}

/**
 * Options for METAR observation fetching
 */
export interface FetchMSLPOptions {
  /** ISO 8601 start time — requests observations from this time onward */
  start?: string;
}

/**
 * Fetch current METAR observation data for a single location from NOAA Weather API
 */
export async function fetchMSLPForLocation(
  location: Location,
  options?: FetchMSLPOptions
): Promise<PressureReading> {
  const icao = location.icaoCode;
  // When a start time is provided, use limit=500 (API max) to capture all
  // observations in the window, even for high-frequency (5-min) reporters.
  const limit = options?.start ? 500 : 48;
  let url = `https://api.weather.gov/stations/${icao}/observations?limit=${limit}`;
  if (options?.start) {
    url += `&start=${encodeURIComponent(options.start)}`;
  }

  const response = await fetch(url, {
    headers: {
      "User-Agent": NOAA_USER_AGENT,
      Accept: "application/geo+json",
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch METAR data for ${location.name} (${icao}): ${response.status} ${response.statusText}`
    );
  }

  const data: NOAAObservationsResponse = await response.json();

  if (!data.features || data.features.length === 0) {
    throw new Error(
      `No METAR observations available for ${location.name} (${icao})`
    );
  }

  // Find the most recent observation with true Sea Level Pressure (MSLP).
  // SLP is only reported in hourly METAR observations (typically at :50-:53).
  // Sub-hourly/SPECI observations only have barometricPressure (altimeter setting),
  // which differs from true MSLP by 0.3-1.5 mb depending on station elevation.
  // We strongly prefer SLP; fall back to altimeter only if no SLP is available.
  let currentPressureMb: number | null = null;
  let currentTemperature: number | null = null;
  let currentTimestamp: string | null = null;
  let usedFallback = false;

  // First pass: look for an observation with seaLevelPressure (true MSLP)
  for (const obs of data.features) {
    const props = obs.properties;
    const slp = props.seaLevelPressure?.value;

    if (slp !== null && slp !== undefined) {
      currentPressureMb = pascalsToMillibars(slp);

      if (props.temperature?.value !== null && props.temperature?.value !== undefined) {
        currentTemperature = props.temperature.value;
      }

      currentTimestamp = props.timestamp;
      break;
    }
  }

  // Second pass (fallback): if no SLP found, use altimeter setting
  if (currentPressureMb === null) {
    for (const obs of data.features) {
      const props = obs.properties;
      const baro = props.barometricPressure?.value;

      if (baro !== null && baro !== undefined) {
        currentPressureMb = pascalsToMillibars(baro);
        usedFallback = true;

        if (props.temperature?.value !== null && props.temperature?.value !== undefined) {
          currentTemperature = props.temperature.value;
        }

        currentTimestamp = props.timestamp;
        break;
      }
    }
  }

  if (usedFallback) {
    console.warn(
      `[METAR] No SLP available for ${location.name} (${icao}); using altimeter setting as fallback (may differ from true MSLP)`
    );
  }

  if (currentPressureMb === null || currentTimestamp === null) {
    throw new Error(
      `No valid pressure data in recent METAR observations for ${location.name} (${icao})`
    );
  }

  // Validate pressure is in reasonable range
  validatePressure(currentPressureMb, location.name);

  // Build time series from available observations (for trend charts)
  // Prefer seaLevelPressure (true MSLP); fall back to altimeter only when SLP is null
  const timeSeriesTime: string[] = [];
  const timeSeriesPressure: number[] = [];
  const timeSeriesTemperature: number[] = [];

  // Process observations in reverse to get chronological order
  const observations = [...data.features].reverse();
  for (const obs of observations) {
    const props = obs.properties;
    const slp = props.seaLevelPressure?.value;
    const baro = props.barometricPressure?.value;
    // Prefer SLP (true MSLP), fall back to altimeter
    const pressureValue = slp ?? baro;

    if (pressureValue !== null && pressureValue !== undefined) {
      const pressureMb = pascalsToMillibars(pressureValue);
      // Only include valid pressure readings
      if (pressureMb >= 950 && pressureMb <= 1050) {
        // Only include observations that have SLP if we have enough SLP data points,
        // otherwise include all to avoid empty charts
        if (slp !== null && slp !== undefined) {
          timeSeriesTime.push(props.timestamp);
          timeSeriesPressure.push(pressureMb);
          if (props.temperature?.value !== null && props.temperature?.value !== undefined) {
            timeSeriesTemperature.push(props.temperature.value);
          }
        }
      }
    }
  }

  // If no SLP-only data points were found, fall back to including altimeter data
  if (timeSeriesTime.length === 0) {
    for (const obs of observations) {
      const props = obs.properties;
      const baro = props.barometricPressure?.value;

      if (baro !== null && baro !== undefined) {
        const pressureMb = pascalsToMillibars(baro);
        if (pressureMb >= 950 && pressureMb <= 1050) {
          timeSeriesTime.push(props.timestamp);
          timeSeriesPressure.push(pressureMb);
          if (props.temperature?.value !== null && props.temperature?.value !== undefined) {
            timeSeriesTemperature.push(props.temperature.value);
          }
        }
      }
    }
  }

  return {
    locationId: location.id,
    timestamp: currentTimestamp,
    pressure: currentPressureMb,
    temperature: currentTemperature ?? undefined,
    timeSeries:
      timeSeriesTime.length > 0
        ? {
            time: timeSeriesTime,
            pressure: timeSeriesPressure,
            temperature:
              timeSeriesTemperature.length > 0
                ? timeSeriesTemperature
                : undefined,
          }
        : undefined,
  };
}

export interface FetchResult {
  status: "success" | "error";
  data?: PressureReading;
  error?: string;
  locationId: string;
  locationName: string;
}

/**
 * Fetch METAR data for multiple locations in parallel.
 * Uses Promise.allSettled so a single station failure doesn't break the batch.
 */
export async function fetchMSLPForLocations(
  locations: Location[],
  options?: FetchMSLPOptions
): Promise<PressureReading[]> {
  const results = await fetchMSLPForLocationsSettled(locations, options);
  // Return only successful readings (backward-compatible)
  return results
    .filter((r): r is FetchResult & { data: PressureReading } => r.status === "success" && !!r.data)
    .map((r) => r.data);
}

/**
 * Fetch METAR data for multiple locations, returning detailed per-location results
 * including errors for individual stations.
 */
export async function fetchMSLPForLocationsSettled(
  locations: Location[],
  options?: FetchMSLPOptions
): Promise<FetchResult[]> {
  const promises = locations.map(async (location): Promise<FetchResult> => {
    try {
      const data = await fetchMSLPForLocation(location, options);
      return { status: "success", data, locationId: location.id, locationName: location.name };
    } catch (error) {
      return {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        locationId: location.id,
        locationName: location.name,
      };
    }
  });
  return Promise.all(promises);
}
