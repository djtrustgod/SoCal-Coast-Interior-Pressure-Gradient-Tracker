import { Location, PressureReading, PressureGradient } from "@/types/location";

/**
 * Calculate pressure difference between home location and comparison location
 * Positive value means home pressure is higher (onshore flow potential)
 * Negative value means home pressure is lower (offshore flow potential)
 */
export function calculatePressureGradient(
  homeLocation: Location,
  homePressure: PressureReading,
  compareLocation: Location,
  comparePressure: PressureReading
): PressureGradient {
  const difference = homePressure.pressure - comparePressure.pressure;

  return {
    homeLocation,
    compareLocation,
    homePressure: homePressure.pressure,
    comparePressure: comparePressure.pressure,
    difference,
    timestamp: homePressure.timestamp,
    homeTimeSeries: homePressure.timeSeries ? {
      time: homePressure.timeSeries.time,
      pressure: homePressure.timeSeries.pressure,
    } : undefined,
    compareTimeSeries: comparePressure.timeSeries ? {
      time: comparePressure.timeSeries.time,
      pressure: comparePressure.timeSeries.pressure,
    } : undefined,
  };
}

/**
 * Calculate gradients between home location and multiple comparison locations
 */
export function calculateMultipleGradients(
  homeLocation: Location,
  homePressure: PressureReading,
  compareLocations: Location[],
  comparePressures: PressureReading[]
): PressureGradient[] {
  return compareLocations.map((location, index) => {
    const pressure = comparePressures[index];
    return calculatePressureGradient(
      homeLocation,
      homePressure,
      location,
      pressure
    );
  });
}

/**
 * Get gradient interpretation
 * Positive gradient: Coast pressure > Inland pressure → Onshore flow
 * Negative gradient: Inland pressure > Coast pressure → Offshore flow
 */
export function interpretGradient(gradient: number): {
  label: string;
  description: string;
  color: string;
} {
  if (gradient > 5) {
    return {
      label: "Strong Onshore Flow",
      description: "High pressure over coast, strong gradient toward land",
      color: "text-indigo-600 dark:text-indigo-400",
    };
  } else if (gradient > 2) {
    return {
      label: "Moderate Onshore Flow",
      description: "Moderate pressure gradient favoring onshore winds",
      color: "text-cyan-600 dark:text-cyan-400",
    };
  } else if (gradient > 0.5) {
    return {
      label: "Weak Onshore Flow",
      description: "Slight pressure gradient toward land",
      color: "text-blue-600 dark:text-blue-400",
    };
  } else if (gradient > -0.5) {
    return {
      label: "Neutral",
      description: "Minimal pressure gradient",
      color: "text-gray-600 dark:text-gray-400",
    };
  } else if (gradient > -2) {
    return {
      label: "Weak Offshore Flow",
      description: "Slight pressure gradient toward coast",
      color: "text-yellow-600 dark:text-yellow-400",
    };
  } else if (gradient > -5) {
    return {
      label: "Moderate Offshore Flow",
      description: "Moderate pressure gradient favoring offshore winds",
      color: "text-orange-600 dark:text-orange-400",
    };
  } else {
    return {
      label: "Strong Offshore Flow",
      description: "High pressure over land, strong gradient toward coast",
      color: "text-red-600 dark:text-red-400",
    };
  }
}

/**
 * Format pressure value for display
 */
export function formatPressure(pressure: number): string {
  return `${pressure.toFixed(1)} hPa`;
}

/**
 * Format gradient value for display
 */
export function formatGradient(gradient: number): string {
  const sign = gradient >= 0 ? "+" : "";
  return `${sign}${gradient.toFixed(2)} hPa`;
}
