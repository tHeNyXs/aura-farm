import { NextRequest, NextResponse } from "next/server";
import { analyzeLandParcel } from "@/app/lib/ai-analyzer";
import { saveAnalysisResult } from "@/app/lib/analysis-store";
import { fetchRealSatelliteScene } from "@/app/lib/services/satellite-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { polygon, location_name } = body;

    if (!polygon || !Array.isArray(polygon) || polygon.length < 3) {
      return NextResponse.json(
        {
          error: "Invalid polygon geometry. At least 3 coordinate pairs required.",
        },
        { status: 400 }
      );
    }

    // Calculate center coordinates
    const avgLat = polygon.reduce((sum: number, p: number[]) => sum + p[0], 0) / polygon.length;
    const avgLng = polygon.reduce((sum: number, p: number[]) => sum + p[1], 0) / polygon.length;

    // Generate coordinate-encoded unique ID
    const generatedId = `geo-${avgLat.toFixed(4)}_${avgLng.toFixed(4)}_${Date.now()}`;

    // Execute Live Geospatial & Remote Sensing APIs concurrently
    const [osmResResult, satelliteResult] = await Promise.allSettled([
      // 1. High-zoom OSM Land-use & Building Reverse Geocode (zoom=18)
      (async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${avgLat}&lon=${avgLng}&format=json&zoom=18&addressdetails=1`,
          {
            headers: { "User-Agent": "AuraFarm-LandEvaluation-v2.0" },
            signal: controller.signal,
          }
        );
        clearTimeout(timeoutId);
        if (res.ok) return await res.json();
        return null;
      })(),

      // Live GEE satellite layers: Sentinel-2, Sentinel-1, DEM, CHIRPS, MODIS, WorldCover
      fetchRealSatelliteScene(avgLat, avgLng, polygon),
    ]);

    const realSatellite = satelliteResult.status === "fulfilled" ? satelliteResult.value : undefined;

    // Enforce Strict Real GEE Satellite Requirement: No Fake Synthesized Data Allowed
    if (!realSatellite || !realSatellite.isRealData || realSatellite.source !== "google_earth_engine") {
      return NextResponse.json(
        {
          error: "⚠️ ไม่สามารถดึงข้อมูลดาวเทียมสดจาก Google Earth Engine ได้ในขณะนี้ กรุณาตรวจสอบว่าเปิดรัน Python GEE Server บน Port 8000 (http://127.0.0.1:8000/health) แล้วและล็อกอินผ่าน ee.Authenticate() เรียบร้อยแล้ว",
        },
        { status: 503 }
      );
    }

    let osmFeature: any = null;
    let resolvedLocationName = location_name;

    if (osmResResult.status === "fulfilled" && osmResResult.value) {
      const osmData = osmResResult.value;
      const addr = osmData.address || {};
      
      osmFeature = {
        class: osmData.class,
        type: osmData.type,
        addresstype: osmData.addresstype,
        name: osmData.name,
        display_name: osmData.display_name,
        road: addr.road,
        neighbourhood: addr.neighbourhood,
        suburb: addr.suburb,
        quarter: addr.quarter,
        city: addr.city,
        town: addr.town,
        village: addr.village,
        hamlet: addr.hamlet,
        building: addr.building || (osmData.class === "building" ? "yes" : undefined),
        amenity: addr.amenity || (osmData.class === "amenity" ? osmData.type : undefined),
      };

      if (!resolvedLocationName && osmData.display_name) {
        const parts = osmData.display_name.split(",");
        resolvedLocationName = parts.slice(0, 3).join(", ");
      }
    }

    const { annual_rainfall_mm, lst_temp_celsius, soil_moisture_pct, elevation_m, slope_degrees } = realSatellite;
    if (
      annual_rainfall_mm === undefined ||
      lst_temp_celsius === undefined ||
      soil_moisture_pct === undefined ||
      elevation_m === undefined ||
      slope_degrees === undefined
    ) {
      return NextResponse.json(
        { error: "ข้อมูลชั้นวิเคราะห์จากดาวเทียมไม่ครบ จึงไม่สามารถประเมินผลได้" },
        { status: 503 }
      );
    }

    const realClimate = {
      annualRainfallMm: annual_rainfall_mm,
      averageTempCelsius: lst_temp_celsius,
      surfaceSoilMoisturePct: soil_moisture_pct,
      isRealData: true,
    };
    const realElevation = {
      elevationAmsl: elevation_m,
      slopeDegrees: slope_degrees,
      isRealData: true,
    };

    // Execute 2-Level AI Land Evaluation Engine
    const { result, rankedCrops } = analyzeLandParcel({
      polygon,
      location_name: resolvedLocationName,
      custom_id: generatedId,
      osm_feature: osmFeature,
      real_climate: realClimate,
      real_elevation: realElevation,
      real_satellite: realSatellite,
    });

    // Check if area exceeds maximum allowed 200 Rai
    if (result.area_size.rai > 200) {
      return NextResponse.json(
        {
          error: `ขนาดแปลงที่ดิน (${result.area_size.rai} ไร่) เกินเกณฑ์สูงสุด 200 ไร่ กรุณาแบ่งเป็นแปลงย่อยเพื่อความแม่นยำในการวิเคราะห์`,
        },
        { status: 400 }
      );
    }

    // Save to runtime and disk store
    saveAnalysisResult(result, rankedCrops);

    return NextResponse.json({
      success: true,
      analysis_id: result.id,
      result,
      rankedCrops,
    });
  } catch (error: any) {
    console.error("AI Analysis Engine Error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to analyze land parcel.",
      },
      { status: 500 }
    );
  }
}

