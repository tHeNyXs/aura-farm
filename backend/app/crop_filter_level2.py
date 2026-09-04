"""
Level 2 Crop-Specific Suitability Module for Aura Farm v2.0
ประเมินความเหมาะสมของ 13 พืชจากชุดข้อมูลเขตความเหมาะสมของที่ดิน (LDD Zoning)
ด้วยวิธีปัจจัยจำกัดสูงสุด (Maximum Limitation Method อิง FAO 1983)
"""

import logging
from typing import List, Dict, Any, Tuple

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("crop_filter_level2")

# Source profiles used to form the exact 13 crops in the downloadable LDD Zoning dataset.
CROP_REQUIREMENTS: List[Dict[str, Any]] = [
    # หมวดที่ 1: พืชไร่และธัญพืชหลัก (5 ชนิด)
    {
        "id": "jasmine_rice",
        "name": "ข้าวหอมมะลิ 105",
        "category": "พืชไร่ / ธัญพืช",
        "icon_emoji": "🌾",
        "ldd_criteria": {
            "slope": {"s1": (0, 1.2), "s2": (1.2, 3.0), "s3": (3.0, 7.0)},
            "ph": {"s1": (5.5, 6.5), "s2": (5.0, 7.5), "s3": (4.5, 8.0)},
            "moisture": {"s1": (60, 95), "s2": (48, 60), "s3": (35, 48)},
            "rainfall": {"s1": (1300, 2000), "s2": (1100, 1300), "s3": (900, 1100)}
        },
        "description": "ข้าวคุณภาพสูงส่งออกอันดับ 1 ของไทย ไวต่อช่วงแสง ต้องการที่ราบลุ่มกักเก็บน้ำได้สม่ำเสมอ"
    },
    {
        "id": "lowland_rice",
        "name": "ข้าวนาปรัง / ข้าวทั่วไป (กข)",
        "category": "พืชไร่ / ธัญพืช",
        "icon_emoji": "🌾",
        "ldd_criteria": {
            "slope": {"s1": (0, 1.2), "s2": (1.2, 3.0), "s3": (3.0, 6.0)},
            "ph": {"s1": (5.5, 7.0), "s2": (5.0, 7.5), "s3": (4.5, 8.0)},
            "moisture": {"s1": (60, 95), "s2": (50, 60), "s3": (40, 50)},
            "rainfall": {"s1": (1000, 1800), "s2": (800, 1000), "s3": (600, 800)}
        },
        "description": "ข้าวไม่ไวต่อช่วงแสง ผลผลิตต่อไร่สูงมากในเขตชลประทานที่ราบภาคกลาง"
    },
    {
        "id": "cassava",
        "name": "มันสำปะหลัง (Cassava)",
        "category": "พืชไร่ / ธัญพืช",
        "icon_emoji": "🥔",
        "ldd_criteria": {
            "slope": {"s1": (0, 4.5), "s2": (4.5, 7.0), "s3": (7.0, 10.0)},
            "ph": {"s1": (5.0, 6.5), "s2": (4.5, 7.5), "s3": (4.0, 8.0)},
            "moisture": {"s1": (30, 65), "s2": (65, 75), "s3": (20, 30)},
            "rainfall": {"s1": (1000, 1500), "s2": (800, 1000), "s3": (600, 800)}
        },
        "description": "พืชไร่ทนแล้ง ระบายน้ำดี ไม่ชอบน้ำขัง นิยมในภาคอีสานและภาคกลาง"
    },
    {
        "id": "sugarcane",
        "name": "อ้อยโรงงาน (Sugarcane)",
        "category": "พืชไร่ / ธัญพืช",
        "icon_emoji": "🎋",
        "ldd_criteria": {
            "slope": {"s1": (0, 3.5), "s2": (3.5, 6.0), "s3": (6.0, 9.0)},
            "ph": {"s1": (5.5, 7.0), "s2": (5.0, 7.8), "s3": (4.5, 8.2)},
            "moisture": {"s1": (40, 72), "s2": (72, 80), "s3": (30, 40)},
            "rainfall": {"s1": (1100, 1600), "s2": (900, 1100), "s3": (750, 900)}
        },
        "description": "พืชอุตสาหกรรมน้ำตาลและพลังงานชีวภาพ เติบโตดีในพื้นที่แดดจัด ดินลึกระบายน้ำดี"
    },
    {
        "id": "maize",
        "name": "ข้าวโพดเลี้ยงสัตว์ (Field Corn)",
        "category": "พืชไร่ / ธัญพืช",
        "icon_emoji": "🌽",
        "ldd_criteria": {
            "slope": {"s1": (0, 4.0), "s2": (4.0, 7.5), "s3": (7.5, 12.0)},
            "ph": {"s1": (5.8, 7.0), "s2": (5.2, 7.5), "s3": (4.8, 8.0)},
            "moisture": {"s1": (40, 70), "s2": (70, 78), "s3": (30, 40)},
            "rainfall": {"s1": (950, 1400), "s2": (800, 950), "s3": (650, 800)}
        },
        "description": "วัตถุดิบหลักอุตสาหกรรมอาหารสัตว์ เติบโตเร็วในดินร่วนที่มีการระบายน้ำดี"
    },

    # หมวดที่ 2: ไม้ยืนต้นและพืชอุตสาหกรรมหลัก (5 ชนิด)
    {
        "id": "rubber_tree",
        "name": "ยางพารา (Rubber Tree)",
        "category": "ไม้ยืนต้น / อุตสาหกรรม",
        "icon_emoji": "🌳",
        "ldd_criteria": {
            "slope": {"s1": (0, 6.0), "s2": (6.0, 10.0), "s3": (10.0, 15.0)},
            "ph": {"s1": (4.5, 5.5), "s2": (4.0, 6.5), "s3": (3.8, 7.0)},
            "moisture": {"s1": (55, 80), "s2": (45, 55), "s3": (35, 45)},
            "rainfall": {"s1": (1600, 2500), "s2": (1350, 1600), "s3": (1150, 1350)}
        },
        "description": "ไม้ยืนต้นเศรษฐกิจสำคัญ ต้องการดินลึก หน้าดินหนา ฝนตกชุกมากกว่า 1,500 มม."
    },
    {
        "id": "oil_palm",
        "name": "ปาล์มน้ำมัน (Oil Palm)",
        "category": "ไม้ยืนต้น / อุตสาหกรรม",
        "icon_emoji": "🌴",
        "ldd_criteria": {
            "slope": {"s1": (0, 4.5), "s2": (4.5, 8.0), "s3": (8.0, 12.0)},
            "ph": {"s1": (4.5, 6.0), "s2": (4.0, 6.8), "s3": (3.8, 7.2)},
            "moisture": {"s1": (65, 88), "s2": (55, 65), "s3": (45, 55)},
            "rainfall": {"s1": (1900, 3000), "s2": (1600, 1900), "s3": (1300, 1600)}
        },
        "description": "พืชพลังงานและน้ำมันพืช ต้องการน้ำฝนสม่ำเสมอมากกว่า 1,800 มม./ปี ดินชุ่มชื้นสูง แดดจัด"
    },
    {
        "id": "robusta_coffee",
        "name": "กาแฟโรบัสต้า (Robusta Coffee)",
        "category": "ไม้ยืนต้น / อุตสาหกรรม",
        "icon_emoji": "☕",
        "ldd_criteria": {
            "slope": {"s1": (0, 6.0), "s2": (6.0, 10.0), "s3": (10.0, 14.0)},
            "ph": {"s1": (5.0, 6.5), "s2": (4.5, 7.0), "s3": (4.0, 7.5)},
            "moisture": {"s1": (55, 78), "s2": (45, 55), "s3": (78, 85)},
            "rainfall": {"s1": (1600, 2400), "s2": (1350, 1600), "s3": (1150, 1350)}
        },
        "description": "กาแฟสำหรับกาแฟสำเร็จรูปและเอสเปรสโซ่ เติบโตได้ดีในระดับความสูงต่ำถึงปานกลาง ฝนตกชุก ภาคใต้"
    },
    {
        "id": "arabica_coffee",
        "name": "กาแฟอาราบิก้า (Arabica Coffee)",
        "category": "ไม้ยืนต้น / อุตสาหกรรม",
        "icon_emoji": "☕",
        "min_elevation": 800,
        "ldd_criteria": {
            "slope": {"s1": (0, 7.0), "s2": (7.0, 12.0), "s3": (12.0, 18.0)},
            "ph": {"s1": (5.5, 6.5), "s2": (5.0, 7.0), "s3": (4.5, 7.5)},
            "moisture": {"s1": (50, 75), "s2": (40, 50), "s3": (75, 82)},
            "rainfall": {"s1": (1400, 2000), "s2": (1200, 1400), "s3": (1000, 1200)}
        },
        "description": "กาแฟพรีเมียมเฉพาะถิ่น ต้องการสภาพอากาศหนาวเย็นบนภูเขาสูงกว่า 800 เมตรจากระดับน้ำทะเลขึ้นไป"
    },
    {
        "id": "coconut",
        "name": "มะพร้าว (Coconut)",
        "category": "ไม้ยืนต้น / อุตสาหกรรม",
        "icon_emoji": "🥥",
        "ldd_criteria": {
            "slope": {"s1": (0, 3.5), "s2": (3.5, 6.0), "s3": (6.0, 9.0)},
            "ph": {"s1": (5.5, 7.2), "s2": (5.0, 7.8), "s3": (4.5, 8.2)},
            "moisture": {"s1": (50, 78), "s2": (40, 50), "s3": (78, 86)},
            "rainfall": {"s1": (1400, 2200), "s2": (1150, 1400), "s3": (950, 1150)}
        },
        "description": "พืชเศรษฐกิจสำคัญ ทั้งเพื่อการบริโภคสด กะทิ และน้ำมันสกัดเย็น ทนลมและดินทรายชายฝั่งได้ดี"
    },

    # หมวดที่ 3: ไม้ผลเศรษฐกิจส่งออกหลัก (5 ชนิด)
    {
        "id": "durian",
        "name": "ทุเรียนหมอนทอง (Durian)",
        "category": "ไม้ผลเศรษฐกิจ",
        "icon_emoji": "🛕",
        "ldd_criteria": {
            "slope": {"s1": (0, 4.5), "s2": (4.5, 7.5), "s3": (7.5, 11.0)},
            "ph": {"s1": (5.5, 6.5), "s2": (5.0, 7.0), "s3": (4.5, 7.5)},
            "moisture": {"s1": (55, 75), "s2": (48, 55), "s3": (75, 82)},
            "rainfall": {"s1": (1600, 2400), "s2": (1350, 1600), "s3": (1150, 1350)}
        },
        "description": "ราชาแห่งผลไม้มูลค่าส่งออกสูงสุดของไทย อ่อนไหวต่อน้ำขัง ต้องการดินระบายน้ำดีเลิศ แหล่งน้ำสะอาดสม่ำเสมอ"
    },
    {
        "id": "mangosteen",
        "name": "มังคุด (Mangosteen)",
        "category": "ไม้ผลเศรษฐกิจ",
        "icon_emoji": "🫐",
        "ldd_criteria": {
            "slope": {"s1": (0, 4.5), "s2": (4.5, 7.5), "s3": (7.5, 11.0)},
            "ph": {"s1": (5.5, 6.5), "s2": (5.0, 7.0), "s3": (4.5, 7.5)},
            "moisture": {"s1": (60, 80), "s2": (50, 60), "s3": (80, 86)},
            "rainfall": {"s1": (1700, 2600), "s2": (1400, 1700), "s3": (1200, 1400)}
        },
        "description": "ราชินีแห่งผลไม้ นิยมปลูกร่วมกับทุเรียน ต้องการความชื้นในบรรยากาศและดินสูง ฝนตกชุก"
    },
    {
        "id": "longan",
        "name": "ลำไย (Longan)",
        "category": "ไม้ผลเศรษฐกิจ",
        "icon_emoji": "🍈",
        "ldd_criteria": {
            "slope": {"s1": (0, 4.5), "s2": (4.5, 7.5), "s3": (7.5, 11.0)},
            "ph": {"s1": (5.5, 6.8), "s2": (5.0, 7.2), "s3": (4.5, 7.8)},
            "moisture": {"s1": (45, 70), "s2": (35, 45), "s3": (70, 78)},
            "rainfall": {"s1": (1100, 1600), "s2": (900, 1100), "s3": (750, 900)}
        },
        "description": "ไม้ผลเศรษฐกิจหลักภาคเหนือ ต้องการช่วงอากาศแห้งและหนาวสั้นๆ เพื่อกระตุ้นการออกดอก"
    },
    {
        "id": "mango",
        "name": "มะม่วงน้ำดอกไม้ (Mango)",
        "category": "ไม้ผลเศรษฐกิจ",
        "icon_emoji": "🥭",
        "ldd_criteria": {
            "slope": {"s1": (0, 4.5), "s2": (4.5, 7.5), "s3": (7.5, 11.0)},
            "ph": {"s1": (5.5, 7.0), "s2": (5.0, 7.5), "s3": (4.5, 8.0)},
            "moisture": {"s1": (38, 68), "s2": (68, 78), "s3": (25, 38)},
            "rainfall": {"s1": (1000, 1500), "s2": (800, 1000), "s3": (650, 800)}
        },
        "description": "ผลไม้ส่งออกยอดนิยม ปรับตัวเก่ง ทนแล้งได้ดีมาก ต้องการช่วงแห้งแล้งสั้นๆ เพื่อแทงช่อดอก"
    },
    {
        "id": "pineapple",
        "name": "สับปะรดโรงงาน (Pineapple)",
        "category": "ไม้ผลเศรษฐกิจ",
        "icon_emoji": "🍍",
        "ldd_criteria": {
            "slope": {"s1": (0, 4.5), "s2": (4.5, 8.0), "s3": (8.0, 12.0)},
            "ph": {"s1": (4.5, 5.5), "s2": (4.0, 6.2), "s3": (3.8, 6.8)},
            "moisture": {"s1": (35, 65), "s2": (65, 75), "s3": (25, 35)},
            "rainfall": {"s1": (1050, 1550), "s2": (850, 1050), "s3": (700, 850)}
        },
        "description": "พืชเศรษฐกิจทนแล้งส่งออกสำคัญ ชอบดินกรดอ่อน ดินทราย ระบายน้ำดี ไม่ชอบน้ำขัง"
    }
]

