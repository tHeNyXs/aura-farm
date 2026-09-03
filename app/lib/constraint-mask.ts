import { CropRequirement } from "./crop-database";
import { SoilGroupInfo } from "./types";

export interface ParcelConstraintMetrics {
  slopeDegrees: number;
  soilMoisture: number;
  elevationAmsl: number;
  annualRainfallMm: number;
  surfaceTempCelsius: number;
  ndviValue?: number;
  soilGroup: SoilGroupInfo;
}

export interface MaskResult {
  isMaskedOut: boolean;
  maskReason?: string;
  limitingFactors: string[];
}

/**
 * Step 2: Spatial Overlay & Constraint Masking (Boolean Logic)
 * ตัดพืชที่ไม่สามารถปลูกได้ในสภาพแวดล้อมนั้นออกทันทีด้วยกฎ Boolean Logic
 */
export function evaluateCropConstraints(
  crop: CropRequirement,
  parcel: ParcelConstraintMetrics
): MaskResult {
  const limitingFactors: string[] = [];
  let isMaskedOut = false;
  let maskReason = "";

  // 0. Urban Built-up Area / Concrete Mask (พื้นที่ชุมชน/ตึกอาคาร)
  if (parcel.soilGroup.groupId === 99) {
    const reason = `พื้นที่ตั้งอยู่ในเขตเมือง/สิ่งปลูกสร้าง (ตึกอาคาร คอนกรีต) ไม่มีผิวดินเปิดสำหรับการเพาะปลูก`;
    limitingFactors.push(reason);
    return {
      isMaskedOut: true,
      maskReason: reason,
      limitingFactors,
    };
  }

  // 0.1 Water Body Mask (พื้นที่แหล่งน้ำ/แม่น้ำ/ทะเล)
  if (parcel.soilGroup.groupId === 98) {
    const reason = `พื้นที่เป็นแหล่งน้ำหรืออ่างเก็บน้ำ ไม่สามารถเพาะปลูกพืชบกได้`;
    limitingFactors.push(reason);
    return {
      isMaskedOut: true,
      maskReason: reason,
      limitingFactors,
    };
  }

  // 1. Slope Constraint (เกณฑ์ความลาดชัน)
  if (parcel.slopeDegrees > crop.max_slope) {
    const reason = `ความลาดชัน (${parcel.slopeDegrees.toFixed(1)}°) เกินเกณฑ์สูงสุดที่พืชรับได้ (${crop.max_slope}°)`;
    limitingFactors.push(reason);
    
    // Hard mask if slope is excessively steep for flatland/machinery crops
    if (parcel.slopeDegrees > crop.max_slope + 4.0 || (crop.max_slope <= 3.5 && parcel.slopeDegrees > 7.0)) {
      isMaskedOut = true;
      maskReason = reason;
    }
  }

  // 2. Minimum Slope Constraint (เช่น ทุเรียน ต้องการความลาดเทเพื่อระบายน้ำ)
  if (crop.min_slope && parcel.slopeDegrees < crop.min_slope && parcel.soilMoisture > 75) {
    const reason = `พื้นที่ราบเรียบเกินไป เสี่ยงต่อการมีน้ำท่วมขังหรือแฉะโคนต้น`;
    limitingFactors.push(reason);
  }

  // 3. Soil Group Compatibility Check
  if (crop.forbidden_soil_groups.includes(parcel.soilGroup.groupId)) {
    const reason = `สภาพดินใน${parcel.soilGroup.nameTh} มีข้อจำกัดต่อพืชชนิดนี้ (${parcel.soilGroup.drainageTh}) ต้องปรับปรุงโครงสร้างแปลง`;
    limitingFactors.push(reason);
  }

  // 4. Acid Sulfate Soils (ดินเปรี้ยวจัด กลุ่มชุดดินที่ 11)
  if (parcel.soilGroup.groupId === 11 && !crop.suitable_soil_groups_s1.includes(11) && !crop.suitable_soil_groups_s2.includes(11)) {
    const reason = `ดินมีสภาพเป็นกรดจัด (pH ${parcel.soilGroup.phRange.join("-")}) ต้องใส่ปูนโดโลไมต์ปรับสภาพดิน`;
    limitingFactors.push(reason);
  }

  // 5. Waterlogging & Root Rot Risk (น้ำท่วมขัง)
  if (parcel.soilMoisture > 80 && crop.ideal_moisture_max <= 65) {
    const reason = `ความชื้นในดินค่อนข้างสูง (${parcel.soilMoisture}%) เสี่ยงต่อโรครากเน่าหากไม่ยกร่องระบายน้ำ`;
    limitingFactors.push(reason);
    if (parcel.soilMoisture > 90) {
      isMaskedOut = true;
      maskReason = reason;
    }
  }

  // 6. Extreme Drought & Sandy Soil Risk (ดินทรายจัดขาดน้ำ)
  if (parcel.soilGroup.groupId === 17 && crop.ideal_moisture_min >= 60) {
    const reason = `ดินทรายจัดไม่อุ้มน้ำ จำเป็นต้องติดตั้งระบบน้ำหยดเพื่อให้น้ำสม่ำเสมอ`;
    limitingFactors.push(reason);
  }

  // 7. Elevation mismatch (ความสูงเกินเกณฑ์ เช่น กาแฟอาราบิก้า / อะโวคาโด บนที่ราบต่ำ)
  if (parcel.elevationAmsl < crop.ideal_elevation_min && crop.ideal_elevation_min >= 500) {
    const reason = `ระดับความสูง (${parcel.elevationAmsl} ม.) ต่ำกว่าเกณฑ์ที่พืชเมืองหนาว/ที่สูงต้องการ (${crop.ideal_elevation_min} ม.)`;
    limitingFactors.push(reason);
    isMaskedOut = true;
    maskReason = reason;
  }

  return {
    isMaskedOut,
    maskReason,
    limitingFactors,
  };
}
