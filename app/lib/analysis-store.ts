import fs from "fs";
import path from "path";
import { AnalysisResult, Crop } from "./types";
import { mockAnalysisResults, mockCrops } from "./mock-data";
import { analyzeLandParcel } from "./ai-analyzer";

// File-based persistence directory across Next.js worker processes
const CACHE_DIR = path.join(process.cwd(), ".aura_cache");
const CACHE_FILE = path.join(CACHE_DIR, "analyses.json");

// In-memory global fallback
declare global {
  var __aura_analysis_store:
    | Map<string, { result: AnalysisResult; rankedCrops: Crop[] }>
    | undefined;
}

if (!globalThis.__aura_analysis_store) {
  globalThis.__aura_analysis_store = new Map();
}

const memoryStore = globalThis.__aura_analysis_store;

function readDiskCache(): Record<string, { result: AnalysisResult; rankedCrops: Crop[] }> {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const raw = fs.readFileSync(CACHE_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error reading analysis disk cache:", err);
  }
  return {};
}

function writeDiskCache(id: string, data: { result: AnalysisResult; rankedCrops: Crop[] }): void {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    const current = readDiskCache();
    current[id] = data;
    fs.writeFileSync(CACHE_FILE, JSON.stringify(current, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing analysis disk cache:", err);
  }
}

/**
 * Saves a computed analysis to both memory and disk storage
 */
export function saveAnalysisResult(
  result: AnalysisResult,
  rankedCrops: Crop[]
): void {
  memoryStore.set(result.id, { result, rankedCrops });
  writeDiskCache(result.id, { result, rankedCrops });
}

/**
 * Retrieves an analysis result by ID or reconstructs from geometry
 */
export function getAnalysisById(
  id: string,
  fallbackPoly?: [number, number][]
): {
  result: AnalysisResult;
  rankedCrops: Crop[];
} {
  // 1. Check in-memory global store
  if (memoryStore.has(id)) {
    return memoryStore.get(id)!;
  }

  // 2. Check disk cache
  const diskCache = readDiskCache();
  if (diskCache[id]) {
    memoryStore.set(id, diskCache[id]);
    return diskCache[id];
  }

  // 3. Check pre-computed mock analyses
  if (mockAnalysisResults[id]) {
    return {
      result: mockAnalysisResults[id],
      rankedCrops: mockCrops,
    };
  }

  // 4. If fallback polygon is supplied via URL query params or ID
  if (fallbackPoly && fallbackPoly.length >= 3) {
    const computed = analyzeLandParcel({
      polygon: fallbackPoly,
      custom_id: id,
    });
    saveAnalysisResult(computed.result, computed.rankedCrops);
    return computed;
  }

  // 5. If ID contains encoded coordinates e.g. geo-18.7890_98.9870-...
  if (id.startsWith("geo-")) {
    const parts = id.replace("geo-", "").split("_");
    if (parts.length >= 2) {
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      if (!isNaN(lat) && !isNaN(lng)) {
        const delta = 0.002;
        const boxPoly: [number, number][] = [
          [lat - delta, lng - delta],
          [lat + delta, lng - delta],
          [lat + delta, lng + delta],
          [lat - delta, lng + delta],
        ];
        const computed = analyzeLandParcel({
          polygon: boxPoly,
          custom_id: id,
        });
        saveAnalysisResult(computed.result, computed.rankedCrops);
        return computed;
      }
    }
  }

  // 6. Default fallback
  const fallback = analyzeLandParcel({
    polygon: [
      [14.6235, 100.1365],
      [14.6248, 100.1442],
      [14.6172, 100.1456],
      [14.6161, 100.1378],
    ],
    custom_id: id,
    location_name: "แปลงสำรวจภาคกลาง",
  });

  saveAnalysisResult(fallback.result, fallback.rankedCrops);
  return fallback;
}
