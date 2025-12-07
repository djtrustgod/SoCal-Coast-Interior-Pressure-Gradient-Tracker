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
import { Plus, Trash2, MapPin, Pencil, Home, Eye, EyeOff, Bug, RefreshCw } from "lucide-react";
import { EditLocationDialog } from "@/components/edit-location-dialog";

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [homeLocationId, setHomeLocationId] = useState<string>("");
  const [dashboardLocationIds, setDashboardLocationIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [debugData, setDebugData] = useState<any>(null);
  const [debugLoading, setDebugLoading] = useState(false);

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
        setDashboardLocationIds(data.dashboardLocationIds || []);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async (updatedLocation: Location) => {
    try {
      const response = await fetch("/api/locations", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedLocation),
      });

      if (response.ok) {
        await fetchLocations();
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to update location");
      }
    } catch (error) {
      console.error("Error updating location:", error);
      throw error;
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

  const handleSetHome = async (locationId: string) => {
    const location = locations.find((loc) => loc.id === locationId);
    if (!location) return;

    if (!confirm(`Set ${location.name} as your home location?`)) {
      return;
    }

    try {
      const response = await fetch("/api/locations", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ homeLocationId: locationId }),
      });

      if (response.ok) {
        await fetchLocations();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error setting home location:", error);
      alert("Failed to set home location");
    }
  };

  const handleToggleDashboard = async (locationId: string) => {
    const newDashboardIds = dashboardLocationIds.includes(locationId)
      ? dashboardLocationIds.filter(id => id !== locationId)
      : dashboardLocationIds.length < 3
      ? [...dashboardLocationIds, locationId]
      : dashboardLocationIds;

    if (newDashboardIds.length === dashboardLocationIds.length && !dashboardLocationIds.includes(locationId)) {
      alert("Maximum 3 locations can be displayed on dashboard");
      return;
    }

    try {
      const response = await fetch("/api/locations", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dashboardLocationIds: newDashboardIds }),
      });

      if (response.ok) {
        await fetchLocations();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error updating dashboard locations:", error);
      alert("Failed to update dashboard locations");
    }
  };

  const fetchDebugData = async () => {
    setDebugLoading(true);
    try {
      const locationIds = locations.map(loc => loc.id).join(',');
      const response = await fetch(`/api/pressure?ids=${locationIds}`);
      const data = await response.json();
      setDebugData(data);
      setShowDebug(true);
    } catch (error) {
      console.error("Error fetching debug data:", error);
      alert("Failed to fetch API data");
    } finally {
      setDebugLoading(false);
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
                        {dashboardLocationIds.includes(location.id) && (
                          <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                            DASHBOARD
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
                    <div className="flex items-center gap-1">
                      {location.id !== homeLocationId && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSetHome(location.id)}
                            title="Set as Home"
                          >
                            <Home className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleDashboard(location.id)}
                            title={dashboardLocationIds.includes(location.id) ? "Remove from Dashboard" : "Add to Dashboard"}
                          >
                            {dashboardLocationIds.includes(location.id) ? (
                              <Eye className="h-4 w-4 text-primary" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(location)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
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
                        {dashboardLocationIds.includes(location.id) && (
                          <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                            DASHBOARD
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
                    <div className="flex items-center gap-1">
                      {location.id !== homeLocationId && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSetHome(location.id)}
                            title="Set as Home"
                          >
                            <Home className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleDashboard(location.id)}
                            title={dashboardLocationIds.includes(location.id) ? "Remove from Dashboard" : "Add to Dashboard"}
                          >
                            {dashboardLocationIds.includes(location.id) ? (
                              <Eye className="h-4 w-4 text-primary" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(location)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
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
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <EditLocationDialog
          location={editingLocation}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleSaveEdit}
        />

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
              • Select up to <strong>3 locations</strong> to display on the dashboard using the eye icon. Currently {dashboardLocationIds.length} selected.
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

        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bug className="h-5 w-5" />
                  Debug: API Raw Output
                </CardTitle>
                <CardDescription>
                  View raw MSLP data from Open-Meteo API for all locations
                </CardDescription>
              </div>
              <Button
                onClick={fetchDebugData}
                disabled={debugLoading}
                variant="outline"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${debugLoading ? "animate-spin" : ""}`} />
                {showDebug ? "Refresh" : "Load"} API Data
              </Button>
            </div>
          </CardHeader>
          {showDebug && debugData && (
            <CardContent>
              <div className="bg-muted p-4 rounded-lg overflow-auto max-h-[600px]">
                <pre className="text-xs font-mono">
                  {JSON.stringify(debugData, null, 2)}
                </pre>
              </div>
              {debugData.readings && (
                <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {debugData.readings.map((reading: any) => {
                    const location = locations.find(l => l.id === reading.locationId);
                    return (
                      <Card key={reading.locationId}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">
                            {location?.name || reading.locationId}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {location?.code}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Pressure:</span>
                            <span className="font-medium">{reading.pressure.toFixed(1)} hPa</span>
                          </div>
                          {reading.temperature !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Temperature:</span>
                              <span className="font-medium">{reading.temperature.toFixed(1)}°C</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Timestamp:</span>
                            <span className="font-medium text-xs">
                              {new Date(reading.timestamp).toLocaleString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                                timeZoneName: 'short'
                              })}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </main>
    </div>
  );
}
