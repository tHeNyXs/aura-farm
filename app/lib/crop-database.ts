import { Crop, FAOSuitabilityClass } from "./types";

export interface LDDCriteriaRange {
  s1: [number, number];
  s2: [number, number];
  s3: [number, number];
}

export interface LDDCropCriteria {
  slope_deg: LDDCriteriaRange;
  soil_ph: LDDCriteriaRange;
  soil_moisture: LDDCriteriaRange;
  annual_rainfall: LDDCriteriaRange;
}

export interface CropRequirement {
  id: string;
  name: string;
  category: "พืชไร่ / ธัญพืช" | "ไม้ผลเศรษฐกิจ" | "ไม้ยืนต้น / อุตสาหกรรม" | "พืชผัก / สมุนไพร";
  icon_emoji: string;
  image_url: string;
  growth_duration: string;
  water_requirement: "ต่ำ" | "ปานกลาง" | "สูง";
  water_level: 1 | 2 | 3;
  estimated_yield: string;
  ideal_temperature_range: string;
  best_season: string;
  soil_preference: string;
  description: string;
  source_citation: string;
  pros_template: string[];
  cautions_template: string[];
  
  // Agronomic parameters
  ideal_moisture_min: number;
  ideal_moisture_max: number;
  max_slope: number;
  min_slope?: number;
  ideal_elevation_min: number;
  ideal_elevation_max: number;
  ideal_rainfall_min: number;
  ideal_rainfall_max: number;
  ideal_ndvi_min: number;
  soil_depth_min_cm: number;
  
  // LDD Criteria Matrix Table (S1, S2, S3, N)
  ldd_criteria: LDDCropCriteria;

  // LDD 62 Soil Groups Alignment
  suitable_soil_groups_s1: number[];
  suitable_soil_groups_s2: number[];
  forbidden_soil_groups: number[];
  
  // Geographic Favored Regions
  favored_regions: ("central" | "north" | "northeast" | "south" | "all")[];
}

