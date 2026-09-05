"""Create reproducible validation parcels sampled from LDD Zoning polygons.

The output is a reference dataset only. Aura Farm's current analysis does not
read LDD; these rows are used afterwards to compare the system grade against
an independent LDD reference grade.

Usage:
  python scripts/sample_ldd_validation_points.py temp/ldd_zoning.sqlite temp/ldd_validation_points.csv
  python scripts/sample_ldd_validation_points.py temp/ldd_zoning.sqlite temp/ldd_validation_points.csv --study-13-crops
"""

import argparse
import csv
import math
import random
import sqlite3
from pathlib import Path

from shapely import wkb


GRADES = ("S1", "S2", "S3", "N")
STANDARD_GRADE_COUNTS = {"S1": 3, "S2": 3, "S3": 2, "N": 2}
COFFEE_GRADE_COUNTS = {"S1": 2, "S2": 1, "S3": 1, "N": 1}
COFFEE_CROPS = {"arabica_coffee", "robusta_coffee"}
DISPLAY_NAMES = {
    "rice": "ข้าว", "cassava": "มันสำปะหลัง", "rubber_tree": "ยางพารา",
    "oil_palm": "ปาล์มน้ำมัน", "sugarcane": "อ้อยโรงงาน", "maize": "ข้าวโพดเลี้ยงสัตว์",
    "pineapple": "สับปะรดโรงงาน", "longan": "ลำไย", "rambutan": "เงาะ",
    "durian": "ทุเรียน", "mangosteen": "มังคุด", "coconut": "มะพร้าว",
    "arabica_coffee": "กาแฟอาราบิก้า", "robusta_coffee": "กาแฟโรบัสต้า",
}


def bbox_for_two_rai(lat: float, lng: float) -> tuple[float, float, float, float]:
    """Return a small ~2-rai testing rectangle centered on a point."""
    half_side_m = math.sqrt(3200) / 2
    lat_delta = half_side_m / 111_320
    lng_delta = half_side_m / (111_320 * math.cos(math.radians(lat)))
    return lat - lat_delta, lat + lat_delta, lng - lng_delta, lng + lng_delta


def choose_feature(
    conn: sqlite3.Connection, crop_id: str, grade: str, excluded_ids: set[int], rng: random.Random
):
    conditions = ["crop_id = ?", "suitability = ?"]
    params: list[object] = [crop_id, grade]
    if excluded_ids:
        placeholders = ", ".join("?" for _ in excluded_ids)
        conditions.append(f"id NOT IN ({placeholders})")
        params.extend(sorted(excluded_ids))
    where_clause = " AND ".join(conditions)
    count = conn.execute(
        f"SELECT COUNT(*) FROM zoning_features WHERE {where_clause}", params
    ).fetchone()[0]
    if not count:
        return None
    offset = rng.randrange(count)
    return conn.execute(
        f"""SELECT id, province_code, geom_wkb FROM zoning_features
            WHERE {where_clause} LIMIT 1 OFFSET ?""",
        [*params, offset],
    ).fetchone()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("database", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--per-grade", type=int, default=None,
                        help="จำนวนจุดต่อเกรดของทุกชั้นข้อมูล (โหมดทั่วไป)")
    parser.add_argument("--study-13-crops", action="store_true",
                        help="สร้างชุด 13 พืชเศรษฐกิจจำนวน 130 จุด (10 จุดต่อพืช)")
    parser.add_argument("--seed", type=int, default=20260904)
    args = parser.parse_args()

    if args.per_grade is not None and args.per_grade < 1:
        raise SystemExit("--per-grade ต้องมีค่าอย่างน้อย 1")
    if not args.study_13_crops and args.per_grade is None:
        raise SystemExit("ระบุ --per-grade หรือ --study-13-crops")
    if not args.database.is_file():
        raise SystemExit(f"ไม่พบฐานข้อมูล: {args.database}")

    rng = random.Random(args.seed)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(args.database)
    conn.execute("CREATE INDEX IF NOT EXISTS idx_validation_crop_grade ON zoning_features(crop_id, suitability)")
    crop_ids = [row[0] for row in conn.execute("SELECT DISTINCT crop_id FROM zoning_features ORDER BY crop_id")]
    rows = []

    for crop_id in crop_ids:
        if args.study_13_crops:
            grade_counts = COFFEE_GRADE_COUNTS if crop_id in COFFEE_CROPS else STANDARD_GRADE_COUNTS
        else:
            grade_counts = {grade: args.per_grade for grade in GRADES}
        for grade, sample_count in grade_counts.items():
            selected_ids: set[int] = set()
            for sample_number in range(1, sample_count + 1):
                feature = choose_feature(conn, crop_id, grade, selected_ids, rng)
                if not feature:
                    print(f"ไม่มีข้อมูล {crop_id} {grade}")
                    continue
                feature_id, province_code, geometry_wkb = feature
                selected_ids.add(feature_id)
                point = wkb.loads(geometry_wkb).representative_point()
                lat_min, lat_max, lon_min, lon_max = bbox_for_two_rai(point.y, point.x)
                rows.append({
                    "test_id": f"{crop_id}-{grade}-{sample_number:02d}",
                    "crop_id": crop_id,
                    "crop_name_th": DISPLAY_NAMES.get(crop_id, crop_id),
                    "study_crop_group": "กาแฟ" if crop_id in COFFEE_CROPS else DISPLAY_NAMES.get(crop_id, crop_id),
                    "ldd_grade": grade,
                    "province_code": province_code,
                    "lat_min": f"{lat_min:.7f}",
                    "lat_max": f"{lat_max:.7f}",
                    "lon_min": f"{lon_min:.7f}",
                    "lon_max": f"{lon_max:.7f}",
                    "reference_feature_id": feature_id,
                    "reference_source": "LDD Zoning",
                    "validation_status": "รอทดสอบกับ Aura Farm",
                })

    conn.close()
    fields = list(rows[0]) if rows else ["test_id"]
    with args.output.open("w", newline="", encoding="utf-8-sig") as file:
        writer = csv.DictWriter(file, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)
    print(f"Created {len(rows)} validation points: {args.output}")


if __name__ == "__main__":
    main()
