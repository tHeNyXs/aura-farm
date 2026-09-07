"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Navbar from "@/app/components/ui/navbar";
import Footer from "@/app/components/ui/footer";

/* ─── Bidirectional Scroll Reveal Hook (Triggers both down & up) ─── */
const ROOT_MARGIN = "0px 0px -40px 0px";

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Bidirectional: updates state when entering AND exiting viewport
        setIsInView(entry.isIntersecting);
      },
      { threshold, rootMargin: ROOT_MARGIN }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isInView };
}

/* ─── Data: 13 Economic Crops with Real High-Res Photography ─── */
const economicCrops = [
  {
    name: "ข้าวหอมมะลิ",
    eng: "Jasmine Rice 105",
    category: "พืชไร่",
    image: "/images/crops/jasmine_rice.jpg",
    soil: "ดินร่วนเหนียวปนทราย pH 5.5-7.0",
    water: "สูง (1,200+ มม./ปี)",
    bestSeason: "พ.ค. - พ.ย.",
  },
  {
    name: "มันสำปะหลัง",
    eng: "Cassava / Tapioca",
    category: "พืชไร่",
    image: "/images/crops/cassava.jpg",
    soil: "ดินร่วนปนทราย ระบายน้ำดี ไม่ท่วมขัง",
    water: "ทนแล้งได้ดีเยี่ยม (800-1,200 มม.)",
    bestSeason: "มี.ค. - พ.ค.",
  },
  {
    name: "ข้าวโพดเลี้ยงสัตว์",
    eng: "Maize / Field Corn",
    category: "พืชไร่",
    image: "/images/crops/corn.jpg",
    soil: "ดินร่วนลึก หน้าดินโปร่ง pH 5.8-6.8",
    water: "ปานกลาง (600-800 มม.)",
    bestSeason: "พ.ค. - ก.ค. / พ.ย.",
  },
  {
    name: "อ้อยโรงงาน",
    eng: "Sugarcane",
    category: "พืชไร่",
    image: "/images/crops/sugarcane.jpg",
    soil: "ดินร่วนถึงดินเหนียว อุ้มน้ำปานกลาง",
    water: "ปานกลาง-สูง (1,200-1,500 มม.)",
    bestSeason: "ต.ค. - ธ.ค.",
  },
  {
    name: "ทุเรียน",
    eng: "Durian (King of Fruits)",
    category: "ไม้ผลเศรษฐกิจ",
    image: "/images/crops/durian.jpg",
    soil: "ดินร่วนระบายน้ำดีเยี่ยม ลาดชัน 2-7° ห้ามน้ำขัง",
    water: "สม่ำเสมอทั้งปี (1,500+ มม.)",
    bestSeason: "ปลูกต้นฤดูฝน (มิ.ย.)",
  },
  {
    name: "ลำไย",
    eng: "Longan",
    category: "ไม้ผลเศรษฐกิจ",
    image: "/images/crops/longan.jpg",
    soil: "ดินร่วนปนทราย หน้าดินลึก ระบายน้ำคล่อง",
    water: "ปานกลาง ต้องการอากาศเย็นชักนำดอก",
    bestSeason: "พ.ค. - มิ.ย.",
  },
  {
    name: "มังคุด",
    eng: "Mangosteen (Queen of Fruits)",
    category: "ไม้ผลเศรษฐกิจ",
    image: "/images/crops/mangosteen.jpg",
    soil: "ดินร่วนอุดมสมบูรณ์ อินทรียวัตถุสูง ดินชื้น",
    water: "ชุ่มชื้นสูงตลอดปี (1,800+ มม.)",
    bestSeason: "พ.ค. - ส.ค.",
  },
  {
    name: "สับปะรด",
    eng: "Pineapple",
    category: "ไม้ผลเศรษฐกิจ",
    image: "/images/crops/pineapple.jpg",
    soil: "ดินร่วนปนทราย กรดอ่อน pH 4.5-5.5",
    water: "ทนแล้งปานกลาง (1,000-1,400 มม.)",
    bestSeason: "ตลอดทั้งปี",
  },
  {
    name: "กล้วยหอมทอง",
    eng: "Cavendish Banana",
    category: "ไม้ผลเศรษฐกิจ",
    image: "/images/crops/banana.jpg",
    soil: "ดินร่วนซุย ลึก โปร่ง ธาตุอาหารสูง",
    water: "สูงและสม่ำเสมอ ขาดน้ำไม่ได้",
    bestSeason: "ต้นฤดูฝน (พ.ค. - มิ.ย.)",
  },
  {
    name: "ยางพารา",
    eng: "Para Rubber Tree",
    category: "พืชยืนต้น",
    image: "/images/crops/rubber.jpg",
    soil: "หน้าดินลึกกว่า 100 ซม. ลาดชัน < 16°",
    water: "ฝนชุกสม่ำเสมอ (1,500+ มม./ปี)",
    bestSeason: "มิ.ย. - ส.ค.",
  },
  {
    name: "ปาล์มน้ำมัน",
    eng: "Oil Palm",
    category: "พืชยืนต้น",
    image: "/images/crops/oil_palm.jpg",
    soil: "ดินร่วนเหนียว กักเก็บความชื้นได้ดี",
    water: "ฝนชุกตลอดปี (2,000+ มม./ปี)",
    bestSeason: "พ.ค. - ก.ค.",
  },
  {
    name: "กาแฟโรบัสต้า",
    eng: "Robusta Coffee",
    category: "พืชยืนต้น",
    image: "/images/crops/coffee.jpg",
    soil: "ดินร่วนโปร่ง ระบายน้ำดี ความชื้นสัมพัทธ์สูง",
    water: "ต้องการฝน 1,500-2,000 มม./ปี",
    bestSeason: "มิ.ย. - ก.ย.",
  },
  {
    name: "พริกไทย",
    eng: "Black & White Pepper",
    category: "พืชสวนทางเลือก",
    image: "/images/crops/pepper.jpg",
    soil: "ดินร่วนซุย อินทรียวัตถุสูง ห้ามน้ำขังเด็ดขาด",
    water: "สม่ำเสมอ มีเสาค้างและพรางแสง",
    bestSeason: "พ.ค. - มิ.ย.",
  },
];

