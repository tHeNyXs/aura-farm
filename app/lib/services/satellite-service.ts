/**
 * Real Sentinel-2 Satellite STAC & Google Earth Engine (GEE) Service
 * ดึงข้อมูลดัชนีพืชพรรณ NDVI และ NDBI จาก Google Earth Engine (Python FastAPI)
 */

export interface RealSatelliteData {
  satelliteId: string;
  cloudCoverPct: number;
  captureDate: string;
  estimatedNdvi: number;
  ndbi_value?: number;
  mndwi_value?: number;
  land_use_code?: number;
  land_use_label?: string;
  soil_moisture_pct?: number;
  elevation_m?: number;
  slope_degrees?: number;
  annual_rainfall_mm?: number;
  lst_temp_celsius?: number;
  minNdvi?: number;
  maxNdvi?: number;
  isRealData: boolean;
  isRealSatelliteScene: boolean;
  source: "google_earth_engine" | "stac_satellite" | "synthesized";
}

export async function fetchRealSatelliteScene(
  lat: number,
  lng: number,
  polygon?: [number, number][]
): Promise<RealSatelliteData> {
  // 1. Try Live Google Earth Engine Python Service First (Port 8000 or Cloud Backend)
  if (polygon && polygon.length >= 3) {
    const backendBase = (process.env.PYTHON_BACKEND_URL || "").replace(/\/$/, "");
    const urls = [
      ...(backendBase ? [`${backendBase}/api/v1/analyze-gee`] : []),
      "http://127.0.0.1:8000/api/v1/analyze-gee",
      "http://localhost:8000/api/v1/analyze-gee",
    ];

    for (const url of urls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout for GEE Supercomputer calculations

        const geeRes = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ polygon, days_history: 180 }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (geeRes.ok) {
          const geeData = await geeRes.json();
          if (geeData.success && typeof geeData.mean_ndvi === "number") {
            console.log(`🛰️ [GEE Live Satellite] Real Sentinel-2 NDVI received from ${url}:`, geeData.mean_ndvi, "NDBI:", geeData.ndbi_value);
            return {
              satelliteId: "Sentinel-2 L2A (10m Pixel GEE)",
              cloudCoverPct: geeData.cloud_cover_pct || 10,
              captureDate: geeData.capture_date || new Date().toISOString().split("T")[0],
              estimatedNdvi: geeData.mean_ndvi,
              ndbi_value: geeData.ndbi_value,
              mndwi_value: geeData.mndwi_value,
              land_use_code: geeData.land_use_code,
              land_use_label: geeData.land_use_label,
              soil_moisture_pct: geeData.soil_moisture_pct,
              elevation_m: geeData.elevation_m,
              slope_degrees: geeData.slope_degrees,
              annual_rainfall_mm: geeData.annual_rainfall_mm,
              lst_temp_celsius: geeData.lst_temp_celsius,
              minNdvi: geeData.min_ndvi,
              maxNdvi: geeData.max_ndvi,
              isRealData: true,
              isRealSatelliteScene: true,
              source: "google_earth_engine",
            };
          }
        }
      } catch (err: any) {
        console.warn(`[GEE Satellite Fetch Warning] ${url}:`, err.message || err);
      }
    }
  }

  throw new Error("ไม่สามารถดึงข้อมูลดาวเทียมสดจาก Google Earth Engine ได้");
}