# LDD publishes a single Rice zoning layer. Keep the old rice profile only as
# agronomic metadata, merge it into that layer, and exclude Mango because this
# downloaded 13-crop Zoning dataset has no Mango layer.
_rice_profile = next(crop for crop in CROP_REQUIREMENTS if crop["id"] == "jasmine_rice")
_ldd_rice = {
    **_rice_profile,
    "id": "rice",
    "name": "ข้าว (Rice)",
    "description": "ผลประเมินอ้างอิงเขตความเหมาะสมของที่ดินสำหรับข้าวจาก LDD Zoning",
}
CROP_REQUIREMENTS = [
    _ldd_rice,
    *[
        crop for crop in CROP_REQUIREMENTS
        if crop["id"] not in {"jasmine_rice", "lowland_rice", "mango"}
    ],
]

def check_ldd_range(value: float, ranges: Dict[str, Tuple[float, float]], param_name: str, unit: str = "") -> Tuple[str, str]:
    """
    ตรวจสอบค่าที่วัดได้ว่าตกอยู่ในช่วง S1, S2, S3 หรือ N
    คืนค่า (เกรด, ข้อความเหตุผลหากไม่ถึง S1)
    """
    s1_min, s1_max = ranges["s1"]
    s2_min, s2_max = ranges["s2"]
    s3_min, s3_max = ranges["s3"]

    if s1_min <= value <= s1_max:
        return "S1", ""
    elif s2_min <= value <= s2_max:
        return "S2", f"{param_name} ({value}{unit}) อยู่ในเกณฑ์ปานกลาง S2 (เกณฑ์ S1 คือ {s1_min}-{s1_max}{unit})"
    elif s3_min <= value <= s3_max:
        return "S3", f"{param_name} ({value}{unit}) มีข้อจำกัดระดับ S3 (เกณฑ์ S1 คือ {s1_min}-{s1_max}{unit})"
    else:
        return "N", f"{param_name} ({value}{unit}) ไม่อยู่ในเกณฑ์ที่เหมาะสม N (เกณฑ์ S1 คือ {s1_min}-{s1_max}{unit})"