/* ─── Step Data ─── */
const steps = [
  {
    number: "01",
    title: "วาดขอบเขตแปลงบนดาวเทียม",
    description: "คลิกจุดหรือลากพื้นที่เพื่อกำหนดขอบเขตแปลงเกษตรกรรมของคุณได้อย่างแม่นยำ พร้อมวัดเนื้อที่จริงแบบเรียลไทม์",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "ดึงข้อมูลรีโมทเซนซิงเชิงลึก",
    description: "ระบบเชื่อมโยงดาวเทียมและข้อมูลภูมิสารสนเทศ คำนวณความลาดชัน (Slope), ปริมาณน้ำฝน, อุณหภูมิ, และลักษณะดิน",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "ประเมินตามกฎ FAO Framework",
    description: "จำแนกเกรดความเหมาะสมตามกฎ Maximum Limitation Rule ปัจจัยที่เป็นอุปสรรคที่สุดจะกำหนดเกรดความสำเร็จของพืช",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "รับคำแนะนำการจัดการแปลง",
    description: "รู้ทันทีว่าพืชชนิดใดได้ S1, S2, S3 หรือ N พร้อมข้อเสนอแนะการปรับปรุงโครงสร้างดินและการจัดการน้ำเฉพาะจุด",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22V12" /><path d="M5 12H2a10 10 0 0 0 20 0h-3" /><path d="M12 12C12 6 7 3 7 3s0 5 5 9" /><path d="M12 12c0-6 5-9 5-9s0 5-5 9" />
      </svg>
    ),
  },
];

