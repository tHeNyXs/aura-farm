import { SoilGroupInfo } from "./types";

/**
 * Official Thailand Land Development Department (LDD) Soil Group Knowledge Base
 * ฐานข้อมูลลักษณะและสมบัติต่างๆ ของกลุ่มชุดดิน 62 กลุ่มชุดดินในประเทศไทย กรมพัฒนาที่ดิน (LDD)
 * รวมถึงพื้นที่ชุมชน สิ่งปลูกสร้าง (Urban Built-up) และแหล่งน้ำ
 */
export const THAILAND_SOIL_GROUPS: Record<number, SoilGroupInfo> = {
  1: {
    groupId: 1,
    nameTh: "กลุ่มชุดดินที่ 1 (ดินเหนียวลึกมาก เกิดจากตะกอนน้ำทะเล)",
    nameEn: "Very deep clayey marine deposits (e.g., Bangkok series)",
    texture: "ดินเหนียวจัด สีเทาเข้ม",
    drainage: "poorly_drained",
    drainageTh: "ระบายน้ำเลวมาก มีน้ำขังบนผิวดินนาน",
    depthCm: 150,
    depthTh: "ลึกมาก (> 150 ซม.)",
    phRange: [6.0, 7.5],
    phLabel: "pH 6.0 - 7.5 (เป็นกรดเล็กน้อยถึงด่างปานกลาง)",
    fertility: "สูง",
    description: "ดินเหนียวเนื้อละเอียดมากในที่ราบลุ่มน้ำท่วมถึงชายฝั่งทะเล อุ้มน้ำได้ดีเลิศ",
    suitableCrops: ["crop-rice", "crop-coconut", "crop-banana"],
  },
  2: {
    groupId: 2,
    nameTh: "กลุ่มชุดดินที่ 2 (ดินเหนียวลึกมาก ดินตะกอนน้ำกร่อย)",
    nameEn: "Very deep clayey brackish water deposits",
    texture: "ดินเหนียวสีเทาเข้ม มีจุดประสีน้ำตาล",
    drainage: "poorly_drained",
    drainageTh: "ระบายน้ำเลว อุ้มน้ำได้ดีมาก",
    depthCm: 150,
    depthTh: "ลึกมาก (> 150 ซม.)",
    phRange: [5.5, 7.0],
    phLabel: "pH 5.5 - 7.0 (เป็นกรดปานกลาง)",
    fertility: "ปานกลาง",
    description: "ดินเหนียวที่ราบลุ่มปากแม่น้ำ เหมาะสมอย่างยิ่งสำหรับทำนาข้าวและการยกร่องปลูกไม้ผลบางชนิด",
    suitableCrops: ["crop-rice", "crop-coconut", "crop-banana", "crop-pomelo"],
  },
  3: {
    groupId: 3,
    nameTh: "กลุ่มชุดดินที่ 3 (ดินเหนียวลึกมาก ดินตะกอนลำน้ำ)",
    nameEn: "Very deep clayey alluvial soils (e.g., Sing Buri series)",
    texture: "ดินเหนียวสีน้ำตาลหรือเทา",
    drainage: "poorly_drained",
    drainageTh: "ระบายน้ำเลว",
    depthCm: 150,
    depthTh: "ลึกมาก",
    phRange: [5.5, 7.0],
    phLabel: "pH 5.5 - 7.0 (เป็นกรดปานกลางถึงเป็นกลาง)",
    fertility: "สูง",
    description: "ดินที่ราบลุ่มเจ้าพระยาและลุ่มน้ำสายหลัก อุดมสมบูรณ์สูง เลื่องชื่อในการปลูกข้าวคุณภาพดี",
    suitableCrops: ["crop-rice", "crop-rice-sticky", "crop-sugarcane"],
  },
  7: {
    groupId: 7,
    nameTh: "กลุ่มชุดดินที่ 7 (ดินเหนียวที่ราบลุ่มน้ำจืด อุดมสมบูรณ์สูง)",
    nameEn: "Deep clayey alluvial soils of river basins (e.g., Nakhon Pathom series)",
    texture: "ดินเหนียวถึงดินร่วนเหนียว",
    drainage: "poorly_drained",
    drainageTh: "ระบายน้ำค่อนข้างเลว อุ้มน้ำและแร่ธาตุได้ดีเลิศ",
    depthCm: 140,
    depthTh: "ลึกมาก (100 - 150 ซม.)",
    phRange: [6.0, 7.0],
    phLabel: "pH 6.0 - 7.0 (เป็นกรดเล็กน้อยถึงเป็นกลาง)",
    fertility: "สูง",
    description: "ดินเกษตรกรรมชั้นยอดในเขตชลประทาน เหมาะกับข้าวหอมมะลิ พืชหมุนเวียน และไม้ผลยกร่อง",
    suitableCrops: ["crop-rice", "crop-rice-sticky", "crop-corn", "crop-banana", "crop-vegetables"],
  },
  11: {
    groupId: 11,
    nameTh: "กลุ่มชุดดินที่ 11 (ดินเปรี้ยวจัด ดินกรดกำมะถันที่ลุ่ม)",
    nameEn: "Acid sulfate soils with high sulfidic materials (e.g., Rangsit series)",
    texture: "ดินเหนียวสีเทาเข้ม มีจุดประสีเหลืองฟางข้าว (Jarosite)",
    drainage: "poorly_drained",
    drainageTh: "ระบายน้ำเลว",
    depthCm: 120,
    depthTh: "ลึกมาก",
    phRange: [3.5, 4.5],
    phLabel: "pH 3.5 - 4.5 (เป็นกรดจัดมาก - ดินเปรี้ยว)",
    fertility: "ต่ำ",
    description: "ดินเปรี้ยวจัดรุนแรง ต้องใส่วัสดุปูนมาร์ลหรือใช้น้ำชะล้างกรดก่อนเพาะปลูก",
    suitableCrops: ["crop-rice"],
  },
  17: {
    groupId: 17,
    nameTh: "กลุ่มชุดดินที่ 17 (ดินทรายจัดชายฝั่งและที่ดอน อุ้มน้ำต่ำมาก)",
    nameEn: "Excessively drained sandy soils (e.g., Sattahip series)",
    texture: "ดินทรายล้วนถึงดินทรายปนร่วน",
    drainage: "somewhat_excessively_drained",
    drainageTh: "ระบายน้ำเร็วเกินไป ไม่อุ้มน้ำ เสี่ยงขาดน้ำรุนแรง",
    depthCm: 150,
    depthTh: "ลึกมาก",
    phRange: [5.0, 6.5],
    phLabel: "pH 5.0 - 6.5",
    fertility: "ต่ำ",
    description: "ดินทรายจัด ธาตุอาหารต่ำมาก ไม่อุ้มน้ำ ไม่เหมาะกับพืชที่ต้องการน้ำสม่ำเสมอ",
    suitableCrops: ["crop-cassava", "crop-pineapple", "crop-coconut"],
  },
  29: {
    groupId: 29,
    nameTh: "กลุ่มชุดดินที่ 29 (ดินร่วนเหนียวลึกมาก เกิดจากหินตะกอน)",
    nameEn: "Deep fine-loamy soils on undulating terrain (e.g., Korat series)",
    texture: "ดินร่วนเหนียวปนทราย สีกักหรือแดง",
    drainage: "well_drained",
    drainageTh: "ระบายน้ำดี",
    depthCm: 150,
    depthTh: "ลึกมาก (> 150 ซม.)",
    phRange: [5.5, 6.5],
    phLabel: "pH 5.5 - 6.5 (เป็นกรดปานกลาง)",
    fertility: "ปานกลาง",
    description: "ดินที่ดอนลูกคลื่นลอนลาด เหมาะสมกับการปลูกพืชไร่ อ้อย มันสำปะหลัง และไม้ผลเมืองร้อน",
    suitableCrops: ["crop-sugarcane", "crop-cassava", "crop-corn", "crop-rubber", "crop-durian"],
  },
  33: {
    groupId: 33,
    nameTh: "กลุ่มชุดดินที่ 33 (ดินร่วนปนทรายที่ดอน ระบายน้ำดี)",
    nameEn: "Deep loamy-sand soils on uplands (e.g., Yasothon series)",
    texture: "ดินร่วนปนทราย สีแดงหรือเหลืองแดง",
    drainage: "well_drained",
    drainageTh: "ระบายน้ำดี ไม่อุ้มน้ำขัง",
    depthCm: 150,
    depthTh: "ลึกมาก",
    phRange: [5.0, 6.5],
    phLabel: "pH 5.0 - 6.5 (เป็นกรดเล็กน้อยถึงปานกลาง)",
    fertility: "ปานกลาง",
    description: "ดินที่ดอนยอดนิยมของภาคอีสานและภาคตะวันออก เหมาะกับมันสำปะหลัง อ้อย ข้าวโพด และพืชไร่ทนแล้ง",
    suitableCrops: ["crop-cassava", "crop-sugarcane", "crop-corn", "crop-peanut", "crop-pineapple"],
  },
  38: {
    groupId: 38,
    nameTh: "กลุ่มชุดดินที่ 38 (ดินร่วนเหนียวลึกปานกลางบนที่ลาดชัน)",
    nameEn: "Moderately deep clayey-skeletal soils on hills (e.g., Tha Yang series)",
    texture: "ดินร่วนปนเศษหินกรวด",
    drainage: "well_drained",
    drainageTh: "ระบายน้ำดี",
    depthCm: 80,
    depthTh: "ลึกปานกลาง (50 - 100 ซม.)",
    phRange: [5.5, 6.5],
    phLabel: "pH 5.5 - 6.5",
    fertility: "ปานกลาง",
    description: "ดินบนที่ลาดเชิงเขา มีเศษหินมนปน เหมาะกับไม้ยืนต้น ยางพารา และไม้ผลทนแล้ง",
    suitableCrops: ["crop-rubber", "crop-durian", "crop-mango", "crop-coffee-robusta"],
  },
  44: {
    groupId: 44,
    nameTh: "กลุ่มชุดดินที่ 44 (ดินร่วนปนทรายลึกมาก ที่ลาดเทระบายน้ำดีเยี่ยม)",
    nameEn: "Very deep coarse-loamy soils on terraces (e.g., Satuk series)",
    texture: "ดินร่วนปนทรายลึก สีน้ำตาลปนเทา",
    drainage: "well_drained",
    drainageTh: "ระบายน้ำดีเยี่ยม",
    depthCm: 150,
    depthTh: "ลึกมาก",
    phRange: [5.0, 6.0],
    phLabel: "pH 5.0 - 6.0",
    fertility: "ปานกลาง",
    description: "ดินที่ดอนระบายน้ำดี ทนทาน ไม่ขังน้ำ เหมาะมากสำหรับมันสำปะหลัง อ้อย และสับปะรด",
    suitableCrops: ["crop-cassava", "crop-sugarcane", "crop-corn", "crop-peanut"],
  },
  48: {
    groupId: 48,
    nameTh: "กลุ่มชุดดินที่ 48 (ดินภูเขา ดินร่วนลึกสีแดง ชุ่มชื้นสูง)",
    nameEn: "Deep fine-clayey volcanic/mountain soils (e.g., Pak Chong / Tha Mai series)",
    texture: "ดินร่วนเหนียว สีแดงเข้ม ละเอียด นุ่มมือ",
    drainage: "well_drained",
    drainageTh: "ระบายน้ำดีเยี่ยม ไม่ขังแฉะ",
    depthCm: 150,
    depthTh: "ลึกมาก (> 150 ซม.)",
    phRange: [5.5, 6.8],
    phLabel: "pH 5.5 - 6.8 (สมบูรณ์สูง)",
    fertility: "สูง",
    description: "ดินเกรดพรีเมียมจากหินบะซอลต์/ภูเขาไฟ (จันทบุรี/ตราด/ปากช่อง) ราชาดินสำหรับทุเรียน ลำไย และไม้ผลมูลค่าสูง",
    suitableCrops: ["crop-durian", "crop-mangosteen", "crop-longan", "crop-avocado", "crop-rubber"],
  },
  56: {
    groupId: 56,
    nameTh: "กลุ่มชุดดินที่ 56 (ดินที่ลาดเชิงเขาสูง ความลาดชัน 12-25%)",
    nameEn: "Steep highland soils on mountain slopes",
    texture: "ดินร่วนปนเศษหินภูเขา",
    drainage: "well_drained",
    drainageTh: "ระบายน้ำเร็วมาก ชะล้างหน้าดินสูง",
    depthCm: 90,
    depthTh: "ลึกปานกลาง",
    phRange: [5.0, 6.5],
    phLabel: "pH 5.0 - 6.5",
    fertility: "ปานกลาง",
    description: "ดินภูเขาสูงทางภาคเหนือและใต้ เหมาะกับพืชเศรษฐกิจที่สูง เช่น กาแฟอาราบิก้า ชา อะโวคาโด และไม้ยืนต้นยึดดิน",
    suitableCrops: ["crop-coffee-arabica", "crop-avocado", "crop-rubber", "crop-tea"],
  },
  98: {
    groupId: 98,
    nameTh: "พื้นที่แหล่งน้ำ (Water Bodies / ลำน้ำ / ทะเล / บึง)",
    nameEn: "Water bodies, rivers, reservoirs and wetlands",
    texture: "พื้นผิวน้ำ / ตะกอนใต้น้ำ",
    drainage: "poorly_drained",
    drainageTh: "มีน้ำท่วมขังตลอดทั้งปี",
    depthCm: 0,
    depthTh: "ไม่มีหน้าดินสำหรับพืชบก",
    phRange: [6.5, 7.5],
    phLabel: "pH 6.5 - 7.5",
    fertility: "ต่ำ",
    description: "พื้นที่แหล่งน้ำธรรมชาติหรืออ่างเก็บน้ำ ไม่สามารถเพาะปลูกพืชบกได้ (เหมาะกับพืชน้ำหรือการประมง)",
    suitableCrops: [],
  },
  99: {
    groupId: 99,
    nameTh: "พื้นที่ชุมชนและสิ่งปลูกสร้าง (Built-up & Urban Land / ตึกอาคาร)",
    nameEn: "Built-up land, residential, commercial and urban concrete structures",
    texture: "พื้นผิวคอนกรีต / แอสฟัลต์ / ดินถมสิ่งก่อสร้าง",
    drainage: "well_drained",
    drainageTh: "ระบายน้ำผ่านระบบท่อระบายน้ำเมือง",
    depthCm: 10,
    depthTh: "หน้าดินถูกปิดทับด้วยสิ่งก่อสร้าง (< 10 ซม.)",
    phRange: [7.0, 8.5],
    phLabel: "pH 7.0 - 8.5 (คอนกรีต/ด่าง)",
    fertility: "ต่ำ",
    description: "พื้นที่เขตเมือง ชุมชนหนาแน่น อาคารบ้านเรือน และโรงงานอุตสาหกรรม หน้าดินถูกปิดทับด้วยคอนกรีต ไม่มีศักยภาพในการทำการเกษตรเชิงพาณิชย์ทั่วไป",
    suitableCrops: [],
  }
};

