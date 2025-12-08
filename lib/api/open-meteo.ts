import { Location, PressureReading } from "@/types/location";

export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  hourly_units: {
    time: string;
    pressure_msl: string;
    temperature_2m?: string;
  };
  hourly: {
    time: string[];
    pressure_msl: number[];
    temperature_2m?: number[];
  };
}

/**
 * Fetch current MSLP data for a single location from Open-Meteo API
 */
export async function fetchMSLPForLocation(
  location: Location
): Promise<PressureReading> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.append("latitude", location.latitude.toString());
  url.searchParams.append("longitude", location.longitude.toString());
  url.searchParams.append("hourly", "pressure_msl,temperature_2m");
  url.searchParams.append("forecast_days", "1");
  url.searchParams.append("timezone", "America/Los_Angeles");

  const response = await fetch(url.toString(), {
    next: { revalidate: 300 }, // 5 minutes default
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch MSLP data for ${location.name}: ${response.statusText}`
    );
  }

  const data: OpenMeteoResponse = await response.json();

  // Find the index for the current hour
  // The API returns times in the timezone we specified (America/Los_Angeles)
  const now = new Date();
  const nowTimestamp = now.getTime();
  
  // Find the most recent hour that is not in the future
  let currentIndex = 0;
  for (let i = 0; i < data.hourly.time.length; i++) {
    const apiTime = new Date(data.hourly.time[i]).getTime();
    if (apiTime <= nowTimestamp) {
      currentIndex = i;
    } else {
      break;
    }
  }
  
  const timestamp = data.hourly.time[currentIndex];
  const pressure = data.hourly.pressure_msl[currentIndex];
  const temperature = data.hourly.temperature_2m?.[currentIndex];

  return {
    locationId: location.id,
    timestamp,
    pressure,
    temperature,
  };
}

/**
 * Fetch MSLP data for multiple locations in parallel
 */
export async function fetchMSLPForLocations(
  locations: Location[]
): Promise<PressureReading[]> {
  const promises = locations.map((location) =>
    fetchMSLPForLocation(location)
  );
  return Promise.all(promises);
}

/**
 * Fetch historical MSLP data for a location
 */
export async function fetchHistoricalMSLP(
  location: Location,
  startDate: string,
  endDate: string
): Promise<{ time: string[]; pressure: number[] }> {
  const url = new URL("https://archive-api.open-meteo.com/v1/archive");
  url.searchParams.append("latitude", location.latitude.toString());
  url.searchParams.append("longitude", location.longitude.toString());
  url.searchParams.append("start_date", startDate);
  url.searchParams.append("end_date", endDate);
  url.searchParams.append("hourly", "pressure_msl");
  url.searchParams.append("timezone", "America/Los_Angeles");

  const response = await fetch(url.toString(), {
    next: { revalidate: 86400 }, // Cache for 24 hours
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch historical data for ${location.name}: ${response.statusText}`
    );
  }

  const data: OpenMeteoResponse = await response.json();

  return {
    time: data.hourly.time,
    pressure: data.hourly.pressure_msl,
  };
}