def filter_crops_from_ldd_zoning(
    zoning_result: Dict[str, Any],
    is_built_up: bool = False,
    is_water: bool = False,
) -> List[Dict[str, Any]]:
    """Return crop grades solely from official LDD Zoning overlay results.

    Satellite observations are deliberately only a current-surface safety mask.
    They never manufacture an S1/S2/S3/N crop grade when LDD has no coverage.
    """
    zoning_by_id = {item.get("crop_id"): item for item in zoning_result.get("crops", [])}
    labels = {
        "S1": "เหมาะสมมาก (S1)", "S2": "เหมาะสมปานกลาง (S2)",
        "S3": "เหมาะสมน้อย (S3)", "N": "ไม่แนะนำ (N)",
    }
    results: List[Dict[str, Any]] = []
    for crop in CROP_REQUIREMENTS:
        zoning = zoning_by_id.get(crop["id"], {})
        official_grade = zoning.get("official_grade")
        coverage_pct = float(zoning.get("coverage_pct", 0) or 0)
        if is_water or is_built_up:
            grade, reason = "N", "ข้อมูลดาวเทียมตรวจพบแหล่งน้ำหรือสิ่งปลูกสร้าง จึงไม่แนะนำปลูกในสภาพปัจจุบัน"
        elif official_grade and coverage_pct >= 50:
            grade = official_grade
            reason = f"LDD Zoning: {grade} ครอบคลุม {zoning.get('area_share_pct', {}).get(grade, 0)}% ของแปลง"
        else:
            grade, reason = "NO_DATA", "LDD Zoning ไม่มีข้อมูลครอบคลุมเพียงพอสำหรับพืชนี้ จึงไม่จัดเกรด"
        results.append({
            "id": crop["id"], "name": crop["name"], "category": crop["category"],
            "icon_emoji": crop["icon_emoji"], "grade": grade,
            "fao_label": labels.get(grade, "ไม่มีข้อมูล LDD"),
            "match_percentage": round(float(zoning.get("area_share_pct", {}).get(grade, 0) or 0)),
            "description": crop["description"], "limiting_factors": [reason],
            "is_masked_out": grade == "N", "mask_reason": reason,
            "ldd_data_available": grade in labels,
        })
    priority = {"S1": 4, "S2": 3, "S3": 2, "N": 1, "NO_DATA": 0}
    results.sort(key=lambda item: priority[item["grade"]], reverse=True)
    return results

