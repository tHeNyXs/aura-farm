import Link from "next/link";
import Navbar from "@/app/components/ui/navbar";
import Footer from "@/app/components/ui/footer";

/* ─── Step Data (100% Friendly Thai) ─────────────────── */

const steps = [
  {
    number: "01",
    icon: "✏️",
    title: "วาดขอบเขตแปลงที่ดิน",
    description:
      "คลิกวางจุดหรือลากกรอบบนแผนที่ดาวเทียมความละเอียดสูง เพื่อกำหนดแนวเขตแปลงเกษตรของคุณได้อย่างอิสระ",
  },
  {
    number: "02",
    icon: "🛰️",
    title: "AI วิเคราะห์ดาวเทียม 5 มิติ",
    description:
      "ดึงข้อมูลสุขภาพพืช (NDVI), ความชื้นผิวดินเรดาร์ (SAR), ความลาดชัน (DEM), ฝนสะสม (CHIRPS) และกลุ่มชุดดิน LDD",
  },
  {
    number: "03",
    icon: "📊",
    title: "จำแนกเกรดมาตรฐาน FAO & LDD",
    description:
      "ประเมินด้วยเขตความเหมาะสมของที่ดิน LDD Zoning สำหรับ 13 พืช",
  },
  {
    number: "04",
    icon: "🌾",
    title: "รับคำแนะนำพืชและวิธีปรับปรุงดิน",
    description:
      "รู้ทันทีว่าพืชชนิดใดได้ S1, S2, S3 หรือ N พร้อมคำแนะนำการจัดการดินเพื่อยกระดับผลผลิตให้คุ้มค่าที่สุด",
  },
];

/* ─── FAO & LDD Grade Standards ──────────────────────── */

const faoGrades = [
  {
    grade: "S1",
    title: "เหมาะสมมาก",
    englishTitle: "Highly Suitable",
    badgeBg: "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300",
    pillColor: "bg-emerald-600",
    gradient: "from-emerald-50 via-teal-50/50 to-white",
    borderColor: "border-emerald-200 hover:border-emerald-400",
    icon: "🌟",
    limitations: "ไม่มีข้อจำกัด (0 ปัจจัย)",
    description:
      "สภาพดิน ความลาดชัน ความชื้น และปริมาณน้ำฝนตรงตามความต้องการของพืชอย่างสมบูรณ์ ปลูกแล้วให้ผลผลิตสูงสุด ต้นทุนต่ำสุด และคุ้มค่าแก่การลงทุน",
    action: "ปลูกได้ทันที ผลผลิตเต็มศักยภาพ",
  },
  {
    grade: "S2",
    title: "เหมาะสมปานกลาง",
    englishTitle: "Moderately Suitable",
    badgeBg: "bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300",
    pillColor: "bg-amber-500",
    gradient: "from-amber-50 via-yellow-50/50 to-white",
    borderColor: "border-amber-200 hover:border-amber-400",
    icon: "⚖️",
    limitations: "มีข้อจำกัดเล็กน้อย (1 ปัจจัย)",
    description:
      "มีข้อจำกัดด้านกายภาพเล็กน้อย เช่น ค่า pH กรดอ่อน หรือปริมาณฝนน้อยกว่าเกณฑ์เล็กน้อย แต่สามารถจัดการเสริมระบบน้ำหรือปรับดินได้ง่าย",
    action: "ปรับปรุงปัจจัยเล็กน้อย แล้วจะเลื่อนขึ้นเป็น S1",
  },
  {
    grade: "S3",
    title: "เหมาะสมน้อย",
    englishTitle: "Marginally Suitable",
    badgeBg: "bg-orange-500/15 border-orange-500/40 text-orange-700 dark:text-orange-300",
    pillColor: "bg-orange-500",
    gradient: "from-orange-50 via-amber-50/50 to-white",
    borderColor: "border-orange-200 hover:border-orange-400",
    icon: "🛠️",
    limitations: "มีข้อจำกัดปานกลาง (2-3 ปัจจัย)",
    description:
      "มีข้อจำกัดหลายข้อ เช่น ความลาดชันสูง ดินระบายน้ำค่อนข้างช้า หรือดินมีลูกรังปน ต้องลงทุนยกร่อง ติดตั้งระบบน้ำหยด หรือใส่ปูนโดโลไมต์ปรับสภาพดิน",
    action: "ต้องลงทุนปรับปรุงแปลงก่อนเริ่มเพาะปลูก",
  },
  {
    grade: "N",
    title: "ไม่แนะนำ / ไม่เหมาะสม",
    englishTitle: "Not Suitable",
    badgeBg: "bg-rose-500/15 border-rose-500/40 text-rose-700 dark:text-rose-300",
    pillColor: "bg-rose-600",
    gradient: "from-rose-50 via-red-50/50 to-white",
    borderColor: "border-rose-200 hover:border-rose-400",
    icon: "🚫",
    limitations: "ข้อจำกัดวิกฤต (≥4 ข้อ หรือคอนกรีต)",
    description:
      "สภาพแวดล้อมขัดแย้งกับสรีรวิทยาของพืชอย่างรุนแรง เช่น ปลูกพืชรากเน่าในพื้นที่น้ำท่วมขัง หรือพื้นที่ตรวจพบเป็นหลังคาคอนกรีต/สิ่งปลูกสร้าง",
    action: "หลีกเลี่ยงการปลูกลงดิน หรือเปลี่ยนเป็นเกษตรในเมือง",
  },
];

