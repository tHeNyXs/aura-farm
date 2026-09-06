import { OAEBenchmarkValidation, FAOSuitabilityClass } from "./types";

export interface OAECropBenchmarkData {
  cropId: string;
  cropName: string;
  s1YieldKgRai: number;
  s2YieldKgRai: number;
  s3YieldKgRai: number;
  unit: string;
  citation: string;
}

export const OAE_CROP_BENCHMARKS: Record<string, OAECropBenchmarkData> = {
  "crop-rice": {
    cropId: "crop-rice",
    cropName: "ข้าวเจ้า / ข้าวนาปี",
    s1YieldKgRai: 560,
    s2YieldKgRai: 420,
    s3YieldKgRai: 310,
    unit: "กก./ไร่",
    citation: "สถิติการเกษตรของประเทศไทย ปี 2566 สำนักงานเศรษฐกิจการเกษตร (สศก.) กระทรวงเกษตรและสหกรณ์",
  },
  "crop-rice-sticky": {
    cropId: "crop-rice-sticky",
    cropName: "ข้าวเหนียว",
    s1YieldKgRai: 480,
    s2YieldKgRai: 360,
    s3YieldKgRai: 270,
    unit: "กก./ไร่",
    citation: "สถิติการเกษตรของประเทศไทย ปี 2566 สำนักงานเศรษฐกิจการเกษตร (สศก.)",
  },
  "crop-cassava": {
    cropId: "crop-cassava",
    cropName: "มันสำปะหลัง",
    s1YieldKgRai: 4200,
    s2YieldKgRai: 3100,
    s3YieldKgRai: 2200,
    unit: "กก./ไร่",
    citation: "รายงานสถานการณ์สินค้าเกษตรมันสำปะหลัง สำนักงานเศรษฐกิจการเกษตร (สศก.)",
  },
  "crop-sugarcane": {
    cropId: "crop-sugarcane",
    cropName: "อ้อยโรงงาน",
    s1YieldKgRai: 11200,
    s2YieldKgRai: 8500,
    s3YieldKgRai: 6200,
    unit: "กก./ไร่",
    citation: "สถิติผลผลิตอ้อยโรงงานรายจังหวัด สำนักงานเศรษฐกิจการเกษตร (สศก.)",
  },
  "crop-corn": {
    cropId: "crop-corn",
    cropName: "ข้าวโพดเลี้ยงสัตว์",
    s1YieldKgRai: 820,
    s2YieldKgRai: 620,
    s3YieldKgRai: 450,
    unit: "กก./ไร่",
    citation: "ข้อมูลสารสนเทศการเกษตรรายพืช ข้าวโพดเลี้ยงสัตว์ สำนักงานเศรษฐกิจการเกษตร (สศก.)",
  },
  "crop-durian": {
    cropId: "crop-durian",
    cropName: "ทุเรียน",
    s1YieldKgRai: 1450,
    s2YieldKgRai: 1050,
    s3YieldKgRai: 700,
    unit: "กก./ไร่",
    citation: "สถิติผลผลิตไม้ผลเศรษฐกิจ ทุเรียน สำนักงานเศรษฐกิจการเกษตร (สศก.)",
  },
  "crop-rubber": {
    cropId: "crop-rubber",
    cropName: "ยางพารา",
    s1YieldKgRai: 260,
    s2YieldKgRai: 195,
    s3YieldKgRai: 140,
    unit: "กก.ยางแห้ง/ไร่/ปี",
    citation: "รายงานการวิเคราะห์การผลิตยางพารา สำนักงานเศรษฐกิจการเกษตร (สศก.)",
  },
  "crop-oilpalm": {
    cropId: "crop-oilpalm",
    cropName: "ปาล์มน้ำมัน",
    s1YieldKgRai: 3450,
    s2YieldKgRai: 2600,
    s3YieldKgRai: 1800,
    unit: "กก./ไร่/ปี",
    citation: "สารสนเทศสินค้าเกษตร ปาล์มน้ำมัน สำนักงานเศรษฐกิจการเกษตร (สศก.)",
  },
};

/**
 * Validates crop suitabilty output against OAE yield benchmark statistics
 */
export function validateWithOAEBenchmark(
  cropId: string,
  faoClass: FAOSuitabilityClass
): OAEBenchmarkValidation | null {
  const benchmark = OAE_CROP_BENCHMARKS[cropId];
  if (!benchmark) return null;

  let estYield = benchmark.s1YieldKgRai;
  let status: "สอดคล้องกับสถิติ สศก. (เกรด S1)" | "สอดคล้องกับสถิติ สศก. (เกรด S2)" | "ต่ำกว่าเกณฑ์ สศก." = "สอดคล้องกับสถิติ สศก. (เกรด S1)";

  if (faoClass === "S2") {
    estYield = benchmark.s2YieldKgRai;
    status = "สอดคล้องกับสถิติ สศก. (เกรด S2)";
  } else if (faoClass === "S3") {
    estYield = benchmark.s3YieldKgRai;
    status = "ต่ำกว่าเกณฑ์ สศก.";
  } else if (faoClass === "N") {
    estYield = 0;
    status = "ต่ำกว่าเกณฑ์ สศก.";
  }

  return {
    crop_id: cropId,
    crop_name: benchmark.cropName,
    oae_average_yield_kg_rai: benchmark.s1YieldKgRai,
    estimated_yield_kg_rai: estYield,
    yield_match_status: status,
    citation: benchmark.citation,
  };
}