/* ─── FAO Grade Standards ─── */
const faoGrades = [
  {
    grade: "S1",
    title: "เหมาะสมมาก",
    englishTitle: "Highly Suitable",
    cardBg: "rgba(16, 185, 129, 0.07)",
    borderColor: "rgba(16, 185, 129, 0.40)",
    badgeBg: "rgba(16, 185, 129, 0.18)",
    badgeColor: "#10B981",
    limitations: "ไม่มีข้อจำกัด (0 ปัจจัย)",
    description: "สภาพดิน ความลาดชัน ความชื้น และสภาพภูมิอากาศสอดคล้องกับชีววิทยาของพืชอย่างสมบูรณ์ ให้ผลผลิตคุ้มค่าสูงสุด",
    action: "แนะนำปลูกเป็นอันดับแรก — ผลผลิตเต็มศักยภาพ",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  {
    grade: "S2",
    title: "เหมาะสมปานกลาง",
    englishTitle: "Moderately Suitable",
    cardBg: "rgba(245, 158, 11, 0.07)",
    borderColor: "rgba(245, 158, 11, 0.40)",
    badgeBg: "rgba(245, 158, 11, 0.18)",
    badgeColor: "#F59E0B",
    limitations: "มีข้อจำกัดเล็กน้อย (1 ปัจจัย)",
    description: "มีข้อจำกัดด้านกายภาพเล็กน้อย เช่น ความลาดชันปานกลาง หรือค่า pH เบี่ยงเบน แต่สามารถปรับปรุงดินหรือจัดการน้ำได้",
    action: "ปรับปรุงปัจจัยจำกัด — สามารถยกระดับเป็น S1 ได้",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  {
    grade: "S3",
    title: "เหมาะสมเล็กน้อย",
    englishTitle: "Marginally Suitable",
    cardBg: "rgba(249, 115, 22, 0.07)",
    borderColor: "rgba(249, 115, 22, 0.40)",
    badgeBg: "rgba(249, 115, 22, 0.18)",
    badgeColor: "#F97316",
    limitations: "มีข้อจำกัดปานกลาง (2 ปัจจัย)",
    description: "มีอุปสรรคสะสมหลายประการ ต้องลงทุนปรับปรุงโครงสร้างพื้นฐานสูง เช่น ขุดร่องระบายน้ำหรือสร้างระบบชลประทานเพิ่มเติม",
    action: "ต้องมีมาตรการจัดการพิเศษก่อนการเพาะปลูก",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  {
    grade: "N",
    title: "ไม่เหมาะสม",
    englishTitle: "Not Suitable",
    cardBg: "rgba(239, 68, 68, 0.07)",
    borderColor: "rgba(239, 68, 68, 0.40)",
    badgeBg: "rgba(239, 68, 68, 0.18)",
    badgeColor: "#EF4444",
    limitations: "มีข้อจำกัดรุนแรง (3+ ปัจจัย)",
    description: "ปัจจัยสภาพแวดล้อมไม่เอื้ออำนวยอย่างยิ่ง เช่น พื้นที่ลุ่มน้ำท่วมซ้ำซาก ดินเค็มจัด หรือลาดชันเกินเกณฑ์ชีววิทยาของพืช",
    action: "หลีกเลี่ยงการปลูก — เปลี่ยนไปปลูกพืชชนิดอื่นที่เหมาะสมกว่า",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
  },
];

/* ─── Hero Stats ─── */
const stats = [
  { label: "พืชเศรษฐกิจไทย", value: "13 ชนิด", sub: "ครอบคลุมพืชไร่ ไม้ผล ยืนต้น" },
  { label: "มาตรฐานสากล", value: "FAO Framework", sub: "ระบบประเมินผืนดินสหประชาชาติ" },
  { label: "ความละเอียดข้อมูล", value: "10-30 ม.", sub: "เรดาร์ดาวเทียม Sentinel & Landsat" },
  { label: "วิเคราะห์ทันที", value: "< 3 วินาที", sub: "ประมวลผลบนคลาวด์แบบเรียลไทม์" },
];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ทั้งหมด");

  // Bidirectional in-view triggers (animate smoothly when scrolling down AND up)
  const heroReveal = useInView(0.1);
  const faoReveal = useInView(0.12);
  const stepsReveal = useInView(0.12);
  const cropsReveal = useInView(0.12);
  const ctaReveal = useInView(0.12);

  const categories = ["ทั้งหมด", "พืชไร่", "ไม้ผลเศรษฐกิจ", "พืชยืนต้น", "พืชสวนทางเลือก"];
  const filteredCrops = selectedCategory === "ทั้งหมด" 
    ? economicCrops 
    : economicCrops.filter(c => c.category === selectedCategory);

  return (
    <div
      className="aura-home-page flex flex-col min-h-screen transition-colors duration-350"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      <Navbar />

      {/* ═══════════════════════════════════════════════════════════════
          1. HERO SECTION (2-Column Luxury Layout with Live Satellite HUD)
         ═══════════════════════════════════════════════════════════════ */}
      <section
        ref={heroReveal.ref}
        className="aura-home-hero relative overflow-hidden px-6 md:px-12 lg:px-20 pt-16 pb-24 lg:pt-24 lg:pb-32 bg-grid-tech"
        style={{ background: "var(--grad-hero)" }}
      >
        {/* Ambient Glow Orbs */}
        <div className="hero-orb-1" aria-hidden="true" />
        <div className="hero-orb-2" aria-hidden="true" />
        <div className="hero-orb-3" aria-hidden="true" />

        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* Left Column: Headlines & Action */}
          <div className={`lg:col-span-7 flex flex-col gap-6 rolex-reveal ${heroReveal.isInView ? "rolex-reveal-active" : ""}`}>
            
            {/* Live Telemetry Radar Badge */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass-deep w-fit">
              <span className="live-dot" aria-label="Active Signal" />
              <span className="text-xs font-bold tracking-wide" style={{ color: "var(--color-teal)" }}>
                ระบบตรวจจับภูมิสารสนเทศดาวเทียมความแม่นยำสูง
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md" style={{ background: "var(--border-soft)", color: "var(--text-secondary)" }}>
                Sentinel-2 / FAO Matrix
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl leading-[1.12] tracking-tight">
              วิเคราะห์ศักยภาพผืนดิน
              <span className="grad-text block mt-1">
                ด้วยดาวเทียมและเกณฑ์ FAO
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg leading-relaxed max-w-2xl" style={{ color: "var(--text-secondary)" }}>
              ยกระดับการตัดสินใจทางการเกษตร คัดกรองพืชที่เหมาะสมที่สุด 13 ชนิดจากข้อมูลความลาดชัน
              ปริมาณน้ำฝน สภาพดิน และระดับความสูง พร้อมคำแนะนำปรับปรุงก่อนเริ่มลงทุน
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/analyze"
                id="hero-cta-analyze"
                className="btn-primary anim-glow"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="3 11 22 2 13 21 11 13 3 11" />
                </svg>
                <span>เริ่มสำรวจแปลงบนแผนที่</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>

              <a
                href="#fao-knowledge"
                id="hero-cta-learn"
                className="btn-secondary"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                <span>คู่มือเกณฑ์ประเมิน S1–N</span>
              </a>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t" style={{ borderColor: "var(--border-soft)" }}>
              {stats.map((s, idx) => (
                <div key={idx} className="flex flex-col gap-0.5">
                  <span className="font-heading font-black text-xl lg:text-2xl" style={{ color: "var(--text-primary)" }}>
                    {s.value}
                  </span>
                  <span className="text-xs font-bold" style={{ color: "var(--color-teal)" }}>
                    {s.label}
                  </span>
                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    {s.sub}
                  </span>
                </div>
              ))}
            </div>

          </div>

          {/* Right Column: Hero Visual Frame with Live HUD telemetry */}
          <div className={`lg:col-span-5 relative rolex-reveal ${heroReveal.isInView ? "rolex-reveal-active" : ""}`} style={{ transitionDelay: "180ms" }}>
            
            {/* Visual Glass Frame */}
            <div className="glass-deep glass-specular rounded-3xl p-3 sm:p-4 shadow-2xl relative group">
              
              {/* Photo Showcase */}
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-[#0A1E14]">
                <img
                  src="/images/hero_farm.jpg"
                  alt="Aura Farm Precision Agriculture Aerial View"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="eager"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "linear-gradient(180deg, rgba(10,30,20,0.1) 0%, rgba(10,30,20,0.7) 100%)",
                  }}
                />

                {/* Live Scanning Reticle Line */}
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono glass">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-bold text-white tracking-wide">LIVE SATELLITE SCAN</span>
                </div>

                {/* Bottom Overlay Info on Photo */}
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-300 block">แปลงตัวอย่างวิจัย</span>
                    <span className="font-heading font-bold text-base sm:text-lg">แปลงเกษตรอัจฉริยะ ลุ่มน้ำเจ้าพระยา</span>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/30 border border-emerald-400/50 text-emerald-200 font-bold">
                      S1 เหมาะสมมาก
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating HUD Card 1 (Top Right) */}
              <div className="absolute -top-4 -right-4 sm:-right-6 glass-deep glass-specular p-3 rounded-2xl flex items-center gap-3 anim-float shadow-xl">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: "var(--grad-brand)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <div>
                  <span className="text-[10px] block font-mono text-muted">ดัชนีพืชพรรณ NDVI</span>
                  <span className="font-heading font-black text-base" style={{ color: "var(--color-teal)" }}>0.84 สดชื่นสูง</span>
                </div>
              </div>

              {/* Floating HUD Card 2 (Bottom Left) */}
              <div className="absolute -bottom-5 -left-4 sm:-left-6 glass-deep glass-specular p-3 rounded-2xl flex items-center gap-3 shadow-xl">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(16,185,129,0.15)", color: "var(--color-teal)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div>
                  <span className="text-[10px] block font-mono" style={{ color: "var(--text-muted)" }}>ความลาดชันเฉลี่ย</span>
                  <span className="font-heading font-black text-sm" style={{ color: "var(--text-primary)" }}>1.8° (ที่ราบลุ่ม)</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          2. FAO KNOWLEDGE & SOIL ANALYSIS (With Real Soil Science Visual)
         ═══════════════════════════════════════════════════════════════ */}
      <section
        id="fao-knowledge"
        ref={faoReveal.ref}
        className="px-6 md:px-12 lg:px-20 py-20 lg:py-28 flex flex-col gap-16"
        style={{ background: "var(--bg-surface)" }}
      >
        {/* Section Header with Rolex Accent Line */}
        <div className={`flex flex-col items-center text-center gap-4 max-w-3xl mx-auto rolex-reveal ${faoReveal.isInView ? "rolex-reveal-active" : ""}`}>
          <span className="section-pill">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            มาตรฐานการประเมินผืนดินระดับสากล
          </span>
          <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight">
            ทำความเข้าใจเกณฑ์ FAO และโครงสร้างดิน
          </h2>
          <div className={`w-28 rolex-line ${faoReveal.isInView ? "rolex-line-active" : "rolex-line-inactive"}`} />
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: "var(--text-muted)" }}>
            องค์การอาหารและเกษตรแห่งสหประชาชาติ (FAO) วางหลักการว่า ผืนดินไม่มีคำว่าดีหรือแย่โดยสัมบูรณ์
            แต่ขึ้นอยู่กับว่า &ldquo;นำไปเพาะปลูกพืชชนิดใด&rdquo;
          </p>
        </div>

        {/* 2-Column Insight: Science & Soil Visual */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto w-full items-center">
          
          {/* Soil Photo Card */}
          <div className={`lg:col-span-5 glass-deep glass-specular rounded-3xl p-3 sm:p-4 shadow-xl rolex-reveal-left ${faoReveal.isInView ? "rolex-reveal-left-active" : ""}`}>
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-[#121A15]">
              <img
                src="/images/fao_soil.jpg"
                alt="Soil Texture and Fertility Cross-Section"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "linear-gradient(180deg, transparent 40%, rgba(8,24,18,0.85) 100%)",
                }}
              />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 block">
                  Soil Quality & Texture
                </span>
                <span className="font-heading font-bold text-sm sm:text-base">
                  ชั้นดิน อินทรียวัตถุ และการอุ้มน้ำ
                </span>
                <p className="text-[11px] text-gray-200 mt-1 leading-snug">
                  ความลึกของหน้าดินและค่า pH เป็นปัจจัยจำกัดสำคัญที่สุดตามเกณฑ์ Land Evaluation
                </p>
              </div>
            </div>
          </div>

          {/* Explanation Text */}
          <div className={`lg:col-span-7 flex flex-col gap-5 rolex-reveal-right ${faoReveal.isInView ? "rolex-reveal-right-active" : ""}`} style={{ transitionDelay: "140ms" }}>
            
            <div className="info-card p-6">
              <div className="flex items-center gap-3">
                <div className="icon-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg" style={{ color: "var(--text-primary)" }}>
                    กฎปัจจัยจำกัดสูงสุด (Maximum Limitation Rule)
                  </h3>
                  <span className="text-xs font-mono" style={{ color: "var(--color-teal)" }}>
                    FAO Guidelines for Land Evaluation
                  </span>
                </div>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed mt-2" style={{ color: "var(--text-secondary)" }}>
                หากแปลงของคุณมีสภาพภูมิอากาศและแร่ธาตุระดับ S1 (ดีเยี่ยม) แต่ความลาดชันชันเกินไปสำหรับพืชชนิดนั้น (ระดับ N) 
                ผลลัพธ์สุทธิจะถูกจัดเป็น <strong>N (ไม่เหมาะสม)</strong> ทันที เพื่อป้องกันความสูญเสียจากการลงทุน
              </p>
            </div>

            <div className="info-card p-6">
              <div className="flex items-center gap-3">
                <div className="icon-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg" style={{ color: "var(--text-primary)" }}>
                    การคัดกรองพื้นที่ข้อจำกัดทางกายภาพ
                  </h3>
                  <span className="text-xs font-mono" style={{ color: "var(--color-teal)" }}>
                    Water Bodies & Built-Up Areas Filter
                  </span>
                </div>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed mt-2" style={{ color: "var(--text-secondary)" }}>
                ระบบตรวจเช็คข้อมูลผังเมือง แหล่งน้ำเปิด สิ่งปลูกสร้าง และพื้นที่ป่าอนุรักษ์ 
                เพื่อไม่ให้มีการแนะนำพืชในพื้นที่ที่ไม่ใช่พื้นที่เกษตรกรรมจริง
              </p>
            </div>

          </div>

        </div>

        {/* 4 FAO Grade Cards (S1, S2, S3, N) with Rolex Stagger */}
        <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
          <div className="text-center">
            <h3 className="font-heading font-black text-2xl" style={{ color: "var(--text-primary)" }}>
              4 ระดับชั้นความเหมาะสมมาตรฐาน FAO
            </h3>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              การจัดลำดับความพร้อมของทรัพยากรธรรมชาติและผลตอบแทนเชิงเศรษฐกิจ
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {faoGrades.map((g, i) => (
              <div
                key={g.grade}
                className={`glass-deep glass-specular rounded-2xl p-6 flex flex-col justify-between gap-6 hover:-translate-y-2 rolex-reveal ${
                  faoReveal.isInView ? "rolex-reveal-active" : ""
                }`}
                style={{
                  background: g.cardBg,
                  borderColor: g.borderColor,
                  transitionDelay: `${i * 100}ms`,
                }}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
                      style={{ background: g.badgeBg, color: g.badgeColor }}
                    >
                      {g.icon}
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-black font-mono border"
                      style={{
                        background: g.badgeBg,
                        borderColor: g.borderColor,
                        color: g.badgeColor,
                      }}
                    >
                      เกรด {g.grade}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-heading font-black text-xl" style={{ color: "var(--text-primary)" }}>
                      {g.title}
                    </h4>
                    <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                      {g.englishTitle}
                    </span>
                  </div>

                  <div
                    className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-[11px] font-semibold"
                    style={{
                      background: "var(--glass-bg)",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--border-soft)",
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    {g.limitations}
                  </div>

                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {g.description}
                  </p>
                </div>

                <div
                  className="pt-3 border-t text-[11px] font-bold flex items-center gap-1.5"
                  style={{ borderColor: "var(--border-soft)", color: "var(--text-primary)" }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                  <span>{g.action}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* ═══════════════════════════════════════════════════════════════
          3. HOW IT WORKS — REMOTE SENSING PIPELINE
         ═══════════════════════════════════════════════════════════════ */}
      <section
        id="how-it-works"
        ref={stepsReveal.ref}
        className="px-6 md:px-12 lg:px-20 py-20 lg:py-28 flex flex-col gap-16"
        style={{ background: "var(--bg-base)" }}
      >
        <div className={`flex flex-col items-center text-center gap-3 max-w-2xl mx-auto rolex-reveal ${stepsReveal.isInView ? "rolex-reveal-active" : ""}`}>
          <span className="section-pill">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            กระบวนการประมวลผล 4 ขั้นตอน
          </span>
          <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight">
            ขั้นตอนการทำงานจากดาวเทียมสู่ผลลัพธ์
          </h2>
          <div className={`w-28 rolex-line ${stepsReveal.isInView ? "rolex-line-active" : "rolex-line-inactive"}`} />
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: "var(--text-muted)" }}>
            กำหนดขอบเขตแปลง ระบบจะคำนวณปัจจัยสภาพแวดล้อมและเปรียบเทียบเกณฑ์ FAO ภายในไม่กี่วินาที
          </p>
        </div>

        {/* Earth Observation Showcase + Steps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto w-full items-center">
          
          {/* Earth Space Observation Graphic */}
          <div className={`lg:col-span-4 glass-deep glass-specular rounded-3xl p-3 sm:p-4 shadow-xl rolex-reveal-left ${stepsReveal.isInView ? "rolex-reveal-left-active" : ""}`}>
            <div className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-[#061014]">
              <img
                src="/images/satellite_earth.jpg"
                alt="Earth Observation Satellite Sensor Network"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "linear-gradient(180deg, transparent 40%, rgba(6,16,20,0.9) 100%)",
                }}
              />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-[10px] font-mono text-cyan-300 font-bold uppercase tracking-wider">
                    Geospatial Cloud Compute
                  </span>
                </div>
                <h4 className="font-heading font-black text-lg">Google Earth Engine</h4>
                <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                  ประมวลผลข้อมูล DEM, ERA5 Land, และ SoilGrids 250m ในระดับพิกัดแปลงจริง
                </p>
              </div>
            </div>
          </div>

          {/* 4 Step Cards */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {steps.map((step, i) => (
              <div
                key={step.number}
                className={`step-card rolex-reveal ${stepsReveal.isInView ? "rolex-reveal-active" : ""}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{
                      background: "var(--glass-bg)",
                      border: "1px solid var(--border-mid)",
                      color: "var(--color-teal)",
                    }}
                  >
                    {step.icon}
                  </div>
                  <span className="step-badge">
                    ขั้นตอน {step.number}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-heading font-bold text-lg" style={{ color: "var(--text-primary)" }}>
                    {step.title}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>

      </section>

      {/* ═══════════════════════════════════════════════════════════════
          4. 13 ECONOMIC CROPS SHOWCASE (With Photos for All 13 Crops!)
         ═══════════════════════════════════════════════════════════════ */}
      <section
        id="crops-database"
        ref={cropsReveal.ref}
        className="px-6 md:px-12 lg:px-20 py-20 lg:py-28 flex flex-col gap-12"
        style={{ background: "var(--bg-surface)" }}
      >
        <div className={`flex flex-col items-center text-center gap-3 max-w-3xl mx-auto rolex-reveal ${cropsReveal.isInView ? "rolex-reveal-active" : ""}`}>
          <span className="section-pill">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22V12" /><path d="M5 12H2a10 10 0 0 0 20 0h-3" /><path d="M12 12C12 6 7 3 7 3s0 5 5 9" />
            </svg>
            ฐานข้อมูลพืชเศรษฐกิจไทย
          </span>
          <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight">
            13 พืชเศรษฐกิจที่ระบบรองรับ
          </h2>
          <div className={`w-28 rolex-line ${cropsReveal.isInView ? "rolex-line-active" : "rolex-line-inactive"}`} />
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: "var(--text-muted)" }}>
            ครอบคลุมพืชไร่อุตสาหกรรม ไม้ผลมูลค่าสูง และพืชยืนต้นสำคัญของประเทศไทย พร้อมภาพถ่ายจริงและข้อมูลความต้องการดินและน้ำ
          </p>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer"
                style={{
                  background: selectedCategory === cat ? "var(--grad-brand)" : "var(--glass-bg)",
                  color: selectedCategory === cat ? "#ffffff" : "var(--text-secondary)",
                  border: `1px solid ${selectedCategory === cat ? "transparent" : "var(--border-soft)"}`,
                  boxShadow: selectedCategory === cat ? "var(--shadow-glow)" : "none",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Crops Grid with High-Res Photos for Every Single Crop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto w-full">
          {filteredCrops.map((crop, idx) => (
            <div
              key={crop.name}
              className={`glass-deep rounded-3xl overflow-hidden flex flex-col justify-between group hover:-translate-y-2 transition-all duration-500 shadow-lg rolex-reveal ${
                cropsReveal.isInView ? "rolex-reveal-active" : ""
              }`}
              style={{ transitionDelay: `${(idx % 4) * 80}ms` }}
            >
              {/* Crop Photo with Category Badge */}
              <div className="relative aspect-[16/10] overflow-hidden bg-black/40">
                <img
                  src={crop.image}
                  alt={crop.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.65) 100%)",
                  }}
                />

                {/* Floating Category Badge */}
                <div className="absolute top-3 left-3">
                  <span
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide backdrop-blur-md"
                    style={{
                      background: "rgba(10,35,24,0.75)",
                      border: "1px solid rgba(44,201,160,0.4)",
                      color: "#5DDBB8",
                    }}
                  >
                    {crop.category}
                  </span>
                </div>

                {/* Crop Name Overlay on Photo bottom */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h4 className="font-heading font-black text-lg sm:text-xl drop-shadow-md">
                    {crop.name}
                  </h4>
                  <span className="text-[11px] font-mono text-emerald-300 drop-shadow-sm">
                    {crop.eng}
                  </span>
                </div>
              </div>

              {/* Crop Agronomic Specs */}
              <div className="p-5 flex flex-col gap-3 flex-1 justify-between">
                <div className="flex flex-col gap-2">
                  <div className="flex items-start gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5" style={{ color: "var(--color-teal)" }}>
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    <div>
                      <span className="font-semibold block text-[10px] uppercase text-muted">ความต้องการดิน</span>
                      <span className="line-clamp-2 text-xs">{crop.soil}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5" style={{ color: "var(--color-teal)" }}>
                      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                    </svg>
                    <div>
                      <span className="font-semibold block text-[10px] uppercase text-muted">ปริมาณน้ำ</span>
                      <span className="text-xs">{crop.water}</span>
                    </div>
                  </div>
                </div>

                <div
                  className="pt-3 border-t flex items-center justify-between text-[11px] font-mono"
                  style={{ borderColor: "var(--border-soft)", color: "var(--text-subtle)" }}
                >
                  <span>ช่วงปลูก: {crop.bestSeason}</span>
                  <span className="font-bold hover:underline cursor-pointer" style={{ color: "var(--color-teal)" }}>
                    เกณฑ์ FAO →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* ═══════════════════════════════════════════════════════════════
          5. LUXURY FINAL CALL TO ACTION (Atmospheric Glass Banner)
         ═══════════════════════════════════════════════════════════════ */}
      <section
        ref={ctaReveal.ref}
        className="px-6 md:px-12 lg:px-20 py-20 lg:py-28"
        style={{ background: "var(--bg-base)" }}
      >
        <div
          className={`max-w-5xl mx-auto glass-deep glass-specular rounded-3xl p-8 sm:p-14 md:p-16 flex flex-col items-center text-center gap-6 shadow-2xl relative overflow-hidden rolex-reveal ${
            ctaReveal.isInView ? "rolex-reveal-active" : ""
          }`}
          style={{
            background: "linear-gradient(135deg, rgba(15,158,123,0.18) 0%, rgba(8,24,18,0.85) 100%)",
          }}
        >
          {/* Subtle Ambient Radial Glow */}
          <div
            className="absolute -top-32 -left-32 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, var(--color-glow) 0%, transparent 70%)" }}
          />
          <div
            className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(44,201,160,0.2) 0%, transparent 70%)" }}
          />

          <span className="section-pill relative z-10">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            เริ่มต้นใช้งานได้ฟรี ไม่มีค่าใช้จ่าย
          </span>

          <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight max-w-2xl relative z-10">
            พร้อมวิเคราะห์แปลงที่ดินของคุณแล้วหรือยัง?
          </h2>

          <div className={`w-28 rolex-line relative z-10 ${ctaReveal.isInView ? "rolex-line-active" : "rolex-line-inactive"}`} />

          <p className="text-sm sm:text-base leading-relaxed max-w-xl relative z-10" style={{ color: "var(--text-secondary)" }}>
            เพียงเปิดแผนที่ ลากกรอบแปลงที่ดินที่คุณสนใจ ระบบจะคำนวณและสร้างรายงานความเหมาะสมของ 13 พืชเศรษฐกิจให้ทันที
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 relative z-10">
            <Link
              href="/analyze"
              id="footer-cta-analyze"
              className="btn-primary anim-glow px-8 py-4 text-base"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polygon points="3 11 22 2 13 21 11 13 3 11" />
              </svg>
              <span>เปิดแผนที่และวาดแปลงเลย</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>

          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
