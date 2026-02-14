"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

import { GradientCard } from "@/components/gradient-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Location, PressureReading, PressureGradient } from "@/types/location";

interface DashboardContentProps {
  homeLocation: Location;
  homePressure: PressureReading;
  gradients: PressureGradient[];
  failedStations?: string[];
}

export function DashboardContent({
  homeLocation,
  homePressure,
  gradients,
  failedStations,
}: DashboardContentProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const intervalId = setInterval(() => {
      router.refresh();
    }, 5 * 60 * 1000); // 5 minutes in milliseconds

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [router]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    router.refresh();
    // Add a small delay to show the loading state
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <>
      {failedStations && failedStations.length > 0 && (
        <div className="mb-4 rounded-md border border-yellow-500/50 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-600 dark:text-yellow-400">
          <strong>Warning:</strong> Could not fetch data for: {failedStations.join(", ")}. These stations may be temporarily unavailable.
        </div>
      )}
      <div className="mb-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Home Location: {homeLocation.name}</CardTitle>
                <CardDescription>
                  Current MSLP: {homePressure.pressure.toFixed(1)} mb
                  <br />
                  Last Updated: {new Date(homePressure.timestamp).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    timeZoneName: 'short'
                  })}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
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
              <strong>Negative values with Coast as reference (offshore flow):</strong> Higher pressure
              inland creates winds flowing from land to ocean. Common during
              Santa Ana wind events.
            </p>
            <p>
              <strong>Positive values with Coast as reference (onshore flow):</strong> Higher pressure
              over the coast creates winds flowing from ocean to land. Typical
              during normal conditions.
            </p>
            <p>
              <strong>Interpretation:</strong> Larger absolute values indicate
              stronger pressure gradients and potentially stronger winds.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
