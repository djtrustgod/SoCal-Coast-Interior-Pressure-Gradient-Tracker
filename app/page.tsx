import { fetchMSLPForLocations } from "@/lib/api/open-meteo";
import { calculateMultipleGradients } from "@/lib/calculations/gradient";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LocationSelector } from "@/components/location-selector";
import { DashboardContent } from "@/components/dashboard-content";
import { Location } from "@/types/location";
import { promises as fs } from "fs";
import path from "path";

async function readLocationsFile() {
  const locationsFilePath = path.join(process.cwd(), "data", "locations.json");
  const fileContents = await fs.readFile(locationsFilePath, "utf8");
  return JSON.parse(fileContents);
}

// Force dynamic rendering to always read fresh data from locations.json
export const dynamic = 'force-dynamic';

// This is a Server Component by default
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ compare?: string }>;
}) {
  const params = await searchParams;
  const locationsData = await readLocationsFile();
  const locations = locationsData.locations as Location[];
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

  // Fetch pressure data for all locations
  const allLocations = [homeLocation, ...compareLocations];
  const pressureReadings = await fetchMSLPForLocations(allLocations);

  const homePressure = pressureReadings[0];
  const comparePressures = pressureReadings.slice(1);

  // Calculate gradients
  const gradients = calculateMultipleGradients(
    homeLocation,
    homePressure,
    compareLocations,
    comparePressures
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <DashboardContent
          homeLocation={homeLocation}
          homePressure={homePressure}
          gradients={gradients}
        />
      </main>
      <Footer />
    </div>
  );
}
