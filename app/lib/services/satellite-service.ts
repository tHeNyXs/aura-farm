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

  // 2. Fallback to Microsoft Planetary Computer STAC API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const delta = 0.01;
    const bbox = [lng - delta, lat - delta, lng + delta, lat + delta];

    const res = await fetch(
      "https://planetarycomputer.microsoft.com/api/stac/v1/search",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collections: ["sentinel-2-l2a"],
          bbox,
          limit: 1,
          query: {
            "eo:cloud_cover": { lt: 25 },
          },
        }),
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const feature = data.features?.[0];

      if (feature) {
        const cloudCover = feature.properties?.["eo:cloud_cover"] || 10;
        const datetime = feature.properties?.datetime || new Date().toISOString();
        const dateStr = datetime.split("T")[0];

        return {
          satelliteId: feature.id,
          cloudCoverPct: Number(cloudCover.toFixed(1)),
          captureDate: dateStr,
          estimatedNdvi: 0.68,
          ndbi_value: -0.15,
          isRealData: false,
          isRealSatelliteScene: true,
          source: "stac_satellite",
        };
      }
    }
  } catch (err) {
    console.warn("Satellite STAC fallback:", err);
  }

  // 3. Synthesized fallback
  return {
    satelliteId: "S2_MSIL2A_FALLBACK",
    cloudCoverPct: 8.5,
    captureDate: new Date().toLocaleDateString("th-TH"),
    estimatedNdvi: 0.65,
    ndbi_value: -0.15,
    isRealData: false,
    isRealSatelliteScene: false,
    source: "synthesized",
  };
}
