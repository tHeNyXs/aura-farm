"""
GEE Client Module for Aura Farm v2.0
เชื่อมต่อและดึงข้อมูลดาวเทียมสด 6 Layer จาก Google Earth Engine (GEE)
"""

import os
import sys
import glob
import json
import logging
from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime, timedelta
import ee

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("gee_client")

gee_initialized = False
init_error_message: Optional[str] = None

def initialize_gee() -> bool:
    """
    เริ่มต้นการเชื่อมต่อ Google Earth Engine ด้วย OAuth User Credentials หรือ Service Account
    """
    global gee_initialized, init_error_message

    # 1. Try Default User OAuth Credentials First (aurafarm-507404)
    cred_path = os.path.expanduser("~/.config/earthengine/credentials")
    project_id = os.getenv("EE_PROJECT_ID")

    if not project_id and os.path.exists(cred_path):
        try:
            with open(cred_path, "r", encoding="utf-8") as cf:
                cdata = json.loads(cf.read())
                project_id = cdata.get("project") or cdata.get("project_id")
        except Exception:
            pass

    if not project_id:
        project_id = "aurafarm-507404"

    try:
        if project_id:
            ee.Initialize(project=project_id)
        else:
            ee.Initialize()

        gee_initialized = True
        init_error_message = None
        logger.info(f"GEE Authenticated successfully with project: {project_id}")
        return True
    except Exception as default_err:
        logger.warning(f"Default OAuth init failed, trying Service Account key: {default_err}")

    # 2. Check Environment Variable for Service Account JSON directly
    sa_json_env = os.getenv("GEE_SERVICE_ACCOUNT_JSON") or os.getenv("GEE_SERVICE_ACCOUNT_KEY")
    if sa_json_env:
        try:
            key_data = json.loads(sa_json_env.strip())
            client_email = key_data.get("client_email")
            sa_project_id = key_data.get("project_id") or project_id
            credentials = ee.ServiceAccountCredentials(
                email=client_email,
                key_data=sa_json_env.strip()
            )
            ee.Initialize(credentials, project=sa_project_id)
            gee_initialized = True
            init_error_message = None
            logger.info("GEE Authenticated successfully with GEE_SERVICE_ACCOUNT_JSON env var!")
            return True
        except Exception as sa_env_err:
            logger.warning(f"GEE init from env var failed: {sa_env_err}"); init_error_message = str(sa_env_err)

    # 3. Fallback to Service Account JSON key file
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    search_patterns = [
        os.path.join(base_dir, "service_account.json"),
        os.path.join(base_dir, "credentials.json"),
        os.path.join(base_dir, "..", "service_account.json"),
    ]

    key_file = None
    for pattern in search_patterns:
        matched = glob.glob(pattern)
        for f in matched:
            if not f.endswith("package.json") and not f.endswith("tsconfig.json"):
                key_file = f
                break
        if key_file:
            break

    try:
        if key_file and os.path.exists(key_file):
            with open(key_file, "r", encoding="utf-8") as kf:
                key_data = json.loads(kf.read().strip())

            if isinstance(key_data, dict) and "client_email" in key_data:
                logger.info(f"Loading GEE Service Account Key from: {key_file}")
                client_email = key_data.get("client_email")
                sa_project_id = key_data.get("project_id") or project_id

                credentials = ee.ServiceAccountCredentials(
                    email=client_email,
                    key_file=key_file
                )
                ee.Initialize(credentials, project=sa_project_id)
                gee_initialized = True
                init_error_message = None
                logger.info("GEE Authenticated successfully with Service Account Key!")
                return True
    except Exception as sa_err:
        init_error_message = str(sa_err)
        logger.error(f"Service Account GEE Init Failed: {sa_err}")

    gee_initialized = False
    return False

# Initialize at module load
initialize_gee()

def get_gee_status() -> Dict[str, Any]:
    """
    คืนค่าสถานะการเชื่อมต่อ GEE สำหรับ /health endpoint
    """
    global gee_initialized, init_error_message
    if not gee_initialized:
        initialize_gee()
    return {
        "gee_authenticated": gee_initialized,
        "error": init_error_message,
        "timestamp": datetime.now().isoformat()
    }

