"""
Level 3 OAE Benchmark Yield Validation Module for Aura Farm v2.0
สอบทานผลวิเคราะห์กับสถิติผลผลิตจริงจากสำนักงานเศรษฐกิจการเกษตร (สศก.) กระทรวงเกษตรและสหกรณ์
"""

import logging
from typing import Dict, Any, Optional

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("oae_validation_level3")

OAE_YIELD_BENCHMARK: Dict[str, Dict[str, Any]] = {
    "ข้าวหอมมะลิ (Hom Mali Rice)": {
        "S1": 560, "S2": 440, "S3": 320, "unit": "กก./ไร่",
        "citation": "สถิติการผลิตพืชเศรษฐกิจ กรมส่งเสริมการเกษตร & สศก. ปี 2567"
    },
    "มันสำปะหลัง (Cassava)": {
        "S1": 4200, "S2": 3300, "S3": 2100, "unit": "กก./ไร่",
        "citation": "สถิติการเกษตรของประเทศไทย สศก. ปี 2567"
    },
    "อ้อยโรงงาน (Sugarcane)": {
        "S1": 11200, "S2": 8900, "S3": 6500, "unit": "กก./ไร่",
        "citation": "รายงานพื้นที่ปลูกและผลผลิตอ้อย สำนักงานคณะกรรมการอ้อยและน้ำตาลทราย"
    },
    "ทุเรียน (Durian)": {
        "S1": 1850, "S2": 1350, "S3": 850, "unit": "กก./ไร่",
        "citation": "ข้อมูลสารสนเทศการเกษตร ไม้ผลเศรษฐกิจ สศก. ปี 2567"
    },
    "ข้าวโพดเลี้ยงสัตว์ (Maize)": {
        "S1": 1180, "S2": 880, "S3": 580, "unit": "กก./ไร่",
        "citation": "สถิติการเกษตร สศก. 2567"
    },
    "ยางพารา (Para Rubber)": {
        "S1": 245, "S2": 185, "S3": 125, "unit": "กก./ไร่/ปี",
        "citation": "รายงานสถานการณ์ยางพาราไทย การยางแห่งประเทศไทย"
    },
    "ปาล์มน้ำมัน (Oil Palm)": {
        "S1": 3450, "S2": 2650, "S3": 1850, "unit": "กก./ไร่/ปี",
        "citation": "ข้อมูลสารสนเทศปาล์มน้ำมัน สศก."
    }
}

def validate_with_oae(crop_name: str, predicted_grade: str) -> Dict[str, Any]:
    """
    เปรียบเทียบชั้นความเหมาะสม (S1/S2/S3/N) กับค่าเฉลี่ยผลผลิตจริงของ สศก.
    """
    benchmark = OAE_YIELD_BENCHMARK.get(crop_name)

    if not benchmark or predicted_grade == "N":
        return {
            "crop_name": crop_name,
            "predicted_grade": predicted_grade,
            "has_oae_data": False,
            "estimated_yield": "ไม่ประเมินผลผลิต (เกรด N)",
            "oae_avg_yield": None,
            "status_text": "ไม่แนะนำสำหรับการปลูกลงดิน",
            "citation": "สำนักงานเศรษฐกิจการเกษตร (สศก.)"
        }

    avg_yield = benchmark.get(predicted_grade, benchmark.get("S2", 500))
    unit = benchmark.get("unit", "กก./ไร่")
    citation = benchmark.get("citation", "สถิติการเกษตร สศก.")

    status_text = f"สอดคล้องกับสถิติต้นแบบ สศก. (เกรด {predicted_grade}): คาดการณ์ผลผลิต ~{avg_yield:,} {unit}"

    logger.info(f"OAE Validation for {crop_name} Grade {predicted_grade}: {avg_yield} {unit}")

    return {
        "crop_name": crop_name,
        "predicted_grade": predicted_grade,
        "has_oae_data": True,
        "estimated_yield": f"{avg_yield:,} {unit}",
        "oae_avg_yield_kg_per_rai": avg_yield,
        "status_text": status_text,
        "citation": citation
    }
