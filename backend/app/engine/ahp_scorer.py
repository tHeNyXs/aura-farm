"""
Step 3: AHP Multi-Criteria Scoring & Weighting
"""

from typing import Dict, Any

def calculate_ahp_score(
    crop: Dict[str, Any],
    rainfall_mm: float,
    soil_moisture_pct: float,
    slope_deg: float,
    soil_group_id: int,
    ndvi_val: float
) -> int:
    """
    AHP Weights:
    - Climate (Rainfall): 30%
    - Soil Moisture & NDVI: 25%
    - Topography (Slope): 20%
    - Soil Group Suitability: 25%
    """
    # 1. Rainfall score (30%)
    opt_rain = crop.get("rainfall_optimal_mm", (1000, 1600))
    if opt_rain[0] <= rainfall_mm <= opt_rain[1]:
        climate_score = 100
    else:
        diff = min(abs(rainfall_mm - opt_rain[0]), abs(rainfall_mm - opt_rain[1]))
        climate_score = max(20, 100 - (diff / 300) * 20)

    # 2. Moisture & NDVI (25%)
    opt_m = crop.get("soil_moisture_optimal_pct", (50, 75))
    if opt_m[0] <= soil_moisture_pct <= opt_m[1]:
        moisture_score = 100
    else:
        diff = min(abs(soil_moisture_pct - opt_m[0]), abs(soil_moisture_pct - opt_m[1]))
        moisture_score = max(30, 100 - diff * 3.0)
    ndvi_score = min(100, (ndvi_val / 0.6) * 90)
    moisture_ndvi_score = moisture_score * 0.7 + ndvi_score * 0.3

    # 3. Slope score (20%)
    max_slope = crop.get("slope_max_deg", 10.0)
    if slope_deg <= max_slope:
        slope_score = 100
    else:
        diff = slope_deg - max_slope
        slope_score = max(20, 100 - diff * 15.0)

    # 4. Soil Group (25%)
    if soil_group_id in crop.get("soil_groups_s1", []):
        soil_score = 100
    elif soil_group_id in crop.get("soil_groups_s2", []):
        soil_score = 80
    else:
        soil_score = 40

    total = (
        climate_score * 0.30 +
        moisture_ndvi_score * 0.25 +
        slope_score * 0.20 +
        soil_score * 0.25
    )
    return int(max(30, min(98, total)))
