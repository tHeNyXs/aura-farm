"""
Level 1 Overall Land Suitability Index Module
คำนวณคะแนนคุณภาพที่ดินรวมด้วยวิธี AHP Weighted Overlay S = SUM(wi * xi)
อ้างอิงค่าน้ำหนักปัจจัยรองด้านกายภาพ: จันทองพูน และคณะ (2565), NCCE27
จัดเกรดตามเกณฑ์ที่ทีม Aura Farm กำหนด อิงหลักการ Suitability Class ของ FAO (1983)
"""

import logging
from typing import Dict, Any
from app.ahp_weights import AHP_WEIGHTS, validate_consistency
from app.normalization import (
    normalize_slope,
    normalize_ph,
    normalize_rainfall,
    normalize_temp,
    normalize_moisture,
    normalize_irrigation
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("suitability_level1")

def classify_fao_grade(score: float) -> str:
    """
    จัดเกรดตามเกณฑ์ที่ทีม Aura Farm กำหนด อิงหลักการ Suitability Class ของ FAO (1983)
    ตามระดับคะแนน 0.00 - 1.00:
    S1: >= 0.80 (เหมาะสมมาก)
    S2: 0.68 - 0.79 (เหมาะสมปานกลาง)
    S3: 0.50 - 0.67 (เหมาะสมน้อย)
    N:  < 0.50 (ไม่เหมาะสม)
    """
    if score >= 0.80:
        return "S1"
    elif score >= 0.68:
        return "S2"
    elif score >= 0.50:
        return "S3"
    else:
        return "N"

def get_fao_label(grade: str) -> str:
    """
    คืนค่าป้ายคำอธิบายเกรดภาษาไทย อิงหลักการ Suitability Class ของ FAO (1983)
    """
    labels = {
        "S1": "เหมาะสมมาก (S1)",
        "S2": "เหมาะสมปานกลาง (S2)",
        "S3": "เหมาะสมน้อย (S3)",
        "N": "ไม่เหมาะสมอย่างยิ่ง (N)"
    }
    return labels.get(grade, "ไม่เหมาะสมอย่างยิ่ง (N)")

def calculate_level1_suitability(
    gee_data: Dict[str, Any],
    ndbi_result: Dict[str, Any],
    soil_ph: float = 6.5,
    irrigation_score: float = 0.80
) -> Dict[str, Any]:
    """
    คำนวณ Level 1 Overall Land Suitability Index
    หาก ndbi_result['skip_ahp'] == True ให้ข้าม AHP และคืนค่าผลจาก NDBI Mask ทันที
    """
    # Check if NDBI Hard Mask triggered
    if ndbi_result.get("skip_ahp", False):
        logger.info("NDBI Hard Mask active -> Skipping AHP calculation.")
        return {
            "score": 0.15,
            "percentage": 15,
            "grade": "N",
            "fao_label": "ไม่เหมาะสมอย่างยิ่ง (N) - สิ่งปลูกสร้าง/อาคารคอนกรีต",
            "skip_ahp": True,
            "is_built_up": True,
            "ndbi": ndbi_result.get("ndbi"),
            "ndvi": ndbi_result.get("ndvi"),
            "message": ndbi_result.get("message"),
            "weights": AHP_WEIGHTS,
            "normalized_criteria": {}
        }

    # Validate AHP Consistency Ratio
    lambda_max, ci, cr = validate_consistency()

    # Extract raw parameters
    slope_deg = gee_data.get("slope_degrees", 1.5)
    rainfall_mm = gee_data.get("annual_rainfall_mm", 1280.0)
    celsius = gee_data.get("lst_temp_celsius", 30.5)
    ndvi = ndbi_result.get("ndvi", 0.68)
    moisture_pct = gee_data.get("soil_moisture_pct", 58.0)

    # Normalize criteria mapped to 4 verified physical factors (Chanthongphun et al., 2565 NCCE27)
    norm_soil = normalize_ph(soil_ph)
    norm_water = round(0.70 * normalize_moisture(moisture_pct) + 0.30 * normalize_irrigation(irrigation_score), 2)
    norm_climate = round(0.65 * normalize_rainfall(rainfall_mm) + 0.35 * normalize_temp(celsius), 2)
    norm_terrain = normalize_slope(slope_deg)

    norm_x = {
        "soil_potential": norm_soil,      # ศักยภาพของดิน: SoilGrids + LDD (43.2%)
        "water_resources": norm_water,    # แหล่งน้ำ: Sentinel-1 SAR + ชลประทาน (39.4%)
        "climate": norm_climate,          # ภูมิอากาศ: CHIRPS ฝน + MODIS LST อุณหภูมิ (10.8%)
        "terrain": norm_terrain           # ภูมิประเทศ: SRTM DEM ความลาดชัน (6.6%)
    }

    # S_overall = SUM(wi * xi)
    raw_s = sum(AHP_WEIGHTS[k] * norm_x[k] for k in AHP_WEIGHTS)
    score = round(raw_s, 2)
    percentage = int(score * 100)
    grade = classify_fao_grade(score)
    fao_label = get_fao_label(grade)

    summary_msg = (
        f"พื้นที่นี้เป็นพืชคลุมดิน / แปลงเกษตร (NDBI={ndbi_result.get('ndbi')}, NDVI={ndvi:.3f}) "
        f"→ ค่าความเหมาะสมต่อการเกษตรโดยรวม: {score:.2f} ({fao_label}) "
        f"ประเมินตาม AHP Weighted Overlay (จันทองพูน และคณะ, 2565 NCCE27, CR = {cr:.4f} < 0.10) "
        f"จัดเกรดตามเกณฑ์ทีม Aura Farm อิงหลักการ FAO (1983)"
    )

    logger.info(f"Level 1 Suitability Score: {score} ({grade}) - {fao_label}")

    return {
        "score": score,
        "percentage": percentage,
        "grade": grade,
        "fao_label": fao_label,
        "skip_ahp": False,
        "is_built_up": False,
        "ndbi": ndbi_result.get("ndbi"),
        "ndvi": ndvi,
        "message": summary_msg,
        "weights": AHP_WEIGHTS,
        "normalized_criteria": norm_x,
        "cr": cr
    }
