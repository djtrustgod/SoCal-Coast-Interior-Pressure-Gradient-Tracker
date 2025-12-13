import { promises as fs } from "fs";
import path from "path";
import { LocationSettings } from "@/types/location";

export const locationsFilePath = path.join(
  process.cwd(),
  "data",
  "locations.json"
);

export async function readLocationsFile(): Promise<LocationSettings> {
  const fileContents = await fs.readFile(locationsFilePath, "utf8");
  return JSON.parse(fileContents);
}

export async function writeLocationsFile(data: LocationSettings): Promise<void> {
  await fs.writeFile(
    locationsFilePath,
    JSON.stringify(data, null, 2),
    "utf8"
  );
}
