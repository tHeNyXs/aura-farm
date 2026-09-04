"""
Aura Farm v2.0 - FastAPI Main Orchestration Engine
ระบบประเมินความเหมาะสมพื้นที่เพาะปลูกแบบ 3-Level Multi-Criteria AI Land Evaluation Engine
"""

import logging
import asyncio
from contextlib import asynccontextmanager, suppress
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

from app.gee_client import fetch_gee_layers, get_gee_status
from app.ndbi_mask import evaluate_ndbi_hard_mask
from app.suitability_level1 import calculate_level1_suitability
from app.crop_filter_level2 import filter_crops
from app.oae_validation_level3 import validate_with_oae
from app.zoning_service import lookup_zoning, zoning_map_features
from app.zoning_bootstrap import provision_zoning_database

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("main_orchestrator")

zoning_bootstrap_status: Dict[str, Any] = {"available": False, "state": "starting"}


async def provision_zoning_in_background() -> None:
    """Prepare the large zoning archive without delaying the web server port."""
    global zoning_bootstrap_status
    zoning_bootstrap_status = await asyncio.to_thread(provision_zoning_database)


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Render needs a listening port promptly. The nationwide LDD database can take
    # longer to download than its port scan, so provision it after startup instead.
    zoning_task = asyncio.create_task(provision_zoning_in_background())
    try:
        yield
    finally:
        if not zoning_task.done():
            zoning_task.cancel()
            with suppress(asyncio.CancelledError):
                await zoning_task


app = FastAPI(
    title="Aura Farm v2.0 - 3-Level GIS Multi-Criteria AI Land Evaluation Engine",
    version="2.0.0",
    description="Live Satellite Analysis Engine powered by Google Earth Engine, Layer 9 NDBI Hard Mask, AHP 8x8 Matrix & OAE Yield Benchmark",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request / Response Pydantic Schemas
class EvaluateRequest(BaseModel):
    polygon: List[List[float]] = Field(..., description="List of [lat, lng] coordinates forming a closed polygon")
    days_history: Optional[int] = Field(180, description="History window in days for cloud-free satellite composite")
    soil_ph: Optional[float] = Field(6.5, description="Soil pH value (default 6.5)")
    irrigation_score: Optional[float] = Field(0.80, description="Irrigation accessibility score (default 0.80)")

class HealthResponse(BaseModel):
    status: str
    gee_authenticated: bool
    error: Optional[str] = None
    timestamp: str
    zoning: Dict[str, Any]

class ZoningRequest(BaseModel):
    polygon: List[List[float]] = Field(..., description="List of [lat, lng] coordinates")

@app.get("/health", response_model=HealthResponse)
@app.get("/api/v1/status", response_model=HealthResponse)
async def health_check():
    """
    Endpoint ตรวจสอบสุขภาพระบบและสถานะการยืนยันตัวตน Google Earth Engine
    """
    status_data = get_gee_status()
    return HealthResponse(
        status="online",
        gee_authenticated=status_data["gee_authenticated"],
        error=status_data.get("error"),
        timestamp=status_data["timestamp"],
        zoning=zoning_bootstrap_status,
    )

@app.post("/api/v1/zoning-overlay")
async def zoning_overlay(req: ZoningRequest):
    """Overlay a parcel with official LDD Zoning polygons (when installed)."""
    if len(req.polygon) < 3:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Polygon geometry ไม่ถูกต้อง")
    try:
        return lookup_zoning(req.polygon)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error))

@app.get("/api/v1/zoning-map")
async def zoning_map(
    crop_id: str = Query(..., min_length=1, max_length=64),
    west: float = Query(...), south: float = Query(...), east: float = Query(...), north: float = Query(...),
    zoom: int = Query(..., ge=6, le=20),
):
    """Visible-bounds LDD Zoning layer for the interactive map."""
    try:
        return zoning_map_features(crop_id, west, south, east, north, zoom)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error))