export const CROP_DATABASE: CropRequirement[] = [
  // ==========================================
  // หมวดที่ 1: พืชไร่และธัญพืช (10 ชนิด)
  // ==========================================
  {
    id: "crop-rice",
    name: "ข้าวหอมมะลิ 105",
    category: "พืชไร่ / ธัญพืช",
    icon_emoji: "🌾",
    image_url: "/crops/rice.jpg",
    growth_duration: "120 วัน",
    water_requirement: "สูง",
    water_level: 3,
    estimated_yield: "650-800 กก./ไร่",
    ideal_temperature_range: "25 - 32 °C",
    best_season: "ต้นฤดูฝน (ก.ค. - พ.ย.)",
    soil_preference: "ดินเหนียวหรือดินเหนียวปนร่วน อุ้มน้ำได้ดี (กลุ่มชุดดินที่ 1, 2, 3, 7)",
    description: "ข้าวพันธุ์เศรษฐกิจยอดนิยม กลิ่นหอม นุ่ม เป็นที่ต้องการของตลาดทั้งในและต่างประเทศ",
    source_citation: "คู่มือประเมินดินพืชเศรษฐกิจ กรมพัฒนาที่ดิน (LDD) & สศก.",
    pros_template: ["ราคาผลผลิตต่อตันสูงและมีตลาดรองรับกว้างขวาง", "เหมาะมากกับพื้นที่ราบลุ่มและดินเหนียว"],
    cautions_template: ["ต้องการน้ำขังหล่อเลี้ยงสม่ำเสมอในระยะตั้งท้อง", "ระวังโรคไหม้และเพลี้ยกระโดดสีน้ำตาล"],
    ideal_moisture_min: 65, ideal_moisture_max: 95, max_slope: 2.0,
    ideal_elevation_min: 5, ideal_elevation_max: 300,
    ideal_rainfall_min: 1200, ideal_rainfall_max: 1800, ideal_ndvi_min: 0.5, soil_depth_min_cm: 50,
    ldd_criteria: {
      slope_deg: { s1: [0, 1.2], s2: [1.2, 3.0], s3: [3.0, 7.0] },
      soil_ph: { s1: [5.5, 6.5], s2: [5.0, 7.5], s3: [4.5, 8.0] },
      soil_moisture: { s1: [60, 95], s2: [48, 60], s3: [35, 48] },
      annual_rainfall: { s1: [1300, 2000], s2: [1100, 1300], s3: [900, 1100] }
    },
    suitable_soil_groups_s1: [1, 2, 3, 7], suitable_soil_groups_s2: [11, 15, 18], forbidden_soil_groups: [17, 98, 99],
    favored_regions: ["northeast", "north", "central"]
  },
  {
    id: "crop-rice-dry",
    name: "ข้าวนาปรัง (กข)",
    category: "พืชไร่ / ธัญพืช",
    icon_emoji: "🌾",
    image_url: "/crops/rice.jpg",
    growth_duration: "100-110 วัน",
    water_requirement: "สูง",
    water_level: 3,
    estimated_yield: "800-1,000 กก./ไร่",
    ideal_temperature_range: "26 - 34 °C",
    best_season: "ฤดูแล้ง (ม.ค. - เม.ย.) ในเขตชลประทาน",
    soil_preference: "ดินเหนียวที่ราบลุ่มเขตชลประทาน (กลุ่มชุดดินที่ 1, 2, 7)",
    description: "ข้าวไม่ไวต่อช่วงแสง ให้ผลผลิตต่อไร่สูงมาก นิยมปลูกในเขตชลประทานภาคกลาง",
    source_citation: "กรมการข้าว & กรมพัฒนาที่ดิน (LDD)",
    pros_template: ["อายุเก็บเกี่ยวสั้น ผลผลิตต่อไร่สูงมาก", "ปลูกได้ปีละ 2-3 รอบในเขตชลประทาน"],
    cautions_template: ["ต้องมีระบบชลประทานเข้าถึงตลอดฤดู", "ต้นทุนปุ๋ยเคมีและการสูบน้ำสูงกว่าข้าวนาปี"],
    ideal_moisture_min: 60, ideal_moisture_max: 95, max_slope: 2.0,
    ideal_elevation_min: 5, ideal_elevation_max: 200,
    ideal_rainfall_min: 800, ideal_rainfall_max: 1600, ideal_ndvi_min: 0.5, soil_depth_min_cm: 50,
    ldd_criteria: {
      slope_deg: { s1: [0, 1.2], s2: [1.2, 3.0], s3: [3.0, 6.0] },
      soil_ph: { s1: [5.5, 7.0], s2: [5.0, 7.5], s3: [4.5, 8.0] },
      soil_moisture: { s1: [60, 95], s2: [50, 60], s3: [40, 50] },
      annual_rainfall: { s1: [1000, 1800], s2: [800, 1000], s3: [600, 800] }
    },
    suitable_soil_groups_s1: [1, 2, 7], suitable_soil_groups_s2: [3, 11], forbidden_soil_groups: [17, 98, 99],
    favored_regions: ["central", "north"]
  },
  {
    id: "crop-cassava",
    name: "มันสำปะหลัง (เกษตรศาสตร์ 50 / ระยอง 72)",
    category: "พืชไร่ / ธัญพืช",
    icon_emoji: "🥔",
    image_url: "/crops/cassava.jpg",
    growth_duration: "8-12 เดือน",
    water_requirement: "ต่ำ",
    water_level: 1,
    estimated_yield: "4.5-6.5 ตัน/ไร่",
    ideal_temperature_range: "25 - 35 °C",
    best_season: "ต้นฤดูฝน (พ.ค. - มิ.ย.) หรือปลายฝน (พ.ย.)",
    soil_preference: "ดินร่วนทรายหรือดินร่วนปนทราย ระบายน้ำดีเลิศ (กลุ่มชุดดินที่ 33, 40, 44)",
    description: "พืชเศรษฐกิจทนแล้งชั้นนำ อุตสาหกรรมแป้งมัน เอทานอล และอาหารสัตว์ มีโรงงานรับซื้อไม่อั้น",
    source_citation: "คู่มือประเมินดินพืชเศรษฐกิจ กรมพัฒนาที่ดิน (LDD) & กรมวิชาการเกษตร",
    pros_template: ["ทนแล้งยอดเยี่ยม ปลูกได้ดีในพื้นที่ดินทราย", "มีโรงงานแปรรูปรองรับผลผลิตแน่นอน"],
    cautions_template: ["แพ้น้ำท่วมขังอย่างรุนแรง หัวจะเน่าเสียหายทันที", "ต้องระวังโรคใบด่างมันสำปะหลัง (SLCMD)"],
    ideal_moisture_min: 30, ideal_moisture_max: 65, max_slope: 8.0,
    ideal_elevation_min: 30, ideal_elevation_max: 600,
    ideal_rainfall_min: 900, ideal_rainfall_max: 1600, ideal_ndvi_min: 0.4, soil_depth_min_cm: 60,
    ldd_criteria: {
      slope_deg: { s1: [1.2, 4.5], s2: [0, 1.2], s3: [4.5, 8.0] },
      soil_ph: { s1: [5.0, 6.5], s2: [4.5, 7.5], s3: [4.0, 8.0] },
      soil_moisture: { s1: [30, 65], s2: [65, 75], s3: [20, 30] },
      annual_rainfall: { s1: [1000, 1500], s2: [800, 1000], s3: [600, 800] }
    },
    suitable_soil_groups_s1: [33, 40, 44, 48], suitable_soil_groups_s2: [29, 35, 38], forbidden_soil_groups: [1, 2, 7, 98, 99],
    favored_regions: ["northeast", "central", "north"]
  },
  {
    id: "crop-sugarcane",
    name: "อ้อยโรงงาน",
    category: "พืชไร่ / ธัญพืช",
    icon_emoji: "🎋",
    image_url: "/crops/sugarcane.jpg",
    growth_duration: "10-12 เดือน",
    water_requirement: "ปานกลาง",
    water_level: 2,
    estimated_yield: "12-18 ตัน/ไร่",
    ideal_temperature_range: "26 - 35 °C",
    best_season: "ต้นฤดูฝน หรืออ้อยข้ามแล้ง (ต.ค. - ธ.ค.)",
    soil_preference: "ดินร่วน ดินร่วนเหนียว หน้าดินลึก (กลุ่มชุดดินที่ 29, 35, 48)",
    description: "พืชพลังงานและน้ำตาลสำคัญของประเทศ มีระบบโควตารับซื้อชัดเจนตามค่าความหวาน C.C.S.",
    source_citation: "คู่มือประเมินดินพืชเศรษฐกิจ กรมพัฒนาที่ดิน (LDD) & สอน.",
    pros_template: ["ระบบราคาอ้อยและน้ำตาลมีเสถียรภาพ มีโรงงานรองรับ", "ไว้ตอเก็บเกี่ยวได้ต่อเนื่อง 3-4 ปี"],
    cautions_template: ["ต้องอยู่ใกล้โรงงานน้ำตาลในรัศมีไม่เกิน 60 กม.", "ต้องการแรงงานหรือรถตัดอ้อยในฤดูหีบ"],
    ideal_moisture_min: 40, ideal_moisture_max: 75, max_slope: 5.0,
    ideal_elevation_min: 20, ideal_elevation_max: 500,
    ideal_rainfall_min: 1000, ideal_rainfall_max: 1800, ideal_ndvi_min: 0.45, soil_depth_min_cm: 60,
    ldd_criteria: {
      slope_deg: { s1: [0.5, 3.0], s2: [3.0, 5.0], s3: [5.0, 8.0] },
      soil_ph: { s1: [5.5, 7.0], s2: [5.0, 7.8], s3: [4.5, 8.2] },
      soil_moisture: { s1: [40, 72], s2: [72, 80], s3: [30, 40] },
      annual_rainfall: { s1: [1100, 1600], s2: [900, 1100], s3: [750, 900] }
    },
    suitable_soil_groups_s1: [29, 35, 48, 52], suitable_soil_groups_s2: [33, 40, 44], forbidden_soil_groups: [1, 2, 98, 99],
    favored_regions: ["central", "northeast", "north"]
  },
  {
    id: "crop-corn",
    name: "ข้าวโพดเลี้ยงสัตว์",
    category: "พืชไร่ / ธัญพืช",
    icon_emoji: "🌽",
    image_url: "/crops/corn.jpg",
    growth_duration: "105-120 วัน",
    water_requirement: "ปานกลาง",
    water_level: 2,
    estimated_yield: "900-1,200 กก./ไร่",
    ideal_temperature_range: "24 - 33 °C",
    best_season: "ต้นฤดูฝน (พ.ค.) หรือข้าวโพดหลังนา (พ.ย. - ธ.ค.)",
    soil_preference: "ดินร่วน ดินร่วนเหนียวปนทราย อินทรียวัตถุปานกลาง (กลุ่มชุดดินที่ 29, 35, 48)",
    description: "วัตถุดิบหลักอุตสาหกรรมอาหารสัตว์ ราคาประกันมั่นคง เป็นพืชหมุนเวียนหลังนาชั้นดี",
    source_citation: "กรมวิชาการเกษตร & กรมพัฒนาที่ดิน (LDD)",
    pros_template: ["ระยะเวลาปลูกสั้น ได้เงินหมุนเวียนเร็ว", "โรงงานอาหารสัตว์รับซื้ออย่างต่อเนื่อง"],
    cautions_template: ["ระวังหนอนกระทู้ข้าวโพดลายจุด (FAW)", "ดินระบายน้ำไม่ดีจะทำให้ต้นเหลืองและแคระแกร็น"],
    ideal_moisture_min: 40, ideal_moisture_max: 70, max_slope: 7.0,
    ideal_elevation_min: 50, ideal_elevation_max: 800,
    ideal_rainfall_min: 900, ideal_rainfall_max: 1500, ideal_ndvi_min: 0.45, soil_depth_min_cm: 50,
    ldd_criteria: {
      slope_deg: { s1: [0.5, 3.5], s2: [3.5, 6.0], s3: [6.0, 9.0] },
      soil_ph: { s1: [5.8, 7.0], s2: [5.2, 7.5], s3: [4.8, 8.0] },
      soil_moisture: { s1: [45, 70], s2: [35, 45], s3: [70, 78] },
      annual_rainfall: { s1: [1000, 1400], s2: [850, 1000], s3: [700, 850] }
    },
    suitable_soil_groups_s1: [29, 35, 48], suitable_soil_groups_s2: [33, 44, 52], forbidden_soil_groups: [1, 2, 7, 98, 99],
    favored_regions: ["north", "central", "northeast"]
  },
  {
    id: "crop-sweet-corn",
    name: "ข้าวโพดหวาน",
    category: "พืชไร่ / ธัญพืช",
    icon_emoji: "🌽",
    image_url: "/crops/corn.jpg",
    growth_duration: "70-75 วัน",
    water_requirement: "ปานกลาง",
    water_level: 2,
    estimated_yield: "2.0-2.8 ตัน/ไร่",
    ideal_temperature_range: "24 - 32 °C",
    best_season: "ตลอดทั้งปี (มีระบบน้ำ)",
    soil_preference: "ดินร่วนซุย อินทรียวัตถุสูง (กลุ่มชุดดินที่ 7, 29, 35)",
    description: "พืชอายุสั้น ตลาดบริโภคสดและส่งออกแปรรูปกระป๋อง ผลตอบแทนต่อไร่สูง",
    source_citation: "คู่มือประเมินดิน กรมพัฒนาที่ดิน (LDD)",
    pros_template: ["เก็บเกี่ยวเร็วมากเพียง 70-75 วัน", "ขายฝักสดได้ราคาดี มีโรงงานกระป๋องรับซื้อ"],
    cautions_template: ["ต้องให้น้ำสม่ำเสมอช่วงออกไหม", "อ่อนไหวต่อลมพายุหักล้ม"],
    ideal_moisture_min: 45, ideal_moisture_max: 72, max_slope: 4.0,
    ideal_elevation_min: 20, ideal_elevation_max: 600,
    ideal_rainfall_min: 900, ideal_rainfall_max: 1400, ideal_ndvi_min: 0.45, soil_depth_min_cm: 50,
    ldd_criteria: {
      slope_deg: { s1: [0.5, 2.5], s2: [2.5, 4.5], s3: [4.5, 7.0] },
      soil_ph: { s1: [5.8, 6.8], s2: [5.2, 7.4], s3: [4.8, 7.8] },
      soil_moisture: { s1: [50, 70], s2: [40, 50], s3: [70, 78] },
      annual_rainfall: { s1: [1000, 1400], s2: [850, 1000], s3: [700, 850] }
    },
    suitable_soil_groups_s1: [7, 29, 35], suitable_soil_groups_s2: [33, 48], forbidden_soil_groups: [1, 2, 98, 99],
    favored_regions: ["central", "north", "northeast"]
  },
  {
    id: "crop-soybean",
    name: "ถั่วเหลือง (เชียงใหม่ 60)",
    category: "พืชไร่ / ธัญพืช",
    icon_emoji: "🫘",
    image_url: "/crops/soybean.jpg",
    growth_duration: "90-100 วัน",
    water_requirement: "ปานกลาง",
    water_level: 2,
    estimated_yield: "300-400 กก./ไร่",
    ideal_temperature_range: "22 - 30 °C",
    best_season: "พืชฤดูแล้งหลังนา (ธ.ค. - ม.ค.)",
    soil_preference: "ดินร่วน ดินร่วนเหนียว ระบายน้ำดี pH เป็นกลาง (กลุ่มชุดดินที่ 7, 29, 35)",
    description: "พืชตระกูลถั่วบำรุงดิน ตรึงไนโตรเจน นิยมปลูกตัดวงจรโรคในแปลงนาข้าว",
    source_citation: "กรมส่งเสริมการเกษตร & กรมพัฒนาที่ดิน (LDD)",
    pros_template: ["ช่วยตรึงไนโตรเจนฟื้นฟูโครงสร้างดิน", "ลดการใช้ปุ๋ยเคมีในรอบถัดไปได้มาก"],
    cautions_template: ["ไม่ชอบดินกรดจัด pH ต่ำกว่า 5.5", "ระวังหนอนเจาะฝักช่วงติดเมล็ด"],
    ideal_moisture_min: 45, ideal_moisture_max: 70, max_slope: 4.0,
    ideal_elevation_min: 50, ideal_elevation_max: 600,
    ideal_rainfall_min: 800, ideal_rainfall_max: 1300, ideal_ndvi_min: 0.45, soil_depth_min_cm: 45,
    ldd_criteria: {
      slope_deg: { s1: [0.5, 2.0], s2: [2.0, 4.0], s3: [4.0, 6.0] },
      soil_ph: { s1: [6.0, 7.0], s2: [5.5, 7.5], s3: [5.0, 8.0] },
      soil_moisture: { s1: [48, 68], s2: [38, 48], s3: [68, 75] },
      annual_rainfall: { s1: [900, 1300], s2: [750, 900], s3: [600, 750] }
    },
    suitable_soil_groups_s1: [7, 29, 35], suitable_soil_groups_s2: [33, 48], forbidden_soil_groups: [1, 2, 11, 98, 99],
    favored_regions: ["north", "central"]
  },
  {
    id: "crop-mungbean",
    name: "ถั่วเขียว (ชัยนาท 72)",
    category: "พืชไร่ / ธัญพืช",
    icon_emoji: "🫘",
    image_url: "/crops/mungbean.jpg",
    growth_duration: "65-70 วัน",
    water_requirement: "ต่ำ",
    water_level: 1,
    estimated_yield: "180-250 กก./ไร่",
    ideal_temperature_range: "25 - 34 °C",
    best_season: "ปลายฤดูฝน (ก.ย. - ต.ค.) หรือหลังนาแล้ง",
    soil_preference: "ดินร่วนปนทราย ระบายน้ำดี ไม่แฉะ (กลุ่มชุดดินที่ 7, 29, 33)",
    description: "พืชใช้น้ำน้อยมาก อายุสั้นที่สุด ปลูกก่อนหรือหลังทำนาเพื่อตัดวงจรศัตรูพืชและบำรุงดิน",
    source_citation: "คู่มือประเมินดิน LDD & กรมวิชาการเกษตร",
    pros_template: ["ใช้น้ำน้อยมาก อายุสั้นเพียง 65 วัน", "ไถกลบเป็นปุ๋ยพืชสดอินทรีย์ชั้นยอด"],
    cautions_template: ["ห้ามมีน้ำท่วมขังแม้เพียง 1-2 วัน", "ฝนตกชุกช่วงเก็บเกี่ยวจะทำให้เมล็ดงอกคาฝัก"],
    ideal_moisture_min: 30, ideal_moisture_max: 60, max_slope: 5.0,
    ideal_elevation_min: 10, ideal_elevation_max: 500,
    ideal_rainfall_min: 700, ideal_rainfall_max: 1200, ideal_ndvi_min: 0.4, soil_depth_min_cm: 40,
    ldd_criteria: {
      slope_deg: { s1: [0.5, 2.5], s2: [2.5, 4.5], s3: [4.5, 7.0] },
      soil_ph: { s1: [5.8, 7.2], s2: [5.2, 7.6], s3: [4.8, 8.0] },
      soil_moisture: { s1: [35, 58], s2: [25, 35], s3: [58, 68] },
      annual_rainfall: { s1: [800, 1200], s2: [650, 800], s3: [500, 650] }
    },
    suitable_soil_groups_s1: [7, 29, 33], suitable_soil_groups_s2: [35, 40], forbidden_soil_groups: [1, 2, 11, 98, 99],
    favored_regions: ["central", "north", "northeast"]
  },
  {
    id: "crop-peanut",
    name: "ถั่วลิสง",
    category: "พืชไร่ / ธัญพืช",
    icon_emoji: "🥜",
    image_url: "/crops/peanut.jpg",
    growth_duration: "95-105 วัน",
    water_requirement: "ปานกลาง",
    water_level: 2,
    estimated_yield: "350-450 กก./ไร่",
    ideal_temperature_range: "25 - 32 °C",
    best_season: "ต้นฤดูฝน หรือฤดูแล้งในเขตมีน้ำ",
    soil_preference: "ดินร่วนทราย ดินร่วนปนทราย ร่วนซุยลึก (กลุ่มชุดดินที่ 33, 40, 44)",
    description: "พืชตระกูลถั่วลงหัว ดินต้องร่วนซุยเพื่อให้เข็มแทงลงดินและถอนเก็บเกี่ยวง่าย",
    source_citation: "กรมพัฒนาที่ดิน (LDD) & DOA",
    pros_template: ["ตลาดฝักต้มและโรงงานแปรรูปถั่วอบกรอบต้องการสูง", "ช่วยบำรุงดิน เพิ่มไนโตรเจน"],
    cautions_template: ["ดินเหนียวจัดจะทำให้เข็มแทงลงยากและถอนหลุดขาด", "ระวังเชื้อราแอสเปอร์จิลลัสสร้างสารอะฟลาท็อกซิน"],
    ideal_moisture_min: 40, ideal_moisture_max: 68, max_slope: 4.0,
    ideal_elevation_min: 10, ideal_elevation_max: 500,
    ideal_rainfall_min: 800, ideal_rainfall_max: 1300, ideal_ndvi_min: 0.45, soil_depth_min_cm: 50,
    ldd_criteria: {
      slope_deg: { s1: [0.5, 2.0], s2: [2.0, 4.0], s3: [4.0, 6.0] },
      soil_ph: { s1: [5.8, 6.8], s2: [5.2, 7.3], s3: [4.8, 7.8] },
      soil_moisture: { s1: [42, 65], s2: [32, 42], s3: [65, 72] },
      annual_rainfall: { s1: [900, 1300], s2: [750, 900], s3: [600, 750] }
    },
    suitable_soil_groups_s1: [33, 40, 44], suitable_soil_groups_s2: [29, 35], forbidden_soil_groups: [1, 2, 7, 98, 99],
    favored_regions: ["northeast", "north", "central"]
  },
  {
    id: "crop-sorghum",
    name: "ข้าวฟ่าง",
    category: "พืชไร่ / ธัญพืช",
    icon_emoji: "🌾",
    image_url: "/crops/sorghum.jpg",
    growth_duration: "90-110 วัน",
    water_requirement: "ต่ำ",
    water_level: 1,
    estimated_yield: "500-700 กก./ไร่",
    ideal_temperature_range: "26 - 36 °C",
    best_season: "ปลายฤดูฝน (ส.ค. - ก.ย.)",
    soil_preference: "ดินร่วน ดินทราย ทนดินด่างและดินเค็มปานกลาง (กลุ่มชุดดินที่ 35, 40)",
    description: "สุดยอดพืชทนแล้งและทนดินเค็ม สำหรับอาหารสัตว์และพลังงานชีวภาพ",
    source_citation: "กรมพัฒนาที่ดิน (LDD) เกณฑ์พืชทนแล้ง",
    pros_template: ["ทนแล้งและทนสภาพดินเลวได้ดีกว่าข้าวโพด", "ใช้น้ำน้อยมาก เหมาะกับพื้นที่ฝนแล้ง"],
    cautions_template: ["ระวังนกทำลายรวงช่วงเมล็ดสุกแก่", "ราคาผลผลิตขึ้นลงตามตลาดอาหารสัตว์"],
    ideal_moisture_min: 25, ideal_moisture_max: 60, max_slope: 8.0,
    ideal_elevation_min: 30, ideal_elevation_max: 600,
    ideal_rainfall_min: 600, ideal_rainfall_max: 1100, ideal_ndvi_min: 0.35, soil_depth_min_cm: 45,
    ldd_criteria: {
      slope_deg: { s1: [1.0, 4.5], s2: [4.5, 7.5], s3: [7.5, 11.0] },
      soil_ph: { s1: [5.5, 7.5], s2: [5.0, 8.0], s3: [4.5, 8.5] },
      soil_moisture: { s1: [30, 58], s2: [20, 30], s3: [58, 68] },
      annual_rainfall: { s1: [700, 1100], s2: [550, 700], s3: [450, 550] }
    },
    suitable_soil_groups_s1: [35, 40, 44], suitable_soil_groups_s2: [29, 33], forbidden_soil_groups: [1, 2, 98, 99],
    favored_regions: ["northeast", "central"]
  },

  // ==========================================
  // หมวดที่ 2: ไม้ยืนต้นและพืชอุตสาหกรรม (8 ชนิด)
  // ==========================================
  {
    id: "crop-rubber",
    name: "ยางพารา (RRIM 600 / RRIT 251)",
    category: "ไม้ยืนต้น / อุตสาหกรรม",
    icon_emoji: "🌲",
    image_url: "/crops/rubber.jpg",
    growth_duration: "6-7 ปี เริ่มกรีดได้",
    water_requirement: "สูง",
    water_level: 3,
    estimated_yield: "250-320 กก./ไร่/ปี",
    ideal_temperature_range: "25 - 32 °C",
    best_season: "ต้นฤดูฝน (พ.ค. - มิ.ย.)",
    soil_preference: "ดินร่วน ดินร่วนปนเหนียว หน้าดินลึก >100 ซม. (กลุ่มชุดดินที่ 38, 48, 55)",
    description: "พืชเศรษฐกิจยุทธศาสตร์ทางภาคใต้ ภาคตะวันออก และอีสานตอนบน กรีดยางได้นานกว่า 20 ปี",
    source_citation: "การยางแห่งประเทศไทย (กยท.) & กรมพัฒนาที่ดิน (LDD)",
    pros_template: ["เก็บเกี่ยวน้ำยางสร้างรายได้รายวันสม่ำเสมอยาวนาน", "เมื่อหมดอายุสามารถขายไม้ยางพาราได้ราคาดี"],
    cautions_template: ["ใช้เวลาดูแล 6-7 ปีกว่าจะได้ผลผลิต", "ระวังลมพายุพัดลำต้นหักโค่นในฤดูมรสุม"],
    ideal_moisture_min: 55, ideal_moisture_max: 85, max_slope: 12.0,
    ideal_elevation_min: 10, ideal_elevation_max: 600,
    ideal_rainfall_min: 1600, ideal_rainfall_max: 2600, ideal_ndvi_min: 0.6, soil_depth_min_cm: 100,
    ldd_criteria: {
      slope_deg: { s1: [1.2, 5.0], s2: [5.0, 9.0], s3: [9.0, 14.0] },
      soil_ph: { s1: [4.5, 5.5], s2: [4.2, 6.0], s3: [4.0, 6.8] },
      soil_moisture: { s1: [55, 80], s2: [45, 55], s3: [80, 88] },
      annual_rainfall: { s1: [1600, 2500], s2: [1350, 1600], s3: [1150, 1350] }
    },
    suitable_soil_groups_s1: [38, 48, 55], suitable_soil_groups_s2: [29, 35, 44], forbidden_soil_groups: [1, 2, 7, 17, 98, 99],
    favored_regions: ["south", "northeast", "central"]
  },
  {
    id: "crop-oil-palm",
    name: "ปาล์มน้ำมัน (พันธุ์เทเนอรา)",
    category: "ไม้ยืนต้น / อุตสาหกรรม",
    icon_emoji: "🌴",
    image_url: "/crops/oil_palm.jpg",
    growth_duration: "3-3.5 ปี เริ่มเก็บผล",
    water_requirement: "สูง",
    water_level: 3,
    estimated_yield: "3.2-4.5 ตัน/ไร่/ปี",
    ideal_temperature_range: "26 - 32 °C",
    best_season: "ต้นฤดูฝน (พ.ค. - ก.ค.)",
    soil_preference: "ดินร่วนเหนียว ดินเหนียว อินทรียวัตถุสูง ระบายน้ำดีปานกลาง (กลุ่มชุดดินที่ 7, 15, 29, 56)",
    description: "พืชน้ำมันผลผลิตต่อไร่สูงสุดในโลก ทนน้ำขังชั่วคราวได้ดี ผลิตน้ำมันพืชและไบโอดีเซล",
    source_citation: "คู่มือประเมินดิน กรมพัฒนาที่ดิน (LDD) & สศก.",
    pros_template: ["เก็บผลผลิตได้ทุก 15-20 วัน ตลอดทั้งปี", "ทนสภาพน้ำท่วมขังระยะสั้นได้ดีกว่าไม้ผลทั่วไป"],
    cautions_template: ["ต้องการปริมาณน้ำฝนสม่ำเสมอ หากแล้งผลผลิตจะดรอป", "ต้องมีลานเทหรือโรงสกัดน้ำมันปาล์มใกล้แปลง"],
    ideal_moisture_min: 60, ideal_moisture_max: 90, max_slope: 6.0,
    ideal_elevation_min: 5, ideal_elevation_max: 300,
    ideal_rainfall_min: 1800, ideal_rainfall_max: 3000, ideal_ndvi_min: 0.65, soil_depth_min_cm: 80,
    ldd_criteria: {
      slope_deg: { s1: [0.5, 3.0], s2: [3.0, 5.5], s3: [5.5, 9.0] },
      soil_ph: { s1: [4.5, 6.0], s2: [4.0, 6.5], s3: [3.8, 7.2] },
      soil_moisture: { s1: [62, 88], s2: [52, 62], s3: [42, 52] },
      annual_rainfall: { s1: [1800, 2800], s2: [1500, 1800], s3: [1250, 1500] }
    },
    suitable_soil_groups_s1: [7, 15, 29, 56], suitable_soil_groups_s2: [2, 38, 48], forbidden_soil_groups: [17, 98, 99],
    favored_regions: ["south", "central"]
  },
  {
    id: "crop-coffee-arabica",
    name: "กาแฟอาราบิก้า (เชียงใหม่ 80 / คาติมอร์)",
    category: "ไม้ยืนต้น / อุตสาหกรรม",
    icon_emoji: "☕",
    image_url: "/crops/coffee.jpg",
    growth_duration: "3-4 ปี เริ่มให้ผล",
    water_requirement: "ปานกลาง",
    water_level: 2,
    estimated_yield: "800-1,200 กก.ผลสด/ไร่",
    ideal_temperature_range: "16 - 24 °C",
    best_season: "ต้นฤดูฝน (พ.ค. - มิ.ย.)",
    soil_preference: "ดินภูเขาสีแดง ดินร่วนซุย อินทรียวัตถุสูง (กลุ่มชุดดินที่ 48, 55, 62)",
    description: "กาแฟคุณภาพพรีเมียม ต้องการอากาศเย็นและระดับความสูง 800 เมตรขึ้นไป ให้รสชาติและกลิ่นหอมซับซ้อน",
    source_citation: "กรมพัฒนาที่ดิน (LDD) เกณฑ์พืชที่สูง & กรมวิชาการเกษตร",
    pros_template: ["ราคาเมล็ดกาแฟกะลาเกรดพิเศษ (Specialty) สูงมาก", "ปลูกร่วมกับไม้ร่มเงาช่วยฟื้นฟูป่าต้นน้ำ"],
    cautions_template: ["บังคับระดับความสูง >800 เมตร ปลูกที่ราบต่ำคุณภาพจะต่ำ", "ระวังโรคราสนิมกาแฟ"],
    ideal_moisture_min: 55, ideal_moisture_max: 78, max_slope: 16.0, min_slope: 2.0,
    ideal_elevation_min: 800, ideal_elevation_max: 1600,
    ideal_rainfall_min: 1400, ideal_rainfall_max: 2200, ideal_ndvi_min: 0.6, soil_depth_min_cm: 80,
    ldd_criteria: {
      slope_deg: { s1: [2.0, 9.0], s2: [9.0, 15.0], s3: [15.0, 22.0] },
      soil_ph: { s1: [5.2, 6.2], s2: [4.8, 6.8], s3: [4.5, 7.2] },
      soil_moisture: { s1: [55, 75], s2: [45, 55], s3: [75, 85] },
      annual_rainfall: { s1: [1400, 2000], s2: [1200, 1400], s3: [1000, 1200] }
    },
    suitable_soil_groups_s1: [48, 55, 62], suitable_soil_groups_s2: [29, 38], forbidden_soil_groups: [1, 2, 7, 11, 98, 99],
    favored_regions: ["north"]
  },
  {
    id: "crop-coffee-robusta",
    name: "กาแฟโรบัสต้า",
    category: "ไม้ยืนต้น / อุตสาหกรรม",
    icon_emoji: "☕",
    image_url: "/crops/coffee.jpg",
    growth_duration: "3-4 ปี เริ่มให้ผล",
    water_requirement: "สูง",
    water_level: 3,
    estimated_yield: "1,200-1,800 กก.ผลสด/ไร่",
    ideal_temperature_range: "24 - 32 °C",
    best_season: "ต้นฤดูฝน (พ.ค. - มิ.ย.)",
    soil_preference: "ดินร่วน ดินร่วนปนเหนียว อินทรียวัตถุสูง (กลุ่มชุดดินที่ 38, 48, 55)",
    description: "กาแฟเขตร้อนชื้นภาคใต้ ทนทาน ให้คาเฟอีนเข้มข้น ป้อนโรงงานกาแฟสำเร็จรูป",
    source_citation: "คู่มือประเมินดิน LDD & กรมวิชาการเกษตร",
    pros_template: ["ทนร้อน ทนโรคแมลงได้ดีกว่าอาราบิก้า ปลูกที่ราบได้", "โรงงานรับซื้อไม่อั้นเพื่อแปรรูปกาแฟผง"],
    cautions_template: ["ต้องการฝนชุกและช่วงแล้งสั้นๆ เพื่อกระตุ้นตาดอก", "ราคาต่อกิโลกรัมต่ำกว่ากาแฟอาราบิก้า"],
    ideal_moisture_min: 55, ideal_moisture_max: 82, max_slope: 10.0,
    ideal_elevation_min: 20, ideal_elevation_max: 500,
    ideal_rainfall_min: 1600, ideal_rainfall_max: 2600, ideal_ndvi_min: 0.58, soil_depth_min_cm: 80,
    ldd_criteria: {
      slope_deg: { s1: [1.2, 5.0], s2: [5.0, 9.0], s3: [9.0, 14.0] },
      soil_ph: { s1: [5.0, 6.3], s2: [4.6, 6.8], s3: [4.2, 7.3] },
      soil_moisture: { s1: [58, 80], s2: [48, 58], s3: [80, 88] },
      annual_rainfall: { s1: [1600, 2400], s2: [1350, 1600], s3: [1150, 1350] }
    },
    suitable_soil_groups_s1: [38, 48, 55], suitable_soil_groups_s2: [29, 35, 44], forbidden_soil_groups: [1, 2, 7, 17, 98, 99],
    favored_regions: ["south", "central"]
  },
  {
    id: "crop-cocoa",
    name: "โกโก้ (ชุมพร 1 / I.M.1)",
    category: "ไม้ยืนต้น / อุตสาหกรรม",
    icon_emoji: "🍫",
    image_url: "/crops/cocoa.jpg",
    growth_duration: "2.5-3 ปี เริ่มให้ผล",
    water_requirement: "สูง",
    water_level: 3,
    estimated_yield: "800-1,200 กก.ผลสด/ไร่",
    ideal_temperature_range: "24 - 32 °C",
    best_season: "ต้นฤดูฝน (พ.ค. - ก.ค.)",
    soil_preference: "ดินร่วน ดินร่วนปนทราย หน้าดินลึก ระบายน้ำดีเลิศ (กลุ่มชุดดินที่ 38, 48)",
    description: "พืชเศรษฐกิจใหม่ นิยมปลูกแซมสวนมะพร้าวหรือสวนกล้วย กระแสคราฟต์ช็อกโกแลตกำลังเติบโต",
    source_citation: "กรมวิชาการเกษตร & FAO EcoCrop",
    pros_template: ["เก็บเกี่ยวผลผลิตได้ทุก 15 วันตลอดทั้งปี", "ปลูกแซมในสวนพืชอื่นได้ ช่วยเพิ่มรายได้ต่อไร่"],
    cautions_template: ["ช่วง 1-2 ปีแรกต้องการพืชพี่เลี้ยงให้ร่มเงา 50%", "ต้องมีแหล่งหมักและตากเมล็ดที่ได้มาตรฐาน"],
    ideal_moisture_min: 55, ideal_moisture_max: 80, max_slope: 8.0,
    ideal_elevation_min: 10, ideal_elevation_max: 600,
    ideal_rainfall_min: 1500, ideal_rainfall_max: 2400, ideal_ndvi_min: 0.55, soil_depth_min_cm: 80,
    ldd_criteria: {
      slope_deg: { s1: [1.0, 4.0], s2: [4.0, 7.5], s3: [7.5, 11.0] },
      soil_ph: { s1: [5.5, 6.8], s2: [5.0, 7.3], s3: [4.5, 7.8] },
      soil_moisture: { s1: [55, 78], s2: [45, 55], s3: [78, 86] },
      annual_rainfall: { s1: [1500, 2200], s2: [1300, 1500], s3: [1100, 1300] }
    },
    suitable_soil_groups_s1: [38, 48], suitable_soil_groups_s2: [29, 35, 44], forbidden_soil_groups: [1, 2, 7, 98, 99],
    favored_regions: ["south", "central", "north"]
  },
  {
    id: "crop-eucalyptus",
    name: "ยูคาลิปตัส (คามัลดูเลนซิส)",
    category: "ไม้ยืนต้น / อุตสาหกรรม",
    icon_emoji: "🪵",
    image_url: "/crops/eucalyptus.jpg",
    growth_duration: "3-5 ปี ตัดขายรอบแรก",
    water_requirement: "ต่ำ",
    water_level: 1,
    estimated_yield: "18-25 ตัน/ไร่/รอบตัด",
    ideal_temperature_range: "25 - 36 °C",
    best_season: "ต้นฤดูฝน (พ.ค. - มิ.ย.)",
    soil_preference: "ดินร่วนปนทราย ดินลูกรัง ดินทรายจัด (กลุ่มชุดดินที่ 33, 40, 44, 47)",
    description: "ไม้โตเร็วสำหรับอุตสาหกรรมเยื่อกระดาษ ทนแล้ง ทนดินเค็มและดินลูกรังได้ดีเยี่ยม",
    source_citation: "คู่มือประเมินดิน กรมพัฒนาที่ดิน (LDD)",
    pros_template: ["ทนแล้งและโตได้ในดินลูกรัง/ดินเลวที่พืชอื่นไม่โต", "โรงงานกระดาษรับซื้อไม่อั้น"],
    cautions_template: ["ดูดใช้น้ำและธาตุอาหารจากดินมาก", "เศษใบมีน้ำมันทำให้พืชชั้นล่างขึ้นยาก"],
    ideal_moisture_min: 25, ideal_moisture_max: 70, max_slope: 12.0,
    ideal_elevation_min: 10, ideal_elevation_max: 600,
    ideal_rainfall_min: 900, ideal_rainfall_max: 1800, ideal_ndvi_min: 0.45, soil_depth_min_cm: 50,
    ldd_criteria: {
      slope_deg: { s1: [1.0, 6.0], s2: [6.0, 10.0], s3: [10.0, 16.0] },
      soil_ph: { s1: [4.5, 6.5], s2: [4.0, 7.5], s3: [3.8, 8.2] },
      soil_moisture: { s1: [30, 70], s2: [20, 30], s3: [70, 80] },
      annual_rainfall: { s1: [1000, 1600], s2: [850, 1000], s3: [700, 850] }
    },
    suitable_soil_groups_s1: [33, 40, 44, 47], suitable_soil_groups_s2: [29, 35, 48], forbidden_soil_groups: [1, 2, 98, 99],
    favored_regions: ["northeast", "central", "north"]
  },
  {
    id: "crop-bamboo",
    name: "ไผ่ตง / ไผ่เลี้ยง",
    category: "ไม้ยืนต้น / อุตสาหกรรม",
    icon_emoji: "🎍",
    image_url: "/crops/bamboo.jpg",
    growth_duration: "8-10 เดือน เริ่มตัดหน่อ",
    water_requirement: "ปานกลาง",
    water_level: 2,
    estimated_yield: "2.5-4.0 ตันหน่อ/ไร่/ปี",
    ideal_temperature_range: "22 - 34 °C",
    best_season: "ต้นฤดูฝน (พ.ค. - มิ.ย.)",
    soil_preference: "ดินร่วน ดินร่วนปนเหนียว อินทรียวัตถุสูง (กลุ่มชุดดินที่ 29, 35, 48)",
    description: "พืชสารพัดประโยชน์ เก็บหน่อขายได้ราคา ลำไผ่ขายงานก่อสร้างและแปรรูปถ่านไบโอชาร์",
    source_citation: "กรมป่าไม้ & กรมพัฒนาที่ดิน (LDD)",
    pros_template: ["เก็บหน่อได้ตลอดปีหากมีระบบน้ำ", "รากไผ่ช่วยยึดหน้าดิน ป้องกันการพังทลาย"],
    cautions_template: ["ต้องสางกอและตัดแต่งลำแก่อย่างสม่ำเสมอ", "หากปล่อยรกจะกลายเป็นแหล่งสะสมงูและหนู"],
    ideal_moisture_min: 45, ideal_moisture_max: 75, max_slope: 12.0,
    ideal_elevation_min: 20, ideal_elevation_max: 800,
    ideal_rainfall_min: 1100, ideal_rainfall_max: 2000, ideal_ndvi_min: 0.5, soil_depth_min_cm: 60,
    ldd_criteria: {
      slope_deg: { s1: [1.0, 5.0], s2: [5.0, 9.0], s3: [9.0, 15.0] },
      soil_ph: { s1: [5.2, 6.8], s2: [4.8, 7.3], s3: [4.5, 7.8] },
      soil_moisture: { s1: [45, 75], s2: [35, 45], s3: [75, 85] },
      annual_rainfall: { s1: [1100, 1800], s2: [900, 1100], s3: [750, 900] }
    },
    suitable_soil_groups_s1: [29, 35, 48], suitable_soil_groups_s2: [33, 44], forbidden_soil_groups: [1, 2, 98, 99],
    favored_regions: ["all"]
  },
  {
    id: "crop-coconut-industrial",
    name: "มะพร้าวแกง / มะพร้าวอุตสาหกรรม",
    category: "ไม้ยืนต้น / อุตสาหกรรม",
    icon_emoji: "🥥",
    image_url: "/crops/coconut.jpg",
    growth_duration: "5-6 ปี เริ่มให้ผล",
    water_requirement: "ปานกลาง",
    water_level: 2,
    estimated_yield: "1,200-1,600 ผล/ไร่/ปี",
    ideal_temperature_range: "25 - 32 °C",
    best_season: "ต้นฤดูฝน",
    soil_preference: "ดินร่วนปนทราย ดินทรายชายฝั่ง หน้าดินลึก (กลุ่มชุดดินที่ 33, 44, 56)",
    description: "มะพร้าวผลใหญ่สำหรับคั้นกะทิและน้ำมันมะพร้าวสกัดเย็น ทนลมและดินเค็มชายทะเล",
    source_citation: "คู่มือประเมินดิน LDD & กรมวิชาการเกษตร",
    pros_template: ["อายุยืนยาวกว่า 50-60 ปี เก็บผลผลิตได้ทุกเดือน", "ทนลมพายุและไอเกลือทะเลได้ดีมาก"],
    cautions_template: ["ระวังด้วงแรดมะพร้าวและหนอนหัวดำทำลายยอด", "ช่วงติดผลแรกใช้เวลา 5-6 ปี"],
    ideal_moisture_min: 50, ideal_moisture_max: 80, max_slope: 6.0,
    ideal_elevation_min: 5, ideal_elevation_max: 300,
    ideal_rainfall_min: 1400, ideal_rainfall_max: 2500, ideal_ndvi_min: 0.55, soil_depth_min_cm: 80,
    ldd_criteria: {
      slope_deg: { s1: [0.5, 3.0], s2: [3.0, 6.0], s3: [6.0, 9.0] },
      soil_ph: { s1: [5.5, 7.2], s2: [5.0, 7.8], s3: [4.5, 8.2] },
      soil_moisture: { s1: [50, 78], s2: [40, 50], s3: [78, 86] },
      annual_rainfall: { s1: [1400, 2200], s2: [1150, 1400], s3: [950, 1150] }
    },
    suitable_soil_groups_s1: [33, 44, 56], suitable_soil_groups_s2: [29, 35, 48], forbidden_soil_groups: [1, 2, 98, 99],
    favored_regions: ["south", "central"]
  },

  // ==========================================
  // หมวดที่ 3: ไม้ผลเศรษฐกิจ (12 ชนิด)
  // ==========================================
  {
    id: "crop-durian",
    name: "ทุเรียน (หมอนทอง / ก้านยาว / ชะนี)",
    category: "ไม้ผลเศรษฐกิจ",
    icon_emoji: "🛕",
    image_url: "/crops/durian.jpg",
    growth_duration: "4-5 ปี เริ่มให้ผล",
    water_requirement: "สูง",
    water_level: 3,
    estimated_yield: "1.5-2.5 ตัน/ไร่",
    ideal_temperature_range: "25 - 32 °C",
    best_season: "ต้นฤดูฝน (พ.ค. - มิ.ย.)",
    soil_preference: "ดินร่วน ดินร่วนปนทรายสีแดง ระบายน้ำดีเลิศ หน้าดินลึก >100 ซม. (กลุ่มชุดดินที่ 38, 48, 29)",
    description: "ราชาแห่งผลไม้ มูลค่าส่งออกอันดับหนึ่ง ราคาต่อกิโลกรัมสูงที่สุด ผลตอบแทนมหาศาล",
    source_citation: "คู่มือประเมินดิน LDD & กรมวิชาการเกษตร (GAP ทุเรียน)",
    pros_template: ["มูลค่าต่อกิโลกรัมสูงมาก ตลาดจีนมีความต้องการสูงต่อเนื่อง", "ให้ผลผลิตต่อเนื่องยาวนาน 25-30 ปี"],
    cautions_template: ["รากอ่อนไหวต่อโรครากเน่าโคนเน่า (ไฟทอปธอรา) ห้ามน้ำขังเด็ดขาด", "ต้นทุนต่อไร่และค่าดูแลรักษาสูง"],
    ideal_moisture_min: 55, ideal_moisture_max: 75, max_slope: 8.0, min_slope: 1.5,
    ideal_elevation_min: 30, ideal_elevation_max: 650,
    ideal_rainfall_min: 1600, ideal_rainfall_max: 2600, ideal_ndvi_min: 0.6, soil_depth_min_cm: 100,
    ldd_criteria: {
      slope_deg: { s1: [1.5, 4.5], s2: [0.5, 1.5], s3: [4.5, 8.0] },
      soil_ph: { s1: [5.5, 6.5], s2: [5.0, 7.0], s3: [4.5, 7.5] },
      soil_moisture: { s1: [55, 75], s2: [48, 55], s3: [75, 82] },
      annual_rainfall: { s1: [1600, 2400], s2: [1350, 1600], s3: [1150, 1350] }
    },
    suitable_soil_groups_s1: [38, 48, 29], suitable_soil_groups_s2: [33, 44], forbidden_soil_groups: [1, 2, 7, 11, 17, 98, 99],
    favored_regions: ["south", "central", "north"]
  },
  {
    id: "crop-mangosteen",
    name: "มังคุด",
    category: "ไม้ผลเศรษฐกิจ",
    icon_emoji: "🫐",
    image_url: "/crops/mangosteen.jpg",
    growth_duration: "5-6 ปี เริ่มให้ผล",
    water_requirement: "สูง",
    water_level: 3,
    estimated_yield: "1.2-1.8 ตัน/ไร่",
    ideal_temperature_range: "25 - 32 °C",
    best_season: "ต้นฤดูฝน (พ.ค. - มิ.ย.)",
    soil_preference: "ดินร่วน ดินร่วนเหนียว อินทรียวัตถุสูง ความชื้นสัมพัทธ์สูง (กลุ่มชุดดินที่ 38, 48)",
    description: "ราชินีแห่งผลไม้ นิยมปลูกร่วมกับทุเรียน ตลาดส่งออกผลสดและแช่แข็งเติบโตดี",
    source_citation: "คู่มือประเมินดิน LDD & กรมวิชาการเกษตร",
    pros_template: ["ราคาผลผลิตมีเสถียรภาพ ไม้ยืนต้นอายุยืนกว่า 30 ปี", "ปลูกร่วมกับทุเรียนสร้างสมดุลระบบนิเวศ"],
    cautions_template: ["ต้นเล็กต้องการร่มเงาพรางแสงแดด", "ผลผลิตอาจเกิดอาการเนื้อแก้วยางไหลหากฝนตกชุกช่วงเก็บเกี่ยว"],
    ideal_moisture_min: 60, ideal_moisture_max: 82, max_slope: 8.0,
    ideal_elevation_min: 20, ideal_elevation_max: 500,
    ideal_rainfall_min: 1700, ideal_rainfall_max: 2800, ideal_ndvi_min: 0.6, soil_depth_min_cm: 100,
    ldd_criteria: {
      slope_deg: { s1: [1.0, 4.0], s2: [4.0, 7.5], s3: [7.5, 11.0] },
      soil_ph: { s1: [5.5, 6.5], s2: [5.0, 7.0], s3: [4.5, 7.5] },
      soil_moisture: { s1: [60, 80], s2: [50, 60], s3: [80, 86] },
      annual_rainfall: { s1: [1700, 2600], s2: [1400, 1700], s3: [1200, 1400] }
    },
    suitable_soil_groups_s1: [38, 48], suitable_soil_groups_s2: [29, 44], forbidden_soil_groups: [1, 2, 11, 17, 98, 99],
    favored_regions: ["south", "central"]
  },
  {
    id: "crop-rambutan",
    name: "เงาะ (โรงเรียน / สีชมพู)",
    category: "ไม้ผลเศรษฐกิจ",
    icon_emoji: "🔴",
    image_url: "/crops/rambutan.jpg",
    growth_duration: "4-5 ปี เริ่มให้ผล",
    water_requirement: "สูง",
    water_level: 3,
    estimated_yield: "1.8-2.5 ตัน/ไร่",
    ideal_temperature_range: "25 - 32 °C",
    best_season: "ต้นฤดูฝน (พ.ค. - มิ.ย.)",
    soil_preference: "ดินร่วน ดินร่วนปนทราย หน้าดินลึก (กลุ่มชุดดินที่ 38, 48, 29)",
    description: "ไม้ผลเขตร้อนชื้น ผลดก รสหวานฉ่ำ ตลาดบริโภคสดและแปรรูปกระป๋อง",
    source_citation: "คู่มือประเมินดิน LDD & DOA",
    pros_template: ["ให้ผลผลิตดกมาก คุ้มค่าแรงเก็บเกี่ยว", "ตลาดโรงงานเงาะกระป๋องรองรับผลผลิตส่วนเกิน"],
    cautions_template: ["ต้องการช่วงแล้ง 3-4 สัปดาห์เพื่อชักนำการออกดอก", "เปลือกผลเหี่ยวง่ายหลังเก็บเกี่ยว ต้องเร่งจำหน่าย"],
    ideal_moisture_min: 55, ideal_moisture_max: 80, max_slope: 7.0,
    ideal_elevation_min: 10, ideal_elevation_max: 400,
    ideal_rainfall_min: 1500, ideal_rainfall_max: 2500, ideal_ndvi_min: 0.58, soil_depth_min_cm: 80,
    ldd_criteria: {
      slope_deg: { s1: [1.0, 3.5], s2: [3.5, 6.5], s3: [6.5, 9.5] },
      soil_ph: { s1: [5.5, 6.5], s2: [5.0, 7.0], s3: [4.5, 7.5] },
      soil_moisture: { s1: [55, 78], s2: [45, 55], s3: [78, 85] },
      annual_rainfall: { s1: [1500, 2300], s2: [1300, 1500], s3: [1100, 1300] }
    },
    suitable_soil_groups_s1: [38, 48, 29], suitable_soil_groups_s2: [33, 44], forbidden_soil_groups: [1, 2, 7, 98, 99],
    favored_regions: ["south", "central"]
  },
  {
    id: "crop-longan",
    name: "ลำไย (อีดอ / พวงทอง)",
    category: "ไม้ผลเศรษฐกิจ",
    icon_emoji: "🟤",
    image_url: "/crops/longan.jpg",
    growth_duration: "3-4 ปี เริ่มให้ผล",
    water_requirement: "ปานกลาง",
    water_level: 2,
    estimated_yield: "1.5-2.2 ตัน/ไร่",
    ideal_temperature_range: "20 - 32 °C",
    best_season: "ฤดูหนาวต้องการอากาศเย็นชักนำตาดอก",
    soil_preference: "ดินร่วน ดินร่วนปนทราย ระบายน้ำดี หน้าดินลึก (กลุ่มชุดดินที่ 7, 29, 35)",
    description: "ไม้ผลเศรษฐกิจหลักของภาคเหนือ ตลาดจีนต้องการสูงมาก สามารถทำสารชักนำออกนอกฤดูได้",
    source_citation: "คู่มือประเมินดิน กรมพัฒนาที่ดิน (LDD)",
    pros_template: ["ใช้สารโพแทสเซียมคลอเรตบังคับออกนอกฤดูได้", "ตลาดส่งออกจีนและโรงงานลำไยอบแห้งรองรับมหาศาล"],
    cautions_template: ["ในฤดูปกติถ้าหน้าหนาวไม่หนาวจัด ดอกจะไม่ยอมออก", "ระวังโรคพุ่มไม้กวาด"],
    ideal_moisture_min: 45, ideal_moisture_max: 72, max_slope: 6.0,
    ideal_elevation_min: 150, ideal_elevation_max: 700,
    ideal_rainfall_min: 1100, ideal_rainfall_max: 1700, ideal_ndvi_min: 0.55, soil_depth_min_cm: 80,
    ldd_criteria: {
      slope_deg: { s1: [0.5, 3.0], s2: [3.0, 5.5], s3: [5.5, 8.5] },
      soil_ph: { s1: [5.8, 6.8], s2: [5.2, 7.3], s3: [4.8, 7.8] },
      soil_moisture: { s1: [48, 70], s2: [38, 48], s3: [70, 78] },
      annual_rainfall: { s1: [1100, 1600], s2: [950, 1100], s3: [800, 950] }
    },
    suitable_soil_groups_s1: [7, 29, 35], suitable_soil_groups_s2: [33, 48], forbidden_soil_groups: [1, 2, 98, 99],
    favored_regions: ["north", "central"]
  },
  {
    id: "crop-mango",
    name: "มะม่วง (น้ำดอกไม้สีทอง / เขียวเสวย)",
    category: "ไม้ผลเศรษฐกิจ",
    icon_emoji: "🥭",
    image_url: "/crops/mango.jpg",
    growth_duration: "3-4 ปี เริ่มให้ผล",
    water_requirement: "ปานกลาง",
    water_level: 2,
    estimated_yield: "1.2-1.8 ตัน/ไร่",
    ideal_temperature_range: "24 - 34 °C",
    best_season: "ฤดูฝน (พ.ค. - มิ.ย.)",
    soil_preference: "ดินร่วน ดินร่วนปนทราย ทนแล้งได้ดี (กลุ่มชุดดินที่ 29, 33, 35, 48)",
    description: "ผลไม้ส่งออกชั้นนำ ปลูกง่าย ดูแลง่าย ทนสภาพแห้งแล้งได้ดีกว่าไม้ผลอื่น",
    source_citation: "คู่มือประเมินดิน LDD & กรมวิชาการเกษตร",
    pros_template: ["ทนแล้งดี ปรับตัวเข้ากับสภาพดินได้หลากหลาย", "ตลาดส่งออกญี่ปุ่น เกาหลี จีน ให้ราคาสูง"],
    cautions_template: ["ระวังโรคแอนแทรคโนสช่วงฝนชุกตอนติดดอก", "ต้องห่อผลเพื่อป้องกันแมลงวันทองเจาะผล"],
    ideal_moisture_min: 40, ideal_moisture_max: 70, max_slope: 8.0,
    ideal_elevation_min: 10, ideal_elevation_max: 500,
    ideal_rainfall_min: 900, ideal_rainfall_max: 1600, ideal_ndvi_min: 0.5, soil_depth_min_cm: 80,
    ldd_criteria: {
      slope_deg: { s1: [0.5, 3.5], s2: [3.5, 6.5], s3: [6.5, 10.0] },
      soil_ph: { s1: [5.5, 7.0], s2: [5.0, 7.5], s3: [4.5, 8.0] },
      soil_moisture: { s1: [42, 68], s2: [32, 42], s3: [68, 76] },
      annual_rainfall: { s1: [1000, 1500], s2: [850, 1000], s3: [700, 850] }
    },
    suitable_soil_groups_s1: [29, 35, 48], suitable_soil_groups_s2: [33, 40, 44], forbidden_soil_groups: [1, 2, 7, 98, 99],
    favored_regions: ["central", "north", "northeast"]
  },
  {
    id: "crop-pomelo",
    name: "ส้มโอ (ขาวน้ำผึ้ง / ทับทิมสยาม)",
    category: "ไม้ผลเศรษฐกิจ",
    icon_emoji: "🍊",
    image_url: "/crops/pomelo.jpg",
    growth_duration: "3-4 ปี เริ่มให้ผล",
    water_requirement: "ปานกลาง",
    water_level: 2,
    estimated_yield: "2.0-3.0 ตัน/ไร่",
    ideal_temperature_range: "25 - 34 °C",
    best_season: "ต้นฤดูฝน",
    soil_preference: "ดินร่วนเหนียว ดินตะกอนน้ำพาด อินทรียวัตถุสูง (กลุ่มชุดดินที่ 2, 7, 15, 29)",
    description: "ผลไม้ GI คุณภาพสูง ปลูกได้ดีในที่ราบลุ่มริมแม่น้ำ ทนน้ำได้ดีกว่าส้มชนิดอื่น",
    source_citation: "คู่มือประเมินดิน LDD & กรมวิชาการเกษตร",
    pros_template: ["ส้มโอทับทิมสยามและขาวน้ำผึ้งราคาสูงมาก", "เก็บรักษาผลไว้ได้นานโดยรสชาติไม่เปลี่ยน"],
    cautions_template: ["ต้องยกร่องสวนหากเป็นที่ราบลุ่มน้ำท่วม", "ระวังเพลี้ยไฟและหนอนเจาะผลส้มโอ"],
    ideal_moisture_min: 50, ideal_moisture_max: 78, max_slope: 4.0,
    ideal_elevation_min: 5, ideal_elevation_max: 300,
    ideal_rainfall_min: 1200, ideal_rainfall_max: 2000, ideal_ndvi_min: 0.55, soil_depth_min_cm: 70,
    ldd_criteria: {
      slope_deg: { s1: [0.5, 2.0], s2: [2.0, 4.0], s3: [4.0, 6.5] },
      soil_ph: { s1: [5.8, 6.8], s2: [5.2, 7.3], s3: [4.8, 7.8] },
      soil_moisture: { s1: [52, 75], s2: [42, 52], s3: [75, 82] },
      annual_rainfall: { s1: [1200, 1800], s2: [1000, 1200], s3: [850, 1000] }
    },
    suitable_soil_groups_s1: [2, 7, 15, 29], suitable_soil_groups_s2: [3, 35], forbidden_soil_groups: [17, 98, 99],
    favored_regions: ["central", "south"]
  },
  {
    id: "crop-banana",
    name: "กล้วยหอมทอง / กล้วยน้ำว้า",
    category: "ไม้ผลเศรษฐกิจ",
    icon_emoji: "🍌",
    image_url: "/crops/banana.jpg",
    growth_duration: "9-10 เดือน",
    water_requirement: "ปานกลาง",
    water_level: 2,
    estimated_yield: "3.5-5.0 ตัน/ไร่",
    ideal_temperature_range: "25 - 34 °C",
    best_season: "ต้นฤดูฝน (พ.ค. - มิ.ย.)",
    soil_preference: "ดินร่วน ดินร่วนเหนียว อินทรียวัตถุสูง (กลุ่มชุดดินที่ 7, 29, 35)",
    description: "ผลไม้เงินสดโตเร็ว เก็บเกี่ยวได้ใน 9 เดือน ตลาดร้านสะดวกซื้อและแปรรูปรองรับตลอดปี",
    source_citation: "คู่มือประเมินดิน LDD & กรมส่งเสริมการเกษตร",
    pros_template: ["คืนทุนเร็วมาก ได้ผลผลิตภายใน 9 เดือน", "ตลาดรับซื้อต่อเนื่อง ทั้งกล้วยสดและแปรรูป"],
    cautions_template: ["อ่อนไหวต่อพายุลมแรง ลำต้นหักล้มง่าย", "ระวังโรคตายพราย (ฟิวซาเรียม)"],
    ideal_moisture_min: 50, ideal_moisture_max: 78, max_slope: 4.0,
    ideal_elevation_min: 5, ideal_elevation_max: 400,
    ideal_rainfall_min: 1200, ideal_rainfall_max: 2000, ideal_ndvi_min: 0.5, soil_depth_min_cm: 60,
    ldd_criteria: {
      slope_deg: { s1: [0.5, 2.0], s2: [2.0, 4.0], s3: [4.0, 6.5] },
      soil_ph: { s1: [5.8, 6.8], s2: [5.2, 7.3], s3: [4.8, 7.8] },
      soil_moisture: { s1: [52, 75], s2: [42, 52], s3: [75, 82] },
      annual_rainfall: { s1: [1200, 1800], s2: [1000, 1200], s3: [850, 1000] }
    },
    suitable_soil_groups_s1: [7, 29, 35], suitable_soil_groups_s2: [33, 48], forbidden_soil_groups: [1, 2, 98, 99],
    favored_regions: ["all"]
  },
  {
    id: "crop-pineapple",
    name: "สับปะรดโรงงาน (ปัตตาเวีย)",
    category: "ไม้ผลเศรษฐกิจ",
    icon_emoji: "🍍",
    image_url: "/crops/pineapple.jpg",
    growth_duration: "12-14 เดือน",
    water_requirement: "ต่ำ",
    water_level: 1,
    estimated_yield: "6.0-9.0 ตัน/ไร่",
    ideal_temperature_range: "24 - 33 °C",
    best_season: "ปลายฤดูฝน (ต.ค. - พ.ย.)",
    soil_preference: "ดินร่วนทราย ดินทราย ทนดินกรดจัดได้ดี (กลุ่มชุดดินที่ 33, 40, 44)",
    description: "พืชทนแล้งและทนดินกรดได้ยอดเยี่ยม ป้อนโรงงานสับปะรดกระป๋องส่งออกเบอร์หนึ่งของโลก",
    source_citation: "คู่มือประเมินดิน กรมพัฒนาที่ดิน (LDD)",
    pros_template: ["ทนแล้งดีเลิศ ปลูกในดินทรายและดินกรดที่พืชอื่นไม่โตได้", "ประเทศไทยเป็นผู้ส่งออกสับปะรดกระป๋องอันดับต้นของโลก"],
    cautions_template: ["ราคาผลผลิตผันผวนตามฤดูกาลโรงงาน", "แดดเผาร้อนจัดช่วงผลแก่อาจทำให้เนื้อสับปะรดนิ่มเละ"],
    ideal_moisture_min: 30, ideal_moisture_max: 65, max_slope: 8.0,
    ideal_elevation_min: 20, ideal_elevation_max: 500,
    ideal_rainfall_min: 900, ideal_rainfall_max: 1600, ideal_ndvi_min: 0.4, soil_depth_min_cm: 50,
    ldd_criteria: {
      slope_deg: { s1: [1.0, 4.5], s2: [4.5, 7.5], s3: [7.5, 12.0] },
      soil_ph: { s1: [4.5, 5.8], s2: [4.0, 6.5], s3: [3.8, 7.0] },
      soil_moisture: { s1: [32, 62], s2: [22, 32], s3: [62, 72] },
      annual_rainfall: { s1: [1000, 1500], s2: [800, 1000], s3: [650, 800] }
    },
    suitable_soil_groups_s1: [33, 40, 44], suitable_soil_groups_s2: [29, 38], forbidden_soil_groups: [1, 2, 7, 98, 99],
    favored_regions: ["central", "south", "northeast"]
  },
  {
    id: "crop-coconut-aromatic",
    name: "มะพร้าวน้ำหอม (ก้นจีบ)",
    category: "ไม้ผลเศรษฐกิจ",
    icon_emoji: "🥥",
    image_url: "/crops/coconut.jpg",
    growth_duration: "3-3.5 ปี เริ่มให้ผล",
    water_requirement: "สูง",
    water_level: 3,
    estimated_yield: "2,000-2,600 ผล/ไร่/ปี",
    ideal_temperature_range: "25 - 33 °C",
    best_season: "ต้นฤดูฝน",
    soil_preference: "ดินเหนียว ดินร่วนเหนียวริมแม่น้ำ (กลุ่มชุดดินที่ 2, 7, 15, 29)",
    description: "มะพร้าวน้ำหอมเอกลักษณ์ไทย น้ำหวานหอมกลิ่นใบเตย ตลาดส่งออกจีนและยุโรปเติบโตสูงมาก",
    source_citation: "คู่มือประเมินดิน LDD & กรมส่งเสริมการเกษตร",
    pros_template: ["ราคาผลผลิตดีมาก เก็บเกี่ยวได้ทุก 20 วันตลอดปี", "ผลผลิตส่งออกสร้างรายได้สูงและต่อเนื่องนาน 25 ปี"],
    cautions_template: ["ต้องการน้ำหล่อเลี้ยงสม่ำเสมอ หากขาดน้ำผลจะร่วงและไม่หอม", "ระวังหนอนหัวดำและด้วงแรด"],
    ideal_moisture_min: 55, ideal_moisture_max: 85, max_slope: 3.0,
    ideal_elevation_min: 2, ideal_elevation_max: 150,
    ideal_rainfall_min: 1300, ideal_rainfall_max: 2200, ideal_ndvi_min: 0.58, soil_depth_min_cm: 80,
    ldd_criteria: {
      slope_deg: { s1: [0, 1.5], s2: [1.5, 3.0], s3: [3.0, 5.0] },
      soil_ph: { s1: [5.8, 7.0], s2: [5.2, 7.5], s3: [4.8, 8.0] },
      soil_moisture: { s1: [58, 85], s2: [48, 58], s3: [38, 48] },
      annual_rainfall: { s1: [1300, 2000], s2: [1100, 1300], s3: [900, 1100] }
    },
    suitable_soil_groups_s1: [2, 7, 15, 29], suitable_soil_groups_s2: [1, 3], forbidden_soil_groups: [17, 98, 99],
    favored_regions: ["central", "south"]
  },
  {
    id: "crop-guava",
    name: "ฝรั่ง (กิมจู / สุ่ยมี่)",
    category: "ไม้ผลเศรษฐกิจ",
    icon_emoji: "🍈",
    image_url: "/crops/guava.jpg",
    growth_duration: "8-10 เดือน เริ่มติดผล",
    water_requirement: "ปานกลาง",
    water_level: 2,
    estimated_yield: "3.5-5.0 ตัน/ไร่",
    ideal_temperature_range: "24 - 34 °C",
    best_season: "ตลอดทั้งปี (มีระบบน้ำ)",
    soil_preference: "ดินร่วน ดินร่วนเหนียว ระบายน้ำดี (กลุ่มชุดดินที่ 7, 29, 35)",
    description: "ผลไม้เพื่อสุขภาพ วิตามินซีสูง ได้ผลผลิตเร็วใน 8 เดือน เก็บขายได้ทุกสัปดาห์",
    source_citation: "กรมวิชาการเกษตร & กรมพัฒนาที่ดิน (LDD)",
    pros_template: ["คืนทุนเร็วมาก ให้ผลผลิตได้ภายในปีแรก", "เก็บเกี่ยวได้ตลอดทั้งปี มีตลาดสดรองรับทุกวัน"],
    cautions_template: ["ต้องห่อผลด้วยถุงพลาสติกและกระดาษทุกผลเพื่อกันแมลงวันทอง", "ต้องตัดแต่งกิ่งอย่างสม่ำเสมอ"],
    ideal_moisture_min: 45, ideal_moisture_max: 75, max_slope: 5.0,
    ideal_elevation_min: 10, ideal_elevation_max: 500,
    ideal_rainfall_min: 1000, ideal_rainfall_max: 1800, ideal_ndvi_min: 0.5, soil_depth_min_cm: 60,
    ldd_criteria: {
      slope_deg: { s1: [0.5, 2.5], s2: [2.5, 4.5], s3: [4.5, 7.0] },
      soil_ph: { s1: [5.5, 6.8], s2: [5.0, 7.3], s3: [4.5, 7.8] },
      soil_moisture: { s1: [48, 72], s2: [38, 48], s3: [72, 80] },
      annual_rainfall: { s1: [1100, 1600], s2: [900, 1100], s3: [750, 900] }
    },
    suitable_soil_groups_s1: [7, 29, 35], suitable_soil_groups_s2: [33, 48], forbidden_soil_groups: [1, 2, 98, 99],
    favored_regions: ["central", "north", "northeast"]
  },
  {
    id: "crop-jackfruit",
    name: "ขนุน (ทองประเสริฐ / มาเลเซีย)",
    category: "ไม้ผลเศรษฐกิจ",
    icon_emoji: "🍈",
    image_url: "/crops/jackfruit.jpg",
    growth_duration: "2.5-3 ปี เริ่มให้ผล",
    water_requirement: "ปานกลาง",
    water_level: 2,
    estimated_yield: "3.0-4.5 ตัน/ไร่",
    ideal_temperature_range: "25 - 35 °C",
    best_season: "ต้นฤดูฝน",
    soil_preference: "ดินร่วน ดินร่วนปนทราย หน้าดินลึก (กลุ่มชุดดินที่ 29, 35, 44, 48)",
    description: "ไม้ผลลูกยักษ์ ปลูกง่าย โตไว ตลาดบริโภคสดและส่งออกเนื้อแกะแช่แข็ง",
    source_citation: "คู่มือประเมินดิน LDD & กรมส่งเสริมการเกษตร",
    pros_template: ["ทนแล้งได้ดี ดูแลง่าย โรคแมลงรบกวนน้อย", "เนื้อหนา กรอบ หวาน ตลาดแปรรูปต้องการสูง"],
    cautions_template: ["แพ้น้ำท่วมขังอย่างรุนแรง", "ต้องคัดปลิดผลให้เหลือ 1-2 ผลต่อกิ่งเพื่อผลสมบูรณ์"],
    ideal_moisture_min: 40, ideal_moisture_max: 70, max_slope: 7.0,
    ideal_elevation_min: 10, ideal_elevation_max: 500,
    ideal_rainfall_min: 1000, ideal_rainfall_max: 1800, ideal_ndvi_min: 0.5, soil_depth_min_cm: 80,
    ldd_criteria: {
      slope_deg: { s1: [0.5, 3.0], s2: [3.0, 5.5], s3: [5.5, 8.5] },
      soil_ph: { s1: [5.5, 6.8], s2: [5.0, 7.3], s3: [4.5, 7.8] },
      soil_moisture: { s1: [42, 68], s2: [32, 42], s3: [68, 76] },
      annual_rainfall: { s1: [1100, 1600], s2: [900, 1100], s3: [750, 900] }
    },
    suitable_soil_groups_s1: [29, 35, 48], suitable_soil_groups_s2: [33, 44], forbidden_soil_groups: [1, 2, 7, 98, 99],
    favored_regions: ["central", "northeast", "south"]
  },
  {
    id: "crop-papaya",
    name: "มะละกอ (ฮอลแลนด์ / เรดเลดี้)",
    category: "ไม้ผลเศรษฐกิจ",
    icon_emoji: "🥭",
    image_url: "/crops/papaya.jpg",
    growth_duration: "7-8 เดือน เริ่มเก็บผล",
    water_requirement: "ปานกลาง",
    water_level: 2,
    estimated_yield: "6.0-10.0 ตัน/ไร่",
    ideal_temperature_range: "25 - 34 °C",
    best_season: "ต้นฤดูฝน (พ.ค. - มิ.ย.)",
    soil_preference: "ดินร่วน ดินร่วนปนทราย ระบายน้ำดีเลิศ (กลุ่มชุดดินที่ 29, 33, 35, 48)",
    description: "ผลไม้โตเร็ว เก็บผลสุกเนื้อแน่นรสหวาน หรือผลดิบส่งร้านส้มตำทั่วประเทศ",
    source_citation: "คู่มือประเมินดิน LDD & กรมวิชาการเกษตร",
    pros_template: ["เก็บผลผลิตได้ต่อเนื่องทุกสัปดาห์นานกว่า 1-2 ปี", "ตลาดบริโภคผลสุกและผลดิบต้องการมหาศาลทุกวัน"],
    cautions_template: ["รากเน่าตายง่ายมากหากน้ำขังเพียง 24 ชั่วโมง", "ระวังไวรัสใบด่างจุดวงแหวน (PRSV)"],
    ideal_moisture_min: 42, ideal_moisture_max: 68, max_slope: 5.0,
    ideal_elevation_min: 10, ideal_elevation_max: 500,
    ideal_rainfall_min: 1000, ideal_rainfall_max: 1800, ideal_ndvi_min: 0.48, soil_depth_min_cm: 60,
    ldd_criteria: {
      slope_deg: { s1: [0.5, 2.5], s2: [2.5, 4.5], s3: [4.5, 7.0] },
      soil_ph: { s1: [5.8, 6.8], s2: [5.2, 7.3], s3: [4.8, 7.8] },
      soil_moisture: { s1: [45, 68], s2: [35, 45], s3: [68, 75] },
      annual_rainfall: { s1: [1100, 1600], s2: [900, 1100], s3: [750, 900] }
    },
    suitable_soil_groups_s1: [29, 35, 48], suitable_soil_groups_s2: [33, 44], forbidden_soil_groups: [1, 2, 7, 98, 99],
    favored_regions: ["central", "northeast", "north"]
  },

  // ==========================================
  // หมวดที่ 4: พืชผักและสมุนไพรเศรษฐกิจ (10 ชนิด)
  // ==========================================
  {
    id: "crop-chili",
    name: "พริกขี้หนู / พริกจินดา",
    category: "พืชผัก / สมุนไพร",
    icon_emoji: "🌶️",
    image_url: "/crops/chili.jpg",
    growth_duration: "85-100 วัน เริ่มเก็บผล",
    water_requirement: "ปานกลาง",
    water_level: 2,
    estimated_yield: "1.5-2.5 ตัน/ไร่",
    ideal_temperature_range: "24 - 33 °C",
    best_season: "ปลายฤดูฝน (ต.ค. - พ.ย.)",
    soil_preference: "ดินร่วน ดินร่วนปนทราย อินทรียวัตถุสูง ระบายน้ำดีเลิศ (กลุ่มชุดดินที่ 7, 29, 35)",
    description: "เครื่องเทศคู่ครัวไทย ราคาพุ่งสูงในฤดูหนาวและฤดูแล้ง เก็บเกี่ยวได้หลายรอบ",
    source_citation: "คู่มือประเมินดิน LDD & กรมวิชาการเกษตร",
    pros_template: ["ราคาช่วงฤดูหนาว-แล้งสูงมากถึง 80-120 บาท/กก.", "เก็บเกี่ยวต่อเนื่องได้นาน 4-6 เดือน"],
    cautions_template: ["ระวังโรคแอนแทรคโนส (กุ้งแห้ง) และเพลี้ยไฟ", "แพ้น้ำท่วมขังอย่างยิ่ง"],
    ideal_moisture_min: 45, ideal_moisture_max: 70, max_slope: 5.0,
    ideal_elevation_min: 10, ideal_elevation_max: 600,
    ideal_rainfall_min: 900, ideal_rainfall_max: 1500, ideal_ndvi_min: 0.45, soil_depth_min_cm: 40,
    ldd_criteria: {
      slope_deg: { s1: [0.5, 2.5], s2: [2.5, 4.5], s3: [4.5, 7.0] },
      soil_ph: { s1: [5.8, 6.8], s2: [5.2, 7.4], s3: [4.8, 7.8] },
      soil_moisture: { s1: [48, 68], s2: [38, 48], s3: [68, 76] },
      annual_rainfall: { s1: [1000, 1500], s2: [850, 1000], s3: [700, 850] }
    },
    suitable_soil_groups_s1: [7, 29, 35], suitable_soil_groups_s2: [33, 48], forbidden_soil_groups: [1, 2, 98, 99],
    favored_regions: ["northeast", "north", "central"]
  },
  {
    id: "crop-tomato",
    name: "มะเขือเทศ (สีดา / เชอร์รี่)",
    category: "พืชผัก / สมุนไพร",
    icon_emoji: "🍅",
    image_url: "/crops/tomato.jpg",
    growth_duration: "75-85 วัน",
    water_requirement: "ปานกลาง",
    water_level: 2,
    estimated_yield: "4.0-6.0 ตัน/ไร่",
    ideal_temperature_range: "20 - 28 °C",
    best_season: "ปลายฝนต้นหนาว (ต.ค. - ธ.ค.)",
    soil_preference: "ดินร่วน อินทรียวัตถุสูง ระบายน้ำดี pH เป็นกรดอ่อน (กลุ่มชุดดินที่ 7, 29, 35)",
    description: "พืชผักผลสดรสชาติอร่อย โรงงานซอสมะเขือเทศและตลาดสดต้องการต่อเนื่อง",
    source_citation: "คู่มือประเมินดิน LDD & กรมวิชาการเกษตร",
    pros_template: ["ผลผลิตต่อไร่สูงมาก ตลาดสดและโรงงานซอสรับซื้อแน่นอน", "ชอบอากาศเย็นผลจะสีสวยสด"],
    cautions_template: ["อ่อนไหวต่อโรคเหี่ยวเขียวและโรคใบหงิกเหลือง", "ต้องปักค้างและตัดแต่งกิ่งอย่างสม่ำเสมอ"],
    ideal_moisture_min: 45, ideal_moisture_max: 70, max_slope: 4.0,
    ideal_elevation_min: 50, ideal_elevation_max: 800,
    ideal_rainfall_min: 800, ideal_rainfall_max: 1400, ideal_ndvi_min: 0.45, soil_depth_min_cm: 50,
    ldd_criteria: {
      slope_deg: { s1: [0.5, 2.0], s2: [2.0, 4.0], s3: [4.0, 6.0] },
      soil_ph: { s1: [6.0, 6.8], s2: [5.5, 7.3], s3: [5.0, 7.8] },
      soil_moisture: { s1: [48, 68], s2: [38, 48], s3: [68, 75] },
      annual_rainfall: { s1: [900, 1400], s2: [750, 900], s3: [600, 750] }
    },
    suitable_soil_groups_s1: [7, 29, 35], suitable_soil_groups_s2: [33, 48], forbidden_soil_groups: [1, 2, 98, 99],
    favored_regions: ["northeast", "north", "central"]
  },
  {
    id: "crop-lime",
    name: "มะนาว (แป้นรำไพ / แป้นพิจิตร)",
    category: "พืชผัก / สมุนไพร",
    icon_emoji: "🍋",
    image_url: "/crops/lime.jpg",
    growth_duration: "1.5-2 ปี เริ่มให้ผล",
    water_requirement: "ปานกลาง",
    water_level: 2,
    estimated_yield: "1,200-1,800 ผล/ต้น/ปี",
    ideal_temperature_range: "25 - 34 °C",
    best_season: "ตลอดทั้งปี (ทำมะนาวนอกฤดู)",
    soil_preference: "ดินร่วนซุย ระบายน้ำดีเลิศ หรือปลูกในวงบ่อซีเมนต์ (กลุ่มชุดดินที่ 7, 29, 44)",
    description: "พืชเครื่องปรุงรสคู่ครัวไทย ราคาสูงลิ่วในฤดูแล้ง (มี.ค. - เม.ย.)",
    source_citation: "คู่มือประเมินดิน LDD & กรมวิชาการเกษตร",
    pros_template: ["ราคามะนาวนอกฤดูสูงถึงลูกละ 5-8 บาท", "บังคับออกนอกฤดูด้วยการงดน้ำได้ง่าย"],
    cautions_template: ["ระวังโรคแคงเกอร์และหนอนชอนใบอย่างเข้มงวด", "ห้ามน้ำท่วมขังเด็ดขาด"],
    ideal_moisture_min: 45, ideal_moisture_max: 68, max_slope: 5.0,
    ideal_elevation_min: 10, ideal_elevation_max: 400,
    ideal_rainfall_min: 1000, ideal_rainfall_max: 1600, ideal_ndvi_min: 0.48, soil_depth_min_cm: 60,
    ldd_criteria: {
      slope_deg: { s1: [0.5, 2.5], s2: [2.5, 4.5], s3: [4.5, 7.0] },
      soil_ph: { s1: [5.8, 6.8], s2: [5.2, 7.3], s3: [4.8, 7.8] },
      soil_moisture: { s1: [48, 68], s2: [38, 48], s3: [68, 76] },
      annual_rainfall: { s1: [1000, 1500], s2: [850, 1000], s3: [700, 850] }
    },
    suitable_soil_groups_s1: [7, 29, 44], suitable_soil_groups_s2: [33, 48], forbidden_soil_groups: [1, 2, 11, 98, 99],
    favored_regions: ["central", "north", "northeast"]
  },
  {
    id: "crop-ginger",
    name: "ขิงแก่",
    category: "พืชผัก / สมุนไพร",
    icon_emoji: "🫚",
    image_url: "/crops/ginger.jpg",
    growth_duration: "8-10 เดือน",
    water_requirement: "ปานกลาง",
    water_level: 2,
    estimated_yield: "3.5-5.0 ตัน/ไร่",
    ideal_temperature_range: "22 - 30 °C",
    best_season: "ต้นฤดูฝน (พ.ค. - มิ.ย.)",
    soil_preference: "ดินร่วนซุย อินทรียวัตถุสูง ไม่แน่นทึบ หน้าดินลึก (กลุ่มชุดดินที่ 38, 48, 29)",
    description: "พืชสมุนไพรและเครื่องเทศส่งออกสำคัญ ตลาดสด อุตสาหกรรมยา และแปรรูปดองส่งญี่ปุ่น",
    source_citation: "คู่มือประเมินดิน LDD & กรมส่งเสริมการเกษตร",
    pros_template: ["ตลาดรับซื้อขิงแก่ส่งออกญี่ปุ่นมีเสถียรภาพ", "แปรรูปผลิตภัณฑ์สมุนไพรได้หลากหลาย"],
    cautions_template: ["ห้ามปลูกซ้ำแปลงเดิมเพื่อป้องกันโรคเหี่ยวเขียว", "ดินต้องระบายน้ำดีเยี่ยม หัวจะเน่าหากน้ำขัง"],
    ideal_moisture_min: 55, ideal_moisture_max: 75, max_slope: 8.0,
    ideal_elevation_min: 50, ideal_elevation_max: 800,
    ideal_rainfall_min: 1200, ideal_rainfall_max: 1800, ideal_ndvi_min: 0.52, soil_depth_min_cm: 50,
    ldd_criteria: {
      slope_deg: { s1: [1.0, 4.0], s2: [4.0, 7.0], s3: [7.0, 10.0] },
      soil_ph: { s1: [5.5, 6.5], s2: [5.0, 7.0], s3: [4.5, 7.5] },
      soil_moisture: { s1: [55, 72], s2: [45, 55], s3: [72, 80] },
      annual_rainfall: { s1: [1200, 1700], s2: [1000, 1200], s3: [850, 1000] }
    },
    suitable_soil_groups_s1: [38, 48, 29], suitable_soil_groups_s2: [44, 33], forbidden_soil_groups: [1, 2, 7, 11, 98, 99],
    favored_regions: ["north", "central", "northeast"]
  },
  {
    id: "crop-galangal",
    name: "ข่าแกง",
    category: "พืชผัก / สมุนไพร",
    icon_emoji: "🫚",
    image_url: "/crops/ginger.jpg",
    growth_duration: "8-10 เดือน",
    water_requirement: "ปานกลาง",
    water_level: 2,
    estimated_yield: "3.0-4.0 ตัน/ไร่",
    ideal_temperature_range: "24 - 33 °C",
    best_season: "ต้นฤดูฝน (พ.ค. - มิ.ย.)",
    soil_preference: "ดินร่วน ดินร่วนปนทราย ร่วนซุย (กลุ่มชุดดินที่ 29, 33, 48)",
    description: "เครื่องแกงหลักของอาหารไทย ทนทาน ปลูกง่าย ให้ผลผลิตหัวใต้ดินดก",
    source_citation: "คู่มือประเมินดิน LDD & DOA",
    pros_template: ["ทนทาน โรคแมลงรบกวนน้อยมาก", "เก็บเกี่ยวได้นานตามความต้องการของตลาด"],
    cautions_template: ["ดินเหนียวแน่นทึบจะทำให้เหง้าข่าแคระแกร็นและขุดยาก", "ต้องการดินระบายน้ำดี"],
    ideal_moisture_min: 50, ideal_moisture_max: 72, max_slope: 7.0,
    ideal_elevation_min: 20, ideal_elevation_max: 600,
    ideal_rainfall_min: 1100, ideal_rainfall_max: 1800, ideal_ndvi_min: 0.5, soil_depth_min_cm: 50,
    ldd_criteria: {
      slope_deg: { s1: [0.5, 3.0], s2: [3.0, 5.5], s3: [5.5, 8.5] },
      soil_ph: { s1: [5.5, 6.8], s2: [5.0, 7.3], s3: [4.5, 7.8] },
      soil_moisture: { s1: [50, 70], s2: [40, 50], s3: [70, 78] },
      annual_rainfall: { s1: [1100, 1600], s2: [900, 1100], s3: [750, 900] }
    },
    suitable_soil_groups_s1: [29, 33, 48], suitable_soil_groups_s2: [35, 44], forbidden_soil_groups: [1, 2, 98, 99],
    favored_regions: ["all"]
  },
  {
    id: "crop-turmeric",
    name: "ขมิ้นชัน",
    category: "พืชผัก / สมุนไพร",
    icon_emoji: "🟡",
    image_url: "/crops/turmeric.jpg",
    growth_duration: "9-10 เดือน",
    water_requirement: "ปานกลาง",
    water_level: 2,
    estimated_yield: "2.5-3.5 ตัน/ไร่",
    ideal_temperature_range: "24 - 32 °C",
    best_season: "ต้นฤดูฝน (พ.ค. - มิ.ย.)",
    soil_preference: "ดินร่วน ดินร่วนปนทรายสีแดง อินทรียวัตถุสูง (กลุ่มชุดดินที่ 38, 48)",
    description: "สมุนไพรสารเคอร์คูมินอยด์สูง เป็นที่ต้องการของอุตสาหกรรมยา อาหารเสริม และเครื่องสำอาง",
    source_citation: "องค์การเภสัชกรรม & กรมพัฒนาที่ดิน (LDD)",
    pros_template: ["สารเคอร์คูมินสูง ตลาดสกัดสารสำคัญรับซื้อราคาดี", "เก็บรักษาเหง้าแห้งได้นาน"],
    cautions_template: ["ไม่ชอบน้ำขัง หัวจะเน่าเสียหาย", "ต้องขุดเก็บเกี่ยวเมื่อต้นยุบแห้งสนิทเพื่อสารสำคัญสูงสุด"],
    ideal_moisture_min: 50, ideal_moisture_max: 72, max_slope: 6.0,
    ideal_elevation_min: 20, ideal_elevation_max: 600,
    ideal_rainfall_min: 1200, ideal_rainfall_max: 1900, ideal_ndvi_min: 0.5, soil_depth_min_cm: 50,
    ldd_criteria: {
      slope_deg: { s1: [0.5, 3.0], s2: [3.0, 5.5], s3: [5.5, 8.5] },
      soil_ph: { s1: [5.5, 6.8], s2: [5.0, 7.2], s3: [4.5, 7.6] },
      soil_moisture: { s1: [50, 70], s2: [40, 50], s3: [70, 78] },
      annual_rainfall: { s1: [1200, 1700], s2: [1000, 1200], s3: [850, 1000] }
    },
    suitable_soil_groups_s1: [38, 48], suitable_soil_groups_s2: [29, 35, 44], forbidden_soil_groups: [1, 2, 7, 98, 99],
    favored_regions: ["south", "central", "north"]
  },
  {
    id: "crop-kariyat",
    name: "ฟ้าทะลายโจร",
    category: "พืชผัก / สมุนไพร",
    icon_emoji: "🌿",
    image_url: "/crops/kariyat.jpg",
    growth_duration: "110-120 วัน",
    water_requirement: "ปานกลาง",
    water_level: 2,
    estimated_yield: "1,500-2,000 กก.สด/ไร่",
    ideal_temperature_range: "25 - 33 °C",
    best_season: "ต้นฤดูฝน (มิ.ย. - ก.ค.)",
    soil_preference: "ดินร่วน ระบายน้ำดี pH 6.0 - 7.0 (กลุ่มชุดดินที่ 7, 29, 44)",
    description: "สมุนไพรแชมเปี้ยนแห่งชาติ สารแอนโดรกราโฟไลด์สูง เป็นที่ต้องการของอุตสาหกรรมยา",
    source_citation: "กรมการแพทย์แผนไทยฯ & กรมพัฒนาที่ดิน (LDD)",
    pros_template: ["โรงงานยาสมุนไพรมีสัญญาจ้างปลูกรับซื้อแน่นอน", "ระยะเวลาสั้น 4 เดือน ตัดได้ 2-3 รอบต่อปี"],
    cautions_template: ["ต้องเก็บเกี่ยวในระยะเริ่มออกดอก 50% เพื่อสารสำคัญสูงสุด", "ห้ามใช้สารเคมีฆ่าแมลงอันตราย"],
    ideal_moisture_min: 50, ideal_moisture_max: 72, max_slope: 4.0,
    ideal_elevation_min: 10, ideal_elevation_max: 500,
    ideal_rainfall_min: 1000, ideal_rainfall_max: 1600, ideal_ndvi_min: 0.48, soil_depth_min_cm: 40,
    ldd_criteria: {
      slope_deg: { s1: [0.5, 2.0], s2: [2.0, 4.0], s3: [4.0, 6.0] },
      soil_ph: { s1: [6.0, 7.0], s2: [5.5, 7.5], s3: [5.0, 7.8] },
      soil_moisture: { s1: [48, 68], s2: [38, 48], s3: [68, 75] },
      annual_rainfall: { s1: [1000, 1500], s2: [850, 1000], s3: [700, 850] }
    },
    suitable_soil_groups_s1: [7, 29, 44], suitable_soil_groups_s2: [33, 48], forbidden_soil_groups: [1, 11, 98, 99],
    favored_regions: ["central", "northeast", "north"]
  },
  {
    id: "crop-lemongrass",
    name: "ตะไคร้แกง / ตะไคร้หอม",
    category: "พืชผัก / สมุนไพร",
    icon_emoji: "🌾",
    image_url: "/crops/lemongrass.jpg",
    growth_duration: "6-8 เดือน",
    water_requirement: "ปานกลาง",
    water_level: 2,
    estimated_yield: "2.0-3.0 ตัน/ไร่",
    ideal_temperature_range: "24 - 34 °C",
    best_season: "ต้นฤดูฝน (พ.ค. - มิ.ย.)",
    soil_preference: "ดินร่วน ดินร่วนปนทราย ระบายน้ำดี (กลุ่มชุดดินที่ 7, 29, 33)",
    description: "เครื่องเทศคู่ครัวไทย ปลูกง่าย แตกกอดก ตลาดสดและโรงงานน้ำพริกต้องการทุกวัน",
    source_citation: "คู่มือประเมินดิน LDD & กรมส่งเสริมการเกษตร",
    pros_template: ["ดูแลง่ายมาก แทบไม่มีโรคแมลงรบกวน", "ตลาดรับซื้อสม่ำเสมอตลอดทั้งปี"],
    cautions_template: ["ห้ามมีน้ำท่วมขัง โคนกาบจะเน่า", "ต้องตัดแต่งใบแก่เพื่อกระตุ้นลำต้นอวบใหญ่"],
    ideal_moisture_min: 45, ideal_moisture_max: 70, max_slope: 6.0,
    ideal_elevation_min: 10, ideal_elevation_max: 500,
    ideal_rainfall_min: 1000, ideal_rainfall_max: 1600, ideal_ndvi_min: 0.45, soil_depth_min_cm: 40,
    ldd_criteria: {
      slope_deg: { s1: [0.5, 2.5], s2: [2.5, 5.0], s3: [5.0, 8.0] },
      soil_ph: { s1: [5.5, 7.0], s2: [5.0, 7.5], s3: [4.5, 8.0] },
      soil_moisture: { s1: [48, 68], s2: [38, 48], s3: [68, 76] },
      annual_rainfall: { s1: [1000, 1500], s2: [850, 1000], s3: [700, 850] }
    },
    suitable_soil_groups_s1: [7, 29, 33], suitable_soil_groups_s2: [35, 40], forbidden_soil_groups: [1, 2, 98, 99],
    favored_regions: ["all"]
  },
  {
    id: "crop-shallot",
    name: "หอมแดง / กระเทียม",
    category: "พืชผัก / สมุนไพร",
    icon_emoji: "🧅",
    image_url: "/crops/shallot.jpg",
    growth_duration: "65-75 วัน",
    water_requirement: "ปานกลาง",
    water_level: 2,
    estimated_yield: "2.5-3.5 ตัน/ไร่",
    ideal_temperature_range: "18 - 28 °C",
    best_season: "ฤดูหนาว (พ.ย. - ม.ค.)",
    soil_preference: "ดินร่วน ดินร่วนปนทราย ร่วนซุย อินทรียวัตถุสูง (กลุ่มชุดดินที่ 7, 29, 35)",
    description: "พืชเศรษฐกิจเงินล้านภาคเหนือและอีสาน ปลูกหลังนาหน้าหนาว ผลตอบแทนต่อไร่สูงลิ่ว",
    source_citation: "คู่มือประเมินดิน LDD & กรมวิชาการเกษตร",
    pros_template: ["อายุปลูกสั้นเพียง 70 วัน สร้างรายได้ก้อนโต", "เก็บแขวนผึ่งลมไว้ขายช่วงราคาสูงได้"],
    cautions_template: ["ต้องการอากาศหนาวเย็น หากร้อนหัวจะไม่ลงและเป็นโรคหอมเลื้อย", "ระวังโรคเน่าคอดิน"],
    ideal_moisture_min: 45, ideal_moisture_max: 68, max_slope: 3.0,
    ideal_elevation_min: 100, ideal_elevation_max: 700,
    ideal_rainfall_min: 800, ideal_rainfall_max: 1300, ideal_ndvi_min: 0.45, soil_depth_min_cm: 35,
    ldd_criteria: {
      slope_deg: { s1: [0.5, 1.5], s2: [1.5, 3.0], s3: [3.0, 5.0] },
      soil_ph: { s1: [6.0, 7.0], s2: [5.5, 7.4], s3: [5.0, 7.8] },
      soil_moisture: { s1: [45, 65], s2: [35, 45], s3: [65, 72] },
      annual_rainfall: { s1: [850, 1300], s2: [700, 850], s3: [550, 700] }
    },
    suitable_soil_groups_s1: [7, 29, 35], suitable_soil_groups_s2: [33, 48], forbidden_soil_groups: [1, 2, 11, 98, 99],
    favored_regions: ["north", "northeast"]
  },
  {
    id: "crop-watermelon",
    name: "แตงโม (ตอร์ปิโด / กินรี)",
    category: "พืชผัก / สมุนไพร",
    icon_emoji: "🍉",
    image_url: "/crops/watermelon.jpg",
    growth_duration: "60-65 วัน",
    water_requirement: "ปานกลาง",
    water_level: 2,
    estimated_yield: "3.5-5.0 ตัน/ไร่",
    ideal_temperature_range: "25 - 34 °C",
    best_season: "ฤดูแล้งหลังนา หรือตลอดปี (มีระบบน้ำ)",
    soil_preference: "ดินร่วนทราย ดินทราย ระบายน้ำดีเลิศ (กลุ่มชุดดินที่ 33, 40, 44)",
    description: "พืชเงินด่วนอายุสั้นที่สุดเพียง 60 วัน คืนทุนไว ผลดก หวานกรอบ ตลาดบริโภคสดคลายร้อน",
    source_citation: "คู่มือประเมินดิน LDD & กรมส่งเสริมการเกษตร",
    pros_template: ["อายุสั้นมากเพียง 2 เดือน ได้เงินก้อนหมุนเวียนเร็ว", "ชอบดินทรายและแสงแดดจัด"],
    cautions_template: ["ห้ามมีฝนตกชุกช่วงผลแก่ ผลจะแตกและไส้ล้ม", "ห้ามปลูกซ้ำแปลงเดิมติดกันเกิน 2 รอบ"],
    ideal_moisture_min: 40, ideal_moisture_max: 65, max_slope: 4.0,
    ideal_elevation_min: 10, ideal_elevation_max: 400,
    ideal_rainfall_min: 700, ideal_rainfall_max: 1200, ideal_ndvi_min: 0.42, soil_depth_min_cm: 45,
    ldd_criteria: {
      slope_deg: { s1: [0.5, 2.0], s2: [2.0, 4.0], s3: [4.0, 6.0] },
      soil_ph: { s1: [5.8, 6.8], s2: [5.2, 7.3], s3: [4.8, 7.8] },
      soil_moisture: { s1: [42, 62], s2: [32, 42], s3: [62, 70] },
      annual_rainfall: { s1: [800, 1200], s2: [650, 800], s3: [500, 650] }
    },
    suitable_soil_groups_s1: [33, 40, 44], suitable_soil_groups_s2: [29, 35], forbidden_soil_groups: [1, 2, 7, 11, 98, 99],
    favored_regions: ["northeast", "central", "north"]
  }
];

