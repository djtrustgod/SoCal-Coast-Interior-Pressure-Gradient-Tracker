import { fetchMSLPForLocationsSettled } from "@/lib/api/metar";
import { calculateMultipleGradients } from "@/lib/calculations/gradient";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LocationSelector } from "@/components/location-selector";
import { DashboardContent } from "@/components/dashboard-content";
import { readLocationsFile } from "@/lib/data/locations";
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
  const allLocations = [homeLocation, ...compareLocations];
  const results = await fetchMSLPForLocationsSettled(allLocations);

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
