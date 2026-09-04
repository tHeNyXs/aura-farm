import type { FAOSuitabilityClass } from "./types";

type Band = { s1: [number, number]; s2: [number, number]; s3: [number, number] };
type Criteria = { slope: Band; rainfall: Band; ph: Band; temperature?: Band; altitude?: Band };

// Transcribed from “เกณฑ์ความเหมาะสมที่ดิน_13พืชเศรษฐกิจ_FAO.xlsx”.
// Only factors that the application actually observes are evaluated.  Soil
// texture, drainage and depth remain ungraded until field measurements exist.
const band = (s1: [number, number], s2: [number, number], s3: [number, number]): Band => ({ s1, s2, s3 });
const common = (slope: Band, rainfall: Band, ph: Band, extras: Partial<Criteria> = {}): Criteria => ({ slope, rainfall, ph, ...extras });

export const FAO_EXCEL_CRITERIA: Record<string, Criteria> = {
  jasmine_rice: common(band([0, 2], [2, 5], [5, 8]), band([1200, 1800], [1000, 1200], [800, 1000]), band([5.5, 6.5], [4.5, 7.5], [4, 8.2])),
  lowland_rice: common(band([0, 2], [2, 5], [5, 8]), band([1200, 1800], [1000, 1200], [800, 1000]), band([5.5, 6.5], [4.5, 7.5], [4, 8.2])),
  rice: common(band([0, 2], [2, 5], [5, 8]), band([1200, 1800], [1000, 1200], [800, 1000]), band([5.5, 6.5], [4.5, 7.5], [4, 8.2])),
  cassava: common(band([0, 8], [8, 16], [16, 30]), band([1000, 1500], [800, 2000], [600, 2500]), band([5.5, 7], [4.8, 7.8], [4.2, 8.5])),
  sugarcane: common(band([0, 5], [5, 12], [12, 20]), band([1200, 1800], [1000, 2200], [800, 2500]), band([6, 7.5], [5, 8], [4.5, 8.5])),
  maize: common(band([0, 8], [8, 15], [15, 25]), band([750, 1200], [600, 1500], [500, 1800]), band([6, 7.2], [5.3, 7.8], [4.8, 8.3])),
  pineapple: common(band([0, 8], [8, 15], [15, 25]), band([1000, 1500], [800, 2000], [600, 2500]), band([4.5, 5.5], [4, 6.5], [3.5, 7.2])),
  rubber_tree: common(band([0, 16], [16, 30], [30, 45]), band([1800, 3000], [1500, 3500], [1250, 4000]), band([4.5, 6], [4, 6.8], [3.8, 7.5])),
  oil_palm: common(band([0, 8], [8, 15], [15, 24]), band([2000, 3500], [1750, 2000], [1500, 1750]), band([4.5, 5.5], [4, 6.5], [3.8, 7])),
  coconut: common(band([0, 8], [8, 15], [15, 25]), band([1500, 2500], [1250, 3000], [1000, 3500]), band([5.5, 7.5], [5, 8], [4.5, 8.5])),
  durian: common(band([0, 8], [8, 15], [15, 30]), band([2000, 3000], [1500, 3500], [1250, 4000]), band([5.5, 6.5], [5, 7.2], [4.5, 7.8]), { temperature: band([25, 32], [22, 35], [20, 37]) }),
  longan: common(band([0, 8], [8, 15], [15, 25]), band([1200, 2000], [1000, 2500], [800, 3000]), band([5.5, 6.8], [5, 7.5], [4.5, 8])),
  mangosteen: common(band([0, 8], [8, 15], [15, 25]), band([1800, 3000], [1500, 3500], [1200, 4000]), band([5.5, 6.5], [5, 7], [4.5, 7.5])),
  arabica_coffee: common(band([0, 8], [8, 15], [15, 30]), band([1500, 2200], [1200, 2800], [1000, 3200]), band([5.6, 6.6], [5, 7.3], [4.5, 7.8]), { altitude: band([1000, 1500], [800, 1800], [600, 2000]), temperature: band([16, 20], [15, 22], [14, 24]) }),
  robusta_coffee: common(band([0, 8], [8, 15], [15, 30]), band([2000, 3000], [1500, 3500], [1200, 4000]), band([5.6, 6.6], [5, 7.3], [4.5, 7.8]), { altitude: band([200, 700], [100, 900], [50, 1100]), temperature: band([22, 28], [20, 30], [18, 32]) }),
};

const priority: Record<FAOSuitabilityClass, number> = { S1: 4, S2: 3, S3: 2, N: 1 };
const labels: Record<FAOSuitabilityClass, string> = { S1: "เหมาะสมมาก (S1)", S2: "เหมาะสมปานกลาง (S2)", S3: "เหมาะสมน้อย (S3)", N: "ไม่แนะนำ (N)" };

function grade(value: number, ranges: Band): FAOSuitabilityClass {
  if (value >= ranges.s1[0] && value <= ranges.s1[1]) return "S1";
  if (value >= ranges.s2[0] && value <= ranges.s2[1]) return "S2";
  if (value >= ranges.s3[0] && value <= ranges.s3[1]) return "S3";
  return "N";
}

export function evaluateFaoExcelCriteria(id: string, values: { slopeDegrees: number; rainfallMm: number; ph: number; temperatureC: number; altitudeM: number }) {
  const criteria = FAO_EXCEL_CRITERIA[id];
  if (!criteria) return null;
  const slopePercent = Math.tan(values.slopeDegrees * Math.PI / 180) * 100;
  const factors: Array<[string, number, Band, string]> = [["ความลาดชัน", slopePercent, criteria.slope, "%"], ["ปริมาณฝนสะสมรายปี", values.rainfallMm, criteria.rainfall, " มม."], ["ค่า pH ดิน", values.ph, criteria.ph, ""]];
  if (criteria.temperature) factors.push(["อุณหภูมิเฉลี่ย", values.temperatureC, criteria.temperature, "°C"]);
  if (criteria.altitude) factors.push(["ความสูงจากระดับน้ำทะเล", values.altitudeM, criteria.altitude, " ม."]);
  const graded = factors.map(([name, value, ranges, unit]) => ({ name, value, unit, result: grade(value, ranges), s1: ranges.s1 }));
  const faoClass = graded.reduce<FAOSuitabilityClass>((worst, item) => priority[item.result] < priority[worst] ? item.result : worst, "S1");
  return { faoClass, label: labels[faoClass], score: { S1: 95, S2: 75, S3: 45, N: 0 }[faoClass], factors: graded, slopePercent };
}
