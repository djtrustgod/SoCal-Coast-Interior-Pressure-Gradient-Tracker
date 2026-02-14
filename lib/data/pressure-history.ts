import { promises as fs } from "fs";
import path from "path";
import {
  PressureHistoryEntry,
  PressureHistoryFile,
  PressureReading,
} from "@/types/location";

const HISTORY_FILE_PATH = path.join(
  process.cwd(),
  "data",
  "pressure-history.json"
);

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Module-level mutex to prevent concurrent read-modify-write races.
// Each write operation chains onto the previous one.
// ---------------------------------------------------------------------------
let writeLock: Promise<void> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const next = writeLock.then(fn, fn); // run even if prior rejects
  // Update the chain but swallow rejections on the chain itself
  writeLock = next.then(
    () => {},
    () => {}
  );
  return next;
}

// ---------------------------------------------------------------------------
// Read / Write
// ---------------------------------------------------------------------------

/**
 * Read pressure history from the JSON file.
 * Returns an empty object if the file does not exist.
 */
export async function readPressureHistory(): Promise<PressureHistoryFile> {
  try {
    const raw = await fs.readFile(HISTORY_FILE_PATH, "utf8");
    return JSON.parse(raw) as PressureHistoryFile;
  } catch {
    // File doesn't exist yet or is invalid — start fresh
    return {};
  }
}

/**
 * Atomically write pressure history to disk (write .tmp then rename).
 */
export async function writePressureHistory(
  data: PressureHistoryFile
): Promise<void> {
  const tmpPath = `${HISTORY_FILE_PATH}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmpPath, HISTORY_FILE_PATH);
}

// ---------------------------------------------------------------------------
// Round-to-hour helper (same logic used in PressureTrendChart)
// ---------------------------------------------------------------------------

function roundToHour(isoTime: string): string {
  const d = new Date(isoTime);
  if (d.getMinutes() >= 30) {
    d.setHours(d.getHours() + 1);
  }
  d.setMinutes(0, 0, 0);
  return d.toISOString();
}

// ---------------------------------------------------------------------------
// Merge
// ---------------------------------------------------------------------------

/**
 * Merge fresh NOAA readings into the persistent history.
 *
 * For each PressureReading:
 *  1. Extract its timeSeries entries (time[] + pressure[] + temperature[])
 *  2. Add the "current" reading as well
 *  3. Round each timestamp to the nearest hour
 *  4. De-duplicate — if an hour already exists, keep the newer value
 *  5. Sort chronologically
 *
 * Returns a NEW history object (does not mutate the input).
 */
export function mergeReadings(
  history: PressureHistoryFile,
  readings: PressureReading[]
): PressureHistoryFile {
  // Shallow-clone so we don't mutate the original
  const merged: PressureHistoryFile = { ...history };

  for (const reading of readings) {
    const locId = reading.locationId;
    const existing = merged[locId] ? [...merged[locId]] : [];

    // Build a map of existing entries keyed by rounded hour for fast lookup
    const byHour = new Map<string, PressureHistoryEntry>();
    for (const entry of existing) {
      byHour.set(roundToHour(entry.timestamp), entry);
    }

    // Collect new entries from the time-series arrays
    if (reading.timeSeries) {
      const ts = reading.timeSeries;
      for (let i = 0; i < ts.time.length; i++) {
        const hourKey = roundToHour(ts.time[i]);
        // Overwrite with latest observation for this hour
        byHour.set(hourKey, {
          timestamp: hourKey,
          pressure: ts.pressure[i],
          temperature: ts.temperature?.[i],
        });
      }
    }

    // Also include the current/"latest" reading itself
    const currentHourKey = roundToHour(reading.timestamp);
    byHour.set(currentHourKey, {
      timestamp: currentHourKey,
      pressure: reading.pressure,
      temperature: reading.temperature,
    });

    // Sort chronologically
    merged[locId] = [...byHour.values()].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  return merged;
}

// ---------------------------------------------------------------------------
// Prune
// ---------------------------------------------------------------------------

/**
 * Remove entries older than 24 hours from every location.
 * Returns a NEW history object.
 */
export function pruneOlderThan24Hours(
  history: PressureHistoryFile
): PressureHistoryFile {
  const cutoff = Date.now() - TWENTY_FOUR_HOURS_MS;
  const pruned: PressureHistoryFile = {};

  for (const [locId, entries] of Object.entries(history)) {
    const kept = entries.filter(
      (e) => new Date(e.timestamp).getTime() >= cutoff
    );
    if (kept.length > 0) {
      pruned[locId] = kept;
    }
  }

  return pruned;
}

// ---------------------------------------------------------------------------
// Convenience: merge, prune, and persist in a single locked operation
// ---------------------------------------------------------------------------

/**
 * Thread-safe merge-prune-persist cycle.
 *
 * 1. Read current history from disk
 * 2. Merge the supplied readings into it
 * 3. Prune entries > 24 h old
 * 4. Write back to disk
 * 5. Return the pruned history (callers can use it to enrich timeSeries)
 */
export function persistReadings(
  readings: PressureReading[]
): Promise<PressureHistoryFile> {
  return withLock(async () => {
    const history = await readPressureHistory();
    const merged = mergeReadings(history, readings);
    const pruned = pruneOlderThan24Hours(merged);
    await writePressureHistory(pruned);
    return pruned;
  });
}

// ---------------------------------------------------------------------------
// Helper: enrich PressureReadings with full 24-h history from the store
// ---------------------------------------------------------------------------

/**
 * Replace each PressureReading's timeSeries with the full 24-hour history
 * from the persistent store (if available). Mutates the readings in-place.
 */
export function enrichReadingsWithHistory(
  readings: PressureReading[],
  history: PressureHistoryFile
): void {
  for (const reading of readings) {
    const entries = history[reading.locationId];
    if (entries && entries.length > 0) {
      reading.timeSeries = {
        time: entries.map((e) => e.timestamp),
        pressure: entries.map((e) => e.pressure),
        temperature: entries.some((e) => e.temperature !== undefined)
          ? entries.map((e) => e.temperature ?? 0)
          : undefined,
      };
    }
  }
}
