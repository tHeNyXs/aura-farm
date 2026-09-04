"""Read-only spatial lookup for LDD economic-crop zoning data."""

import os
import tempfile
import sqlite3
from contextlib import closing
from typing import Any, Dict, List, Optional, Sequence

from shapely import wkb
from shapely.geometry import Polygon, mapping
from shapely.ops import transform
from pyproj import Transformer

DB_PATH = os.getenv(
    "LDD_ZONING_DB_PATH",
    os.path.join(tempfile.gettempdir(), "aura-farm", "ldd_zoning.sqlite"),
)
AREA_TRANSFORMER = Transformer.from_crs("EPSG:4326", "EPSG:6933", always_xy=True)


def database_available() -> bool:
    return os.path.isfile(DB_PATH)


def lookup_zoning(polygon_lat_lng: Sequence[Sequence[float]]) -> Dict[str, Any]:
    """Return official LDD S1/S2/S3/N area shares intersecting a user polygon."""
    if not database_available():
        return {"available": False, "reason": "ฐานข้อมูล Zoning ยังไม่ได้ติดตั้ง"}
    if len(polygon_lat_lng) < 3:
        raise ValueError("Polygon ต้องมีพิกัดอย่างน้อย 3 จุด")

    ring = [(float(lng), float(lat)) for lat, lng in polygon_lat_lng]
    if ring[0] != ring[-1]:
        ring.append(ring[0])
    parcel = Polygon(ring)
    if not parcel.is_valid:
        parcel = parcel.buffer(0)
    if parcel.is_empty:
        raise ValueError("Polygon ไม่ถูกต้อง")

    minx, miny, maxx, maxy = parcel.bounds
    parcel_area = transform(AREA_TRANSFORMER.transform, parcel).area
    if parcel_area <= 0:
        raise ValueError("Polygon มีพื้นที่เป็นศูนย์")

    sql = """
        SELECT crop_id, suitability, geom_wkb
        FROM zoning_features AS feature
        INNER JOIN zoning_feature_index AS spatial_index ON spatial_index.id = feature.id
        WHERE spatial_index.min_lng <= ? AND spatial_index.max_lng >= ?
          AND spatial_index.min_lat <= ? AND spatial_index.max_lat >= ?
    """
    totals: Dict[str, Dict[str, float]] = {}
    with closing(sqlite3.connect(DB_PATH)) as conn:
        for crop_id, suitability, raw_geometry in conn.execute(sql, (maxx, minx, maxy, miny)):
            feature = wkb.loads(raw_geometry)
            if not feature.intersects(parcel):
                continue
            intersection = feature.intersection(parcel)
            if intersection.is_empty:
                continue
            area = transform(AREA_TRANSFORMER.transform, intersection).area
            if area <= 0:
                continue
            crop_totals = totals.setdefault(crop_id, {"S1": 0.0, "S2": 0.0, "S3": 0.0, "N": 0.0})
            if suitability in crop_totals:
                crop_totals[suitability] += area

    crops: List[Dict[str, Any]] = []
    for crop_id, areas in sorted(totals.items()):
        shares = {grade: round(area / parcel_area * 100, 2) for grade, area in areas.items()}
        official_grade = next((grade for grade in ("S1", "S2", "S3", "N") if shares[grade] >= 50), None)
        crops.append({
            "crop_id": crop_id,
            "official_grade": official_grade,
            "area_share_pct": shares,
            "coverage_pct": round(sum(shares.values()), 2),
        })

    return {
        "available": True,
        "source": "กรมพัฒนาที่ดิน (LDD) เขตความเหมาะสมของที่ดินสำหรับการปลูกพืชเศรษฐกิจ (Zoning)",
        "crops": crops,
    }


def zoning_map_features(crop_id: str, west: float, south: float, east: float, north: float, zoom: int) -> Dict[str, Any]:
    """Return simplified GeoJSON for one LDD crop layer within the visible map bounds."""
    if not database_available():
        return {"available": False, "reason": "ฐานข้อมูล Zoning ยังไม่ได้ติดตั้ง", "type": "FeatureCollection", "features": []}
    if not crop_id or not all(char.islower() or char.isdigit() or char == "_" for char in crop_id):
        raise ValueError("รหัสพืชไม่ถูกต้อง")
    if not (-180 <= west < east <= 180 and -90 <= south < north <= 90):
        raise ValueError("ขอบเขตแผนที่ไม่ถูกต้อง")

    # Avoid returning country-sized detail when the user is zoomed far out.
    max_span = 10.0 if zoom < 10 else 4.0 if zoom < 12 else 1.5
    if east - west > max_span or north - south > max_span:
        return {"available": True, "zoom_required": True, "type": "FeatureCollection", "features": []}

    tolerance = 0.0003 if zoom < 12 else 0.0001 if zoom < 14 else 0.00003 if zoom < 16 else 0.00001
    sql = """
        SELECT suitability, geom_wkb
        FROM zoning_features AS feature
        INNER JOIN zoning_feature_index AS spatial_index ON spatial_index.id = feature.id
        WHERE feature.crop_id = ?
          AND spatial_index.min_lng <= ? AND spatial_index.max_lng >= ?
          AND spatial_index.min_lat <= ? AND spatial_index.max_lat >= ?
        LIMIT 3000
    """
    features: List[Dict[str, Any]] = []
    with closing(sqlite3.connect(DB_PATH)) as conn:
        for suitability, raw_geometry in conn.execute(sql, (crop_id, east, west, north, south)):
            geometry = wkb.loads(raw_geometry)
            simplified = geometry.simplify(tolerance, preserve_topology=True)
            if simplified.is_empty:
                continue
            features.append({
                "type": "Feature",
                "properties": {"suitability": suitability},
                "geometry": mapping(simplified),
            })
    return {"available": True, "zoom_required": False, "type": "FeatureCollection", "features": features}
