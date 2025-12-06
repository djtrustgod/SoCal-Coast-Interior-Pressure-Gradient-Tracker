import { fetchMSLPForLocations } from "@/lib/api/open-meteo";
import { calculateMultipleGradients } from "@/lib/calculations/gradient";
import { Header } from "@/components/header";
import { GradientCard } from "@/components/gradient-card";
import { LocationSelector } from "@/components/location-selector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import locationsData from "@/data/locations.json";
import { Location } from "@/types/location";
import { format } from "date-fns";

// This is a Server Component by default
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ compare?: string }>;
}) {
  const params = await searchParams;
  const locations = locationsData.locations as Location[];
  const homeLocationId = locationsData.homeLocationId;
  const homeLocation = locations.find((loc) => loc.id === homeLocationId)!;

  // Parse selected comparison locations from URL or use defaults
  const defaultCompareIds = ["sba", "smx", "dag"];
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
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Home Location: {homeLocation.name}</CardTitle>
              <CardDescription>
                Current MSLP: {homePressure.pressure.toFixed(1)} hPa
                <br />
                Last Updated: {format(new Date(homePressure.timestamp), "PPpp")}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
          {gradients.map((gradient) => (
            <GradientCard key={gradient.compareLocation.id} gradient={gradient} />
          ))}
        </div>

        {gradients.length === 0 && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No comparison locations selected. Select locations below to view
                pressure gradients.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>About Pressure Gradients</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>Positive values (offshore flow):</strong> Higher pressure
                inland creates winds flowing from land to ocean. Common during
                Santa Ana wind events.
              </p>
              <p>
                <strong>Negative values (onshore flow):</strong> Higher pressure
                over the ocean creates winds flowing from ocean to land. Typical
                during normal conditions.
              </p>
              <p>
                <strong>Interpretation:</strong> Larger absolute values indicate
                stronger pressure gradients and potentially stronger winds.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
