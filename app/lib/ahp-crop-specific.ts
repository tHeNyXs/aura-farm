import { CropRequirement } from "./crop-database";
import { ParcelConstraintMetrics } from "./constraint-mask";
import { OverallLandSuitabilityLevel1 } from "./types";

export interface AHPCropSpecificScores {
  baselineOverallScore: number;
  cropThresholdScore: number;
  totalCropScore: number;
  limitingFactors: string[];
}

/**
 * Level 2 - Crop-specific Suitability Evaluation
 * Filters & adjusts Level 1 Overall Land Suitability Index with crop-specific threshold requirements
 */
export function calculateLevel2CropSuitability(
  crop: CropRequirement,
  parcel: ParcelConstraintMetrics & { ndviValue: number; region: string; soilPh: number },
  overallLevel1: OverallLandSuitabilityLevel1
): AHPCropSpecificScores {
  const limitingFactors: string[] = [];

  // Start with Level 1 Overall Index as the baseline land quality (0-100%)
  const baselineOverallScore = overallLevel1.indexPercentage;

  // 1. Slope Threshold Specific Evaluation
  let slopeScore = 100;
  if (crop.id.includes("rice")) {
    // Rice Paddy: 0-2% slope is ideal. Steep slopes penalize heavily.
    if (parcel.slopeDegrees > 2.0) {
      slopeScore = Math.max(10, 100 - (parcel.slopeDegrees - 2.0) * 20.0);
      limitingFactors.push(`ความลาดชัน ${parcel.slopeDegrees.toFixed(1)}° สูงกว่าเกณฑ์ทำนาข้าว (เหมาะที่สุด 0-2°)`);
    }
  } else if (crop.id.includes("cassava") || crop.id.includes("sugarcane") || crop.id.includes("corn")) {
    // Cassava & Upland crops: Tolerates up to 5-8% slope
    if (parcel.slopeDegrees > crop.max_slope) {
      slopeScore = Math.max(20, 100 - (parcel.slopeDegrees - crop.max_slope) * 12.0);
      limitingFactors.push(`ความลาดชัน ${parcel.slopeDegrees.toFixed(1)}° เกินเกณฑ์พืชไร่ (รับได้ถึง ${crop.max_slope}°)`);
    }
  } else {
    if (parcel.slopeDegrees > crop.max_slope) {
      slopeScore = Math.max(20, 100 - (parcel.slopeDegrees - crop.max_slope) * 15.0);
      limitingFactors.push(`ความลาดชัน ${parcel.slopeDegrees.toFixed(1)}° เกินเกณฑ์พืช (${crop.max_slope}°)`);
    }
  }

  // 2. Soil pH Threshold Specific Evaluation
  let phScore = 100;
  const phMin = crop.id.includes("cassava") ? 4.5 : 5.5;
  const phMax = crop.id.includes("cassava") ? 6.5 : 7.0;

  if (parcel.soilPh < phMin || parcel.soilPh > phMax) {
    const diff = Math.min(Math.abs(parcel.soilPh - phMin), Math.abs(parcel.soilPh - phMax));
    phScore = Math.max(30, 100 - diff * 25.0);
    limitingFactors.push(`ค่าความเป็นกรด-ด่างดิน pH ${parcel.soilPh.toFixed(1)} ไม่ตรงเกณฑ์เหมาะที่สุด (${phMin}-${phMax})`);
  }

  // 3. Water & Irrigation / Flooding Threshold
  let waterScore = 100;
  if (crop.id.includes("rice")) {
    // Rice paddy requires high moisture / water retention / irrigation
    if (parcel.soilMoisture < 50) {
      waterScore = Math.max(20, 100 - (50 - parcel.soilMoisture) * 2.5);
      limitingFactors.push(`ความชื้นผิวดิน ${parcel.soilMoisture}% ต่ำเกินไปสำหรับนาข้าว (ข้าวน้ำขังต้องการ >50%)`);
    }
  } else if (crop.id.includes("cassava") || crop.id.includes("durian")) {
    // Cassava & Durian dislike waterlogging / poorly drained soils
    if (parcel.soilMoisture > 78 || parcel.soilGroup.drainage === "poorly_drained") {
      waterScore = 40;
      limitingFactors.push(`พื้นที่น้ำขังแฉะระบายน้ำเลว เสี่ยงต่อโรครากเน่าโคนเน่า`);
    }
  }

  // 4. Land Use Compatibility
  let landUseScore = 100;
  if (overallLevel1.normalized_criteria.land_use_norm < 0.2) {
    landUseScore = 15;
    limitingFactors.push("การใช้ที่ดินเดิมเป็นพื้นที่สิ่งปลูกสร้าง/หลังคา ไม่เหมาะสำหรับปลูกลงดิน");
  }

  // 5. Temperature Threshold
  let tempScore = 100;
  if (crop.id.includes("rice")) {
    if (parcel.surfaceTempCelsius < 20 || parcel.surfaceTempCelsius > 36) {
      tempScore = 60;
      limitingFactors.push(`อุณหภูมิ ${parcel.surfaceTempCelsius}°C ไม่อยู่ในช่วง 20-35°C`);
    }
  }

  // Crop-Specific Threshold Factor Average (30% weight) combined with Level 1 Baseline (70% weight)
  const cropSpecificFactorAvg = (slopeScore * 0.3 + phScore * 0.25 + waterScore * 0.25 + landUseScore * 0.1 + tempScore * 0.1);

  let totalCropScore = Math.round(baselineOverallScore * 0.65 + cropSpecificFactorAvg * 0.35);

  if (overallLevel1.fao_class === "N" || overallLevel1.normalized_criteria.land_use_norm < 0.2) {
    totalCropScore = 15;
  }

  return {
    baselineOverallScore,
    cropThresholdScore: Math.round(cropSpecificFactorAvg),
    totalCropScore: Math.max(15, Math.min(98, totalCropScore)),
    limitingFactors,
  };
}