/**
 * Checks if coordinates fall into major Thai urban/built-up centers (Bangkok Core, Chiang Mai Mueang, Pattaya, Korat center, etc.)
 */
export function isUrbanDenseArea(lat: number, lng: number): boolean {
  // 1. Bangkok Metropolitan Core (กทม. ชั้นในและปริมณฑลหนาแน่น: สุขุมวิท สาทร สีลม พญาไท จตุจักร บางรัก ฯลฯ)
  if (lat >= 13.65 && lat <= 13.88 && lng >= 100.43 && lng <= 100.67) {
    return true;
  }
  // 2. Nonthaburi / Pak Kret Urban Core
  if (lat >= 13.82 && lat <= 13.93 && lng >= 100.48 && lng <= 100.56) {
    return true;
  }
  // 3. Chiang Mai Mueang Core (คูเมืองและย่านธุรกิจเชียงใหม่)
  if (lat >= 18.76 && lat <= 18.82 && lng >= 98.96 && lng <= 99.02) {
    return true;
  }
  // 4. Pattaya / Bang Lamung Urban Strip
  if (lat >= 12.89 && lat <= 12.98 && lng >= 100.86 && lng <= 100.93) {
    return true;
  }
  // 5. Nakhon Ratchasima (Korat) Mueang Core
  if (lat >= 14.95 && lat <= 15.01 && lng >= 102.06 && lng <= 102.13) {
    return true;
  }
  // 6. Hat Yai Urban Core
  if (lat >= 6.98 && lat <= 7.03 && lng >= 100.45 && lng <= 100.50) {
    return true;
  }
  return false;
}

