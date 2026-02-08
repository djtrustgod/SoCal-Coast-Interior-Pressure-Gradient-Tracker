import { NextRequest, NextResponse } from "next/server";
import { fetchMSLPForLocationsSettled } from "@/lib/api/metar";
import { readLocationsFile } from "@/lib/data/locations";
import { Location } from "@/types/location";

export const dynamic = 'force-dynamic';
export const revalidate = 300; // 5 minutes default

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const locationIds = searchParams.get("ids")?.split(",") || [];

    if (locationIds.length === 0) {
      return NextResponse.json(
        { error: "No location IDs provided" },
        { status: 400 }
      );
    }

    const locationsData = await readLocationsFile();
    const locations = locationsData.locations;
    const requestedLocations = locationIds
      .map((id) => locations.find((loc) => loc.id === id))
      .filter(Boolean) as Location[];

    if (requestedLocations.length === 0) {
      return NextResponse.json(
        { error: "No valid locations found" },
        { status: 404 }
      );
    }

    const results = await fetchMSLPForLocationsSettled(requestedLocations);

    const successData = results
      .filter((r) => r.status === "success" && r.data)
      .map((r) => r.data!);

    const errors = results
      .filter((r) => r.status === "error")
      .map((r) => ({ locationId: r.locationId, locationName: r.locationName, error: r.error }));

    return NextResponse.json({
      success: true,
      data: successData,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching pressure data:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch pressure data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