/**
 * ฟังก์ชันประเมินพืชตามวิธีปัจจัยจำกัดสูงสุดของกรมพัฒนาที่ดิน (LDD Maximum Limitation Method)
 */
export function evaluateCropByLDDMatrix(
  crop: CropRequirement,
  parcel: {
    slopeDegrees: number;
    soilPh: number;
    soilMoisture: number;
    annualRainfallMm: number;
    elevationAmsl: number;
    soilGroupId: number;
    isBuiltUp: boolean;
  }
): {
  fao_class: FAOSuitabilityClass;
  fao_label: string;
  match_percentage: number;
  limiting_factors: string[];
  is_masked_out: boolean;
  mask_reason?: string;
} {
  // 1. ตรวจสอบเงื่อนไขสิ่งปลูกสร้าง / หลังคาคอนกรีต (Hard Mask)
  if (parcel.isBuiltUp || parcel.soilGroupId === 99) {
    return {
      fao_class: "N",
      fao_label: "ไม่แนะนำ (N)",
      match_percentage: 15,
      limiting_factors: ["พื้นที่เป็นสิ่งปลูกสร้าง/หลังคาคอนกรีต ไม่มีหน้าดินสำหรับการเพาะปลูก"],
      is_masked_out: true,
      mask_reason: "พื้นที่เป็นสิ่งปลูกสร้าง/หลังคาคอนกรีต"
    };
  }

  // 2. ตรวจสอบความสูงระดับน้ำทะเลกรณีพืชต้องการที่สูงโดยเฉพาะ (เช่น กาแฟอาราบิก้า)
  if (crop.ideal_elevation_min >= 700 && parcel.elevationAmsl < crop.ideal_elevation_min) {
    return {
      fao_class: "N",
      fao_label: "ไม่แนะนำ (N)",
      match_percentage: 25,
      limiting_factors: [`ระดับความสูง (${parcel.elevationAmsl} ม.) ต่ำกว่าเกณฑ์ที่พืชเมืองหนาว/ที่สูงต้องการ (ขั้นต่ำ ${crop.ideal_elevation_min} ม.)`],
      is_masked_out: true,
      mask_reason: `ระดับความสูงไม่ถึงเกณฑ์พืชที่สูง (${crop.ideal_elevation_min} ม.)`
    };
  }

  const crit = crop.ldd_criteria;
  const limiting_factors: string[] = [];
  const factorGrades: FAOSuitabilityClass[] = [];

  // Helper เช็คช่วง LDD
  const checkRange = (
    val: number,
    range: LDDCriteriaRange,
    factorName: string,
    unit: string,
    optimalText: string
  ): FAOSuitabilityClass => {
    if (val >= range.s1[0] && val <= range.s1[1]) {
      return "S1";
    } else if (val >= range.s2[0] && val <= range.s2[1]) {
      limiting_factors.push(`${factorName} (${val}${unit}) อยู่ในเกณฑ์ปานกลาง S2 (${optimalText} คือ S1)`);
      return "S2";
    } else if (val >= range.s3[0] && val <= range.s3[1]) {
      limiting_factors.push(`${factorName} (${val}${unit}) มีข้อจำกัดระดับ S3 ต้องปรับปรุงแปลง (${optimalText} คือ S1)`);
      return "S3";
    } else {
      limiting_factors.push(`${factorName} (${val}${unit}) อยู่นอกเกณฑ์เพาะปลูก (ระดับ N)`);
      return "N";
    }
  };

  // เช็คทีละปัจจัยตามตาราง LDD
  factorGrades.push(checkRange(parcel.slopeDegrees, crit.slope_deg, "ความลาดชัน", "°", `${crit.slope_deg.s1[0]}-${crit.slope_deg.s1[1]}°`));
  factorGrades.push(checkRange(parcel.soilPh, crit.soil_ph, "ค่า pH ดิน", "", `pH ${crit.soil_ph.s1[0]}-${crit.soil_ph.s1[1]}`));
  factorGrades.push(checkRange(parcel.soilMoisture, crit.soil_moisture, "ความชื้นผิวดิน", "%", `${crit.soil_moisture.s1[0]}-${crit.soil_moisture.s1[1]}%`));
  factorGrades.push(checkRange(parcel.annualRainfallMm, crit.annual_rainfall, "ปริมาณฝนสะสม", " มม.", `${crit.annual_rainfall.s1[0]}-${crit.annual_rainfall.s1[1]} มม.`));

  // เช็คกลุ่มชุดดิน LDD
  if (crop.forbidden_soil_groups.includes(parcel.soilGroupId)) {
    limiting_factors.push(`กลุ่มชุดดินที่ ${parcel.soilGroupId} มีลักษณะทางกายภาพไม่เหมาะสมกับพืชชนิดนี้`);
    factorGrades.push("S3");
  }

  // หลักการ Maximum Limitation Method: เกรดสุดท้าย = เกรดที่จำกัดที่สุด (Worst Case)
  const gradeRank: Record<FAOSuitabilityClass, number> = {
    "N": 0,
    "S3": 1,
    "S2": 2,
    "S1": 3
  };

  let worstGrade: FAOSuitabilityClass = "S1";
  for (const g of factorGrades) {
    if (gradeRank[g] < gradeRank[worstGrade]) {
      worstGrade = g;
    }
  }

  const scoreMap: Record<FAOSuitabilityClass, number> = {
    "S1": 95,
    "S2": 75,
    "S3": 55,
    "N": 25
  };

  const labelMap: Record<FAOSuitabilityClass, string> = {
    "S1": "เหมาะสมมาก (S1)",
    "S2": "เหมาะสมปานกลาง (S2)",
    "S3": "เหมาะสมน้อย (S3)",
    "N": "ไม่แนะนำ (N)"
  };

  return {
    fao_class: worstGrade,
    fao_label: labelMap[worstGrade],
    match_percentage: scoreMap[worstGrade],
    limiting_factors,
    is_masked_out: worstGrade === "N",
    mask_reason: worstGrade === "N" ? limiting_factors[0] : undefined
  };
}
