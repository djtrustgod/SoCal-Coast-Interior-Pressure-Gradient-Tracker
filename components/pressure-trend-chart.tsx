"use client";

import { useTheme } from "next-themes";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface PressureTrendChartProps {
  compareTimeSeries: {
    time: string[];
    pressure: number[];
  };
  homeTimeSeries?: {
    time: string[];
    pressure: number[];
  };
  locationName: string;
  homeLocationName?: string;
}

/**
 * Round a timestamp to the nearest hour for alignment between stations.
 * METAR stations report at different minutes (e.g., :53, :56),
 * so we normalize to the hour for chart alignment.
 */
function roundToHour(isoTime: string): string {
  const d = new Date(isoTime);
  if (d.getMinutes() >= 30) {
    d.setHours(d.getHours() + 1);
  }
  d.setMinutes(0, 0, 0);
  return d.toISOString();
}

export function PressureTrendChart({
  compareTimeSeries,
  homeTimeSeries,
  locationName,
  homeLocationName,
}: PressureTrendChartProps) {
  const { theme, systemTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  const now = new Date();
  const nowTimestamp = now.getTime();

  // Build a map of hourly-rounded compare data
  const compareByHour = new Map<string, number>();
  compareTimeSeries.time.forEach((t, i) => {
    if (new Date(t).getTime() <= nowTimestamp) {
      const hourKey = roundToHour(t);
      // Keep the latest observation for each hour
      compareByHour.set(hourKey, compareTimeSeries.pressure[i]);
    }
  });

  // Build a map of hourly-rounded home data
  const homeByHour = new Map<string, number>();
  if (homeTimeSeries) {
    homeTimeSeries.time.forEach((t, i) => {
      if (new Date(t).getTime() <= nowTimestamp) {
        const hourKey = roundToHour(t);
        homeByHour.set(hourKey, homeTimeSeries.pressure[i]);
      }
    });
  }

  // Merge both series on the union of hourly keys, sorted chronologically
  const allHourKeys = new Set([...compareByHour.keys(), ...homeByHour.keys()]);
  const sortedHours = [...allHourKeys].sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  // Count how many hourly data points each series actually has
  const compareDataPoints = compareByHour.size;
  const homeDataPoints = homeByHour.size;

  // Prepare chart data aligned by hour
  const chartData = sortedHours.map((hourKey) => {
    const dataPoint: Record<string, string | number | undefined> = {
      time: hourKey,
    };
    if (compareByHour.has(hourKey)) {
      dataPoint.compareLocation = compareByHour.get(hourKey);
    }
    if (homeByHour.has(hourKey)) {
      dataPoint.homeLocation = homeByHour.get(hourKey);
    }
    return dataPoint;
  });

  // Compute Y-axis domain from both data series with 1 mb padding
  const allPressures: number[] = [];
  for (const dp of chartData) {
    if (dp.compareLocation !== undefined) allPressures.push(dp.compareLocation as number);
    if (dp.homeLocation !== undefined) allPressures.push(dp.homeLocation as number);
  }
  const yMin = allPressures.length > 0 ? Math.floor(Math.min(...allPressures) - 1) : 1000;
  const yMax = allPressures.length > 0 ? Math.ceil(Math.max(...allPressures) + 1) : 1030;

  // Format time for X-axis (show only hour)
  const formatXAxis = (timeString: string) => {
    const date = new Date(timeString);
    const hour = date.getHours();
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}${ampm}`;
  };

  // Format tooltip
  const formatTooltip = (value: number | undefined) => {
    if (value === undefined) return "N/A";
    return `${value.toFixed(1)} mb`;
  };

  // Theme colors
  const colors = {
    text: isDark ? "#e5e7eb" : "#374151",
    grid: isDark ? "#374151" : "#e5e7eb",
    compareLine: isDark ? "#f97316" : "#ea580c",
    homeLine: isDark ? "#60a5fa" : "#3b82f6",
    background: isDark ? "#1f2937" : "#ffffff",
  };

  return (
    <div className="w-full mt-4">
      {compareDataPoints < 6 && compareDataPoints > 0 && (
        <p className="text-xs text-muted-foreground mb-2 italic">
          ⚠ Limited trend data for {locationName} ({compareDataPoints}/24 hours collected — history builds over time)
        </p>
      )}
      {homeTimeSeries && homeDataPoints < 6 && homeDataPoints > 0 && (
        <p className="text-xs text-muted-foreground mb-2 italic">
          ⚠ Limited trend data for {homeLocationName || "Home"} ({homeDataPoints}/24 hours collected)
        </p>
      )}
      {chartData.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">
          No historical data available
        </p>
      ) : (
      <ResponsiveContainer width="100%" height={256} minHeight={256}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
          <XAxis
            dataKey="time"
            tickFormatter={formatXAxis}
            stroke={colors.text}
            style={{ fontSize: "12px" }}
            tick={{ fill: colors.text }}
          />
          <YAxis
            stroke={colors.text}
            style={{ fontSize: "12px" }}
            tick={{ fill: colors.text }}
            domain={[yMin, yMax]}
            tickFormatter={(value) => value.toFixed(0)}
          />
          <Tooltip
            formatter={formatTooltip}
            labelFormatter={(label) => {
              const date = new Date(label);
              return date.toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                timeZoneName: "short",
              });
            }}
            contentStyle={{
              backgroundColor: colors.background,
              border: `1px solid ${colors.grid}`,
              borderRadius: "6px",
              color: colors.text,
            }}
          />
          {homeTimeSeries && (
            <Legend
              wrapperStyle={{ fontSize: "12px", color: colors.text }}
              iconType="line"
            />
          )}
          <Line
            type="monotone"
            dataKey="compareLocation"
            stroke={colors.compareLine}
            strokeWidth={2}
            dot={false}
            name={locationName}
            isAnimationActive={false}
            connectNulls
          />
          {homeTimeSeries && (
            <Line
              type="monotone"
              dataKey="homeLocation"
              stroke={colors.homeLine}
              strokeWidth={2}
              dot={false}
              name={homeLocationName || "Home"}
              isAnimationActive={false}
              connectNulls
            />
          )}
        </LineChart>
      </ResponsiveContainer>
      )}
    </div>
  );
}