/**
 * Resolves Thailand Soil Group dynamically from spatial characteristics & Land Cover
 */
export function resolveSoilGroup(
  lat: number,
  lng: number,
  slope: number,
  elevation: number,
  soilMoisture: number,
  ndvi: number,
  isWaterBody = false
): SoilGroupInfo {
  // A confirmed satellite water classification must take priority over low-NDVI
  // urban detection: both water and concrete can have low NDVI values.
  if (isWaterBody || ndvi < 0.05 || (soilMoisture > 92 && slope < 0.5)) {
    return THAILAND_SOIL_GROUPS[98];
  }

  // Urban / Built-up Area Detection
  if (isUrbanDenseArea(lat, lng) || ndvi < 0.25) {
    return THAILAND_SOIL_GROUPS[99];
  }

  // High slope / high mountain (North / South mountains)
  if (elevation > 500 || slope > 12) {
    return THAILAND_SOIL_GROUPS[56];
  }
  
  // Premium volcanic/fruit belt (Eastern slopes: Chanthaburi/Rayong or Pak Chong / Chiang Rai fruit zones)
  if (slope >= 2.5 && slope <= 10 && soilMoisture >= 60 && (lat < 13.5 || lat > 18.0 || (lng > 101.2 && lng < 102.5))) {
    return THAILAND_SOIL_GROUPS[48];
  }

  // Southern rubber / fruit upland
  if (lat < 11.0 && slope >= 3.0) {
    return THAILAND_SOIL_GROUPS[38];
  }

  // Northeast uplands: Sandy loams (Yasothon/Satuk/Korat)
  if (lng > 101.5 && slope > 1.8) {
    return soilMoisture < 50 ? THAILAND_SOIL_GROUPS[33] : THAILAND_SOIL_GROUPS[29];
  }

  // Flat Lowlands & Floodplains: Rice clay soils (Group 1, 2, 3, 7)
  if (slope <= 2.2) {
    if (lat < 14.0 && lng < 101.0 && soilMoisture >= 70) {
      return THAILAND_SOIL_GROUPS[1]; // Coastal marine clay
    }
    return THAILAND_SOIL_GROUPS[7]; // Prime Central/River Basin Clay
  }

  // Default well-drained loamy upland
  return THAILAND_SOIL_GROUPS[44];
}