def mask_s2_clouds(image: ee.Image) -> ee.Image:
    """
    ฟังก์ชันลบเมฆจาก Sentinel-2 QA60 Band
    """
    qa = image.select('QA60')
    cloud_bit_mask = 1 << 10
    cirrus_bit_mask = 1 << 11
    mask = (qa.bitwiseAnd(cloud_bit_mask).eq(0)
            .And(qa.bitwiseAnd(cirrus_bit_mask).eq(0)))
    return image.updateMask(mask).divide(10000)

def fetch_gee_layers(polygon: List[List[float]], days_history: int = 180) -> Dict[str, Any]:
    """
    ดึงข้อมูล 6 Layer หลักจาก Google Earth Engine สำหรับพิกัด Polygon ที่กำหนด
    """
    global gee_initialized
    if not gee_initialized:
        initialize_gee()

    if not gee_initialized:
        raise RuntimeError(f"Google Earth Engine not authenticated: {init_error_message}")

    logger.info(f"Fetching GEE layers for polygon with {len(polygon)} vertices...")

    # Convert [lat, lng] -> GEE [lng, lat]
    gee_coords = [[p[1], p[0]] for p in polygon]
    if gee_coords[0] != gee_coords[-1]:
        gee_coords.append(gee_coords[0])

    farm_poly = ee.Geometry.Polygon(gee_coords)

    # Validate area <= 200 Rai (1 Rai = 1600 sqm)
    area_sqm = farm_poly.area().getInfo()
    area_rai = round(area_sqm / 1600.0, 2)
    logger.info(f"Polygon Area: {area_rai} Rai ({area_sqm:.1f} sqm)")

    if area_rai > 200.0:
        raise ValueError(f"ขนาดแปลงที่ดิน ({area_rai} ไร่) เกินเกณฑ์สูงสุด 200 ไร่ กรุณาแบ่งเป็นแปลงย่อย")

    reduce_geom = farm_poly.buffer(25)

    def require_stat(stats: Dict[str, Any], key: str, dataset: str) -> float:
        value = stats.get(key) if stats else None
        if value is None:
            raise RuntimeError(f"ไม่มีข้อมูล {dataset} ที่ใช้วิเคราะห์แปลงนี้")
        return float(value)

    end_date = datetime.now()
    start_date = end_date - timedelta(days=days_history)
    start_str = start_date.strftime('%Y-%m-%d')
    end_str = end_date.strftime('%Y-%m-%d')

    # 1. ESA WorldCover v200 (10m)
    wc = ee.ImageCollection('ESA/WorldCover/v200').first().select('Map')
    wc_stats = wc.reduceRegion(reducer=ee.Reducer.mode(), geometry=reduce_geom, scale=10, tileScale=4).getInfo()
    lu_code = int(require_stat(wc_stats, 'Map', 'ESA WorldCover'))
    labels = {
        10: "Tree cover", 20: "Shrubland", 30: "Grassland", 40: "Cropland",
        50: "Built-up", 60: "Bare / sparse vegetation", 80: "Permanent water bodies",
        90: "Herbaceous wetland", 95: "Mangroves"
    }
    lu_label = labels.get(lu_code, "Unknown land cover")

    # 2. Sentinel-2 L2A (10m) Bands: B3 (Green), B8 (NIR), B4 (Red), B11 (SWIR1)
    s2_collection = (
        ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
        .filterBounds(reduce_geom)
        .filterDate(start_str, end_str)
        .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 35.0))
    )

    if s2_collection.size().getInfo() == 0:
        s2_collection = (
            ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
            .filterBounds(reduce_geom)
            .filterDate(start_str, end_str)
            .limit(20)
        )
    if s2_collection.size().getInfo() == 0:
        raise RuntimeError("ไม่พบภาพ Sentinel-2 สำหรับแปลงนี้ในช่วงเวลาที่เลือก")

    masked_collection = s2_collection.map(mask_s2_clouds)
    s2_median = masked_collection.median()

    # Compute mean spectral band values
    bands_stats = s2_median.select(['B3', 'B8', 'B4', 'B11']).reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=reduce_geom,
        scale=10,
        tileScale=4,
        maxPixels=1e8
    ).getInfo()

    b3_val = require_stat(bands_stats, 'B3', 'Sentinel-2 Green band')
    b8_val = require_stat(bands_stats, 'B8', 'Sentinel-2 NIR band')
    b4_val = require_stat(bands_stats, 'B4', 'Sentinel-2 Red band')
    b11_val = require_stat(bands_stats, 'B11', 'Sentinel-2 SWIR band')

    # MNDWI separates open water from dark built-up surfaces more reliably than NDVI alone.
    mndwi_denominator = b3_val + b11_val
    if abs(mndwi_denominator) < 1e-6:
        raise RuntimeError("ไม่สามารถคำนวณ MNDWI จากภาพ Sentinel-2 ได้")
    mndwi_value = (b3_val - b11_val) / mndwi_denominator

    # 3. Elevation & Slope (USGS SRTM 30m / Copernicus DEM 30m)
    try:
        dem = ee.Image('USGS/SRTMGL1_003')
        slope = ee.Terrain.slope(dem)
        dem_stats = dem.reduceRegion(reducer=ee.Reducer.mean(), geometry=reduce_geom, scale=30, tileScale=4).getInfo()
        slope_stats = slope.reduceRegion(reducer=ee.Reducer.mean(), geometry=reduce_geom, scale=30, tileScale=4).getInfo()
        elev_m = require_stat(dem_stats, 'elevation', 'SRTM elevation')
        slope_deg = require_stat(slope_stats, 'slope', 'SRTM slope')
    except Exception:
        dem = ee.Image('COPERNICUS/DEM/GLO30').select('DEM')
        slope = ee.Terrain.slope(dem)
        dem_stats = dem.reduceRegion(reducer=ee.Reducer.mean(), geometry=reduce_geom, scale=30, tileScale=4).getInfo()
        slope_stats = slope.reduceRegion(reducer=ee.Reducer.mean(), geometry=reduce_geom, scale=30, tileScale=4).getInfo()
        elev_m = require_stat(dem_stats, 'DEM', 'Copernicus DEM elevation')
        slope_deg = require_stat(slope_stats, 'slope', 'Copernicus DEM slope')

    # 4. Sentinel-1 SAR VV Backscatter (10m)
    s1 = (ee.ImageCollection('COPERNICUS/S1_GRD')
          .filterBounds(reduce_geom)
          .filterDate(start_str, end_str)
          .filter(ee.Filter.eq('instrumentMode', 'IW'))
          .select('VV')
          .median())
    sar_stats = s1.reduceRegion(reducer=ee.Reducer.mean(), geometry=reduce_geom, scale=10, tileScale=4).getInfo()
    sar_val = require_stat(sar_stats, 'VV', 'Sentinel-1 SAR')

    # Convert SAR dB (-25dB to -5dB) -> estimated surface soil moisture % (20% to 85%)
    soil_moisture_pct = round(max(20.0, min(85.0, 85.0 + (sar_val + 5.0) * 3.25)), 1)

    # 5. CHIRPS Daily Rainfall (~5km)
    chirps = (ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY')
              .filterBounds(reduce_geom)
              .filterDate(f'{end_date.year - 1}-01-01', f'{end_date.year - 1}-12-31')
              .sum())
    rain_stats = chirps.reduceRegion(reducer=ee.Reducer.mean(), geometry=reduce_geom, scale=5000, tileScale=4).getInfo()
    annual_rain = require_stat(rain_stats, 'precipitation', 'CHIRPS rainfall')

    # 6. MODIS LST Surface Temperature (1km)
    modis = (ee.ImageCollection('MODIS/061/MOD11A2')
             .filterBounds(reduce_geom)
             .filterDate(start_str, end_str)
             .select('LST_Day_1km')
             .median())
    lst_stats = modis.reduceRegion(reducer=ee.Reducer.mean(), geometry=reduce_geom, scale=1000, tileScale=4).getInfo()
    lst_temp = require_stat(lst_stats, 'LST_Day_1km', 'MODIS land-surface temperature') * 0.02 - 273.15

    return {
        "b3_green": round(b3_val, 4),
        "b8_nir": round(b8_val, 4),
        "b4_red": round(b4_val, 4),
        "b11_swir": round(b11_val, 4),
        "sar_vv_db": round(sar_val, 2),
        "soil_moisture_pct": soil_moisture_pct,
        "elevation_m": round(elev_m, 1),
        "slope_degrees": round(slope_deg, 1),
        "annual_rainfall_mm": round(annual_rain, 1),
        "lst_temp_celsius": round(lst_temp, 1),
        "land_use_code": lu_code,
        "land_use_label": lu_label,
        "mndwi_value": round(mndwi_value, 3),
        "area_rai": area_rai,
        "area_sqm": area_sqm
    }


