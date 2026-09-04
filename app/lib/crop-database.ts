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
  category: "พืชไร่ / ธัญพืช" | "ไม้ผลเศรษฐกิจ" | "ไม้ยืนต้น / อุตสาหกรรม";
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
  favored_regions: ("central" | "north" | "northeast" | "south" | "east" | "west" | "all" | string)[];
}

/**
 * รายการตั้งต้นสำหรับสร้างรายการพืช LDD Zoning ทางการ
 */
const RAW_CROP_DATABASE: CropRequirement[] = [
  // ==========================================
  // หมวดที่ 1: พืชไร่และธัญพืชหลัก (5 ชนิด)
  // ==========================================
  {
    id: "jasmine_rice",
    name: "ข้าวหอมมะลิ 105",
    category: "พืชไร่ / ธัญพืช",
    icon_emoji: "🌾",
    image_url: "/images/crops/jasmine_rice.jpg",
    growth_duration: "120 วัน",
    water_requirement: "สูง",
    water_level: 3,
    estimated_yield: "350 - 450 กก./ไร่",
    ideal_temperature_range: "25 - 32 °C",
    best_season: "ฤดูนาปี (พ.ค. - พ.ย.)",
    soil_preference: "ดินร่วนปนทรายหรือดินร่วนเหนียว ที่ราบลุ่ม อุ้มน้ำได้ดี",
    description: "ข้าวคุณภาพสูงส่งออกอันดับ 1 ของไทย ไวต่อช่วงแสง ต้องการที่ราบลุ่มกักเก็บน้ำได้สม่ำเสมอช่วงแตกกอ",
    source_citation: "คู่มือเกณฑ์ความเหมาะสมดิน LDD พืชไร่ (2558) & สถิติ สศก.",
    pros_template: ["มูลค่าผลผลิตและราคาจำหน่ายสูง", "มีตลาดรองรับกว้างขวาง", "สอดคล้องกับวิถีเกษตรกรไทย"],
    cautions_template: ["ต้องการน้ำสม่ำเสมอ ไม่ทนแล้งช่วงออกรวง", "อ่อนแอต่อโรคไหม้หากได้รับปุ๋ยไนโตรเจนมากเกินไป"],
    ideal_moisture_min: 60,
    ideal_moisture_max: 95,
    max_slope: 7.0,
    min_slope: 0,
    ideal_elevation_min: 0,
    ideal_elevation_max: 300,
    ideal_rainfall_min: 1300,
    ideal_rainfall_max: 2000,
    ideal_ndvi_min: 0.35,
    soil_depth_min_cm: 30,
    ldd_criteria: {
      slope_deg: { s1: [0, 1.2], s2: [1.2, 3.0], s3: [3.0, 7.0] },
      soil_ph: { s1: [5.5, 6.5], s2: [5.0, 7.5], s3: [4.5, 8.0] },
      soil_moisture: { s1: [60, 95], s2: [48, 60], s3: [35, 48] },
      annual_rainfall: { s1: [1300, 2000], s2: [1100, 1300], s3: [900, 1100] },
    },
    suitable_soil_groups_s1: [1, 2, 3, 4, 15, 16, 17, 18],
    suitable_soil_groups_s2: [5, 6, 7, 22, 23],
    forbidden_soil_groups: [99, 45, 46, 47],
    favored_regions: ["northeast", "north"],
  },
  {
    id: "lowland_rice",
    name: "ข้าวนาปรัง / ข้าวทั่วไป (กข)",
    category: "พืชไร่ / ธัญพืช",
    icon_emoji: "🌾",
    image_url: "/images/crops/lowland_rice.jpg",
    growth_duration: "100 - 110 วัน",
    water_requirement: "สูง",
    water_level: 3,
    estimated_yield: "700 - 900 กก./ไร่",
    ideal_temperature_range: "25 - 35 °C",
    best_season: "ฤดูนาปรัง (ม.ค. - เม.ย.) / นาปี",
    soil_preference: "ดินเหนียวหรือดินเหนียวปนทราย ที่ราบลุ่มเขตชลประทาน",
    description: "ข้าวไม่ไวต่อช่วงแสง ตอบสนองต่อปุ๋ยดีมาก ให้ผลผลิตต่อไร่สูงในเขตชลประทานที่ราบภาคกลาง",
    source_citation: "คู่มือเกณฑ์ความเหมาะสมดิน LDD & สถิติ สศก.",
    pros_template: ["ผลผลิตต่อไร่สูงมาก", "รอบการปลูกสั้น ปลูกได้ปีละ 2-3 ครั้ง", "ดูแลจัดการง่าย"],
    cautions_template: ["ต้องพึ่งพาระบบชลประทานเป็นหลัก", "ระวังเพลี้ยกระโดดสีน้ำตาล"],
    ideal_moisture_min: 60,
    ideal_moisture_max: 95,
    max_slope: 6.0,
    min_slope: 0,
    ideal_elevation_min: 0,
    ideal_elevation_max: 200,
    ideal_rainfall_min: 1000,
    ideal_rainfall_max: 1800,
    ideal_ndvi_min: 0.35,
    soil_depth_min_cm: 30,
    ldd_criteria: {
      slope_deg: { s1: [0, 1.2], s2: [1.2, 3.0], s3: [3.0, 6.0] },
      soil_ph: { s1: [5.5, 7.0], s2: [5.0, 7.5], s3: [4.5, 8.0] },
      soil_moisture: { s1: [60, 95], s2: [50, 60], s3: [40, 50] },
      annual_rainfall: { s1: [1000, 1800], s2: [800, 1000], s3: [600, 800] },
    },
    suitable_soil_groups_s1: [1, 2, 3, 4, 7, 8, 15],
    suitable_soil_groups_s2: [5, 6, 16, 17, 22],
    forbidden_soil_groups: [99, 45, 46],
    favored_regions: ["central", "lower_north"],
  },
  {
    id: "cassava",
    name: "มันสำปะหลัง (Cassava)",
    category: "พืชไร่ / ธัญพืช",
    icon_emoji: "🥔",
    image_url: "/images/crops/cassava.jpg",
    growth_duration: "8 - 12 เดือน",
    water_requirement: "ต่ำ",
    water_level: 1,
    estimated_yield: "3,500 - 5,500 กก./ไร่",
    ideal_temperature_range: "25 - 35 °C",
    best_season: "ต้นฤดูฝน (เม.ย. - พ.ค.)",
    soil_preference: "ดินร่วนปนทราย ที่ดอน ระบายน้ำดี ไม่ชอบน้ำขัง",
    description: "พืชหัวเศรษฐกิจทนแล้งยอดเยี่ยม ทนทานต่อสภาพแห้งแล้ง ดินทราย ระบายน้ำคล่องตัว ห้ามมีน้ำท่วมขังเด็ดขาด",
    source_citation: "คู่มือประเมินความเหมาะสมพืชไร่ กรมพัฒนาที่ดิน (2558)",
    pros_template: ["ทนแล้งสูงมาก ต้นทุนการดูแลต่ำ", "ตลาดโรงงานแป้งและเอทานอลรองรับแน่นอน", "ปลูกได้ดีในดินร่วนทราย"],
    cautions_template: ["ห้ามมีน้ำท่วมขังเกิน 24 ชม. หัวจะเน่าเสียหาย", "เสี่ยงต่อโรคใบด่างมันสำปะหลัง"],
    ideal_moisture_min: 30,
    ideal_moisture_max: 65,
    max_slope: 8.0,
    ideal_elevation_min: 0,
    ideal_elevation_max: 400,
    ideal_rainfall_min: 1000,
    ideal_rainfall_max: 1500,
    ideal_ndvi_min: 0.25,
    soil_depth_min_cm: 50,
    ldd_criteria: {
      slope_deg: { s1: [0, 4.5], s2: [4.5, 7.0], s3: [7.0, 10.0] },
      soil_ph: { s1: [5.0, 6.5], s2: [4.5, 7.5], s3: [4.0, 8.0] },
      soil_moisture: { s1: [30, 65], s2: [65, 75], s3: [20, 30] },
      annual_rainfall: { s1: [1000, 1500], s2: [800, 1000], s3: [600, 800] },
    },
    suitable_soil_groups_s1: [35, 36, 40, 41, 44, 48],
    suitable_soil_groups_s2: [29, 31, 33, 47, 52],
    forbidden_soil_groups: [99, 1, 2, 3, 4, 15],
    favored_regions: ["northeast", "central"],
  },
  {
    id: "sugarcane",
    name: "อ้อยโรงงาน (Sugarcane)",
    category: "พืชไร่ / ธัญพืช",
    icon_emoji: "🎋",
    image_url: "/images/crops/sugarcane.jpg",
    growth_duration: "10 - 12 เดือน",
    water_requirement: "ปานกลาง",
    water_level: 2,
    estimated_yield: "11 - 15 ตัน/ไร่",
    ideal_temperature_range: "28 - 35 °C",
    best_season: "ปลายฤดูฝน (ต.ค. - พ.ย.)",
    soil_preference: "ดินร่วนเหนียวหรือดินร่วนปนทราย ที่ดอนน้ำไม่ท่วม",
    description: "พืชอุตสาหกรรมน้ำตาลและพลังงานชีวภาพ เติบโตดีในพื้นที่แดดจัด ดินลึกระบายน้ำดี",
    source_citation: "คู่มือเกณฑ์ความเหมาะสมดิน LDD & สมาคมโรงงานน้ำตาล",
    pros_template: ["มีระบบโควตารับซื้อแน่นอนจากโรงงานน้ำตาล", "ไว้ตอเก็บเกี่ยวได้ 2-3 รอบ", "ทนแล้งได้ดีหลังตั้งตัว"],
    cautions_template: ["ต้องการเครื่องจักรตัดอ้อยหรือแรงงานช่วงเก็บเกี่ยว", "ห้ามเผาอ้อยก่อนตัด"],
    ideal_moisture_min: 40,
    ideal_moisture_max: 72,
    max_slope: 8.0,
    ideal_elevation_min: 0,
    ideal_elevation_max: 350,
    ideal_rainfall_min: 1100,
    ideal_rainfall_max: 1600,
    ideal_ndvi_min: 0.35,
    soil_depth_min_cm: 60,
    ldd_criteria: {
      slope_deg: { s1: [0, 3.5], s2: [3.5, 6.0], s3: [6.0, 9.0] },
      soil_ph: { s1: [5.5, 7.0], s2: [5.0, 7.8], s3: [4.5, 8.2] },
      soil_moisture: { s1: [40, 72], s2: [72, 80], s3: [30, 40] },
      annual_rainfall: { s1: [1100, 1600], s2: [900, 1100], s3: [750, 900] },
    },
    suitable_soil_groups_s1: [28, 29, 31, 33, 35, 36, 40],
    suitable_soil_groups_s2: [25, 41, 48, 52],
    forbidden_soil_groups: [99, 1, 2, 3],
    favored_regions: ["northeast", "central", "north"],
  },
  {
    id: "maize",
    name: "ข้าวโพดเลี้ยงสัตว์ (Field Corn)",
    category: "พืชไร่ / ธัญพืช",
    icon_emoji: "🌽",
    image_url: "/images/crops/maize.jpg",
    growth_duration: "105 - 120 วัน",
    water_requirement: "ปานกลาง",
    water_level: 2,
    estimated_yield: "900 - 1,200 กก./ไร่",
    ideal_temperature_range: "24 - 32 °C",
    best_season: "ฤดูฝน (พ.ค. - ก.ค.) / หลังนา",
    soil_preference: "ดินร่วน ดินร่วนเหนียว ระบายน้ำดี หน้าดินลึก",
    description: "วัตถุดิบหลักอุตสาหกรรมอาหารสัตว์ เติบโตเร็วในดินร่วนที่มีการระบายน้ำดี ความลาดชันไม่เกิน 12%",
    source_citation: "คู่มือความเหมาะสมดิน LDD & กรมวิชาการเกษตร",
    pros_template: ["รอบปลูกสั้น คืนทุนเร็ว", "ความต้องการตลาดอาหารสัตว์สูงมาก", "ปลูกสลับกับพืชอื่นได้ดี"],
    cautions_template: ["ระวังหนอนกระทู้ข้าวโพดลายจุด", "ไม่ทนน้ำขังข้ามคืน รากจะขาดออกซิเจน"],
    ideal_moisture_min: 40,
    ideal_moisture_max: 70,
    max_slope: 12.0,
    ideal_elevation_min: 0,
    ideal_elevation_max: 600,
    ideal_rainfall_min: 950,
    ideal_rainfall_max: 1400,
    ideal_ndvi_min: 0.35,
    soil_depth_min_cm: 50,
    ldd_criteria: {
      slope_deg: { s1: [0, 4.0], s2: [4.0, 7.5], s3: [7.5, 12.0] },
      soil_ph: { s1: [5.8, 7.0], s2: [5.2, 7.5], s3: [4.8, 8.0] },
      soil_moisture: { s1: [40, 70], s2: [70, 78], s3: [30, 40] },
      annual_rainfall: { s1: [950, 1400], s2: [800, 950], s3: [650, 800] },
    },
    suitable_soil_groups_s1: [28, 29, 31, 33, 35, 40],
    suitable_soil_groups_s2: [25, 36, 41, 48],
    forbidden_soil_groups: [99, 1, 2, 3],
    favored_regions: ["north", "northeast", "central"],
  },

  // ==========================================
  // หมวดที่ 2: ไม้ยืนต้นและพืชอุตสาหกรรมหลัก (5 ชนิด)
  // ==========================================
  {
    id: "rubber_tree",
    name: "ยางพารา (Rubber Tree)",
    category: "ไม้ยืนต้น / อุตสาหกรรม",
    icon_emoji: "🌳",
    image_url: "/images/crops/rubber_tree.jpg",
    growth_duration: "กรีดได้ปีที่ 7 (อายุ 25-30 ปี)",
    water_requirement: "สูง",
    water_level: 3,
    estimated_yield: "250 - 350 กก.ยางแห้ง/ไร่/ปี",
    ideal_temperature_range: "25 - 30 °C",
    best_season: "ต้นฤดูฝน (พ.ค. - ก.ย.)",
    soil_preference: "ดินลึกมากกว่า 100 ซม. ระบายน้ำดี ดินกรดอ่อน",
    description: "ไม้ยืนต้นเศรษฐกิจสำคัญ ต้องการดินลึก หน้าดินหนา ฝนตกชุกมากกว่า 1,500 มม. ความลาดชันไม่เกิน 15%",
    source_citation: "เกณฑ์การใช้ที่ดินยางพารา การยางแห่งประเทศไทย (กยท.) & LDD",
    pros_template: ["รายได้ประจำจากการกรีดยางต่อเนื่อง", "ไม้ยางเมื่อหมดอายุยังขายเป็นไม้แปรรูปได้", "รากยึดหน้าดินดี"],
    cautions_template: ["ระยะคืนทุนยาวนาน (6-7 ปีกว่าจะได้กรีด)", "ผันผวนตามราคายางพาราโลก"],
    ideal_moisture_min: 55,
    ideal_moisture_max: 80,
    max_slope: 15.0,
    ideal_elevation_min: 0,
    ideal_elevation_max: 500,
    ideal_rainfall_min: 1600,
    ideal_rainfall_max: 2500,
    ideal_ndvi_min: 0.50,
    soil_depth_min_cm: 100,
    ldd_criteria: {
      slope_deg: { s1: [0, 6.0], s2: [6.0, 10.0], s3: [10.0, 15.0] },
      soil_ph: { s1: [4.5, 5.5], s2: [4.0, 6.5], s3: [3.8, 7.0] },
      soil_moisture: { s1: [55, 80], s2: [45, 55], s3: [35, 45] },
      annual_rainfall: { s1: [1600, 2500], s2: [1350, 1600], s3: [1150, 1350] },
    },
    suitable_soil_groups_s1: [29, 31, 33, 40, 48, 52],
    suitable_soil_groups_s2: [25, 35, 36, 44, 47],
    forbidden_soil_groups: [99, 1, 2, 3, 4, 15],
    favored_regions: ["south", "east", "northeast"],
  },
  {
    id: "oil_palm",
    name: "ปาล์มน้ำมัน (Oil Palm)",
    category: "ไม้ยืนต้น / อุตสาหกรรม",
    icon_emoji: "🌴",
    image_url: "/images/crops/oil_palm.jpg",
    growth_duration: "เก็บเกี่ยวปีที่ 3-4 (อายุ 25 ปี)",
    water_requirement: "สูง",
    water_level: 3,
    estimated_yield: "3.0 - 4.5 ตันทะลาย/ไร่/ปี",
    ideal_temperature_range: "26 - 32 °C",
    best_season: "ต้นฤดูฝน (พ.ค. - มิ.ย.)",
    soil_preference: "ดินร่วนเหนียวหรือดินร่วน ดินลึก ชุ่มชื้นสูงตลอดปี",
    description: "พืชพลังงานและน้ำมันพืช ต้องการน้ำฝนสม่ำเสมอมากกว่า 1,800 มม./ปี ดินชุ่มชื้นสูง แดดจัด",
    source_citation: "คู่มือความเหมาะสมที่ดินปาล์มน้ำมัน กรมวิชาการเกษตร & LDD",
    pros_template: ["เก็บเกี่ยวผลผลิตได้ทุก 15 วันตลอดทั้งปี", "เริ่มให้ผลผลิตเร็วในปีที่ 3", "ตลาดน้ำมันพืชและไบโอดีเซลมั่นคง"],
    cautions_template: ["ใช้น้ำปริมาณมหาศาล ไม่เหมาะกับเขตฝนต่ำกว่า 1,400 มม.", "ต้องส่งโรงสกัดภายใน 24-48 ชม."],
    ideal_moisture_min: 65,
    ideal_moisture_max: 88,
    max_slope: 12.0,
    ideal_elevation_min: 0,
    ideal_elevation_max: 300,
    ideal_rainfall_min: 1900,
    ideal_rainfall_max: 3000,
    ideal_ndvi_min: 0.50,
    soil_depth_min_cm: 80,
    ldd_criteria: {
      slope_deg: { s1: [0, 4.5], s2: [4.5, 8.0], s3: [8.0, 12.0] },
      soil_ph: { s1: [4.5, 6.0], s2: [4.0, 6.8], s3: [3.8, 7.2] },
      soil_moisture: { s1: [65, 88], s2: [55, 65], s3: [45, 55] },
      annual_rainfall: { s1: [1900, 3000], s2: [1600, 1900], s3: [1300, 1600] },
    },
    suitable_soil_groups_s1: [6, 7, 24, 28, 29, 31, 33],
    suitable_soil_groups_s2: [25, 40, 48, 52],
    forbidden_soil_groups: [99, 1, 2, 45],
    favored_regions: ["south", "east"],
  },
  {
    id: "robusta_coffee",
    name: "กาแฟโรบัสต้า (Robusta Coffee)",
    category: "ไม้ยืนต้น / อุตสาหกรรม",
    icon_emoji: "☕",
    image_url: "/images/crops/robusta_coffee.jpg",
    growth_duration: "เริ่มเก็บผลปีที่ 3",
    water_requirement: "สูง",
    water_level: 3,
    estimated_yield: "200 - 350 กก.สาร/ไร่",
    ideal_temperature_range: "24 - 30 °C",
    best_season: "ต้นฤดูฝน (มิ.ย. - ก.ค.)",
    soil_preference: "ดินร่วน ดินลึก ระบายน้ำดี ปลูกแซมสวนยาง/ปาล์มได้",
    description: "กาแฟสำหรับกาแฟสำเร็จรูปและเอสเปรสโซ่ เติบโตได้ดีในระดับความสูงต่ำถึงปานกลาง ฝนตกชุก ภาคใต้",
    source_citation: "คู่มือการปลูกกาแฟโรบัสต้า กรมวิชาการเกษตร & LDD",
    pros_template: ["ปลูกร่วมกับไม้ยืนต้นอื่นได้", "ทนต่อโรคราสนิมได้ดีกว่าอาราบิก้า", "ตลาดรับซื้อกว้างขวาง"],
    cautions_template: ["ต้องการความชื้นสม่ำเสมอช่วงติดผล", "ต้องตากและสีกะลาอย่างมีมาตรฐาน"],
    ideal_moisture_min: 55,
    ideal_moisture_max: 78,
    max_slope: 14.0,
    ideal_elevation_min: 0,
    ideal_elevation_max: 600,
    ideal_rainfall_min: 1600,
    ideal_rainfall_max: 2400,
    ideal_ndvi_min: 0.45,
    soil_depth_min_cm: 80,
    ldd_criteria: {
      slope_deg: { s1: [0, 6.0], s2: [6.0, 10.0], s3: [10.0, 14.0] },
      soil_ph: { s1: [5.0, 6.5], s2: [4.5, 7.0], s3: [4.0, 7.5] },
      soil_moisture: { s1: [55, 78], s2: [45, 55], s3: [78, 85] },
      annual_rainfall: { s1: [1600, 2400], s2: [1350, 1600], s3: [1150, 1350] },
    },
    suitable_soil_groups_s1: [29, 31, 33, 40, 48],
    suitable_soil_groups_s2: [25, 35, 44, 52],
    forbidden_soil_groups: [99, 1, 2, 3],
    favored_regions: ["south", "east"],
  },
  {
    id: "arabica_coffee",
    name: "กาแฟอาราบิก้า (Arabica Coffee)",
    category: "ไม้ยืนต้น / อุตสาหกรรม",
    icon_emoji: "☕",
    image_url: "/images/crops/arabica_coffee.jpg",
    growth_duration: "เริ่มเก็บผลปีที่ 3-4",
    water_requirement: "ปานกลาง",
    water_level: 2,
    estimated_yield: "150 - 250 กก.สาร/ไร่",
    ideal_temperature_range: "15 - 24 °C",
    best_season: "ต้นฤดูฝน (มิ.ย. - ส.ค.)",
    soil_preference: "ดินภูเขาโปร่ง ฮิวมัสสูง ดินระบายน้ำดีเลิศ",
    description: "กาแฟพรีเมียมเฉพาะถิ่น ต้องการสภาพอากาศหนาวเย็นบนภูเขาสูงกว่า 800 เมตรจากระดับน้ำทะเลขึ้นไป",
    source_citation: "คู่มือกาแฟอาราบิก้าที่สูง โครงการหลวง & LDD",
    pros_template: ["ราคาจำหน่ายต่อกิโลกรัมสูงมาก (Specialty Coffee)", "ส่งเสริมการอนุรักษ์ป่าต้นน้ำ", "มีความต้องการในตลาดคาเฟ่สูง"],
    cautions_template: ["ปลูกได้เฉพาะพื้นที่ภูเขาสูง (> 800 ม.) เท่านั้น", "อ่อนแอต่อโรคราสนิมใบกาแฟหากอากาศร้อน"],
    ideal_moisture_min: 50,
    ideal_moisture_max: 75,
    max_slope: 18.0,
    ideal_elevation_min: 800,
    ideal_elevation_max: 1600,
    ideal_rainfall_min: 1400,
    ideal_rainfall_max: 2000,
    ideal_ndvi_min: 0.50,
    soil_depth_min_cm: 80,
    ldd_criteria: {
      slope_deg: { s1: [0, 7.0], s2: [7.0, 12.0], s3: [12.0, 18.0] },
      soil_ph: { s1: [5.5, 6.5], s2: [5.0, 7.0], s3: [4.5, 7.5] },
      soil_moisture: { s1: [50, 75], s2: [40, 50], s3: [75, 82] },
      annual_rainfall: { s1: [1400, 2000], s2: [1200, 1400], s3: [1000, 1200] },
    },
    suitable_soil_groups_s1: [48, 52, 55, 59],
    suitable_soil_groups_s2: [29, 31, 40],
    forbidden_soil_groups: [99, 1, 2, 3, 15],
    favored_regions: ["north"],
  },
  {
    id: "coconut",
    name: "มะพร้าว (Coconut)",
    category: "ไม้ยืนต้น / อุตสาหกรรม",
    icon_emoji: "🥥",
    image_url: "/images/crops/coconut.jpg",
    growth_duration: "เริ่มให้ผลปีที่ 4-5 (อายุยาว 50 ปี)",
    water_requirement: "ปานกลาง",
    water_level: 2,
    estimated_yield: "1,200 - 1,800 ผล/ไร่/ปี",
    ideal_temperature_range: "25 - 32 °C",
    best_season: "ต้นฤดูฝน (พ.ค. - ก.ค.)",
    soil_preference: "ดินร่วนปนทรายหรือดินตะกอนชายฝั่ง ระบายน้ำดี ทนเค็มอ่อน",
    description: "พืชเศรษฐกิจสำคัญ ทั้งเพื่อการบริโภคสด กะทิ และน้ำมันสกัดเย็น ทนลมและปรับตัวกับดินทรายชายฝั่งได้ดีเยี่ยม",
    source_citation: "คู่มือเกณฑ์ความเหมาะสมดิน LDD & กรมวิชาการเกษตร",
    pros_template: ["อายุยืนยาว เก็บผลผลิตได้ทุกเดือน", "ทนทานต่อสภาพลมแรงและดินเค็มชายฝั่ง", "ใช้งานได้ทุกส่วนของต้น"],
    cautions_template: ["ระวังหนอนหัวดำและด้วงแรดมะพร้าว", "ต้องมีระบบจัดการผลผลิตไม่ให้หล่นเสียหาย"],
    ideal_moisture_min: 50,
    ideal_moisture_max: 78,
    max_slope: 9.0,
    ideal_elevation_min: 0,
    ideal_elevation_max: 200,
    ideal_rainfall_min: 1400,
    ideal_rainfall_max: 2200,
    ideal_ndvi_min: 0.40,
    soil_depth_min_cm: 80,
    ldd_criteria: {
      slope_deg: { s1: [0, 3.5], s2: [3.5, 6.0], s3: [6.0, 9.0] },
      soil_ph: { s1: [5.5, 7.2], s2: [5.0, 7.8], s3: [4.5, 8.2] },
      soil_moisture: { s1: [50, 78], s2: [40, 50], s3: [78, 86] },
      annual_rainfall: { s1: [1400, 2200], s2: [1150, 1400], s3: [950, 1150] },
    },
    suitable_soil_groups_s1: [7, 24, 28, 29, 31, 35],
    suitable_soil_groups_s2: [25, 36, 40, 48],
    forbidden_soil_groups: [99, 1, 2],
    favored_regions: ["south", "central", "east"],
  },

  // ==========================================
  // หมวดที่ 3: ไม้ผลเศรษฐกิจส่งออกหลัก (5 ชนิด)
  // ==========================================
  {
    id: "durian",
    name: "ทุเรียนหมอนทอง (Durian)",
    category: "ไม้ผลเศรษฐกิจ",
    icon_emoji: "🛕",
    image_url: "/images/crops/durian.jpg",
    growth_duration: "ให้ผลผลิตปีที่ 5 เป็นต้นไป",
    water_requirement: "สูง",
    water_level: 3,
    estimated_yield: "1.5 - 2.5 ตัน/ไร่",
    ideal_temperature_range: "25 - 32 °C",
    best_season: "เก็บเกี่ยว เม.ย. - ส.ค.",
    soil_preference: "ดินร่วนปนทรายหรือดินร่วน ระบายน้ำดีเลิศ ห้ามน้ำขังเด็ดขาด",
    description: "ราชาแห่งผลไม้มูลค่าส่งออกสูงสุดของไทย อ่อนไหวต่อน้ำขัง ต้องการดินระบายน้ำดีเลิศ แหล่งน้ำสะอาดสม่ำเสมอ",
    source_citation: "คู่มือประเมินความเหมาะสมทุเรียน กรมพัฒนาที่ดิน (2558) & กรมส่งเสริมการเกษตร",
    pros_template: ["ผลตอบแทนต่อไร่สูงที่สุดในบรรดาไม้ผล", "ตลาดส่งออกประเทศจีนมีความต้องการสูงต่อเนื่อง", "มูลค่าแปลงที่ดินเพิ่มสูง"],
    cautions_template: ["ห้ามน้ำท่วมขังเด็ดขาด รากจะเน่าจากเชื้อไฟทอปธอราอย่างรวดเร็ว", "ต้นทุนการดูแลและการจัดการดอกสูง"],
    ideal_moisture_min: 55,
    ideal_moisture_max: 75,
    max_slope: 8.0,
    min_slope: 0.5,
    ideal_elevation_min: 0,
    ideal_elevation_max: 400,
    ideal_rainfall_min: 1600,
    ideal_rainfall_max: 2400,
    ideal_ndvi_min: 0.45,
    soil_depth_min_cm: 80,
    ldd_criteria: {
      slope_deg: { s1: [0, 4.5], s2: [4.5, 7.5], s3: [7.5, 11.0] },
      soil_ph: { s1: [5.5, 6.5], s2: [5.0, 7.0], s3: [4.5, 7.5] },
      soil_moisture: { s1: [55, 75], s2: [48, 55], s3: [75, 82] },
      annual_rainfall: { s1: [1600, 2400], s2: [1350, 1600], s3: [1150, 1350] },
    },
    suitable_soil_groups_s1: [29, 31, 33, 40, 48],
    suitable_soil_groups_s2: [25, 35, 44, 52],
    forbidden_soil_groups: [99, 1, 2, 3, 4, 15],
    favored_regions: ["east", "south", "northeast"],
  },
  {
    id: "mangosteen",
    name: "มังคุด (Mangosteen)",
    category: "ไม้ผลเศรษฐกิจ",
    icon_emoji: "🫐",
    image_url: "/images/crops/mangosteen.jpg",
    growth_duration: "ให้ผลผลิตปีที่ 6-7",
    water_requirement: "สูง",
    water_level: 3,
    estimated_yield: "1.2 - 1.8 ตัน/ไร่",
    ideal_temperature_range: "25 - 32 °C",
    best_season: "เก็บเกี่ยว พ.ค. - ส.ค.",
    soil_preference: "ดินร่วนเหนียวหรือดินร่วน ดินลึก ฮิวมัสสูง ชุ่มชื้นสูง",
    description: "ราชินีแห่งผลไม้ นิยมปลูกร่วมกับทุเรียน ต้องการความชื้นในบรรยากาศและดินสูง ฝนตกชุก",
    source_citation: "คู่มือความเหมาะสมไม้ผล LDD & สำนักวิจัยและพัฒนาการเกษตร",
    pros_template: ["ปลูกร่วมเป็นสวนผลไม้ผสมผสานได้ดี", "โรคแมลงรบกวนน้อยกว่าทุเรียน", "ผลตอบแทนมั่นคง"],
    cautions_template: ["เจริญเติบโตช้าในระยะ 3 ปีแรก", "ระวังปัญหาเนื้อแก้วยางไหลหากฝนตกชุกช่วงเก็บเกี่ยว"],
    ideal_moisture_min: 60,
    ideal_moisture_max: 80,
    max_slope: 11.0,
    ideal_elevation_min: 0,
    ideal_elevation_max: 450,
    ideal_rainfall_min: 1700,
    ideal_rainfall_max: 2600,
    ideal_ndvi_min: 0.50,
    soil_depth_min_cm: 80,
    ldd_criteria: {
      slope_deg: { s1: [0, 4.5], s2: [4.5, 7.5], s3: [7.5, 11.0] },
      soil_ph: { s1: [5.5, 6.5], s2: [5.0, 7.0], s3: [4.5, 7.5] },
      soil_moisture: { s1: [60, 80], s2: [50, 60], s3: [80, 86] },
      annual_rainfall: { s1: [1700, 2600], s2: [1400, 1700], s3: [1200, 1400] },
    },
    suitable_soil_groups_s1: [29, 31, 33, 40],
    suitable_soil_groups_s2: [25, 48, 52],
    forbidden_soil_groups: [99, 1, 2, 3],
    favored_regions: ["east", "south"],
  },
  {
    id: "longan",
    name: "ลำไย (Longan)",
    category: "ไม้ผลเศรษฐกิจ",
    icon_emoji: "🍈",
    image_url: "/images/crops/longan.jpg",
    growth_duration: "ให้ผลผลิตปีที่ 4",
    water_requirement: "ปานกลาง",
    water_level: 2,
    estimated_yield: "1.0 - 1.5 ตัน/ไร่",
    ideal_temperature_range: "20 - 30 °C",
    best_season: "เก็บเกี่ยว ก.ค. - ส.ค. (และนอกฤดู)",
    soil_preference: "ดินร่วน ดินร่วนปนทราย หน้าดินลึก ระบายน้ำดี",
    description: "ไม้ผลเศรษฐกิจหลักภาคเหนือ ต้องการช่วงอากาศแห้งและหนาวสั้นๆ เพื่อกระตุ้นการออกดอก",
    source_citation: "คู่มือความเหมาะสมที่ดินลำไย LDD & กรมวิชาการเกษตร",
    pros_template: ["สามารถใช้สารโพแทสเซียมคลอเรตชักนำให้ออกดอกนอกฤดูได้", "ตลาดแปรรูปอบแห้งและบริโภคสดกว้างขวาง", "ทนแล้งได้ดีหลังติดผล"],
    cautions_template: ["ระวังผันผวนของราคาผลผลิตในฤดู", "ต้องตัดแต่งช่อผลเพื่อให้ได้เกรดทองคุณภาพส่งออก"],
    ideal_moisture_min: 45,
    ideal_moisture_max: 70,
    max_slope: 8.0,
    ideal_elevation_min: 0,
    ideal_elevation_max: 550,
    ideal_rainfall_min: 1100,
    ideal_rainfall_max: 1600,
    ideal_ndvi_min: 0.40,
    soil_depth_min_cm: 70,
    ldd_criteria: {
      slope_deg: { s1: [0, 4.5], s2: [4.5, 7.5], s3: [7.5, 11.0] },
      soil_ph: { s1: [5.5, 6.8], s2: [5.0, 7.2], s3: [4.5, 7.8] },
      soil_moisture: { s1: [45, 70], s2: [35, 45], s3: [70, 78] },
      annual_rainfall: { s1: [1100, 1600], s2: [900, 1100], s3: [750, 900] },
    },
    suitable_soil_groups_s1: [28, 29, 31, 33, 40],
    suitable_soil_groups_s2: [25, 35, 48],
    forbidden_soil_groups: [99, 1, 2, 3],
    favored_regions: ["north"],
  },
  {
    id: "mango",
    name: "มะม่วงน้ำดอกไม้ (Mango)",
    category: "ไม้ผลเศรษฐกิจ",
    icon_emoji: "🥭",
    image_url: "/images/crops/mango.jpg",
    growth_duration: "ให้ผลผลิตปีที่ 3-4",
    water_requirement: "ต่ำ",
    water_level: 1,
    estimated_yield: "1.0 - 1.8 ตัน/ไร่",
    ideal_temperature_range: "24 - 32 °C",
    best_season: "เก็บเกี่ยว มี.ค. - พ.ค.",
    soil_preference: "ดินร่วนปนทราย ที่ดอน ระบายน้ำดี ไม่ชอบดินเหนียวแฉะ",
    description: "ผลไม้ส่งออกยอดนิยม ปรับตัวเก่ง ทนแล้งได้ดีมาก ต้องการช่วงแห้งแล้งสั้นๆ เพื่อแทงช่อดอก",
    source_citation: "คู่มือความเหมาะสมที่ดินมะม่วง กรมพัฒนาที่ดิน (2558)",
    pros_template: ["ทนแล้งยอดเยี่ยม จัดการง่าย", "ตลาดส่งออกเอเชียและยุโรปมีความต้องการสูง", "ปลูกได้ทั่วทุกภาคของไทย"],
    cautions_template: ["ระวังเพลี้ยไฟและโรคแอนแทรคโนสช่วงออกดอกติดผล", "ห้ามมีฝนตกชุกช่วงดอกบาน"],
    ideal_moisture_min: 38,
    ideal_moisture_max: 68,
    max_slope: 8.0,
    ideal_elevation_min: 0,
    ideal_elevation_max: 450,
    ideal_rainfall_min: 1000,
    ideal_rainfall_max: 1500,
    ideal_ndvi_min: 0.38,
    soil_depth_min_cm: 80,
    ldd_criteria: {
      slope_deg: { s1: [0, 4.5], s2: [4.5, 7.5], s3: [7.5, 11.0] },
      soil_ph: { s1: [5.5, 7.0], s2: [5.0, 7.5], s3: [4.5, 8.0] },
      soil_moisture: { s1: [38, 68], s2: [68, 78], s3: [25, 38] },
      annual_rainfall: { s1: [1000, 1500], s2: [800, 1000], s3: [650, 800] },
    },
    suitable_soil_groups_s1: [28, 29, 31, 33, 35, 40],
    suitable_soil_groups_s2: [25, 36, 48, 52],
    forbidden_soil_groups: [99, 1, 2, 3],
    favored_regions: ["central", "north", "northeast"],
  },
  {
    id: "pineapple",
    name: "สับปะรดโรงงาน (Pineapple)",
    category: "ไม้ผลเศรษฐกิจ",
    icon_emoji: "🍍",
    image_url: "/images/crops/pineapple.jpg",
    growth_duration: "14 - 16 เดือน",
    water_requirement: "ต่ำ",
    water_level: 1,
    estimated_yield: "4.0 - 6.0 ตัน/ไร่",
    ideal_temperature_range: "24 - 32 °C",
    best_season: "เก็บเกี่ยว พ.ย. - ม.ค. และ เม.ย. - มิ.ย.",
    soil_preference: "ดินร่วนปนทราย ดินกรด (pH 4.5-5.5) ระบายน้ำดี ที่ดอน",
    description: "พืชเศรษฐกิจทนแล้งส่งออกสำคัญ ชอบดินกรดอ่อน ดินทราย ระบายน้ำดี ไม่ชอบน้ำขัง นิยมปลูกในเขตเพชรบุรี ประจวบฯ และระยอง",
    source_citation: "คู่มือความเหมาะสมดินสับปะรด LDD & สศก.",
    pros_template: ["ทนแล้งสูงมาก ปลูกได้ในดินทรายกรดจัดที่พืชอื่นไม่ขึ้น", "อุตสาหกรรมแปรรูปสับปะรดกระป๋องไทยเป็นอันดับ 1 ของโลก", "ดูแลรักษาง่าย"],
    cautions_template: ["ไม่ทนน้ำท่วมขังแม้เพียงระยะสั้น โคนจะเน่าทันที", "ราคาผันผวนตามรอบผลผลิต"],
    ideal_moisture_min: 35,
    ideal_moisture_max: 65,
    max_slope: 12.0,
    ideal_elevation_min: 0,
    ideal_elevation_max: 350,
    ideal_rainfall_min: 1050,
    ideal_rainfall_max: 1550,
    ideal_ndvi_min: 0.30,
    soil_depth_min_cm: 40,
    ldd_criteria: {
      slope_deg: { s1: [0, 4.5], s2: [4.5, 8.0], s3: [8.0, 12.0] },
      soil_ph: { s1: [4.5, 5.5], s2: [4.0, 6.2], s3: [3.8, 6.8] },
      soil_moisture: { s1: [35, 65], s2: [65, 75], s3: [25, 35] },
      annual_rainfall: { s1: [1050, 1550], s2: [850, 1050], s3: [700, 850] },
    },
    suitable_soil_groups_s1: [35, 36, 40, 41, 44],
    suitable_soil_groups_s2: [29, 31, 33, 47, 48],
    forbidden_soil_groups: [99, 1, 2, 3, 4, 15],
    favored_regions: ["central", "east", "south"],
  },
];

