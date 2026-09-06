import { FAOSuitabilityClass } from "./types";

export interface FAOClassificationResult {
  faoClass: FAOSuitabilityClass;
  faoLabel: string;
  faoDescriptionTh: string;
  badgeBgColor: string;
  badgeTextColor: string;
}

/**
 * Step 4: FAO Suitability Classification (S1, S2, S3, N)
 * แปลงคะแนนรวมและการติด Mask เป็นระดับความเหมาะสม 4 ระดับตามมาตรฐาน FAO Framework for Land Evaluation
 */
export function classifyFAOSuitability(
  score: number,
  isMaskedOut: boolean
): FAOClassificationResult {
  // If Boolean constraint failed, classify as N immediately
  if (isMaskedOut || score < 50) {
    return {
      faoClass: "N",
      faoLabel: "ไม่เหมาะสม (N)",
      faoDescriptionTh: "สภาพพื้นที่หรือคุณสมบัติดินเป็นอุปสรรครุนแรง ไม่แนะนำให้ปลูก",
      badgeBgColor: "#FDE8E8",
      badgeTextColor: "#9B1C1C",
    };
  }

  if (score >= 85) {
    return {
      faoClass: "S1",
      faoLabel: "เหมาะสมมาก (S1)",
      faoDescriptionTh: "ตรงตามความต้องการของพืชเกือบ 100% ไม่มีข้อจำกัดรุนแรง ให้ผลผลิตสูงสุด",
      badgeBgColor: "#EBF5EB",
      badgeTextColor: "#22543D",
    };
  }

  if (score >= 70) {
    return {
      faoClass: "S2",
      faoLabel: "เหมาะสมปานกลาง (S2)",
      faoDescriptionTh: "ปลูกได้ดี มีข้อจำกัดเล็กน้อยที่สามารถจัดการได้ เช่น เพิ่มระบบน้ำหรือปรับปรุงดิน",
      badgeBgColor: "#FEF9E7",
      badgeTextColor: "#B4841F",
    };
  }

  return {
    faoClass: "S3",
    faoLabel: "เหมาะสมน้อย (S3)",
    faoDescriptionTh: "ปลูกได้แต่ผลผลิตอาจต่ำ หรือมีต้นทุนในการจัดการโครงสร้างแปลงสูง",
    badgeBgColor: "#FBF1E6",
    badgeTextColor: "#C05621",
  };
}
