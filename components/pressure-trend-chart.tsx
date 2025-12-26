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

export function PressureTrendChart({
  compareTimeSeries,
  homeTimeSeries,
  locationName,
  homeLocationName,
}: PressureTrendChartProps) {
  const { theme, systemTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  // Prepare chart data
  const chartData = compareTimeSeries.time.map((time, index) => {
    const dataPoint: any = {
      time,
      compareLocation: compareTimeSeries.pressure[index],
    };

    // Add home location data if available
    if (homeTimeSeries && homeTimeSeries.time[index] === time) {
      dataPoint.homeLocation = homeTimeSeries.pressure[index];
    }

    return dataPoint;
  });

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
    return `${value.toFixed(1)} hPa`;
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
            domain={["auto", "auto"]}
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
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
