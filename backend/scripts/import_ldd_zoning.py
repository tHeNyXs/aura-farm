"""Build a compact, queryable SQLite dataset from LDD Zoning Shapefile ZIPs.

Usage (inside the backend image):
  python scripts/import_ldd_zoning.py /source/ldd_zoning /output/ldd_zoning.sqlite
"""

import sqlite3
import sys
from pathlib import Path
from typing import Dict

import geopandas as gpd

CROPS: Dict[str, str] = {
    "Cassava": "cassava", "Coconut": "coconut", "Coffee_arabibca": "arabica_coffee",
    "Coffee_robusta": "robusta_coffee", "Durian": "durian", "Longan": "longan",
    "Maize": "maize", "Mangosteen": "mangosteen", "Palm": "oil_palm",
    "Pararubber": "rubber_tree", "Pineapple": "pineapple", "Rice": "rice",
    "Sugarcane": "sugarcane",
}
GRADES = {"S1", "S2", "S3", "N"}


def get_suitability_column(columns):
    return next((column for column in columns if column.lower().startswith("suit_")), None)


def main(source_root: str, output_file: str) -> None:
    source = Path(source_root)
    output = Path(output_file)
    output.parent.mkdir(parents=True, exist_ok=True)
    if output.exists():
        output.unlink()

    conn = sqlite3.connect(output)
    conn.executescript("""
      CREATE TABLE zoning_features (
        id INTEGER PRIMARY KEY,
        crop_id TEXT NOT NULL,
        province_code TEXT NOT NULL,
        suitability TEXT NOT NULL,
        min_lng REAL NOT NULL, min_lat REAL NOT NULL,
        max_lng REAL NOT NULL, max_lat REAL NOT NULL,
        geom_wkb BLOB NOT NULL
      );
      CREATE VIRTUAL TABLE zoning_feature_index USING rtree(
        id, min_lng, max_lng, min_lat, max_lat
      );
      CREATE TRIGGER zoning_feature_index_insert AFTER INSERT ON zoning_features BEGIN
        INSERT INTO zoning_feature_index VALUES
          (new.id, new.min_lng, new.max_lng, new.min_lat, new.max_lat);
      END;
      CREATE TABLE import_issues (source_file TEXT PRIMARY KEY, issue TEXT NOT NULL);
      CREATE TABLE dataset_metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    """)
    conn.execute("INSERT INTO dataset_metadata VALUES (?, ?)", ("source", "LDD Zoning Shapefile"))

    inserted = 0
    for folder, crop_id in CROPS.items():
        for archive in sorted((source / folder).rglob("*.zip")):
            try:
                # Read archives through GDAL/pyogrio, rather than Fiona. GeoPandas
                # 0.14's legacy ZIP path helper calls fiona.path, which no longer
                # exists in recent Fiona releases and caused every province to skip.
                archive_vsi_path = f"/vsizip/{archive.resolve().as_posix()}"
                frame = gpd.read_file(archive_vsi_path, engine="pyogrio")
                suit_column = get_suitability_column(frame.columns)
                if not suit_column:
                    raise ValueError("ไม่พบฟิลด์ Suit_xx")
                if frame.crs is None:
                    raise ValueError("ไม่พบระบบพิกัด")
                frame = frame.to_crs("EPSG:4326")
                province = archive.stem.rsplit("_", 1)[-1].lower()
                rows = []
                for _, feature in frame.iterrows():
                    grade = str(feature[suit_column]).strip().upper()
                    geometry = feature.geometry
                    if grade not in GRADES or geometry is None or geometry.is_empty:
                        continue
                    if not geometry.is_valid:
                        geometry = geometry.buffer(0)
                    if geometry.is_empty:
                        continue
                    minx, miny, maxx, maxy = geometry.bounds
                    rows.append((crop_id, province, grade, minx, miny, maxx, maxy, geometry.wkb))
                conn.executemany("""
                  INSERT INTO zoning_features
                  (crop_id, province_code, suitability, min_lng, min_lat, max_lng, max_lat, geom_wkb)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, rows)
                inserted += len(rows)
                print(f"Imported {archive.name}: {len(rows)} features")
            except Exception as error:
                conn.execute("INSERT INTO import_issues VALUES (?, ?)", (str(archive), str(error)))
                print(f"Skipped {archive.name}: {error}", file=sys.stderr)
    conn.commit()
    print(f"Completed: {inserted} features in {output}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("Usage: import_ldd_zoning.py SOURCE_DIRECTORY OUTPUT_DATABASE")
    main(sys.argv[1], sys.argv[2])
