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
 * Fetch current METAR observation data for a single location from NOAA Weather API
 */
export async function fetchMSLPForLocation(
  location: Location
): Promise<PressureReading> {
  const icao = location.icaoCode;
  const url = `https://api.weather.gov/stations/${icao}/observations?limit=25`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": NOAA_USER_AGENT,
      Accept: "application/geo+json",
    },
    next: { revalidate: 300 },
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

  // Find the most recent observation with valid pressure data
  let currentPressureMb: number | null = null;
  let currentTemperature: number | null = null;
  let currentTimestamp: string | null = null;

  for (const obs of data.features) {
    const props = obs.properties;
    const pressureValue =
      props.seaLevelPressure?.value ?? props.barometricPressure?.value;

    if (pressureValue !== null && pressureValue !== undefined) {
      currentPressureMb = pascalsToMillibars(pressureValue);

      if (props.temperature?.value !== null && props.temperature?.value !== undefined) {
        currentTemperature = props.temperature.value;
      }

      currentTimestamp = props.timestamp;
      break;
    }
  }

  if (currentPressureMb === null || currentTimestamp === null) {
    throw new Error(
      `No valid pressure data in recent METAR observations for ${location.name} (${icao})`
    );
  }

  // Validate pressure is in reasonable range
  validatePressure(currentPressureMb, location.name);

  // Build time series from available observations (for trend charts)
  const timeSeriesTime: string[] = [];
  const timeSeriesPressure: number[] = [];
  const timeSeriesTemperature: number[] = [];

  // Process observations in reverse to get chronological order
  const observations = [...data.features].reverse();
  for (const obs of observations) {
    const props = obs.properties;
    const pressureValue =
      props.seaLevelPressure?.value ?? props.barometricPressure?.value;

    if (pressureValue !== null && pressureValue !== undefined) {
      const pressureMb = pascalsToMillibars(pressureValue);
      // Only include valid pressure readings
      if (pressureMb >= 950 && pressureMb <= 1050) {
        timeSeriesTime.push(props.timestamp);
        timeSeriesPressure.push(pressureMb);
        if (props.temperature?.value !== null && props.temperature?.value !== undefined) {
          timeSeriesTemperature.push(props.temperature.value);
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
  locations: Location[]
): Promise<PressureReading[]> {
  const results = await fetchMSLPForLocationsSettled(locations);
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
  locations: Location[]
): Promise<FetchResult[]> {
  const promises = locations.map(async (location): Promise<FetchResult> => {
    try {
      const data = await fetchMSLPForLocation(location);
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
