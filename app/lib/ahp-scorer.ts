import { CropRequirement } from "./crop-database";
import { ParcelConstraintMetrics } from "./constraint-mask";

export interface AHPCriteriaScores {
  climateScore: number;
  moistureNdviScore: number;
  topographyScore: number;
  soilGroupScore: number;
  totalWeightedScore: number;
}

/**
 * Step 3: Scoring & AHP Multi-Criteria Weighting
 * คำนวณคะแนนตามค่าน้ำหนัก AHP สำหรับพืชที่ผ่านเกณฑ์การคัดกรอง
 */
export function calculateAHPCropScore(
  crop: CropRequirement,
  parcel: ParcelConstraintMetrics & { ndviValue: number; region: string }
): AHPCriteriaScores {
  // 1. Climate Score (30% weight) - Rainfall & Temperature
  let rainfallScore = 100;
  if (
    parcel.annualRainfallMm < crop.ideal_rainfall_min ||
    parcel.annualRainfallMm > crop.ideal_rainfall_max
  ) {
    const diff = Math.min(
      Math.abs(parcel.annualRainfallMm - crop.ideal_rainfall_min),
      Math.abs(parcel.annualRainfallMm - crop.ideal_rainfall_max)
    );
    rainfallScore = Math.max(20, 100 - (diff / 300) * 20);
  }
  const climateScore = rainfallScore;

  // 2. Moisture & NDVI Score (25% weight)
  let moistureScore = 100;
  if (
    parcel.soilMoisture < crop.ideal_moisture_min ||
    parcel.soilMoisture > crop.ideal_moisture_max
  ) {
    const diff = Math.min(
      Math.abs(parcel.soilMoisture - crop.ideal_moisture_min),
      Math.abs(parcel.soilMoisture - crop.ideal_moisture_max)
    );
    moistureScore = Math.max(30, 100 - diff * 3.0);
  }
  const ndviScore = Math.min(100, (parcel.ndviValue / crop.ideal_ndvi_min) * 90);
  const moistureNdviScore = moistureScore * 0.7 + ndviScore * 0.3;

  // 3. Topography Score (20% weight) - Slope & Elevation
  let slopeScore = 100;
  if (parcel.slopeDegrees > crop.max_slope) {
    const diff = parcel.slopeDegrees - crop.max_slope;
    slopeScore = Math.max(20, 100 - diff * 12.0);
  } else if (crop.min_slope && parcel.slopeDegrees < crop.min_slope) {
    slopeScore = 80;
  }

  let elevationScore = 100;
  if (
    parcel.elevationAmsl < crop.ideal_elevation_min ||
    parcel.elevationAmsl > crop.ideal_elevation_max
  ) {
    const diff = Math.min(
      Math.abs(parcel.elevationAmsl - crop.ideal_elevation_min),
      Math.abs(parcel.elevationAmsl - crop.ideal_elevation_max)
    );
    elevationScore = Math.max(40, 100 - (diff / 100) * 15);
  }
  const topographyScore = slopeScore * 0.7 + elevationScore * 0.3;

  // 4. Soil Group Compatibility Score (25% weight)
  let soilGroupScore = 60;
  if (crop.suitable_soil_groups_s1.includes(parcel.soilGroup.groupId)) {
    soilGroupScore = 100; // Perfect S1 Soil match
  } else if (crop.suitable_soil_groups_s2.includes(parcel.soilGroup.groupId)) {
    soilGroupScore = 80; // S2 Soil match
  } else if (crop.forbidden_soil_groups.includes(parcel.soilGroup.groupId)) {
    soilGroupScore = 20;
  }

  // AHP Weighted Synthesis: 30% Climate, 25% Moisture/NDVI, 20% Topography, 25% Soil Group
  const totalWeightedScore = Math.round(
    climateScore * 0.3 +
      moistureNdviScore * 0.25 +
      topographyScore * 0.2 +
      soilGroupScore * 0.25
  );

  return {
    climateScore: Math.round(climateScore),
    moistureNdviScore: Math.round(moistureNdviScore),
    topographyScore: Math.round(topographyScore),
    soilGroupScore: Math.round(soilGroupScore),
    totalWeightedScore: Math.max(30, Math.min(98, totalWeightedScore)),
  };
}
