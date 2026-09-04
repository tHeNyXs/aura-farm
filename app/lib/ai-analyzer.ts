import * as turf from "@turf/turf";
import { AnalysisResult, Crop, FAOSuitabilityClass, OAEBenchmarkValidation } from "./types";
import { CROP_DATABASE, evaluateCropByLDDMatrix } from "./crop-database";
import { resolveSoilGroup, THAILAND_SOIL_GROUPS } from "./soil-groups-thailand";
import { evaluateCropConstraints } from "./constraint-mask";
import { calculateLevel1OverallLandSuitability } from "./ahp-overall";
import { calculateLevel2CropSuitability } from "./ahp-crop-specific";
import { validateWithOAEBenchmark } from "./oae-validator";
import { classifyFAOSuitability } from "./fao-classifier";

export interface AIAnalysisInput {
  polygon: [number, number][];
  location_name?: string;
  custom_id?: string;
  osm_feature?: {
    class?: string;
    type?: string;
    addresstype?: string;
    name?: string;
    display_name?: string;
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    quarter?: string;
    city?: string;
    town?: string;
    village?: string;
    hamlet?: string;
    building?: string;
    amenity?: string;
  };
  real_climate?: {
    annualRainfallMm: number;
    averageTempCelsius: number;
    surfaceSoilMoisturePct: number;
    isRealData: boolean;
  };
  real_elevation?: {
    elevationAmsl: number;
    slopeDegrees: number;
    isRealData: boolean;
  };
  real_satellite?: {
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
    zoning?: {
      available: boolean;
      source?: string;
      crops?: Array<{
        crop_id: string;
        official_grade: FAOSuitabilityClass | null;
        coverage_pct: number;
        area_share_pct: Record<FAOSuitabilityClass, number>;
      }>;
    };
    minNdvi?: number;
    maxNdvi?: number;
    isRealData?: boolean;
    isRealSatelliteScene?: boolean;
    source?: string;
  };
}

export type ThaiRegion = "central" | "north" | "northeast" | "south";

/**
 * Resolves Thai administrative region & climate baseline from coordinates
 */
export function resolveThaiRegion(lat: number, lng: number): {
  region: ThaiRegion;
  regionName: string;
  subdistrictGuess: string;
  defaultRainfall: number;
  baseTemp: number;
} {
  if (lat >= 13.5 && lat <= 14.1 && lng >= 100.3 && lng <= 100.9) {
    return {
      region: "central",
      regionName: "กรุงเทพมหานครและปริมณฑล",
      subdistrictGuess: "เขตพระนคร กรุงเทพมหานคร",
      defaultRainfall: 1300,
      baseTemp: 32.5,
    };
  }

  if (lat < 11.0) {
    return {
      region: "south",
      regionName: "ภาคใต้",
      subdistrictGuess: "อ.เมือง จ.สุราษฎร์ธานี",
      defaultRainfall: 1950,
      baseTemp: 28.5,
    };
  }
  if (lat > 17.5) {
    return {
      region: "north",
      regionName: "ภาคเหนือ",
      subdistrictGuess: "อ.แม่ริม จ.เชียงใหม่",
      defaultRainfall: 1350,
      baseTemp: 26.5,
    };
  }
  if (lng > 101.5) {
    return {
      region: "northeast",
      regionName: "ภาคตะวันออกเฉียงเหนือ",
      subdistrictGuess: "อ.เมือง จ.ขอนแก่น",
      defaultRainfall: 1200,
      baseTemp: 29.0,
    };
  }
  return {
    region: "central",
    regionName: "ภาคกลาง",
    subdistrictGuess: "อ.ศรีประจันต์ จ.สุพรรณบุรี",
    defaultRainfall: 1280,
    baseTemp: 30.2,
  };
}

/**
 * Core 2-Level GIS Multi-Criteria AI Land Evaluation Engine with Layer 9 NDBI Built-up Hard Mask
 */
