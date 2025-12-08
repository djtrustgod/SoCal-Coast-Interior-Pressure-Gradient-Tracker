import { NextRequest, NextResponse } from "next/server";
import { fetchMSLPForLocations } from "@/lib/api/open-meteo";
import locationsData from "@/data/locations.json";
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

    const locations = locationsData.locations as Location[];
    const requestedLocations = locationIds
      .map((id) => locations.find((loc) => loc.id === id))
      .filter(Boolean) as Location[];

    if (requestedLocations.length === 0) {
      return NextResponse.json(
        { error: "No valid locations found" },
        { status: 404 }
      );
    }

    const pressureReadings = await fetchMSLPForLocations(requestedLocations);

    return NextResponse.json({
      success: true,
      data: pressureReadings,
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
