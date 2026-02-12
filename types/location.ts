export interface Location {
  id: string;
  name: string;
  code: string;
  icaoCode: string;
  latitude: number;
  longitude: number;
  type: "coast" | "interior";
  elevation?: number;
}

export interface PressureReading {
  locationId: string;
  timestamp: string;
  pressure: number; // in mb (millibars, equivalent to hPa)
  temperature?: number; // in Celsius
  timeSeries?: {
    time: string[];
    pressure: number[];
    temperature?: number[];
  };
}

export interface PressureGradient {
  homeLocation: Location;
  compareLocation: Location;
  homePressure: number;
  comparePressure: number;
  difference: number; // home - compare
  timestamp: string;
  homeTimeSeries?: {
    time: string[];
    pressure: number[];
  };
  compareTimeSeries?: {
    time: string[];
    pressure: number[];
  };
}

export interface LocationSettings {
  locations: Location[];
  homeLocationId: string;
  dashboardLocationIds: string[];
  apiRefreshInterval: number; // in seconds
}

/**
 * A single hourly pressure reading stored in the persistent history file.
 */
export interface PressureHistoryEntry {
  timestamp: string; // ISO 8601
  pressure: number; // in mb (millibars / hPa)
  temperature?: number; // in Celsius
}

/**
 * Schema for the pressure-history.json file.
 * Keys are location IDs, values are sorted arrays of hourly readings.
 */
export interface PressureHistoryFile {
  [locationId: string]: PressureHistoryEntry[];
}
