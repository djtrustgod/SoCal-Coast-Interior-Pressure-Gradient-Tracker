"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorRetryProps {
  locationName: string;
}

const INITIAL_RETRY_SECONDS = 15;
const MAX_RETRY_SECONDS = 120;

export function ErrorRetry({ locationName }: ErrorRetryProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(INITIAL_RETRY_SECONDS);
  const [retryDelay, setRetryDelay] = useState(INITIAL_RETRY_SECONDS);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const doRetry = useCallback(() => {
    setIsRetrying(true);
    router.refresh();
    // After refresh, the server component will re-render.
    // If it still fails, this component remounts with fresh state,
    // but we store retry info to increase backoff.
    setTimeout(() => {
      setIsRetrying(false);
      setRetryCount((prev) => prev + 1);
      // Increase delay with backoff, capped at MAX_RETRY_SECONDS
      setRetryDelay((prev) => Math.min(prev * 1.5, MAX_RETRY_SECONDS));
      setCountdown(Math.min(retryDelay * 1.5, MAX_RETRY_SECONDS));
    }, 2000);
  }, [router, retryDelay]);

  // Countdown timer
  useEffect(() => {
    if (isRetrying) return;

    if (countdown <= 0) {
      doRetry();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, isRetrying, doRetry]);

  const handleManualRetry = () => {
    setCountdown(0);
  };

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-4">
          <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto" />
          <div>
            <p className="text-destructive text-lg font-semibold">
              Unable to fetch pressure data for home location ({locationName}).
            </p>
            <p className="text-muted-foreground mt-2 text-sm">
              The NOAA METAR API may be temporarily unavailable.
            </p>
          </div>

          {isRetrying ? (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Retrying…</span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Auto-retry in <span className="font-mono font-semibold text-foreground">{Math.ceil(countdown)}s</span>
              {retryCount > 0 && (
                <span className="ml-1">
                  (attempt {retryCount + 1})
                </span>
              )}
            </p>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRetry}
            disabled={isRetrying}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRetrying ? "animate-spin" : ""}`} />
            Retry Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
