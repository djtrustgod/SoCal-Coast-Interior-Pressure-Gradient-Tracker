"use client";

import { useState } from "react";
import { Location } from "@/types/location";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface LocationSelectorProps {
  locations: Location[];
  selectedIds: string[];
  homeLocationId: string;
  onSelectionChange: (ids: string[]) => void;
  maxSelections?: number;
}

export function LocationSelector({
  locations,
  selectedIds,
  homeLocationId,
  onSelectionChange,
  maxSelections = 3,
}: LocationSelectorProps) {
  const availableLocations = locations.filter(
    (loc) => loc.id !== homeLocationId && !selectedIds.includes(loc.id)
  );

  const handleSelect = (index: number, locationId: string) => {
    const newSelection = [...selectedIds];
    newSelection[index] = locationId;
    onSelectionChange(newSelection.filter(Boolean));
  };

  const handleClear = (index: number) => {
    const newSelection = [...selectedIds];
    newSelection.splice(index, 1);
    onSelectionChange(newSelection);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compare Locations</CardTitle>
        <CardDescription>
          Select up to {maxSelections} locations to compare with{" "}
          {locations.find((l) => l.id === homeLocationId)?.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: maxSelections }).map((_, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground w-8">
              {index + 1}.
            </span>
            <Select
              value={selectedIds[index] || ""}
              onValueChange={(value) => handleSelect(index, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a location..." />
              </SelectTrigger>
              <SelectContent>
                {availableLocations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name} ({location.code}) - {location.type}
                  </SelectItem>
                ))}
                {selectedIds[index] && (
                  <SelectItem value={selectedIds[index]}>
                    {
                      locations.find((l) => l.id === selectedIds[index])
                        ?.name
                    }{" "}
                    (
                    {locations.find((l) => l.id === selectedIds[index])?.code})
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {selectedIds[index] && (
              <button
                onClick={() => handleClear(index)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