def filter_crops(
    slope_deg: float = 0.0,
    soil_ph: float = 6.5,
    moisture_pct: float = 50.0,
    rainfall_mm: float = 1200.0,
    is_built_up: bool = False,
    is_water: bool = False,
    elevation_m: float = 100.0,
    **kwargs
) -> List[Dict[str, Any]]:
    """
    ประเมินพืช LDD Zoning 13 ชนิดด้วยวิธีปัจจัยจำกัดสูงสุด (Maximum Limitation Method - FAO 1983)
    รองรับทั้งการเรียกโดยตรง และการเรียกผ่าน main.py (gee_data, level1_result)
    """
    if "gee_data" in kwargs:
        gd = kwargs["gee_data"]
        slope_deg = gd.get("slope_degrees", slope_deg)
        rainfall_mm = gd.get("annual_rainfall_mm", rainfall_mm)
        elevation_m = gd.get("elevation_m", elevation_m)
        sar_db = gd.get("sar_vv_db", -12.0)
        # แปลง SAR backscatter VV dB เป็นความชื้นผิวดินโดยประมาณ
        moisture_pct = max(10.0, min(95.0, (sar_db + 22.0) * 5.0))

    if "level1_result" in kwargs:
        l1 = kwargs["level1_result"]
        if isinstance(l1, dict) and l1.get("is_masked_out"):
            is_built_up = True

    if "is_built_up" in kwargs:
        is_built_up = kwargs["is_built_up"]

    if "is_water" in kwargs:
        is_water = kwargs["is_water"]

    if "soil_ph" in kwargs:
        soil_ph = kwargs["soil_ph"]
    ranked_crops = []

    grade_weights = {"S1": 4, "S2": 3, "S3": 2, "N": 1}
    score_map = {"S1": 95, "S2": 78, "S3": 58, "N": 20}
    label_map = {
        "S1": "เหมาะสมมาก (S1)",
        "S2": "เหมาะสมปานกลาง (S2)",
        "S3": "เหมาะสมน้อย (S3)",
        "N": "ไม่แนะนำ (N)"
    }

    for crop in CROP_REQUIREMENTS:
        limiting_factors = []

        if is_water:
            final_grade = "N"
            final_label = "ไม่แนะนำ (N)"
            final_score = 0
            is_masked = True
            mask_reason = "พื้นที่เป็นแหล่งน้ำหรือพื้นที่ชุ่มน้ำถาวร ไม่มีหน้าดินสำหรับการเพาะปลูกพืชบก"
            limiting_factors.append(mask_reason)
        elif is_built_up:
            final_grade = "N"
            final_label = "ไม่แนะนำ (N)"
            final_score = 15
            is_masked = True
            mask_reason = "พื้นที่เป็นสิ่งปลูกสร้าง/หลังคาคอนกรีต ไม่มีหน้าดินสำหรับการปลูกลงดิน"
            limiting_factors.append(mask_reason)
        else:
            # Check high altitude specific crops (e.g. Arabica Coffee)
            min_elev = crop.get("min_elevation")
            if min_elev and elevation_m < min_elev:
                final_grade = "N"
                final_label = "ไม่แนะนำ (N)"
                final_score = 25
                is_masked = True
                mask_reason = f"ระดับความสูง ({elevation_m} ม.) ต่ำกว่าเกณฑ์พืชที่สูง ({min_elev} ม.)"
                limiting_factors.append(mask_reason)
            else:
                crit = crop["ldd_criteria"]
                factor_grades = []

                # 1. Slope
                g_slope, r_slope = check_ldd_range(slope_deg, crit["slope"], "ความลาดชัน", "°")
                factor_grades.append(g_slope)
                if r_slope:
                    limiting_factors.append(r_slope)

                # 2. pH
                g_ph, r_ph = check_ldd_range(soil_ph, crit["ph"], "ค่า pH ดิน", "")
                factor_grades.append(g_ph)
                if r_ph:
                    limiting_factors.append(r_ph)

                # 3. Moisture
                g_moist, r_moist = check_ldd_range(moisture_pct, crit["moisture"], "ความชื้นผิวดิน", "%")
                factor_grades.append(g_moist)
                if r_moist:
                    limiting_factors.append(r_moist)

                # 4. Rainfall
                g_rain, r_rain = check_ldd_range(rainfall_mm, crit["rainfall"], "ปริมาณฝนสะสม", " มม.")
                factor_grades.append(g_rain)
                if r_rain:
                    limiting_factors.append(r_rain)

                # LDD Maximum Limitation Rule: worst factor grade defines the crop grade
                worst_grade = min(factor_grades, key=lambda g: grade_weights[g])
                final_grade = worst_grade
                final_label = label_map[final_grade]
                final_score = score_map[final_grade]
                is_masked = final_grade == "N"
                mask_reason = limiting_factors[0] if is_masked and limiting_factors else None

        ranked_crops.append({
            "id": crop["id"],
            "name": crop["name"],
            "category": crop["category"],
            "icon_emoji": crop["icon_emoji"],
            "grade": final_grade,
            "fao_label": final_label,
            "match_percentage": final_score,
            "description": crop["description"],
            "limiting_factors": limiting_factors,
            "is_masked_out": is_masked,
            "mask_reason": mask_reason
        })

    # Sort crops: S1 > S2 > S3 > N, then by match_percentage descending
    priority_map = {"S1": 4, "S2": 3, "S3": 2, "N": 1}
    ranked_crops.sort(key=lambda c: (priority_map[c["grade"]], c["match_percentage"]), reverse=True)

    for i, c in enumerate(ranked_crops, 1):
        c["rank"] = i

    logger.info(f"Level 2 LDD Crop Filtering completed: {len(ranked_crops)} crops evaluated via Maximum Limitation Method.")
    return ranked_crops