// The downloadable LDD Zoning dataset contains these exact 13 crop groups.
// Rice is one LDD layer, so the former two rice varieties are intentionally
// represented as a single "rice" result. Mango has no corresponding layer.
const riceReference = RAW_CROP_DATABASE.find((crop) => crop.id === "jasmine_rice");
if (!riceReference) {
  throw new Error("ไม่พบข้อมูลตั้งต้นสำหรับพืชข้าว")
}

export const CROP_DATABASE: CropRequirement[] = [
  {
    ...riceReference,
    id: "rice",
    name: "ข้าว (Rice)",
    image_url: "/images/crops/jasmine_rice.jpg",
    description: "ผลประเมินใช้ชั้นข้อมูลเขตความเหมาะสมของที่ดินสำหรับข้าวจากกรมพัฒนาที่ดิน (LDD Zoning)",
    source_citation: "เขตความเหมาะสมของที่ดินสำหรับการปลูกข้าว กรมพัฒนาที่ดิน (LDD Zoning)",
  },
  ...RAW_CROP_DATABASE.filter(
    (crop) => !["jasmine_rice", "lowland_rice", "mango"].includes(crop.id)
  ),
];

export interface CropEvaluationParams {
  slopeDegrees: number;
  soilPh: number;
  soilMoisture: number;
  annualRainfallMm: number;
  elevationAmsl?: number;
  soilGroupId?: number;
  isBuiltUp?: boolean;
  isWaterBody?: boolean;
}

