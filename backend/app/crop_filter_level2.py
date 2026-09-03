"""
Level 2 Crop-Specific Suitability Module for Aura Farm v2.0
ประเมินความเหมาะสมของพืชเศรษฐกิจ 40 ชนิดตามเกณฑ์คู่มือกรมพัฒนาที่ดิน (LDD)
ด้วยวิธีปัจจัยจำกัดสูงสุด (Maximum Limitation Method อิง FAO 1983)
"""

import logging
from typing import List, Dict, Any, Tuple

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("crop_filter_level2")

# Database of 40 Thai Economic Crops with LDD S1, S2, S3 Criteria Matrix
CROP_REQUIREMENTS: List[Dict[str, Any]] = [
    # หมวดที่ 1: พืชไร่และธัญพืช (10 ชนิด)
    {
        "id": "rice_jasmine",
        "name": "ข้าวหอมมะลิ 105",
        "category": "พืชไร่ / ธัญพืช",
        "icon_emoji": "🌾",
        "ldd_criteria": {
            "slope": {"s1": (0, 1.2), "s2": (1.2, 3.0), "s3": (3.0, 7.0)},
            "ph": {"s1": (5.5, 6.5), "s2": (5.0, 7.5), "s3": (4.5, 8.0)},
            "moisture": {"s1": (60, 95), "s2": (48, 60), "s3": (35, 48)},
            "rainfall": {"s1": (1300, 2000), "s2": (1100, 1300), "s3": (900, 1100)}
        },
        "description": "ข้าวคุณภาพสูง ชอบที่ราบลุ่ม อุ้มน้ำได้ดี"
    },
    {
        "id": "rice_dry",
        "name": "ข้าวนาปรัง (กข)",
        "category": "พืชไร่ / ธัญพืช",
        "icon_emoji": "🌾",
        "ldd_criteria": {
            "slope": {"s1": (0, 1.2), "s2": (1.2, 3.0), "s3": (3.0, 6.0)},
            "ph": {"s1": (5.5, 7.0), "s2": (5.0, 7.5), "s3": (4.5, 8.0)},
            "moisture": {"s1": (60, 95), "s2": (50, 60), "s3": (40, 50)},
            "rainfall": {"s1": (1000, 1800), "s2": (800, 1000), "s3": (600, 800)}
        },
        "description": "ข้าวไม่ไวต่อช่วงแสง ผลผลิตต่อไร่สูงมากในเขตชลประทาน"
    },
    {
        "id": "cassava",
        "name": "มันสำปะหลัง (Cassava)",
        "category": "พืชไร่ / ธัญพืช",
        "icon_emoji": "🥔",
        "ldd_criteria": {
            "slope": {"s1": (1.2, 4.5), "s2": (0, 1.2), "s3": (4.5, 8.0)},
            "ph": {"s1": (5.0, 6.5), "s2": (4.5, 7.5), "s3": (4.0, 8.0)},
            "moisture": {"s1": (30, 65), "s2": (65, 75), "s3": (20, 30)},
            "rainfall": {"s1": (1000, 1500), "s2": (800, 1000), "s3": (600, 800)}
        },
        "description": "พืชไร่ทนแล้ง ระบายน้ำดี ไม่ชอบน้ำขัง"
    },
    {
        "id": "sugarcane",
        "name": "อ้อยโรงงาน (Sugarcane)",
        "category": "พืชไร่ / ธัญพืช",
        "icon_emoji": "🎋",
        "ldd_criteria": {
            "slope": {"s1": (0.5, 3.0), "s2": (3.0, 5.0), "s3": (5.0, 8.0)},
            "ph": {"s1": (5.5, 7.0), "s2": (5.0, 7.8), "s3": (4.5, 8.2)},
            "moisture": {"s1": (40, 72), "s2": (72, 80), "s3": (30, 40)},
            "rainfall": {"s1": (1100, 1600), "s2": (900, 1100), "s3": (750, 900)}
        },
        "description": "พืชอุตสาหกรรมชอบแสงแดดและดินร่วนเหนียว"
    },
    {
        "id": "maize",
        "name": "ข้าวโพดเลี้ยงสัตว์ (Maize)",
        "category": "พืชไร่ / ธัญพืช",
        "icon_emoji": "🌽",
        "ldd_criteria": {
            "slope": {"s1": (0.5, 3.5), "s2": (3.5, 6.0), "s3": (6.0, 9.0)},
            "ph": {"s1": (5.8, 7.0), "s2": (5.2, 7.5), "s3": (4.8, 8.0)},
            "moisture": {"s1": (45, 70), "s2": (35, 45), "s3": (70, 78)},
            "rainfall": {"s1": (1000, 1400), "s2": (850, 1000), "s3": (700, 850)}
        },
        "description": "พืชไร่หมุนเวียน ต้องการดินร่วนระบายน้ำดี"
    },
    {
        "id": "sweet_corn",
        "name": "ข้าวโพดหวาน (Sweet Corn)",
        "category": "พืชไร่ / ธัญพืช",
        "icon_emoji": "🌽",
        "ldd_criteria": {
            "slope": {"s1": (0.5, 2.5), "s2": (2.5, 4.5), "s3": (4.5, 7.0)},
            "ph": {"s1": (5.8, 6.8), "s2": (5.2, 7.4), "s3": (4.8, 7.8)},
            "moisture": {"s1": (50, 70), "s2": (40, 50), "s3": (70, 78)},
            "rainfall": {"s1": (1000, 1400), "s2": (850, 1000), "s3": (700, 850)}
        },
        "description": "พืชผักอายุสั้น 70 วัน ผลตอบแทนต่อไร่สูง"
    },
    {
        "id": "soybean",
        "name": "ถั่วเหลือง (Soybean)",
        "category": "พืชไร่ / ธัญพืช",
        "icon_emoji": "🫘",
        "ldd_criteria": {
            "slope": {"s1": (0.5, 2.0), "s2": (2.0, 4.0), "s3": (4.0, 6.0)},
            "ph": {"s1": (6.0, 7.0), "s2": (5.5, 7.5), "s3": (5.0, 8.0)},
            "moisture": {"s1": (48, 68), "s2": (38, 48), "s3": (68, 75)},
            "rainfall": {"s1": (900, 1300), "s2": (750, 900), "s3": (600, 750)}
        },
        "description": "พืชตระกูลถั่วบำรุงดิน ตรึงไนโตรเจน"
    },
    {
        "id": "mungbean",
        "name": "ถั่วเขียว (Mungbean)",
        "category": "พืชไร่ / ธัญพืช",
        "icon_emoji": "🫘",
        "ldd_criteria": {
            "slope": {"s1": (0.5, 2.5), "s2": (2.5, 4.5), "s3": (4.5, 7.0)},
            "ph": {"s1": (5.8, 7.2), "s2": (5.2, 7.6), "s3": (4.8, 8.0)},
            "moisture": {"s1": (35, 58), "s2": (25, 35), "s3": (58, 68)},
            "rainfall": {"s1": (800, 1200), "s2": (650, 800), "s3": (500, 650)}
        },
        "description": "พืชใช้น้ำน้อยมาก อายุสั้น 65 วัน"
    },
    {
        "id": "peanut",
        "name": "ถั่วลิสง (Peanut)",
        "category": "พืชไร่ / ธัญพืช",
        "icon_emoji": "🥜",
        "ldd_criteria": {
            "slope": {"s1": (0.5, 2.0), "s2": (2.0, 4.0), "s3": (4.0, 6.0)},
            "ph": {"s1": (5.8, 6.8), "s2": (5.2, 7.3), "s3": (4.8, 7.8)},
            "moisture": {"s1": (42, 65), "s2": (32, 42), "s3": (65, 72)},
            "rainfall": {"s1": (900, 1300), "s2": (750, 900), "s3": (600, 750)}
        },
        "description": "พืชตระกูลถั่วลงหัว ดินร่วนซุย"
    },
    {
        "id": "sorghum",
        "name": "ข้าวฟ่าง (Sorghum)",
        "category": "พืชไร่ / ธัญพืช",
        "icon_emoji": "🌾",
        "ldd_criteria": {
            "slope": {"s1": (1.0, 4.5), "s2": (4.5, 7.5), "s3": (7.5, 11.0)},
            "ph": {"s1": (5.5, 7.5), "s2": (5.0, 8.0), "s3": (4.5, 8.5)},
            "moisture": {"s1": (30, 58), "s2": (20, 30), "s3": (58, 68)},
            "rainfall": {"s1": (700, 1100), "s2": (550, 700), "s3": (450, 550)}
        },
        "description": "พืชทนแล้งและทนดินเค็มปานกลาง"
    },

    # หมวดที่ 2: ไม้ยืนต้นและพืชอุตสาหกรรม (8 ชนิด)
    {
        "id": "rubber",
        "name": "ยางพารา (Rubber)",
        "category": "ไม้ยืนต้น / อุตสาหกรรม",
        "icon_emoji": "🌲",
        "ldd_criteria": {
            "slope": {"s1": (1.2, 5.0), "s2": (5.0, 9.0), "s3": (9.0, 14.0)},
            "ph": {"s1": (4.5, 5.5), "s2": (4.2, 6.0), "s3": (4.0, 6.8)},
            "moisture": {"s1": (55, 80), "s2": (45, 55), "s3": (80, 88)},
            "rainfall": {"s1": (1600, 2500), "s2": (1350, 1600), "s3": (1150, 1350)}
        },
        "description": "พืชเศรษฐกิจยุทธศาสตร์ กรีดได้นาน 20 ปี"
    },
    {
        "id": "oil_palm",
        "name": "ปาล์มน้ำมัน (Oil Palm)",
        "category": "ไม้ยืนต้น / อุตสาหกรรม",
        "icon_emoji": "🌴",
        "ldd_criteria": {
            "slope": {"s1": (0.5, 3.0), "s2": (3.0, 5.5), "s3": (5.5, 9.0)},
            "ph": {"s1": (4.5, 6.0), "s2": (4.0, 6.5), "s3": (3.8, 7.2)},
            "moisture": {"s1": (62, 88), "s2": (52, 62), "s3": (42, 52)},
            "rainfall": {"s1": (1800, 2800), "s2": (1500, 1800), "s3": (1250, 1500)}
        },
        "description": "พืชน้ำมันเขตร้อน ต้องการฝนตกชุกชุ่มชื้น"
    },
    {
        "id": "coffee_arabica",
        "name": "กาแฟอาราบิก้า (Arabica Coffee)",
        "category": "ไม้ยืนต้น / อุตสาหกรรม",
        "icon_emoji": "☕",
        "min_elevation": 750,
        "ldd_criteria": {
            "slope": {"s1": (2.0, 9.0), "s2": (9.0, 15.0), "s3": (15.0, 22.0)},
            "ph": {"s1": (5.2, 6.2), "s2": (4.8, 6.8), "s3": (4.5, 7.2)},
            "moisture": {"s1": (55, 75), "s2": (45, 55), "s3": (75, 85)},
            "rainfall": {"s1": (1400, 2000), "s2": (1200, 1400), "s3": (1000, 1200)}
        },
        "description": "กาแฟพรีเมียม ต้องการอากาศหนาวเย็นบนพื้นที่สูง >800 ม."
    },
    {
        "id": "coffee_robusta",
        "name": "กาแฟโรบัสต้า (Robusta Coffee)",
        "category": "ไม้ยืนต้น / อุตสาหกรรม",
        "icon_emoji": "☕",
        "ldd_criteria": {
            "slope": {"s1": (1.2, 5.0), "s2": (5.0, 9.0), "s3": (9.0, 14.0)},
            "ph": {"s1": (5.0, 6.3), "s2": (4.6, 6.8), "s3": (4.2, 7.3)},
            "moisture": {"s1": (58, 80), "s2": (48, 58), "s3": (80, 88)},
            "rainfall": {"s1": (1600, 2400), "s2": (1350, 1600), "s3": (1150, 1350)}
        },
        "description": "กาแฟเขตร้อนชื้นภาคใต้ ปลูกได้ในที่ราบ"
    },
    {
        "id": "cocoa",
        "name": "โกโก้ (Cocoa)",
        "category": "ไม้ยืนต้น / อุตสาหกรรม",
        "icon_emoji": "🍫",
        "ldd_criteria": {
            "slope": {"s1": (1.0, 4.0), "s2": (4.0, 7.5), "s3": (7.5, 11.0)},
            "ph": {"s1": (5.5, 6.8), "s2": (5.0, 7.3), "s3": (4.5, 7.8)},
            "moisture": {"s1": (55, 78), "s2": (45, 55), "s3": (78, 86)},
            "rainfall": {"s1": (1500, 2200), "s2": (1300, 1500), "s3": (1100, 1300)}
        },
        "description": "พืชเศรษฐกิจใหม่ ปลูกแซมสวนมะพร้าวและกล้วย"
    },
    {
        "id": "eucalyptus",
        "name": "ยูคาลิปตัส (Eucalyptus)",
        "category": "ไม้ยืนต้น / อุตสาหกรรม",
        "icon_emoji": "🪵",
        "ldd_criteria": {
            "slope": {"s1": (1.0, 6.0), "s2": (6.0, 10.0), "s3": (10.0, 16.0)},
            "ph": {"s1": (4.5, 6.5), "s2": (4.0, 7.5), "s3": (3.8, 8.2)},
            "moisture": {"s1": (30, 70), "s2": (20, 30), "s3": (70, 80)},
            "rainfall": {"s1": (1000, 1600), "s2": (850, 1000), "s3": (700, 850)}
        },
        "description": "ไม้โตเร็วสำหรับอุตสาหกรรมเยื่อกระดาษ ทนแล้ง"
    },
    {
        "id": "bamboo",
        "name": "ไผ่ตง / ไผ่เลี้ยง (Bamboo)",
        "category": "ไม้ยืนต้น / อุตสาหกรรม",
        "icon_emoji": "🎍",
        "ldd_criteria": {
            "slope": {"s1": (1.0, 5.0), "s2": (5.0, 9.0), "s3": (9.0, 15.0)},
            "ph": {"s1": (5.2, 6.8), "s2": (4.8, 7.3), "s3": (4.5, 7.8)},
            "moisture": {"s1": (45, 75), "s2": (35, 45), "s3": (75, 85)},
            "rainfall": {"s1": (1100, 1800), "s2": (900, 1100), "s3": (750, 900)}
        },
        "description": "พืชสารพัดประโยชน์ เก็บหน่อและตัดลำไม้ไผ่"
    },
    {
        "id": "coconut_industrial",
        "name": "มะพร้าวแกง (Industrial Coconut)",
        "category": "ไม้ยืนต้น / อุตสาหกรรม",
        "icon_emoji": "🥥",
        "ldd_criteria": {
            "slope": {"s1": (0.5, 3.0), "s2": (3.0, 6.0), "s3": (6.0, 9.0)},
            "ph": {"s1": (5.5, 7.2), "s2": (5.0, 7.8), "s3": (4.5, 8.2)},
            "moisture": {"s1": (50, 78), "s2": (40, 50), "s3": (78, 86)},
            "rainfall": {"s1": (1400, 2200), "s2": (1150, 1400), "s3": (950, 1150)}
        },
        "description": "มะพร้าวผลใหญ่สำหรับคั้นกะทิและน้ำมันสกัดเย็น"
    },

    # หมวดที่ 3: ไม้ผลเศรษฐกิจ (12 ชนิด)
    {
        "id": "durian",
        "name": "ทุเรียนหมอนทอง (Durian)",
        "category": "ไม้ผลเศรษฐกิจ",
        "icon_emoji": "🛕",
        "ldd_criteria": {
            "slope": {"s1": (1.5, 4.5), "s2": (0.5, 1.5), "s3": (4.5, 8.0)},
            "ph": {"s1": (5.5, 6.5), "s2": (5.0, 7.0), "s3": (4.5, 7.5)},
            "moisture": {"s1": (55, 75), "s2": (48, 55), "s3": (75, 82)},
            "rainfall": {"s1": (1600, 2400), "s2": (1350, 1600), "s3": (1150, 1350)}
        },
        "description": "ราชาแห่งผลไม้ มูลค่าส่งออกสูงสุด ดินต้องระบายน้ำดีเลิศ"
    },
    {
        "id": "mangosteen",
        "name": "มังคุด (Mangosteen)",
        "category": "ไม้ผลเศรษฐกิจ",
        "icon_emoji": "🫐",
        "ldd_criteria": {
            "slope": {"s1": (1.0, 4.0), "s2": (4.0, 7.5), "s3": (7.5, 11.0)},
            "ph": {"s1": (5.5, 6.5), "s2": (5.0, 7.0), "s3": (4.5, 7.5)},
            "moisture": {"s1": (60, 80), "s2": (50, 60), "s3": (80, 86)},
            "rainfall": {"s1": (1700, 2600), "s2": (1400, 1700), "s3": (1200, 1400)}
        },
        "description": "ราชินีแห่งผลไม้ นิยมปลูกร่วมกับทุเรียน"
    },
    {
        "id": "rambutan",
        "name": "เงาะโรงเรียน (Rambutan)",
        "category": "ไม้ผลเศรษฐกิจ",
        "icon_emoji": "🔴",
        "ldd_criteria": {
            "slope": {"s1": (1.0, 3.5), "s2": (3.5, 6.5), "s3": (6.5, 9.5)},
            "ph": {"s1": (5.5, 6.5), "s2": (5.0, 7.0), "s3": (4.5, 7.5)},
            "moisture": {"s1": (55, 78), "s2": (45, 55), "s3": (78, 85)},
            "rainfall": {"s1": (1500, 2300), "s2": (1300, 1500), "s3": (1100, 1300)}
        },
        "description": "ผลไม้เขตร้อนชื้น ผลดก รสหวานฉ่ำ"
    },
    {
        "id": "longan",
        "name": "ลำไย (Longan)",
        "category": "ไม้ผลเศรษฐกิจ",
        "icon_emoji": "🟤",
        "ldd_criteria": {
            "slope": {"s1": (0.5, 3.0), "s2": (3.0, 5.5), "s3": (5.5, 8.5)},
            "ph": {"s1": (5.8, 6.8), "s2": (5.2, 7.3), "s3": (4.8, 7.8)},
            "moisture": {"s1": (48, 70), "s2": (38, 48), "s3": (70, 78)},
            "rainfall": {"s1": (1100, 1600), "s2": (950, 1100), "s3": (800, 950)}
        },
        "description": "ไม้ผลเศรษฐกิจหลักภาคเหนือ ตลาดจีนต้องการสูง"
    },
    {
        "id": "mango",
        "name": "มะม่วงน้ำดอกไม้ (Mango)",
        "category": "ไม้ผลเศรษฐกิจ",
        "icon_emoji": "🥭",
        "ldd_criteria": {
            "slope": {"s1": (0.5, 3.5), "s2": (3.5, 6.5), "s3": (6.5, 10.0)},
            "ph": {"s1": (5.5, 7.0), "s2": (5.0, 7.5), "s3": (4.5, 8.0)},
            "moisture": {"s1": (42, 68), "s2": (32, 42), "s3": (68, 76)},
            "rainfall": {"s1": (1000, 1500), "s2": (850, 1000), "s3": (700, 850)}
        },
        "description": "ผลไม้ส่งออกชั้นนำ ทนแล้งได้ดี"
    },
    {
        "id": "pomelo",
        "name": "ส้มโอขาวน้ำผึ้ง (Pomelo)",
        "category": "ไม้ผลเศรษฐกิจ",
        "icon_emoji": "🍊",
        "ldd_criteria": {
            "slope": {"s1": (0.5, 2.0), "s2": (2.0, 4.0), "s3": (4.0, 6.5)},
            "ph": {"s1": (5.8, 6.8), "s2": (5.2, 7.3), "s3": (4.8, 7.8)},
            "moisture": {"s1": (52, 75), "s2": (42, 52), "s3": (75, 82)},
            "rainfall": {"s1": (1200, 1800), "s2": (1000, 1200), "s3": (850, 1000)}
        },
        "description": "ผลไม้ GI คุณภาพสูง ปลูกในที่ราบลุ่มริมน้ำ"
    },
    {
        "id": "banana",
        "name": "กล้วยหอมทอง (Banana)",
        "category": "ไม้ผลเศรษฐกิจ",
        "icon_emoji": "🍌",
        "ldd_criteria": {
            "slope": {"s1": (0.5, 2.0), "s2": (2.0, 4.0), "s3": (4.0, 6.5)},
            "ph": {"s1": (5.8, 6.8), "s2": (5.2, 7.3), "s3": (4.8, 7.8)},
            "moisture": {"s1": (52, 75), "s2": (42, 52), "s3": (75, 82)},
            "rainfall": {"s1": (1200, 1800), "s2": (1000, 1200), "s3": (850, 1000)}
        },
        "description": "ผลไม้เงินสดโตเร็ว เก็บเกี่ยวได้ใน 9 เดือน"
    },
    {
        "id": "pineapple",
        "name": "สับปะรดโรงงาน (Pineapple)",
        "category": "ไม้ผลเศรษฐกิจ",
        "icon_emoji": "🍍",
        "ldd_criteria": {
            "slope": {"s1": (1.0, 4.5), "s2": (4.5, 7.5), "s3": (7.5, 12.0)},
            "ph": {"s1": (4.5, 5.8), "s2": (4.0, 6.5), "s3": (3.8, 7.0)},
            "moisture": {"s1": (32, 62), "s2": (22, 32), "s3": (62, 72)},
            "rainfall": {"s1": (1000, 1500), "s2": (800, 1000), "s3": (650, 800)}
        },
        "description": "พืชทนแล้งและทนดินกรดได้ยอดเยี่ยม"
    },
    {
        "id": "coconut_aromatic",
        "name": "มะพร้าวน้ำหอม (Aromatic Coconut)",
        "category": "ไม้ผลเศรษฐกิจ",
        "icon_emoji": "🥥",
        "ldd_criteria": {
            "slope": {"s1": (0, 1.5), "s2": (1.5, 3.0), "s3": (3.0, 5.0)},
            "ph": {"s1": (5.8, 7.0), "s2": (5.2, 7.5), "s3": (4.8, 8.0)},
            "moisture": {"s1": (58, 85), "s2": (48, 58), "s3": (38, 48)},
            "rainfall": {"s1": (1300, 2000), "s2": (1100, 1300), "s3": (900, 1100)}
        },
        "description": "มะพร้าวน้ำหอมเอกลักษณ์ไทย ตลาดส่งออกเติบโตสูง"
    },
    {
        "id": "guava",
        "name": "ฝรั่งกิมจู (Guava)",
        "category": "ไม้ผลเศรษฐกิจ",
        "icon_emoji": "🍈",
        "ldd_criteria": {
            "slope": {"s1": (0.5, 2.5), "s2": (2.5, 4.5), "s3": (4.5, 7.0)},
            "ph": {"s1": (5.5, 6.8), "s2": (5.0, 7.3), "s3": (4.5, 7.8)},
            "moisture": {"s1": (48, 72), "s2": (38, 48), "s3": (72, 80)},
            "rainfall": {"s1": (1100, 1600), "s2": (900, 1100), "s3": (750, 900)}
        },
        "description": "ผลไม้เพื่อสุขภาพ วิตามินซีสูง ได้ผลเร็วใน 8 เดือน"
    },
    {
        "id": "jackfruit",
        "name": "ขนุนทองประเสริฐ (Jackfruit)",
        "category": "ไม้ผลเศรษฐกิจ",
        "icon_emoji": "🍈",
        "ldd_criteria": {
            "slope": {"s1": (0.5, 3.0), "s2": (3.0, 5.5), "s3": (5.5, 8.5)},
            "ph": {"s1": (5.5, 6.8), "s2": (5.0, 7.3), "s3": (4.5, 7.8)},
            "moisture": {"s1": (42, 68), "s2": (32, 42), "s3": (68, 76)},
            "rainfall": {"s1": (1100, 1600), "s2": (900, 1100), "s3": (750, 900)}
        },
        "description": "ไม้ผลลูกยักษ์ ปลูกง่าย โตไว ทนแล้ง"
    },
    {
        "id": "papaya",
        "name": "มะละกอฮอลแลนด์ (Papaya)",
        "category": "ไม้ผลเศรษฐกิจ",
        "icon_emoji": "🥭",
        "ldd_criteria": {
            "slope": {"s1": (0.5, 2.5), "s2": (2.5, 4.5), "s3": (4.5, 7.0)},
            "ph": {"s1": (5.8, 6.8), "s2": (5.2, 7.3), "s3": (4.8, 7.8)},
            "moisture": {"s1": (45, 68), "s2": (35, 45), "s3": (68, 75)},
            "rainfall": {"s1": (1100, 1600), "s2": (900, 1100), "s3": (750, 900)}
        },
        "description": "ผลไม้โตเร็ว เก็บผลสุกเนื้อแน่น หรือผลดิบส่งร้านส้มตำ"
    },

    # หมวดที่ 4: พืชผักและสมุนไพรเศรษฐกิจ (10 ชนิด)
    {
        "id": "chili",
        "name": "พริกขี้หนู / พริกจินดา (Chili)",
        "category": "พืชผัก / สมุนไพร",
        "icon_emoji": "🌶️",
        "ldd_criteria": {
            "slope": {"s1": (0.5, 2.5), "s2": (2.5, 4.5), "s3": (4.5, 7.0)},
            "ph": {"s1": (5.8, 6.8), "s2": (5.2, 7.4), "s3": (4.8, 7.8)},
            "moisture": {"s1": (48, 68), "s2": (38, 48), "s3": (68, 76)},
            "rainfall": {"s1": (1000, 1500), "s2": (850, 1000), "s3": (700, 850)}
        },
        "description": "เครื่องเทศคู่ครัวไทย ราคาพุ่งสูงในฤดูหนาว"
    },
    {
        "id": "tomato",
        "name": "มะเขือเทศสีดา (Tomato)",
        "category": "พืชผัก / สมุนไพร",
        "icon_emoji": "🍅",
        "ldd_criteria": {
            "slope": {"s1": (0.5, 2.0), "s2": (2.0, 4.0), "s3": (4.0, 6.0)},
            "ph": {"s1": (6.0, 6.8), "s2": (5.5, 7.3), "s3": (5.0, 7.8)},
            "moisture": {"s1": (48, 68), "s2": (38, 48), "s3": (68, 75)},
            "rainfall": {"s1": (900, 1400), "s2": (750, 900), "s3": (600, 750)}
        },
        "description": "พืชผักผลสดรสชาติอร่อย ตลาดสดและโรงงานซอสต้องการ"
    },
    {
        "id": "lime",
        "name": "มะนาวแป้นพิจิตร (Lime)",
        "category": "พืชผัก / สมุนไพร",
        "icon_emoji": "🍋",
        "ldd_criteria": {
            "slope": {"s1": (0.5, 2.5), "s2": (2.5, 4.5), "s3": (4.5, 7.0)},
            "ph": {"s1": (5.8, 6.8), "s2": (5.2, 7.3), "s3": (4.8, 7.8)},
            "moisture": {"s1": (48, 68), "s2": (38, 48), "s3": (68, 76)},
            "rainfall": {"s1": (1000, 1500), "s2": (850, 1000), "s3": (700, 850)}
        },
        "description": "พืชเครื่องปรุงรส ราคาสูงลิ่วในฤดูแล้ง"
    },
    {
        "id": "ginger",
        "name": "ขิงแก่ (Ginger)",
        "category": "พืชผัก / สมุนไพร",
        "icon_emoji": "🫚",
        "ldd_criteria": {
            "slope": {"s1": (1.0, 4.0), "s2": (4.0, 7.0), "s3": (7.0, 10.0)},
            "ph": {"s1": (5.5, 6.5), "s2": (5.0, 7.0), "s3": (4.5, 7.5)},
            "moisture": {"s1": (55, 72), "s2": (45, 55), "s3": (72, 80)},
            "rainfall": {"s1": (1200, 1700), "s2": (1000, 1200), "s3": (850, 1000)}
        },
        "description": "พืชสมุนไพรและเครื่องเทศส่งออกสำคัญ"
    },
    {
        "id": "galangal",
        "name": "ข่าแกง (Galangal)",
        "category": "พืชผัก / สมุนไพร",
        "icon_emoji": "🫚",
        "ldd_criteria": {
            "slope": {"s1": (0.5, 3.0), "s2": (3.0, 5.5), "s3": (5.5, 8.5)},
            "ph": {"s1": (5.5, 6.8), "s2": (5.0, 7.3), "s3": (4.5, 7.8)},
            "moisture": {"s1": (50, 70), "s2": (40, 50), "s3": (70, 78)},
            "rainfall": {"s1": (1100, 1600), "s2": (900, 1100), "s3": (750, 900)}
        },
        "description": "เครื่องแกงหลัก ทนทาน ปลูกง่าย ให้ผลผลิตหัวดก"
    },
    {
        "id": "turmeric",
        "name": "ขมิ้นชัน (Turmeric)",
        "category": "พืชผัก / สมุนไพร",
        "icon_emoji": "🟡",
        "ldd_criteria": {
            "slope": {"s1": (0.5, 3.0), "s2": (3.0, 5.5), "s3": (5.5, 8.5)},
            "ph": {"s1": (5.5, 6.8), "s2": (5.0, 7.2), "s3": (4.5, 7.6)},
            "moisture": {"s1": (50, 70), "s2": (40, 50), "s3": (70, 78)},
            "rainfall": {"s1": (1200, 1700), "s2": (1000, 1200), "s3": (850, 1000)}
        },
        "description": "สมุนไพรสารเคอร์คูมินอยด์สูง เป็นที่ต้องการของอุตสาหกรรมยา"
    },
    {
        "id": "kariyat",
        "name": "ฟ้าทะลายโจร (Andrographis)",
        "category": "พืชผัก / สมุนไพร",
        "icon_emoji": "🌿",
        "ldd_criteria": {
            "slope": {"s1": (0.5, 2.0), "s2": (2.0, 4.0), "s3": (4.0, 6.0)},
            "ph": {"s1": (6.0, 7.0), "s2": (5.5, 7.5), "s3": (5.0, 7.8)},
            "moisture": {"s1": (48, 68), "s2": (38, 48), "s3": (68, 75)},
            "rainfall": {"s1": (1000, 1500), "s2": (850, 1000), "s3": (700, 850)}
        },
        "description": "สมุนไพรแชมเปี้ยนแห่งชาติ สารแอนโดรกราโฟไลด์สูง"
    },
    {
        "id": "lemongrass",
        "name": "ตะไคร้แกง (Lemongrass)",
        "category": "พืชผัก / สมุนไพร",
        "icon_emoji": "🌾",
        "ldd_criteria": {
            "slope": {"s1": (0.5, 2.5), "s2": (2.5, 5.0), "s3": (5.0, 8.0)},
            "ph": {"s1": (5.5, 7.0), "s2": (5.0, 7.5), "s3": (4.5, 8.0)},
            "moisture": {"s1": (48, 68), "s2": (38, 48), "s3": (68, 76)},
            "rainfall": {"s1": (1000, 1500), "s2": (850, 1000), "s3": (700, 850)}
        },
        "description": "เครื่องเทศคู่ครัวไทย ปลูกง่าย แตกกอดก"
    },
    {
        "id": "shallot",
        "name": "หอมแดง / กระเทียม (Shallot & Garlic)",
        "category": "พืชผัก / สมุนไพร",
        "icon_emoji": "🧅",
        "ldd_criteria": {
            "slope": {"s1": (0.5, 1.5), "s2": (1.5, 3.0), "s3": (3.0, 5.0)},
            "ph": {"s1": (6.0, 7.0), "s2": (5.5, 7.4), "s3": (5.0, 7.8)},
            "moisture": {"s1": (45, 65), "s2": (35, 45), "s3": (65, 72)},
            "rainfall": {"s1": (850, 1300), "s2": (700, 850), "s3": (550, 700)}
        },
        "description": "พืชเศรษฐกิจเงินล้านภาคเหนือและอีสาน ปลูกหน้าหนาว"
    },
    {
        "id": "watermelon",
        "name": "แตงโม (Watermelon)",
        "category": "พืชผัก / สมุนไพร",
        "icon_emoji": "🍉",
        "ldd_criteria": {
            "slope": {"s1": (0.5, 2.0), "s2": (2.0, 4.0), "s3": (4.0, 6.0)},
            "ph": {"s1": (5.8, 6.8), "s2": (5.2, 7.3), "s3": (4.8, 7.8)},
            "moisture": {"s1": (42, 62), "s2": (32, 42), "s3": (62, 70)},
            "rainfall": {"s1": (800, 1200), "s2": (650, 800), "s3": (500, 650)}
        },
        "description": "พืชเงินด่วนอายุสั้น 60 วัน คืนทุนไว ผลดก หวานกรอบ"
    }
]

