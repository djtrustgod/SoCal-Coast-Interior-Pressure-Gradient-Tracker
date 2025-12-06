import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { Location } from "@/types/location";
import { z } from "zod";

const LocationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  code: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  type: z.enum(["coast", "interior"]),
  elevation: z.number().optional(),
});

const locationsFilePath = path.join(process.cwd(), "data", "locations.json");

async function readLocationsFile() {
  const fileContents = await fs.readFile(locationsFilePath, "utf8");
  return JSON.parse(fileContents);
}

async function writeLocationsFile(data: any) {
  await fs.writeFile(locationsFilePath, JSON.stringify(data, null, 2), "utf8");
}

// GET all locations
export async function GET() {
  try {
    const data = await readLocationsFile();
    return NextResponse.json({
      success: true,
      locations: data.locations,
      homeLocationId: data.homeLocationId,
    });
  } catch (error) {
    console.error("Error reading locations:", error);
    return NextResponse.json(
      { error: "Failed to read locations" },
      { status: 500 }
    );
  }
}

// POST - Add a new location
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedLocation = LocationSchema.parse(body);

    const data = await readLocationsFile();

    // Check if location already exists
    if (data.locations.some((loc: Location) => loc.id === validatedLocation.id)) {
      return NextResponse.json(
        { error: "Location with this ID already exists" },
        { status: 400 }
      );
    }

    // Check max locations (25)
    if (data.locations.length >= 25) {
      return NextResponse.json(
        { error: "Maximum of 25 locations allowed" },
        { status: 400 }
      );
    }

    data.locations.push(validatedLocation);
    await writeLocationsFile(data);

    return NextResponse.json({
      success: true,
      location: validatedLocation,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid location data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error adding location:", error);
    return NextResponse.json(
      { error: "Failed to add location" },
      { status: 500 }
    );
  }
}

// PUT - Update a location
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedLocation = LocationSchema.parse(body);

    const data = await readLocationsFile();
    const index = data.locations.findIndex(
      (loc: Location) => loc.id === validatedLocation.id
    );

    if (index === -1) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    data.locations[index] = validatedLocation;
    await writeLocationsFile(data);

    return NextResponse.json({
      success: true,
      location: validatedLocation,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid location data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating location:", error);
    return NextResponse.json(
      { error: "Failed to update location" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a location
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const locationId = searchParams.get("id");

    if (!locationId) {
      return NextResponse.json(
        { error: "Location ID is required" },
        { status: 400 }
      );
    }

    const data = await readLocationsFile();

    // Prevent deleting home location
    if (locationId === data.homeLocationId) {
      return NextResponse.json(
        { error: "Cannot delete home location" },
        { status: 400 }
      );
    }

    const initialLength = data.locations.length;
    data.locations = data.locations.filter(
      (loc: Location) => loc.id !== locationId
    );

    if (data.locations.length === initialLength) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    await writeLocationsFile(data);

    return NextResponse.json({
      success: true,
      message: "Location deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting location:", error);
    return NextResponse.json(
      { error: "Failed to delete location" },
      { status: 500 }
    );
  }
}
