/**
 * Validate Aura Farm's active FAO criteria against LDD Zoning reference points.
 * Requests are deliberately sequential: one polygon is completed and saved before
 * the following request begins.
 *
 * Usage after compilation:
 * node temp/ldd-validator/validate_ldd_points.js temp/ldd_validation_points_130.csv temp/ldd_validation_results.csv
 */

import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { evaluateFaoExcelCriteria } from "../../app/lib/fao-excel-criteria";

type Row = Record<string, string>;
type Grade = "S1" | "S2" | "S3" | "N";

const [, , inputPath, outputPath] = process.argv;
if (!inputPath || !outputPath) throw new Error("Usage: node validate_ldd_points.js INPUT.csv OUTPUT.csv");

const parseCsv = (text: string): Row[] => {
  const [header, ...lines] = text.trim().split(/\r?\n/);
  const columns = header.split(",");
  return lines.filter(Boolean).map((line) => Object.fromEntries(columns.map((column, index) => {
    const value = line.split(",")[index] ?? "";
    return [column.replaceAll('"', ""), value.replace(/^"|"$/g, "").replaceAll('""', '"')];
  })));
};
const csvValue = (value: string | number | boolean | null | undefined) => String(value ?? "").replaceAll('"', '""');
const rank: Record<Grade, number> = { N: 0, S3: 1, S2: 2, S1: 3 };

async function main() {
  const rows = parseCsv(readFileSync(inputPath, "utf8"));
  const headers = [
    ...Object.keys(rows[0]), "system_grade", "system_grade_source", "is_water", "is_built_up",
    "land_use_label", "ndvi", "slope_degrees", "annual_rainfall_mm", "soil_ph", "temperature_c",
    "elevation_m", "exact_match", "within_one_grade", "status", "error",
  ];
  const completedIds = new Set<string>();
  const completedRows = new Map<string, Row>();
  if (existsSync(outputPath)) {
    for (const prior of parseCsv(readFileSync(outputPath, "utf8"))) {
      if (prior.status === "completed" && !completedRows.has(prior.test_id)) {
        completedIds.add(prior.test_id);
        completedRows.set(prior.test_id, prior);
      }
    }
  }
  // Rebuild the output before resuming so an interrupted duplicate run cannot
  // leave duplicate test rows in the final validation dataset.
  writeFileSync(outputPath, `${headers.join(",")}\n`, "utf8");
  for (const row of rows) {
    const prior = completedRows.get(row.test_id);
    if (prior) appendFileSync(outputPath, `${headers.map((header) => `"${csvValue(prior[header])}"`).join(",")}\n`, "utf8");
  }

  for (let index = 0; index < rows.length; index += 1) {
  const row = rows[index];
  if (completedIds.has(row.test_id)) {
    console.log(`${index + 1}/${rows.length} ${row.test_id}: already completed`);
    continue;
  }
  const polygon = [
    [Number(row.lat_min), Number(row.lon_min)], [Number(row.lat_min), Number(row.lon_max)],
    [Number(row.lat_max), Number(row.lon_max)], [Number(row.lat_max), Number(row.lon_min)],
  ];
  let output: Record<string, string | number | boolean | null | undefined> = { ...row, status: "error" };
  try {
    // GEE occasionally waits indefinitely for a single location.  A failed
    // point must not prevent the remaining validation set from completing.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000);
    const response = await fetch("http://localhost:8000/api/v1/analyze-gee", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ polygon, days_history: 180 }), signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const isWater = Boolean(data.is_water);
    const isBuiltUp = Boolean(data.is_built_up);
    const evaluation = evaluateFaoExcelCriteria(row.crop_id, {
      slopeDegrees: Number(data.slope_degrees), rainfallMm: Number(data.annual_rainfall_mm),
      ph: Number(data.soil_ph), temperatureC: Number(data.lst_temp_celsius), altitudeM: Number(data.elevation_m),
    });
    const systemGrade: Grade | "" = isWater || isBuiltUp ? "N" : evaluation?.faoClass ?? "";
    const referenceGrade = row.ldd_grade as Grade;
    output = {
      ...row, system_grade: systemGrade, system_grade_source: isWater || isBuiltUp ? "hard_mask" : "FAO criteria",
      is_water: isWater, is_built_up: isBuiltUp, land_use_label: data.land_use_label,
      ndvi: data.mean_ndvi, slope_degrees: data.slope_degrees, annual_rainfall_mm: data.annual_rainfall_mm,
      soil_ph: data.soil_ph, temperature_c: data.lst_temp_celsius, elevation_m: data.elevation_m,
      exact_match: systemGrade === referenceGrade, within_one_grade: systemGrade ? Math.abs(rank[systemGrade] - rank[referenceGrade]) <= 1 : false,
      status: "completed", error: "",
    };
  } catch (error) {
    output.error = error instanceof Error ? error.message : String(error);
  }
    appendFileSync(outputPath, `${headers.map((header) => `"${csvValue(output[header])}"`).join(",")}\n`, "utf8");
    console.log(`${index + 1}/${rows.length} ${row.test_id}: ${output.status} ${output.system_grade ?? ""}`);
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