/**
 * คำนวณระดับความเหมาะสมของพืชด้วยวิธีปัจจัยจำกัดสูงสุด (Maximum Limitation Method)
 * ตามมาตรฐานสากล FAO (1983) และคู่มือกรมพัฒนาที่ดิน (LDD)
 */
export function evaluateCropByLDDMatrix(
  crop: CropRequirement,
  params: CropEvaluationParams
): {
  fao_class: FAOSuitabilityClass;
  fao_label: string;
  match_percentage: number;
  limiting_factors: string[];
  is_masked_out: boolean;
  mask_reason?: string;
} {
  const limitingFactors: string[] = [];
  const isBuiltUp = params.isBuiltUp ?? false;
  const isWaterBody = params.isWaterBody ?? params.soilGroupId === 98;

  if (isWaterBody) {
    const reason = "พื้นที่เป็นแหล่งน้ำหรือพื้นที่ชุ่มน้ำถาวร ไม่มีหน้าดินสำหรับการเพาะปลูกพืชบก";
    return {
      fao_class: "N",
      fao_label: "ไม่แนะนำ (N)",
      match_percentage: 0,
      limiting_factors: [reason],
      is_masked_out: true,
      mask_reason: reason,
    };
  }

  if (isBuiltUp) {
    return {
      fao_class: "N",
      fao_label: "ไม่แนะนำ (N)",
      match_percentage: 15,
      limiting_factors: ["พื้นที่เป็นสิ่งปลูกสร้าง/หลังคาคอนกรีต ไม่มีหน้าดินสำหรับการเพาะปลูกลงดิน"],
      is_masked_out: true,
      mask_reason: "พื้นที่เป็นสิ่งปลูกสร้าง/หลังคาคอนกรีต ไม่มีหน้าดินสำหรับการเพาะปลูกลงดิน",
    };
  }

  // Check highland crop requirement (เฉพาะกาแฟอาราบิก้าที่ต้องปลูกบนภูเขาสูงกว่า 800 เมตร ตามหลักวิชาการ)
  if (crop.id === "arabica_coffee" && crop.ideal_elevation_min && params.elevationAmsl && params.elevationAmsl < crop.ideal_elevation_min) {
    const reason = `ระดับความสูง (${params.elevationAmsl} ม.) ต่ำกว่าเกณฑ์พืชที่สูงสำหรับกาแฟอาราบิก้า (${crop.ideal_elevation_min} ม.รทก.)`;
    return {
      fao_class: "N",
      fao_label: "ไม่แนะนำ (N)",
      match_percentage: 20,
      limiting_factors: [reason],
      is_masked_out: true,
      mask_reason: reason,
    };
  }

  const crit = crop.ldd_criteria;
  const gradeRanks: Record<FAOSuitabilityClass, number> = {
    S1: 4,
    S2: 3,
    S3: 2,
    N: 1,
  };

  const evaluateRange = (
    val: number,
    range: { s1: [number, number]; s2: [number, number]; s3: [number, number] },
    paramName: string,
    unit: string
  ): { grade: FAOSuitabilityClass; reason?: string } => {
    if (val >= range.s1[0] && val <= range.s1[1]) {
      return { grade: "S1" };
    }
    if (val >= range.s2[0] && val <= range.s2[1]) {
      return {
        grade: "S2",
        reason: `${paramName} (${val}${unit}) อยู่ในเกณฑ์ปานกลาง S2 (เกณฑ์ S1 คือ ${range.s1[0]}-${range.s1[1]}${unit})`,
      };
    }
    if (val >= range.s3[0] && val <= range.s3[1]) {
      return {
        grade: "S3",
        reason: `${paramName} (${val}${unit}) มีข้อจำกัดระดับ S3 (เกณฑ์ S1 คือ ${range.s1[0]}-${range.s1[1]}${unit})`,
      };
    }
    return {
      grade: "N",
      reason: `${paramName} (${val}${unit}) ไม่อยู่ในเกณฑ์ที่เหมาะสม N (เกณฑ์ S1 คือ ${range.s1[0]}-${range.s1[1]}${unit})`,
    };
  };

  const gSlope = evaluateRange(params.slopeDegrees, crit.slope_deg, "ความลาดชัน", "°");
  const gPh = evaluateRange(params.soilPh, crit.soil_ph, "ความเป็นกรด-ด่างดิน (pH)", "");
  const gMoist = evaluateRange(params.soilMoisture, crit.soil_moisture, "ความชื้นผิวดินเรดาร์", "%");
  const gRain = evaluateRange(params.annualRainfallMm, crit.annual_rainfall, "ปริมาณน้ำฝนสะสม", " มม.");

  const factorResults = [gSlope, gPh, gMoist, gRain];

  for (const res of factorResults) {
    if (res.reason) {
      limitingFactors.push(res.reason);
    }
  }

  // Maximum Limitation Rule: The lowest grade determines the final class
  let worstGrade: FAOSuitabilityClass = "S1";
  for (const res of factorResults) {
    if (gradeRanks[res.grade] < gradeRanks[worstGrade]) {
      worstGrade = res.grade;
    }
  }

  const labelMap: Record<FAOSuitabilityClass, string> = {
    S1: "เหมาะสมมาก (S1)",
    S2: "เหมาะสมปานกลาง (S2)",
    S3: "เหมาะสมน้อย (S3)",
    N: "ไม่แนะนำ (N)",
  };

  const scoreMap: Record<FAOSuitabilityClass, number> = {
    S1: 95,
    S2: 78,
    S3: 58,
    N: 20,
  };

  return {
    fao_class: worstGrade,
    fao_label: labelMap[worstGrade],
    match_percentage: scoreMap[worstGrade],
    limiting_factors: limitingFactors,
    is_masked_out: worstGrade === "N",
    mask_reason: worstGrade === "N" && limitingFactors.length > 0 ? limitingFactors[0] : undefined,
  };
}
