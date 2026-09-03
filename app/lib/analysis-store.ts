import { AnalysisResult, Crop } from "./types";
import { analyzeLandParcel } from "./ai-analyzer";
import { fetchRealSatelliteScene } from "./services/satellite-service";

type StoredAnalysis = { result: AnalysisResult; rankedCrops: Crop[] };

declare global {
  var __aura_analysis_store: Map<string, StoredAnalysis> | undefined;
}

const memoryStore = globalThis.__aura_analysis_store ?? new Map<string, StoredAnalysis>();
globalThis.__aura_analysis_store = memoryStore;

export function saveAnalysisResult(result: AnalysisResult, rankedCrops: Crop[]): void {
  memoryStore.set(result.id, { result, rankedCrops });
}

/** Rebuilds a result using only live GEE layers when a serverless instance changes. */
async function analyzeFromSatellite(id: string, polygon: [number, number][]): Promise<StoredAnalysis> {
  const lat = polygon.reduce((sum, point) => sum + point[0], 0) / polygon.length;
  const lng = polygon.reduce((sum, point) => sum + point[1], 0) / polygon.length;
  const satellite = await fetchRealSatelliteScene(lat, lng, polygon);

  if (
    !satellite.isRealData ||
    satellite.source !== "google_earth_engine" ||
    satellite.soil_moisture_pct === undefined ||
    satellite.elevation_m === undefined ||
    satellite.slope_degrees === undefined ||
    satellite.annual_rainfall_mm === undefined ||
    satellite.lst_temp_celsius === undefined
  ) {
    throw new Error("ไม่พบข้อมูลดาวเทียมจริงที่ครบถ้วนสำหรับแสดงผลวิเคราะห์");
  }

  const computed = analyzeLandParcel({
    polygon,
    custom_id: id,
    real_satellite: satellite,
    real_climate: {
      annualRainfallMm: satellite.annual_rainfall_mm,
      averageTempCelsius: satellite.lst_temp_celsius,
      surfaceSoilMoisturePct: satellite.soil_moisture_pct,
      isRealData: true,
    },
    real_elevation: {
      elevationAmsl: satellite.elevation_m,
      slopeDegrees: satellite.slope_degrees,
      isRealData: true,
    },
  });
  saveAnalysisResult(computed.result, computed.rankedCrops);
  return computed;
}

/**
 * Never creates an approximate/default result. A polygon is required to
 * restore an analysis in a different Vercel serverless instance.
 */
export async function getAnalysisById(
  id: string,
  polygon?: [number, number][]
): Promise<StoredAnalysis | null> {
  const stored = memoryStore.get(id);
  if (stored) return stored;
  if (!polygon || polygon.length < 3) return null;
  return analyzeFromSatellite(id, polygon);
}