def check_ldd_range(val: float, crit: Dict[str, Tuple[float, float]], factor_name: str, unit: str) -> Tuple[str, str]:
    """
    ตรวจสอบช่วงเกณฑ์ LDD ของปัจจัยหนึ่ง คืนค่า (grade, reason)
    """
    s1_min, s1_max = crit["s1"]
    s2_min, s2_max = crit["s2"]
    s3_min, s3_max = crit["s3"]

    if s1_min <= val <= s1_max:
        return "S1", ""
    elif s2_min <= val <= s2_max:
        return "S2", f"{factor_name} ({val}{unit}) อยู่ในเกณฑ์ปานกลาง S2 (เกณฑ์ S1 คือ {s1_min}-{s1_max}{unit})"
    elif s3_min <= val <= s3_max:
        return "S3", f"{factor_name} ({val}{unit}) มีข้อจำกัดระดับ S3 ต้องปรับปรุงแปลง (เกณฑ์ S1 คือ {s1_min}-{s1_max}{unit})"
    else:
        return "N", f"{factor_name} ({val}{unit}) อยู่นอกเกณฑ์เพาะปลูกระดับ N (เกณฑ์ S1 คือ {s1_min}-{s1_max}{unit})"

def filter_crops(gee_data: Dict[str, Any], level1_result: Dict[str, Any], soil_ph: float = 6.5) -> List[Dict[str, Any]]:
    """
    ประเมินและจัดอันดับพืชเศรษฐกิจ 40 ชนิดตามวิธีปัจจัยจำกัดสูงสุดของกรมพัฒนาที่ดิน (LDD Maximum Limitation Method)
    """
    is_built_up = level1_result.get("is_built_up", False)
    slope_deg = gee_data.get("slope_degrees", 1.5)
    moisture_pct = gee_data.get("soil_moisture_pct", 58.0)
    rainfall_mm = gee_data.get("annual_rainfall_mm", 1280.0)
    elevation_m = gee_data.get("elevation_m", 150.0)

    ranked_crops = []

    grade_weights = {"S1": 3, "S2": 2, "S3": 1, "N": 0}
    score_map = {"S1": 95, "S2": 75, "S3": 55, "N": 25}
    label_map = {
        "S1": "เหมาะสมมาก (S1)",
        "S2": "เหมาะสมปานกลาง (S2)",
        "S3": "เหมาะสมน้อย (S3)",
        "N": "ไม่แนะนำ (N)"
    }

    for crop in CROP_REQUIREMENTS:
        limiting_factors = []

        if is_built_up:
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
