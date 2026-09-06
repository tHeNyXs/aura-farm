export type FAOSuitabilityClass = "S1" | "S2" | "S3" | "N";

export interface SoilGroupInfo {
  groupId: number;
  nameTh: string;
  nameEn: string;
  texture: string;
  drainage: "poorly_drained" | "somewhat_poorly_drained" | "moderately_well_drained" | "well_drained" | "somewhat_excessively_drained";
  drainageTh: string;
  depthCm: number;
  depthTh: string;
  phRange: [number, number];
  phLabel: string;
  fertility: "ต่ำ" | "ปานกลาง" | "สูง";
  description: string;
  suitableCrops: string[];
}

export interface OverallLandSuitabilityLevel1 {
  indexScore: number; // 0.00 - 1.00 (e.g. 0.78)
  indexPercentage: number; // 0 - 100% (e.g. 78%)
  fao_class: FAOSuitabilityClass;
  fao_label: string;
  ahp_weights: {
    soil_potential?: number;
    water_resources?: number;
    climate?: number;
    terrain?: number;
    [key: string]: number | undefined;
  };
  consistency_ratio: number; // CR value (e.g., 0.0192 < 0.10)
  cr_passed: boolean;
  normalized_criteria: {
    [key: string]: number;
  };
  summary_th: string;
  ndbi_value?: number; // Layer 9: NDBI (Pre-filter/Hard mask layer)
  is_built_up_masked?: boolean;
  is_water_masked?: boolean;
}

export interface OAEBenchmarkValidation {
  crop_id: string;
  crop_name: string;
  oae_average_yield_kg_rai: number;
  estimated_yield_kg_rai: number;
  yield_match_status: "สอดคล้องกับสถิติ สศก. (เกรด S1)" | "สอดคล้องกับสถิติ สศก. (เกรด S2)" | "ต่ำกว่าเกณฑ์ สศก.";
  citation: string;
}

export interface AnalysisResult {
  id: string;
  location_name: string;
  coordinates: {
    lat: number;
    lng: number;
    formatted: string;
  };
  area_size: {
    rai: number;
    ha: number;
    sqm: number;
  };
  analyzed_date: string;

  // Level 1: Overall Land Suitability Index (General baseline score S = SUM(wi * xi) or Built-up NDBI Hard Mask)
  overall_land_suitability: OverallLandSuitabilityLevel1;

  // Display compatibility properties
  suitability_score: number; // Level 1 score in % (e.g. 78)
  status_label: "เหมาะสมมาก" | "ปานกลาง" | "ต้องปรับปรุง";
  status_color: string;
  fao_class: FAOSuitabilityClass;
  fao_label: string;

  ndvi_value: number;
  ndbi_value?: number; // Layer 9: NDBI Pre-filter
  is_built_up_masked?: boolean;
  is_water_masked?: boolean;
  ndvi_trend: { month: string; value: number }[];
  soil_moisture: number;
  slope_degrees: number;
  elevation_amsl: number;
  surface_temp: number;
  rainfall_mm: number;
  soil_ph: number;
  land_use_class: string;
  soil_group: SoilGroupInfo;
  insight_text: string;
  polygon_geojson?: any;
  oae_validations?: OAEBenchmarkValidation[];
}

export interface Crop {
  id: string;
  name: string;
  category: "พืชไร่ / ธัญพืช" | "ไม้ผลเศรษฐกิจ" | "ไม้ยืนต้น / อุตสาหกรรม" | "พืชผัก / สมุนไพร";
  icon_emoji: string;
  image_url: string;
  fao_class: FAOSuitabilityClass;
  fao_label: string;
  match_percentage: number;
  growth_duration: string;
  water_requirement: "ต่ำ" | "ปานกลาง" | "สูง";
  water_level: 1 | 2 | 3;
  estimated_yield: string;
  ideal_temperature_range: string;
  best_season: string;
  soil_preference: string;
  description: string;
  pros: string[];
  cautions: string[];
  limiting_factors?: string[];
  is_masked_out?: boolean;
  mask_reason?: string;
  source_citation?: string;
  oae_yield_benchmark?: string;
  /** Retained for response compatibility; results now use the supplied FAO workbook. */
  ldd_data_available?: boolean;
}

export interface RecentSurvey {
  id: string;
  name: string;
  subdistrict: string;
  lat: number;
  lng: number;
  coords_formatted: string;
  area_rai: number;
  area_ha: number;
  status: string;
  bounds?: [[number, number], [number, number]];
  polygon?: [number, number][];
}