export function analyzeLandParcel(input: AIAnalysisInput): {
  result: AnalysisResult;
  rankedCrops: Crop[];
} {
  const coords = input.polygon;
  if (!coords || coords.length < 3) {
    throw new Error("Polygon must have at least 3 vertices");
  }

  // 1. Spatial calculations via Turf.js
  const turfCoords = coords.map(([lat, lng]) => [lng, lat]);
  if (
    turfCoords[0][0] !== turfCoords[turfCoords.length - 1][0] ||
    turfCoords[0][1] !== turfCoords[turfCoords.length - 1][1]
  ) {
    turfCoords.push(turfCoords[0]);
  }
  const poly = turf.polygon([turfCoords]);
  const center = turf.center(poly);
  const centerLng = center.geometry.coordinates[0];
  const centerLat = center.geometry.coordinates[1];

  const sqm = Math.round(turf.area(poly));
  const rai = Number((sqm / 1600).toFixed(1));
  const ha = Number((sqm / 10000).toFixed(2));

  // 2. Geographic & Climatic resolution
  const regionInfo = resolveThaiRegion(centerLat, centerLng);
  
  // 3. Live Satellite Optical NDVI (Sentinel-2 10m) & Layer 9 NDBI
  const ndviValue = input.real_satellite?.estimatedNdvi ?? 0.68;
  const ndbiValue = input.real_satellite?.ndbi_value ?? (ndviValue < 0.20 ? 0.15 : -0.15);
  const mndwiValue = input.real_satellite?.mndwi_value;
  const isWaterBody =
    input.real_satellite?.land_use_code === 80 ||
    (mndwiValue !== undefined && mndwiValue > 0.10 && ndviValue < 0.10) ||
    // Fallback spectral rule when the composite's MNDWI is unavailable or
    // diluted at an edge pixel: open water is dark in NIR (low NDVI) and is
    // not bright in SWIR like the built-up hard-mask signature.
    (ndviValue < 0.05 && ndbiValue < 0.10);

  // 4. Live Satellite Elevation & Slope (SRTM DEM 30m)
  const elevationAmsl = input.real_elevation?.elevationAmsl ?? (regionInfo.region === "north" ? 310 : 15);
  const slopeDegrees = input.real_elevation?.slopeDegrees ?? (regionInfo.region === "north" ? 4.5 : 1.5);

  // 5. Live Satellite Climate & Moisture (Open-Meteo / ERA5 / CHIRPS / MODIS)
  const rainfallMm = input.real_climate?.annualRainfallMm ?? regionInfo.defaultRainfall;
  const surfaceTemp = input.real_climate?.averageTempCelsius ?? regionInfo.baseTemp;
  const soilMoisture = input.real_climate?.surfaceSoilMoisturePct ?? 58;

  // 6. Soil Group & Soil pH (LDD & SoilGrids)
  const soilGroup = resolveSoilGroup(centerLat, centerLng, slopeDegrees, elevationAmsl, soilMoisture, ndviValue, isWaterBody);
  const soilPh = Number(((soilGroup.phRange[0] + soilGroup.phRange[1]) / 2).toFixed(1));

  // 6-Month NDVI seasonal trend
  const ndviTrend = [
    { month: "มี.ค.", value: Number(Math.max(0.06, ndviValue - 0.08).toFixed(2)) },
    { month: "เม.ย.", value: Number(Math.max(0.05, ndviValue - 0.10).toFixed(2)) },
    { month: "พ.ค.", value: Number(Math.max(0.08, ndviValue - 0.04).toFixed(2)) },
    { month: "มิ.ย.", value: Number(Math.max(0.10, ndviValue - 0.02).toFixed(2)) },
    { month: "ก.ค.", value: Number(Math.min(0.92, ndviValue + 0.04).toFixed(2)) },
    { month: "ส.ค.", value: ndviValue },
  ];

  // =========================================================
  // LEVEL 1: NDBI Built-up Hard Mask Layer + AHP 8x8 Weighted Overlay
  // =========================================================
  const overallLevel1 = calculateLevel1OverallLandSuitability({
    slopeDegrees,
    soilPh,
    annualRainfallMm: rainfallMm,
    surfaceTempCelsius: surfaceTemp,
    ndviValue,
    ndbiValue,
    landUseClass: isWaterBody ? "Permanent water bodies" : input.real_satellite?.land_use_label || "Cropland",
    soilMoisturePct: soilMoisture,
    isBuiltUpOrRoof: false,
    isWaterBody,
  });

  const isBuiltUpMasked = Boolean(overallLevel1.is_built_up_masked);
  const isWaterMasked = Boolean(overallLevel1.is_water_masked);
  const landUseClass = isWaterMasked ? "Permanent water bodies" : isBuiltUpMasked ? "Built-up" : input.real_satellite?.land_use_label || "Cropland";

  // =========================================================
  // LEVEL 2: Crop-Specific Suitability (Filtered by Thresholds)
  // =========================================================
  const parcelMetrics = {
    slopeDegrees,
    soilMoisture,
    elevationAmsl,
    annualRainfallMm: rainfallMm,
    surfaceTempCelsius: surfaceTemp,
    ndviValue,
    soilGroup,
    soilPh,
  };

  const oaeValidations: OAEBenchmarkValidation[] = [];
  const zoningByCrop = new Map(
    input.real_satellite?.zoning?.available
      ? (input.real_satellite.zoning.crops || []).map((item) => [item.crop_id, item])
      : []
  );

  const rankedCrops: Crop[] = CROP_DATABASE.map((crop) => {
    // Evaluate crop with official LDD Maximum Limitation Matrix
    const lddResult = evaluateCropByLDDMatrix(crop, {
      slopeDegrees,
      soilPh,
      soilMoisture,
      annualRainfallMm: rainfallMm,
      elevationAmsl,
      soilGroupId: soilGroup.groupId,
      isBuiltUp: isBuiltUpMasked,
      isWaterBody: isWaterMasked,
    });
    const zoning = zoningByCrop.get(crop.id);
    const useOfficialZoning = Boolean(zoning?.official_grade && zoning.coverage_pct >= 50 && !isWaterMasked && !isBuiltUpMasked);
    const finalFaoClass = useOfficialZoning ? zoning!.official_grade! : lddResult.fao_class;
    const finalMatchPercentage = useOfficialZoning
      ? Math.round(zoning!.area_share_pct[finalFaoClass] || 0)
      : lddResult.match_percentage;
    const finalFaoLabel = useOfficialZoning
      ? ({ S1: "เหมาะสมมาก (S1)", S2: "เหมาะสมปานกลาง (S2)", S3: "เหมาะสมน้อย (S3)", N: "ไม่แนะนำ (N)" } as const)[finalFaoClass]
      : lddResult.fao_label;
    const zoningFactor = useOfficialZoning
      ? `LDD Zoning: ${finalFaoClass} ครอบคลุม ${zoning!.area_share_pct[finalFaoClass]}% ของแปลง`
      : input.real_satellite?.zoning?.available
      ? "LDD Zoning: ข้อมูลสำหรับพืชนี้ครอบคลุมแปลงไม่ถึง 50% จึงใช้ข้อมูลดาวเทียมประกอบ"
      : "LDD Zoning: ยังไม่มีข้อมูลสำหรับแปลงนี้ จึงใช้ข้อมูลดาวเทียมประกอบ";

    // OAE Yield Benchmark Validation
    const oaeVal = validateWithOAEBenchmark(crop.id, finalFaoClass);
    if (oaeVal) {
      oaeValidations.push(oaeVal);
    }

    const pros = isWaterMasked
      ? []
      : isBuiltUpMasked
      ? ["สามารถปรับใช้เป็นระบบเกษตรในเมือง (Urban Farming) ปลูกผักกระถาง หรือสวนผักดาดฟ้า"]
      : [...crop.pros_template];

    if (!isBuiltUpMasked && crop.suitable_soil_groups_s1.includes(soilGroup.groupId)) {
      pros.unshift(`สอดคล้องกับคุณสมบัติของ${soilGroup.nameTh} ในระดับสมบูรณ์แบบ`);
    }

    const cautions = [...crop.cautions_template];
    if (zoningFactor) cautions.unshift(zoningFactor);
    if (lddResult.limiting_factors.length > 0) {
      cautions.unshift(...lddResult.limiting_factors);
    }

    return {
      id: crop.id,
      name: crop.name,
      category: crop.category,
      icon_emoji: crop.icon_emoji,
      image_url: crop.image_url,
      fao_class: finalFaoClass,
      fao_label: finalFaoLabel,
      match_percentage: finalMatchPercentage,
      growth_duration: crop.growth_duration,
      water_requirement: crop.water_requirement,
      water_level: crop.water_level,
      estimated_yield: isBuiltUpMasked ? "ไม่แนะนำสำหรับการปลูกลงดิน" : crop.estimated_yield,
      ideal_temperature_range: crop.ideal_temperature_range,
      best_season: crop.best_season,
      soil_preference: crop.soil_preference,
      description: crop.description,
      pros,
      cautions,
      limiting_factors: lddResult.limiting_factors,
      is_masked_out: finalFaoClass === "N",
      mask_reason: finalFaoClass === "N" && useOfficialZoning
        ? "LDD Zoning จัดพื้นที่นี้เป็นไม่เหมาะสมสำหรับพืชชนิดนี้"
        : lddResult.mask_reason,
      source_citation: crop.source_citation,
      oae_yield_benchmark: oaeVal ? `สถิติ สศก.: ${oaeVal.estimated_yield_kg_rai} ${oaeVal.yield_match_status}` : undefined,
    };
  }).sort((a, b) => {
    const classPriority: Record<FAOSuitabilityClass, number> = {
      S1: 4,
      S2: 3,
      S3: 2,
      N: 1,
    };
    if (classPriority[a.fao_class] !== classPriority[b.fao_class]) {
      return classPriority[b.fao_class] - classPriority[a.fao_class];
    }
    return b.match_percentage - a.match_percentage;
  });

  const locationName =
    input.location_name || (isWaterMasked ? `พื้นที่แหล่งน้ำ (${rai} ไร่)` : isBuiltUpMasked ? `พื้นที่สิ่งปลูกสร้าง/อาคาร (${rai} ไร่)` : `แปลงสำรวจ ${regionInfo.regionName} (${rai} ไร่)`);
  const generatedId = input.custom_id || `geo-${centerLat.toFixed(4)}_${centerLng.toFixed(4)}_${Date.now()}`;

  const s1Count = rankedCrops.filter((c) => c.fao_class === "S1").length;
  const s2Count = rankedCrops.filter((c) => c.fao_class === "S2").length;
  const s3Count = rankedCrops.filter((c) => c.fao_class === "S3").length;
  const nCount = rankedCrops.filter((c) => c.fao_class === "N").length;

  const insightText = isWaterMasked
    ? `⚠️ พื้นที่นี้ตรวจพบเป็นแหล่งน้ำหรือพื้นที่ชุ่มน้ำถาวร${mndwiValue !== undefined ? ` (MNDWI = ${mndwiValue.toFixed(2)})` : ""} → ไม่แนะนำให้เพาะปลูกพืชบก (เกรด N)`
    : isBuiltUpMasked
    ? `⚠️ พื้นที่นี้ตรวจพบเป็นสิ่งปลูกสร้าง (อาคารคอนกรีต: NDBI = ${ndbiValue.toFixed(2)} > 0.10, NDVI = ${ndviValue.toFixed(2)} < 0.20) → ไม่ประเมินความเหมาะสมทางการเกษตร (เกรด N)`
    : `พื้นที่นี้เป็นพืชคลุมดิน / แปลงเกษตร (NDBI = ${ndbiValue.toFixed(2)}, NDVI = ${ndviValue.toFixed(2)}) → จำแนกพืชเศรษฐกิจหลัก ${rankedCrops.length} ชนิด: พบเกรด S1 (เหมาะสมมาก) ${s1Count} ชนิด, เกรด S2 (ปานกลาง) ${s2Count} ชนิด, เกรด S3 (มีข้อจำกัด) ${s3Count} ชนิด, เกรด N (ไม่แนะนำ) ${nCount} ชนิด ประเมินตามเกณฑ์ความต้องการพืชและปัจจัยจำกัดอิง FAO (1983) & LDD`;

  let statusLabel: "เหมาะสมมาก" | "ปานกลาง" | "ต้องปรับปรุง" = "เหมาะสมมาก";
  let statusColor = "#6B8E5A";
  if (overallLevel1.indexPercentage < 68 || isBuiltUpMasked || isWaterMasked) {
    statusLabel = "ต้องปรับปรุง";
    statusColor = "#9B1C1C";
  } else if (overallLevel1.indexPercentage < 80) {
    statusLabel = "ปานกลาง";
    statusColor = "#B4841F";
  }

  const result: AnalysisResult = {
    id: generatedId,
    location_name: locationName,
    coordinates: {
      lat: Number(centerLat.toFixed(4)),
      lng: Number(centerLng.toFixed(4)),
      formatted: `LAT: ${centerLat.toFixed(4)}° N, LON: ${centerLng.toFixed(4)}° E`,
    },
    area_size: {
      rai,
      ha,
      sqm,
    },
    analyzed_date: new Date().toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    overall_land_suitability: overallLevel1,
    suitability_score: overallLevel1.indexPercentage,
    status_label: statusLabel,
    status_color: statusColor,
    fao_class: overallLevel1.fao_class,
    fao_label: overallLevel1.fao_label,
    ndvi_value: ndviValue,
    ndbi_value: ndbiValue,
    is_built_up_masked: isBuiltUpMasked,
    is_water_masked: isWaterMasked,
    ndvi_trend: ndviTrend,
    soil_moisture: soilMoisture,
    slope_degrees: slopeDegrees,
    elevation_amsl: elevationAmsl,
    surface_temp: surfaceTemp,
    rainfall_mm: rainfallMm,
    soil_ph: soilPh,
    land_use_class: landUseClass,
    soil_group: soilGroup,
    insight_text: insightText,
    polygon_geojson: poly,
    oae_validations: oaeValidations,
  };

  return { result, rankedCrops };
}
