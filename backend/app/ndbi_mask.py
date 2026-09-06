"""
Layer 9 NDBI Built-up Hard Mask Module
ทำการตรวจสอบสิ่งปลูกสร้าง/หลังคาคอนกรีตกด้วยดัชนี NDBI & NDVI ก่อนเข้าสู่สมการ AHP
"""

import logging
from typing import Dict, Any, Tuple

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ndbi_mask")

def compute_ndbi(b11_swir: float, b8_nir: float) -> float:
    """
    คำนวณ NDBI (Normalized Difference Built-up Index)
    NDBI = (SWIR - NIR) / (SWIR + NIR)
    """
    denom = b11_swir + b8_nir
    if abs(denom) < 1e-6:
        return 0.0
    return (b11_swir - b8_nir) / denom

def compute_ndvi(b8_nir: float, b4_red: float) -> float:
    """
    คำนวณ NDVI (Normalized Difference Vegetation Index)
    NDVI = (NIR - Red) / (NIR + Red)
    """
    denom = b8_nir + b4_red
    if abs(denom) < 1e-6:
        return 0.0
    return (b8_nir - b4_red) / denom

def evaluate_ndbi_hard_mask(
    b8_nir: float,
    b4_red: float,
    b11_swir: float,
    land_use_code: int | None = None,
) -> Dict[str, Any]:
    """
    ประเมินเงื่อนไข Pre-filter Hard Mask:
    IF WorldCover is Built-up (50), OR NDBI > 0.10 AND NDVI < 0.20:
        -> บังคับเป็นเกรด N (0.15) และ skip_ahp = True
    ELSE:
        -> skip_ahp = False เข้าสู่ AHP ตามปกติ
    """
    ndbi = compute_ndbi(b11_swir, b8_nir)
    ndvi = compute_ndvi(b8_nir, b4_red)

    logger.info(f"Calculated NDBI = {ndbi:.4f}, NDVI = {ndvi:.4f}")

    is_worldcover_built_up = land_use_code == 50
    is_spectral_built_up = ndbi > 0.10 and ndvi < 0.20
    is_built_up = is_worldcover_built_up or is_spectral_built_up

    if is_built_up:
        detection_reason = (
            "ESA WorldCover จัดเป็นพื้นที่สิ่งปลูกสร้าง (Built-up)"
            if is_worldcover_built_up
            else f"NDBI={ndbi:.3f} > 0.10 และ NDVI={ndvi:.3f} < 0.20"
        )
        message = f"⚠️ พื้นที่นี้ตรวจพบเป็นสิ่งปลูกสร้าง / อาคารคอนกรีต ({detection_reason}) → ไม่ประเมินความเหมาะสมทางการเกษตร (เกรด N)"
        return {
            "skip_ahp": True,
            "grade": "N",
            "score": 0.15,
            "percentage": 15,
            "ndbi": round(ndbi, 3),
            "ndvi": round(ndvi, 3),
            "is_built_up": True,
            "message": message
        }
    else:
        message = (
            f"พื้นที่นี้เป็นพืชคลุมดิน / แปลงเกษตร "
            f"(NDBI={ndbi:.3f}, NDVI={ndvi:.3f}) → ประเมินความเหมาะสมตามปกติ"
        )
        return {
            "skip_ahp": False,
            "grade": None,
            "score": None,
            "percentage": None,
            "ndbi": round(ndbi, 3),
            "ndvi": round(ndvi, 3),
            "is_built_up": False,
            "message": message
        }
