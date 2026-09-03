"""
Normalization Module for Aura Farm v2.0
แปลงค่าดาวเทียมและข้อมูลปฐพีวิทยาให้อยู่ในสเกลคะแนนมาตรฐาน 0.0 - 1.0
"""

import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("normalization")

def clip_value(val: float, min_val: float = 0.0, max_val: float = 1.0) -> float:
    """
    จำกัดขอบเขตค่าให้อยู่ในช่วง [min_val, max_val]
    """
    return max(min_val, min(max_val, val))

def normalize_slope(slope_deg: float) -> float:
    """
    Continuous curve ความลาดชัน DEM: 0° -> 0.96, >15° -> 0.15
    """
    if slope_deg > 15.0:
        val = 0.15
    elif slope_deg > 8.0:
        val = 0.40 - (slope_deg - 8.0) * 0.035
    elif slope_deg > 3.0:
        val = 0.78 - (slope_deg - 3.0) * 0.076
    elif slope_deg > 1.0:
        val = 0.92 - (slope_deg - 1.0) * 0.07
    else:
        val = 0.96
    return round(clip_value(val), 4)

def normalize_ph(ph: float) -> float:
    """
    Bell curve ค่าความเป็นกรด-ด่างดิน รอบ pH 6.5:
    x = max(0.20, 1.0 - abs(ph - 6.5)/1.8 * 0.16)
    """
    diff = abs(ph - 6.5)
    val = max(0.20, 1.0 - (diff / 1.8) * 0.16)
    return round(clip_value(val), 4)

def normalize_rainfall(rainfall_mm: float) -> float:
    """
    Linear mapping ปริมาณฝนสะสมรายปีช่วง 800–2200 มม.
    """
    if rainfall_mm < 800.0:
        val = 0.35
    elif rainfall_mm < 1200.0:
        val = 0.50 + ((rainfall_mm - 800.0) / 400.0) * 0.28
    elif rainfall_mm <= 1800.0:
        val = 0.78 + ((rainfall_mm - 1200.0) / 600.0) * 0.18
    else:
        val = max(0.50, 0.96 - ((rainfall_mm - 1800.0) / 400.0) * 0.25)
    return round(clip_value(val), 4)

def normalize_temp(celsius: float) -> float:
    """
    Linear mapping อุณหภูมิผิวดินช่วง 20–38°C (เหมาะสมที่สุด 25–30°C)
    """
    if celsius < 20.0:
        val = 0.40
    elif celsius <= 30.0:
        val = 0.70 + ((celsius - 20.0) / 10.0) * 0.26
    elif celsius <= 38.0:
        val = 0.96 - ((celsius - 30.0) / 8.0) * 0.45
    else:
        val = 0.30
    return round(clip_value(val), 4)

def normalize_ndvi(ndvi: float) -> float:
    """
    Linear mapping ดัชนีพืชพรรณ NDVI (0.10 -> 0.96)
    """
    if ndvi >= 0.20:
        val = min(0.96, max(0.20, 0.25 + (ndvi - 0.20) * 1.05))
    else:
        val = max(0.10, ndvi * 0.90)
    return round(clip_value(val), 4)

def normalize_moisture(pct: float) -> float:
    """
    Normalize ความชื้นดิน SAR: x = 0.40 + (pct/100) * 0.65
    """
    val = 0.40 + (pct / 100.0) * 0.65
    return round(clip_value(val), 4)

def normalize_land_cover(lu_code: int) -> float:
    """
    Normalize การใช้ที่ดิน ESA WorldCover
    """
    if lu_code == 50: # Built-up
        return 0.05
    elif lu_code == 10: # Tree cover
        return 0.65
    elif lu_code == 30: # Grassland
        return 0.85
    elif lu_code == 40: # Cropland
        return 0.95
    return 0.80

def normalize_irrigation(score: float = 0.80) -> float:
    """
    Normalize คะแนนการเข้าถึงแหล่งน้ำ/ชลประทาน
    """
    return round(clip_value(score), 4)