@app.post("/evaluate")
@app.post("/api/v1/analyze-gee")
@app.post("/api/v1/analyze-ndvi")
async def evaluate_land_parcel(req: EvaluateRequest):
    """
    POST /evaluate - ประมวลผลประเมินคุณภาพที่ดิน 3 ระดับสดๆ จากดาวเทียม Google Earth Engine
    """
    logger.info(f"Received /evaluate request for polygon with {len(req.polygon)} points")

    if not req.polygon or len(req.polygon) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Polygon geometry ไม่ถูกต้อง ต้องประกอบด้วยพิกัดอย่างน้อย 3 จุด"
        )

    try:
        # Step 1: ดึงข้อมูลสด 6 Layer จาก Google Earth Engine (พร้อมตรวจขนาดพื้นที่ <= 200 ไร่)
        gee_data = fetch_gee_layers(req.polygon, days_history=req.days_history or 180)

        # Step 2: Layer 9 NDBI Built-up Hard Mask Check (Pre-filter)
        b8_nir = gee_data["b8_nir"]
        b4_red = gee_data["b4_red"]
        b11_swir = gee_data["b11_swir"]

        ndbi_result = evaluate_ndbi_hard_mask(b8_nir, b4_red, b11_swir)

        # Water must be excluded before AHP. A water surface can have low NDVI,
        # which otherwise looks superficially similar to non-vegetated land.
        ndvi_value = ndbi_result["ndvi"]
        mndwi_value = gee_data.get("mndwi_value", 0.0)
        is_water_body = (
            gee_data.get("land_use_code") == 80 or
            (mndwi_value >= 0.10 and ndvi_value < 0.10)
        )
        if is_water_body:
            ndbi_result = {
                "skip_ahp": True,
                "grade": "N",
                "score": 0.0,
                "percentage": 0,
                "ndbi": ndbi_result["ndbi"],
                "ndvi": ndvi_value,
                "is_built_up": False,
                "is_water": True,
                "message": (
                    f"พื้นที่นี้เป็นแหล่งน้ำถาวร (WorldCover={gee_data.get('land_use_label')}, "
                    f"MNDWI={mndwi_value:.3f}, NDVI={ndvi_value:.3f}) "
                    "→ ไม่ประเมินความเหมาะสมสำหรับพืชบก (เกรด N)"
                ),
            }

        # Step 3: Level 1 - Overall Land Suitability Index (AHP Weighted Overlay - จันทองพูน และคณะ, 2565 NCCE27)
        level1_result = calculate_level1_suitability(
            gee_data=gee_data,
            ndbi_result=ndbi_result,
            soil_ph=req.soil_ph or 6.5,
            irrigation_score=req.irrigation_score or 0.80
        )

        # Step 4: Level 2 - Crop-Specific Suitability Filtering (พืชเศรษฐกิจหลักตามฐานข้อมูล LDD)
        level2_crops = filter_crops(
            gee_data=gee_data,
            level1_result=level1_result,
            soil_ph=req.soil_ph or 6.5,
            is_water=is_water_body,
        )
        zoning_result = lookup_zoning(req.polygon)

        # Step 5: Level 3 - OAE Benchmark Yield Validation
        top_crop = level2_crops[0] if level2_crops else {"name": "ข้าวหอมมะลิ (Hom Mali Rice)", "grade": level1_result["grade"]}
        level3_validation = validate_with_oae(top_crop["name"], top_crop["grade"])

        # Format Next.js UI Compatible Response
        response_payload = {
            "success": True,
            "source": "google_earth_engine",
            "mean_ndvi": ndbi_result["ndvi"],
            "min_ndvi": round(ndbi_result["ndvi"] - 0.05, 3),
            "max_ndvi": round(ndbi_result["ndvi"] + 0.05, 3),
            "ndbi_value": ndbi_result["ndbi"],
            "mndwi_value": gee_data["mndwi_value"],
            "cloud_cover_pct": 12.5,
            "satellite": "Sentinel-2 L2A (10m), Sentinel-1 SAR, SRTM DEM, CHIRPS, MODIS & ESA WorldCover",
            "sar_vv_db": gee_data["sar_vv_db"],
            "soil_moisture_pct": gee_data["soil_moisture_pct"],
            "elevation_m": gee_data["elevation_m"],
            "slope_degrees": gee_data["slope_degrees"],
            "annual_rainfall_mm": gee_data["annual_rainfall_mm"],
            "lst_temp_celsius": gee_data["lst_temp_celsius"],
            "land_use_code": gee_data["land_use_code"],
            "land_use_label": gee_data["land_use_label"],
            "is_built_up": ndbi_result["is_built_up"],
            "is_water": is_water_body,
            "zoning": zoning_result,
            "capture_date": datetime.now().strftime("%Y-%m-%d"),
            "level1": level1_result,
            "level2": level2_crops,
            "level3": level3_validation
        }

        logger.info(f"Evaluation finished successfully. Level 1 Score: {level1_result['score']} ({level1_result['grade']})")
        return response_payload

    except ValueError as ve:
        logger.warning(f"Validation error: {ve}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        logger.error(f"Orchestrator Exception: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"เกิดข้อผิดพลาดในการประมวลผลดาวเทียม GEE: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