/* ─── Page Component ─────────────────────────────────── */

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FDFBF7] text-[#1A2E1A] selection:bg-emerald-200 selection:text-emerald-950">
      <Navbar />

      {/* ═══════════════════════════════════════════
          HERO SECTION (Enhanced Modern UI)
         ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden border-b border-[#E5E0D5] flex flex-col items-center px-6 md:px-12 lg:px-24 pt-20 pb-24 lg:pt-28 lg:pb-32 gap-10 bg-gradient-to-b from-[#F7F4EC] via-[#FDFBF7] to-white">
        
        {/* Soft Background Accents */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-400/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Live Pill Badge */}
        <div className="inline-flex items-center gap-2.5 border border-emerald-600/30 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-xs hover:border-emerald-600/60 transition-colors">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
          </span>
          <span className="text-xs font-bold text-emerald-900 tracking-wide">
            อัปเกรดใหม่: LDD Zoning ทางการสำหรับ 13 พืชเศรษฐกิจ
          </span>
        </div>

        {/* Main Headline */}
        <div className="flex flex-col items-center gap-6 max-w-4xl text-center">
          <h1 className="font-heading font-black text-3xl sm:text-5xl lg:text-6xl leading-[118%] text-[#142B18] tracking-tight">
            วิเคราะห์ศักยภาพผืนดินของคุณ{" "}
            <span className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 bg-clip-text text-transparent block mt-2">
              ด้วยข้อมูลดาวเทียมและเกณฑ์ FAO & LDD
            </span>
          </h1>
          <p className="text-base sm:text-lg leading-relaxed text-[#4A5D4E] max-w-2xl font-normal">
            รู้ทันทีว่าแปลงที่ดินของคุณเหมาะกับการปลูกพืชชนิดไหน ประเมินความชื้นผิวดินเรดาร์ ความลาดชัน ปริมาณน้ำฝน และกลุ่มชุดดิน 62 กลุ่มจากกรมพัฒนาที่ดิน เพื่อผลตอบแทนที่มั่นคงที่สุด
          </p>
        </div>

        {/* CTA Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/analyze"
            className="w-full sm:w-auto px-9 py-4 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-bold text-base rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <span>เริ่มวิเคราะห์แปลงที่ดิน</span>
            <span className="text-lg">→</span>
          </Link>
          <a
            href="#fao-knowledge"
            className="w-full sm:w-auto px-8 py-4 bg-white/90 hover:bg-white border border-[#D5CEBF] text-[#2C4A32] font-semibold text-base rounded-xl hover:border-[#142B18] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <span>📖 เรียนรู้เกณฑ์ FAO (S1-N)</span>
          </a>
        </div>

        {/* Floating Quick Feature Ticker */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mt-6 w-full max-w-4xl">
          <div className="bg-white/70 backdrop-blur-sm border border-[#E8E3D8] rounded-2xl p-4 flex flex-col items-center text-center shadow-xs">
            <span className="text-2xl mb-1">🌾</span>
            <span className="font-heading font-black text-lg text-emerald-900">13 ชนิด</span>
            <span className="text-xs text-[#5D7060]">พืชยุทธศาสตร์หลัก</span>
          </div>
          <div className="bg-white/70 backdrop-blur-sm border border-[#E8E3D8] rounded-2xl p-4 flex flex-col items-center text-center shadow-xs">
            <span className="text-2xl mb-1">🛰️</span>
            <span className="font-heading font-black text-lg text-emerald-900">5 มิติ</span>
            <span className="text-xs text-[#5D7060]">ดาวเทียม GEE สด</span>
          </div>
          <div className="bg-white/70 backdrop-blur-sm border border-[#E8E3D8] rounded-2xl p-4 flex flex-col items-center text-center shadow-xs">
            <span className="text-2xl mb-1">📋</span>
            <span className="font-heading font-black text-lg text-emerald-900">62 กลุ่ม</span>
            <span className="text-xs text-[#5D7060]">ชุดดินกรมพัฒนาที่ดิน</span>
          </div>
          <div className="bg-white/70 backdrop-blur-sm border border-[#E8E3D8] rounded-2xl p-4 flex flex-col items-center text-center shadow-xs">
            <span className="text-2xl mb-1">🎯</span>
            <span className="font-heading font-black text-lg text-emerald-900">S1 - N</span>
            <span className="text-xs text-[#5D7060]">เกณฑ์สากล FAO (1983)</span>
          </div>
        </div>

      </section>

      {/* ═══════════════════════════════════════════
          FAO & LDD EDUCATIONAL SECTION (Knowledge Hub)
         ═══════════════════════════════════════════ */}
      <section
        id="fao-knowledge"
        className="px-6 md:px-12 lg:px-24 py-20 lg:py-28 bg-white border-b border-[#E5E0D5] flex flex-col gap-16"
      >
        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-4 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/70 border border-emerald-300 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <span>📚</span>
            <span>ศูนย์เรียนรู้มาตรฐานการประเมินดินระดับสากล</span>
          </span>
          <h2 className="font-heading font-black text-2xl sm:text-4xl text-[#142B18] tracking-tight">
            ทำความเข้าใจ FAO คืออะไร และเกณฑ์ S1, S2, S3, N บ่งบอกอะไร?
          </h2>
          <p className="text-sm sm:text-base text-[#4A5D4E] leading-relaxed">
            ระบบ Aura Farm ยึดหลักการประเมินที่ดินที่เป็นวิทยาศาสตร์ตามคู่มือทางการขององค์การอาหารและการเกษตรแห่งสหประชาชาติ (FAO) ผสานกับฐานข้อมูลกรมพัฒนาที่ดิน (LDD) เพื่อให้เกษตรกรเข้าใจสภาพแปลงของตนเองอย่างแท้จริง
          </p>
        </div>

        {/* 2 Core Columns: What is FAO & LDD */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto w-full">
          
          {/* Card 1: What is FAO? */}
          <div className="bg-gradient-to-br from-[#F7F9F5] to-[#EEF4EC] border border-emerald-200/80 rounded-3xl p-8 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center text-2xl shadow-sm">
              🌐
            </div>
            <h3 className="font-heading font-bold text-xl text-emerald-950">
              FAO คืออะไร? ทำไมต้องใช้เป็นมาตรฐาน?
            </h3>
            <p className="text-sm text-[#3E5343] leading-relaxed">
              <strong>FAO (Food and Agriculture Organization of the United Nations)</strong> คือองค์การอาหารและเกษตรแห่งสหประชาชาติ ซึ่งเป็นผู้กำหนดกรอบการประเมินผืนดินระดับสากล <em>(A Framework for Land Evaluation, FAO 1976 / 1983)</em>
            </p>
            <p className="text-xs text-[#526857] leading-relaxed">
              หลักการสำคัญของ FAO คือ <strong>"ดินไม่มีคำว่าดีหรือแย่โดยสมบูรณ์ แต่ขึ้นอยู่กับว่าใช้ปลูกพืชอะไร"</strong> แปลงหนึ่งอาจไม่เหมาะกับการปลูกข้าว (N) แต่อาจเหมาะสมอย่างยิ่งกับการปลูกมันสำปะหลังหรือสับปะรด (S1)
            </p>
          </div>

          {/* Card 2: LDD Connection */}
          <div className="bg-gradient-to-br from-[#FDFBF7] to-[#F5EFE1] border border-amber-200/80 rounded-3xl p-8 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-amber-700 text-white flex items-center justify-center text-2xl shadow-sm">
              🇹🇭
            </div>
            <h3 className="font-heading font-bold text-xl text-amber-950">
              เชื่อมโยงกับ กรมพัฒนาที่ดิน (LDD) อย่างไร?
            </h3>
            <p className="text-sm text-[#4E4432] leading-relaxed">
              <strong>กรมพัฒนาที่ดิน (พด. - LDD)</strong> กระทรวงเกษตรและสหกรณ์ ได้นำกรอบ FAO มาประยุกต์ใช้กับดินในประเทศไทย และจัดทำเป็น <strong>"คู่มือเกณฑ์การประเมินความเหมาะสมของดินสำหรับพืชเศรษฐกิจ"</strong> และระบบ Agri-Map
            </p>
            <p className="text-xs text-[#635843] leading-relaxed">
              LDD ได้กำหนดเกณฑ์ตารางตัวเลขเฉพาะสำหรับพืชแต่ละชนิด (เช่น ความลาดชัน, ค่า pH ดิน, ความชื้น, ปริมาณฝน) โดยใช้ <strong>วิธีปัจจัยจำกัดสูงสุด (Maximum Limitation Method)</strong> ซึ่งระบบ Aura Farm นำมาใช้คำนวณอย่างตรงไปตรงมา
            </p>
          </div>

        </div>

        {/* Visual 4-Pillars of S1, S2, S3, N */}
        <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
          <div className="text-center">
            <h3 className="font-heading font-bold text-xl text-[#142B18]">
              ความหมายของ 4 ระดับชั้นความเหมาะสม (Suitability Classes)
            </h3>
            <p className="text-xs text-[#5D7060] mt-1">
              ประเมินตามกฎปัจจัยจำกัดสูงสุด (ปัจจัยที่แย่ที่สุดจะเป็นตัวตัดสินเกรดของพืชชนิดนั้น)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {faoGrades.map((g) => (
              <div
                key={g.grade}
                className={`bg-gradient-to-b ${g.gradient} border ${g.borderColor} rounded-3xl p-6 flex flex-col justify-between gap-5 shadow-xs hover:shadow-md transition-all hover:-translate-y-1`}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{g.icon}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-black border ${g.badgeBg}`}>
                      เกรด {g.grade}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-heading font-bold text-lg text-[#142B18]">
                      {g.title}
                    </h4>
                    <span className="text-[11px] font-medium text-[#5D7060] uppercase tracking-wider">
                      {g.englishTitle}
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-white/80 border border-black/5 text-[11px] font-semibold text-[#2C4A32]">
                    <span>🔍</span>
                    <span>{g.limitations}</span>
                  </div>

                  <p className="text-xs leading-relaxed text-[#4A5D4E]">
                    {g.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-black/5 flex items-center gap-1.5 text-[11px] font-bold text-[#142B18]">
                  <span>👉</span>
                  <span>{g.action}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* ═══════════════════════════════════════════
          HOW IT WORKS (4 STEPS)
         ═══════════════════════════════════════════ */}
      <section
        id="how-it-works"
        className="px-6 md:px-12 lg:px-24 py-20 lg:py-28 flex flex-col gap-14 bg-[#F7F4EC]"
      >
        <div className="flex flex-col items-center text-center gap-3 max-w-2xl mx-auto">
          <span className="font-mono font-bold text-xs uppercase text-emerald-800 tracking-wider bg-emerald-100/70 border border-emerald-300 px-3.5 py-1 rounded-full">
            ขั้นตอนการทำงาน 4 สเตป
          </span>
          <h2 className="font-heading font-black text-2xl lg:text-4xl text-[#142B18]">
            สำรวจและประเมินแปลงที่ดินได้ง่ายๆ ในไม่กี่วินาที
          </h2>
          <p className="text-sm text-[#4A5D4E]">
            เพียงกำหนดแนวเขตแปลง ระบบ AI จะประมวลผลดาวเทียมและเทียบตารางเกณฑ์ LDD ให้ทันที
          </p>
        </div>

        {/* Step cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto w-full">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-white border border-[#E5E0D5] hover:border-emerald-500 rounded-2xl p-7 flex flex-col gap-5 shadow-xs hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl p-2.5 bg-[#F7F4EC] border border-[#E5E0D5] rounded-xl shadow-inner">
                  {step.icon}
                </span>
                <span className="font-mono font-bold text-xs text-emerald-800 px-3 py-1 bg-emerald-100 rounded-full border border-emerald-300">
                  ขั้นตอนที่ {step.number}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-heading font-bold text-lg text-[#142B18]">
                  {step.title}
                </h3>
                <p className="text-xs leading-relaxed text-[#4A5D4E]">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
