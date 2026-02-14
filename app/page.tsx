import { fetchMSLPForLocationsSettled } from "@/lib/api/metar";
import { calculateMultipleGradients } from "@/lib/calculations/gradient";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LocationSelector } from "@/components/location-selector";
import { DashboardContent } from "@/components/dashboard-content";
import { readLocationsFile } from "@/lib/data/locations";
import {
  persistReadings,
  enrichReadingsWithHistory,
} from "@/lib/data/pressure-history";
import { Location, PressureReading } from "@/types/location";

// Force dynamic rendering to ensure fresh data on refresh
export const dynamic = 'force-dynamic';

// This is a Server Component by default
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ compare?: string }>;
}) {
  const params = await searchParams;
  const locationsData = await readLocationsFile();
  const locations = locationsData.locations;
  const homeLocationId = locationsData.homeLocationId;
  const homeLocation = locations.find((loc) => loc.id === homeLocationId)!;

  // Parse selected comparison locations from URL or use defaults from settings
  const defaultCompareIds = locationsData.dashboardLocationIds || ["sba", "smx", "dag"];
  const compareIds = params.compare
    ? params.compare.split(",").slice(0, 3)
    : defaultCompareIds;

  const compareLocations = compareIds
    .map((id) => locations.find((loc) => loc.id === id))
    .filter(Boolean) as Location[];

  // Fetch pressure data for all locations (resilient to individual failures)
  // Always request 24 hours of history so the chart is fully seeded on first load.
  const allLocations = [homeLocation, ...compareLocations];
  const start = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const results = await fetchMSLPForLocationsSettled(allLocations, { start });

  // Build a map of successful readings by locationId
  const readingsByLocation = new Map<string, PressureReading>();
  const failedStations: string[] = [];
  for (const result of results) {
    if (result.status === "success" && result.data) {
      readingsByLocation.set(result.locationId, result.data);
    } else {
      failedStations.push(result.locationName);
    }
  }

  // Persist fresh readings to the 24-hour history store, then enrich
  // each reading's timeSeries with the full accumulated history.
  const successfulReadings = [...readingsByLocation.values()];
  const history = await persistReadings(successfulReadings);
  enrichReadingsWithHistory(successfulReadings, history);

  // Fire-and-forget: fetch remaining locations to build their history too.
  // This does NOT block the page render.
  const fetchedIds = new Set(allLocations.map((l) => l.id));
  const remainingLocations = locations.filter((l) => !fetchedIds.has(l.id));
  if (remainingLocations.length > 0) {
    fetchMSLPForLocationsSettled(remainingLocations, { start })
      .then((bgResults) => {
        const bgReadings = bgResults
          .filter((r): r is typeof r & { data: PressureReading } => r.status === "success" && !!r.data)
          .map((r) => r.data);
        if (bgReadings.length > 0) {
          return persistReadings(bgReadings);
        }
      })
      .catch((err) => {
        console.warn("[Background fetch] Error seeding remaining locations:", err);
      });
  }

  const homePressure = readingsByLocation.get(homeLocation.id);

  // Filter compare locations to only those with successful readings
  const successfulCompareLocations = compareLocations.filter((loc) =>
    readingsByLocation.has(loc.id)
  );
  const comparePressures = successfulCompareLocations.map(
    (loc) => readingsByLocation.get(loc.id)!
  );

  // Calculate gradients (only for locations with data)
  const gradients = homePressure
    ? calculateMultipleGradients(
        homeLocation,
        homePressure,
        successfulCompareLocations,
        comparePressures
      )
    : [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        {homePressure ? (
          <DashboardContent
            homeLocation={homeLocation}
            homePressure={homePressure}
            gradients={gradients}
            failedStations={failedStations}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-destructive text-lg font-semibold">
              Unable to fetch pressure data for home location ({homeLocation.name}).
            </p>
            <p className="text-muted-foreground mt-2">
              The NOAA METAR API may be temporarily unavailable. Please try refreshing.
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
