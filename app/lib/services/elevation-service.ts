import * as turf from "@turf/turf";

/**
 * Real-time Elevation & Terrain Slope Service
 * ดึงระดับความสูงจากระดับน้ำทะเล (AMSL) และคำนวณความลาดชัน (Slope °) จริงของแปลงที่ดิน
 */

export interface RealElevationData {
  elevationAmsl: number;
  slopeDegrees: number;
  isRealData: boolean;
}

export async function fetchRealElevationAndSlope(
  polygon: [number, number][]
): Promise<RealElevationData> {
  try {
    if (!polygon || polygon.length < 3) {
      throw new Error("Invalid polygon");
    }

    // Sample points: Center + Up to 4 vertices
    const avgLat = polygon.reduce((sum, p) => sum + p[0], 0) / polygon.length;
    const avgLng = polygon.reduce((sum, p) => sum + p[1], 0) / polygon.length;

    const sampleCoords: [number, number][] = [
      [avgLat, avgLng],
      polygon[0],
      polygon[Math.floor(polygon.length / 3)],
      polygon[Math.floor((polygon.length * 2) / 3)],
    ];

    const locationsParam = sampleCoords
      .map(([lat, lng]) => `${lat.toFixed(5)},${lng.toFixed(5)}`)
      .join("|");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(
      `https://api.open-elevation.com/api/v1/lookup?locations=${locationsParam}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Open-Elevation HTTP error: ${res.status}`);
    }

    const data = await res.json();
    const results: { latitude: number; longitude: number; elevation: number }[] =
      data.results || [];

    if (results.length === 0) {
      throw new Error("No elevation results");
    }

    const centerElev = results[0].elevation;
    const vertexElevs = results.slice(1).map((r) => r.elevation);

    // Calculate real slope across polygon vertices
    let maxSlope = 1.0;
    if (vertexElevs.length >= 2) {
      const minEl = Math.min(...results.map((r) => r.elevation));
      const maxEl = Math.max(...results.map((r) => r.elevation));
      const deltaH = Math.abs(maxEl - minEl);

      // Estimate average horizontal diagonal distance of polygon via Turf
      const turfPoly = turf.polygon([
        [...polygon.map(([lat, lng]) => [lng, lat]), [polygon[0][1], polygon[0][0]]],
      ]);
      const bbox = turf.bbox(turfPoly);
      const diagDistMeters = Math.max(
        30,
        turf.distance(
          turf.point([bbox[0], bbox[1]]),
          turf.point([bbox[2], bbox[3]]),
          { units: "meters" }
        )
      );

      // Slope angle in degrees: arctan(deltaH / horizontalDistance)
      const slopeRadian = Math.atan(deltaH / diagDistMeters);
      const calcDegree = Number(((slopeRadian * 180) / Math.PI).toFixed(1));
      maxSlope = Math.max(0.5, Math.min(35, calcDegree));
    }

    return {
      elevationAmsl: Number(centerElev.toFixed(1)),
      slopeDegrees: Number(maxSlope.toFixed(1)),
      isRealData: true,
    };
  } catch (err) {
    console.warn("Elevation API fallback:", err);
    // Regional baseline fallback
    const avgLat = polygon.reduce((sum, p) => sum + p[0], 0) / polygon.length;
    const isNorth = avgLat > 17.5;
    return {
      elevationAmsl: isNorth ? 320 : 15,
      slopeDegrees: isNorth ? 4.5 : 1.5,
      isRealData: false,
    };
  }
}
