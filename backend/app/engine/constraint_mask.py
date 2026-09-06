"""
Step 2: Constraint Masking (Boolean Logic)
ตัดพืชที่ไม่เหมาะสมทางกายภาพออกทันที
"""

from typing import Dict, Any, Tuple, List

def evaluate_crop_constraints(
    crop: Dict[str, Any],
    slope_deg: float,
    soil_group_id: int,
    soil_moisture_pct: float,
    elevation_m: float
) -> Tuple[bool, List[str]]:
    """
    Returns (is_masked_out, limiting_factors)
    """
    limiting_factors: List[str] = []
    is_masked_out = False

    # 1. Slope constraint
    max_slope = crop.get("slope_max_deg", 15.0)
    if slope_deg > max_slope:
        msg = f"ความลาดชัน ({slope_deg:.1f}°) เกินเกณฑ์สูงสุดที่พืชรับได้ ({max_slope}°)"
        limiting_factors.append(msg)
        if slope_deg > max_slope + 4.0 or (max_slope <= 3.5 and slope_deg > 6.0):
            is_masked_out = True

    # 2. Forbidden soil group
    forbidden_groups = crop.get("soil_groups_forbidden", [])
    if soil_group_id in forbidden_groups:
        msg = f"กลุ่มชุดดินที่ {soil_group_id} เป็นข้อจำกัดรุนแรงสำหรับพืชชนิดนี้"
        limiting_factors.append(msg)
        is_masked_out = True

    # 3. Waterlogging risk (e.g. durian/cassava in waterlogged soil)
    ideal_max_m = crop.get("soil_moisture_optimal_pct", (40, 75))[1]
    if soil_moisture_pct > 82 and ideal_max_m <= 65:
        msg = f"ความชื้นดิน ({soil_moisture_pct:.0f}%) สูงเกินไป เสี่ยงต่อการเน่าของราก/หัว"
        limiting_factors.append(msg)
        if soil_moisture_pct > 85:
            is_masked_out = True

    # 4. Highland elevation requirement (e.g. Arabica coffee)
    min_elev = crop.get("elevation_min_m", 0)
    if min_elev > 500 and elevation_m < min_elev:
        msg = f"ระดับความสูง ({elevation_m:.0f} ม.) ต่ำกว่าเกณฑ์พืชเมืองหนาว ({min_elev} ม.)"
        limiting_factors.append(msg)
        is_masked_out = True

    return is_masked_out, limiting_factors
