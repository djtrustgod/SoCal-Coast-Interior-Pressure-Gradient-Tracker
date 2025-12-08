export interface Location {
  id: string;
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  type: "coast" | "interior";
  elevation?: number;
}

export interface PressureReading {
  locationId: string;
  timestamp: string;
  pressure: number; // in hPa
  temperature?: number; // in Celsius
}

export interface PressureGradient {
  homeLocation: Location;
  compareLocation: Location;
  homePressure: number;
  comparePressure: number;
  difference: number; // home - compare
  timestamp: string;
}

export interface LocationSettings {
  locations: Location[];
  homeLocationId: string;
  dashboardLocationIds: string[];
  apiRefreshInterval: number; // in seconds
}
