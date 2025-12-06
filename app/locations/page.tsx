"use client";

import { useState, useEffect } from "react";
import { Location } from "@/types/location";
import { Header } from "@/components/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, MapPin } from "lucide-react";

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [homeLocationId, setHomeLocationId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await fetch("/api/locations");
      const data = await response.json();
      if (data.success) {
        setLocations(data.locations);
        setHomeLocationId(data.homeLocationId);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (locationId: string) => {
    if (locationId === homeLocationId) {
      alert("Cannot delete home location");
      return;
    }

    if (!confirm("Are you sure you want to delete this location?")) {
      return;
    }

    try {
      const response = await fetch(`/api/locations?id=${locationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchLocations();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error deleting location:", error);
      alert("Failed to delete location");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  const coastLocations = locations.filter((loc) => loc.type === "coast");
  const interiorLocations = locations.filter((loc) => loc.type === "interior");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold">Manage Locations</h2>
            <p className="text-muted-foreground">
              {locations.length} of 25 locations configured
            </p>
          </div>
          <Button disabled={locations.length >= 25}>
            <Plus className="mr-2 h-4 w-4" />
            Add Location
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-500" />
                Coastal Locations ({coastLocations.length})
              </CardTitle>
              <CardDescription>
                Locations along the Pacific Coast
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {coastLocations.map((location) => (
                  <div
                    key={location.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {location.name}
                        {location.id === homeLocationId && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                            HOME
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {location.code} • {location.latitude.toFixed(4)}°N,{" "}
                        {Math.abs(location.longitude).toFixed(4)}°W
                      </div>
                      {location.elevation !== undefined && (
                        <div className="text-xs text-muted-foreground">
                          Elevation: {location.elevation}m
                        </div>
                      )}
                    </div>
                    {location.id !== homeLocationId && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(location.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-orange-500" />
                Interior Locations ({interiorLocations.length})
              </CardTitle>
              <CardDescription>
                Locations inland from the coast
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {interiorLocations.map((location) => (
                  <div
                    key={location.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {location.name}
                        {location.id === homeLocationId && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                            HOME
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {location.code} • {location.latitude.toFixed(4)}°N,{" "}
                        {Math.abs(location.longitude).toFixed(4)}°W
                      </div>
                      {location.elevation !== undefined && (
                        <div className="text-xs text-muted-foreground">
                          Elevation: {location.elevation}m
                        </div>
                      )}
                    </div>
                    {location.id !== homeLocationId && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(location.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              • The <strong>Home Location</strong> (currently{" "}
              {locations.find((l) => l.id === homeLocationId)?.name}) is used as
              the reference point for all pressure gradient calculations.
            </p>
            <p>
              • You can have up to <strong>25 locations</strong> configured at
              once.
            </p>
            <p>
              • <strong>Coastal locations</strong> are typically used to measure
              marine influence, while <strong>interior locations</strong> help
              identify offshore flow patterns.
            </p>
            <p>
              • To add a new location, click the "Add Location" button and
              provide the required details including coordinates.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
