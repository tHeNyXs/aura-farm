import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAnalysisById } from "@/app/lib/analysis-store";
import Navbar from "@/app/components/ui/navbar";
import Footer from "@/app/components/ui/footer";
import SaveParcelButton from "./components/save-parcel-button";
import { FAOSuitabilityClass } from "@/app/lib/types";

export const maxDuration = 60;

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const sp = searchParams ? await searchParams : {};
  let fallbackPoly: [number, number][] | undefined = undefined;
  if (sp.poly && typeof sp.poly === "string") {
    try {
      fallbackPoly = JSON.parse(decodeURIComponent(sp.poly));
    } catch {}
  }
  const analysis = await getAnalysisById(id, fallbackPoly);
  if (!analysis) return {};
  const { result } = analysis;
  return {
    title: `ผลการวิเคราะห์: ${result.location_name} — Aura Farm`,
    description: result.insight_text,
  };
}

export default async function AnalysisResultPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = searchParams ? await searchParams : {};
  let fallbackPoly: [number, number][] | undefined = undefined;
  if (sp.poly && typeof sp.poly === "string") {
    try {
      fallbackPoly = JSON.parse(decodeURIComponent(sp.poly));
    } catch {}
  }
  const analysis = await getAnalysisById(id, fallbackPoly);

  if (!analysis) {
    notFound();
  }
  const { result: data, rankedCrops } = analysis;

  // Missing LDD coverage is not an N grade and must not make the parcel look unsuitable.
  const gradedCrops = rankedCrops.filter((crop) => crop.ldd_data_available || crop.is_masked_out);
  const s1Crops = gradedCrops.filter((c) => c.fao_class === "S1");
  const s2Crops = gradedCrops.filter((c) => c.fao_class === "S2");
  const s3Crops = gradedCrops.filter((c) => c.fao_class === "S3");
  const nCrops = gradedCrops.filter((c) => c.fao_class === "N");

  const lvl1 = data.overall_land_suitability || {
    indexScore: (data.suitability_score / 100),
    indexPercentage: data.suitability_score,
    fao_class: data.fao_class,
    fao_label: data.fao_label,
    consistency_ratio: 0.024,
    cr_passed: true,
  };

  // Helper gauge percentages for satellite mini stats
  const ndviPct = Math.min(100, Math.max(0, (data.ndvi_value / 0.85) * 100));
  const moisturePct = Math.min(100, Math.max(0, data.soil_moisture));
  const slopePct = Math.min(100, Math.max(5, (data.slope_degrees / 15) * 100));
  const rainPct = Math.min(100, Math.max(10, (data.rainfall_mm / 2200) * 100));

  const isBuiltUp = Boolean(lvl1?.is_built_up_masked || data.soil_group?.groupId === 99);

  // Dynamic Hero Banner Theme based on Land Quality / Top Crops
  const isAllN = s1Crops.length === 0 && s2Crops.length === 0 && s3Crops.length === 0;
  const isRedStatus = isAllN || isBuiltUp;
  const isOrangeStatus = !isRedStatus && s1Crops.length === 0 && s2Crops.length === 0 && s3Crops.length > 0;
  const isAmberStatus = !isRedStatus && s1Crops.length === 0 && s2Crops.length > 0;

  const heroTheme = isRedStatus
    ? {
        bg: "from-[#450A0A] via-[#7F1D1D] to-[#991B1B] border-red-500/40",
        radialGlow1: "bg-red-400/20",
        radialGlow2: "bg-rose-500/20",
        topBadge: "bg-red-950/80 border-red-400/40 text-red-200",
        topBadgeDot: "bg-red-400",
        ringStroke: "stroke-red-950/80",
        ringGradId: "redGrad",
        ringStops: [
          { offset: "0%", color: "#F87171" },
          { offset: "50%", color: "#EF4444" },
          { offset: "100%", color: "#B91C1C" },
        ],
        ringHalo: "from-red-500/35 via-rose-500/20 to-amber-500/15",
        ringGlow: "drop-shadow-[0_0_18px_rgba(239,68,68,0.55)]",
        ringTitle: isBuiltUp ? "พื้นที่สิ่งปลูกสร้าง (N)" : "พืชไม่แนะนำ (N)",
        ringCount: nCrops.length,
        ringCountColor: "text-red-100",
        ringUnit: "ชนิด",
        ringUnitColor: "text-red-200",
        ringSubtitle: isBuiltUp ? "ตรวจพบคอนกรีต/หลังคา" : `จากทั้งหมด ${rankedCrops.length} ชนิด`,
        rightCardBg: "bg-red-950/50 border-red-400/30",
        rightBadge: "text-red-300",
        rightPill: "bg-red-500/25 border-red-400/40 text-red-100",
        rightPillLabel: isBuiltUp ? "⚠️ สิ่งปลูกสร้าง (เกรด N)" : `⚠️ ไม่มีพืช S1 (เกรด N: ${nCrops.length} ชนิด)`,
        insightBox: "bg-red-900/40 border-red-500/30 text-red-100/90",
        miniPillBg: "bg-red-950/70 border-red-400/30",
        miniPillLabel: "text-red-300",
        miniPillVal: "text-red-100",
      }
    : isOrangeStatus
    ? {
        bg: "from-[#431407] via-[#7C2D12] to-[#9A3412] border-orange-500/40",
        radialGlow1: "bg-orange-400/20",
        radialGlow2: "bg-amber-500/20",
        topBadge: "bg-orange-950/80 border-orange-400/40 text-orange-200",
        topBadgeDot: "bg-orange-400",
        ringStroke: "stroke-orange-950/80",
        ringGradId: "orangeGrad",
        ringStops: [
          { offset: "0%", color: "#FB923C" },
          { offset: "50%", color: "#EA580C" },
          { offset: "100%", color: "#C2410C" },
        ],
        ringHalo: "from-orange-500/35 via-amber-500/20 to-red-500/15",
        ringGlow: "drop-shadow-[0_0_18px_rgba(249,115,22,0.5)]",
        ringTitle: "พืชเหมาะสมน้อย (S3)",
        ringCount: s3Crops.length,
        ringCountColor: "text-orange-100",
        ringUnit: "ชนิด",
        ringUnitColor: "text-orange-200",
        ringSubtitle: `จากทั้งหมด ${rankedCrops.length} ชนิด`,
        rightCardBg: "bg-orange-950/50 border-orange-400/30",
        rightBadge: "text-orange-300",
        rightPill: "bg-orange-500/25 border-orange-400/40 text-orange-100",
        rightPillLabel: `พืชเหมาะสมน้อย (S3): ${s3Crops.length} ชนิด`,
        insightBox: "bg-orange-900/40 border-orange-500/30 text-orange-100/90",
        miniPillBg: "bg-orange-950/70 border-orange-400/30",
        miniPillLabel: "text-orange-300",
        miniPillVal: "text-orange-100",
      }
    : isAmberStatus
    ? {
        bg: "from-[#451A03] via-[#78350F] to-[#B45309] border-amber-500/40",
        radialGlow1: "bg-amber-400/20",
        radialGlow2: "bg-yellow-500/20",
        topBadge: "bg-amber-950/80 border-amber-400/40 text-amber-200",
        topBadgeDot: "bg-amber-400",
        ringStroke: "stroke-amber-950/80",
        ringGradId: "amberGrad",
        ringStops: [
          { offset: "0%", color: "#FBBF24" },
          { offset: "50%", color: "#D97706" },
          { offset: "100%", color: "#B45309" },
        ],
        ringHalo: "from-amber-500/35 via-yellow-500/20 to-orange-500/15",
        ringGlow: "drop-shadow-[0_0_18px_rgba(245,158,11,0.5)]",
        ringTitle: "พืชเหมาะสมปานกลาง (S2)",
        ringCount: s2Crops.length,
        ringCountColor: "text-amber-100",
        ringUnit: "ชนิด",
        ringUnitColor: "text-amber-200",
        ringSubtitle: `จากทั้งหมด ${rankedCrops.length} ชนิด`,
        rightCardBg: "bg-amber-950/50 border-amber-400/30",
        rightBadge: "text-amber-300",
        rightPill: "bg-amber-500/25 border-amber-400/40 text-amber-100",
        rightPillLabel: `พืชเหมาะสมปานกลาง (S2): ${s2Crops.length} ชนิด`,
        insightBox: "bg-amber-900/40 border-amber-500/30 text-amber-100/90",
        miniPillBg: "bg-amber-950/70 border-amber-400/30",
        miniPillLabel: "text-amber-300",
        miniPillVal: "text-amber-100",
      }
    : {
        // Emerald Lush (Default when S1 >= 1)
        bg: "from-[#022C22] via-[#064E3B] to-[#047857] border-emerald-500/30",
        radialGlow1: "bg-emerald-400/15",
        radialGlow2: "bg-teal-400/15",
        topBadge: "bg-emerald-950/60 border-emerald-400/30 text-emerald-300",
        topBadgeDot: "bg-emerald-400",
        ringStroke: "stroke-emerald-950/70",
        ringGradId: "emeraldGrad",
        ringStops: [
          { offset: "0%", color: "#34D399" },
          { offset: "50%", color: "#10B981" },
          { offset: "100%", color: "#F59E0B" },
        ],
        ringHalo: "from-emerald-400/30 via-teal-300/20 to-amber-300/20",
        ringGlow: "drop-shadow-[0_0_15px_rgba(52,211,153,0.4)]",
        ringTitle: "พืชเหมาะสมมาก (S1)",
        ringCount: s1Crops.length,
        ringCountColor: "text-white",
        ringUnit: "ชนิด",
        ringUnitColor: "text-emerald-200",
        ringSubtitle: `จากทั้งหมด ${rankedCrops.length} ชนิด`,
        rightCardBg: "bg-emerald-950/40 border-emerald-400/20",
        rightBadge: "text-amber-300",
        rightPill: "bg-emerald-500/20 border-emerald-400/30 text-emerald-200",
        rightPillLabel: `พืชเหมาะสมสูง (S1): ${s1Crops.length} ชนิด`,
        insightBox: "bg-emerald-900/30 border-emerald-500/20 text-emerald-100/90",
        miniPillBg: "bg-emerald-950/60 border-emerald-400/20",
        miniPillLabel: "text-emerald-300",
        miniPillVal: "text-white",
      };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6] text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 md:px-8 py-8 flex flex-col gap-10">
        
        {/* ── Top Navigation & Title Bar ───────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-emerald-950/10">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <Link href="/analyze" className="hover:underline flex items-center gap-1.5 transition-colors">
                <span>←</span>
                <span>วาดแปลงใหม่</span>
              </Link>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 font-medium">รายงานประเมินความเหมาะสมที่ดิน GIS AI</span>
            </div>
            <h1 className="font-heading font-black text-3xl md:text-4xl text-emerald-950 tracking-tight">
              {data.location_name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
              <span className="px-3 py-1 bg-emerald-100/70 border border-emerald-200 rounded-full font-bold text-emerald-900 shadow-2xs">
                🌾 ขนาด {data.area_size.rai} ไร่
              </span>
              <span>•</span>
              <span className="text-slate-500 font-mono">{data.coordinates.formatted}</span>
              <span>•</span>
              <span className="text-slate-500">สำรวจเมื่อ: {data.analyzed_date}</span>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <SaveParcelButton analysis={data} />
            <Link
              href={`/analyze/result/${data.id}/crops${sp.poly ? `?poly=${sp.poly}` : ""}`}
              className="px-6 py-3 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>ดูพืชที่แนะนำ ({rankedCrops.length} ชนิด)</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* ── 1. Hero Summary Section: Dynamic Color Glowing Ring ── */}
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${heroTheme.bg} text-white p-8 md:p-10 shadow-2xl border transition-all duration-500`}>
          
          {/* Subtle Background Radial Glow */}
          <div className={`absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 ${heroTheme.radialGlow1} rounded-full blur-3xl pointer-events-none`} />
          <div className={`absolute -bottom-10 -right-10 w-80 h-80 ${heroTheme.radialGlow2} rounded-full blur-3xl pointer-events-none`} />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Glowing Crop Breakdown Summary */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center text-center">
              
              {/* Satellite Sync Pill Badge */}
              <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full ${heroTheme.topBadge} text-xs font-semibold mb-5 shadow-inner`}>
                <span className={`w-2 h-2 rounded-full ${heroTheme.topBadgeDot} animate-pulse`} />
                <span>📡 จำแนกพืชเศรษฐกิจหลัก {rankedCrops.length} ชนิด</span>
              </div>

              {/* Glowing Pulse Ring Container */}
              <div className="relative w-48 h-48 md:w-52 md:h-52 flex items-center justify-center">
                
                {/* Glowing Halo Rings */}
                <div className={`absolute inset-0 rounded-full bg-gradient-to-tr ${heroTheme.ringHalo} blur-xl animate-pulse`} />
                
                {/* SVG Progress Ring */}
                <svg className={`w-full h-full transform -rotate-90 ${heroTheme.ringGlow}`} viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    className={heroTheme.ringStroke}
                    strokeWidth="6"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke={`url(#${heroTheme.ringGradId})`}
                    strokeWidth="6"
                    strokeDasharray={263.8}
                    strokeDashoffset={0}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                  <defs>
                    <linearGradient id={heroTheme.ringGradId} x1="0%" y1="0%" x2="100%" y2="100%">
                      {heroTheme.ringStops.map((s, idx) => (
                        <stop key={idx} offset={s.offset} stopColor={s.color} />
                      ))}
                    </linearGradient>
                  </defs>
                </svg>

                {/* Centered S1 Crops Count Badge */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/90 mb-0.5">
                    {heroTheme.ringTitle}
                  </span>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className={`font-heading font-black text-5xl md:text-6xl tracking-tight ${heroTheme.ringCountColor} drop-shadow-md`}>
                      {heroTheme.ringCount}
                    </span>
                    <span className={`text-sm font-bold ${heroTheme.ringUnitColor}`}>{heroTheme.ringUnit}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-white/90 mt-1 px-2.5 py-0.5 bg-black/30 rounded-full border border-white/20 backdrop-blur-xs">
                    {heroTheme.ringSubtitle}
                  </span>
                </div>
              </div>

              {/* 4 Grade Pills Breakdown */}
              <div className="grid grid-cols-2 gap-2 w-full max-w-xs mt-5 text-xs">
                <div className="bg-black/30 border border-emerald-400/40 rounded-xl py-2 px-2.5 flex items-center justify-between shadow-xs">
                  <span className="text-emerald-300 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>เกรด S1</span>
                  </span>
                  <span className="font-black text-white text-sm">{s1Crops.length} ชนิด</span>
                </div>

                <div className="bg-black/30 border border-amber-400/40 rounded-xl py-2 px-2.5 flex items-center justify-between shadow-xs">
                  <span className="text-amber-300 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>เกรด S2</span>
                  </span>
                  <span className="font-black text-white text-sm">{s2Crops.length} ชนิด</span>
                </div>

                <div className="bg-black/30 border border-orange-400/40 rounded-xl py-2 px-2.5 flex items-center justify-between shadow-xs">
                  <span className="text-orange-300 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-orange-400" />
                    <span>เกรด S3</span>
                  </span>
                  <span className="font-black text-white text-sm">{s3Crops.length} ชนิด</span>
                </div>

                <div className="bg-black/30 border border-rose-400/40 rounded-xl py-2 px-2.5 flex items-center justify-between shadow-xs">
                  <span className="text-rose-300 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    <span>เกรด N</span>
                  </span>
                  <span className="font-black text-white text-sm">{nCrops.length} ชนิด</span>
                </div>
              </div>

              <p className="text-[11px] text-white/80 mt-4 max-w-xs leading-relaxed font-light">
                *พืชแต่ละชนิดมีเกณฑ์ข้อจำกัด (S1-N) เฉพาะตัว ระบบจึงจำแนกจำนวนพืชตามระดับความเหมาะสมเพื่อให้เลือกปลูกได้ตรงจุด
              </p>
            </div>

            {/* Right: AI Synthesis & Satellite Insight Card */}
            <div className={`lg:col-span-7 flex flex-col gap-5 ${heroTheme.rightCardBg} backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-inner border transition-colors`}>
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase ${heroTheme.rightBadge} tracking-wider`}>
                  <span>🤖</span>
                  <span>บทวิเคราะห์ศักยภาพแปลงที่ดินโดย AI</span>
                </span>
                <span className={`px-3 py-1 ${heroTheme.rightPill} rounded-md text-xs font-semibold`}>
                  {heroTheme.rightPillLabel}
                </span>
              </div>

              <h2 className="font-heading font-bold text-xl md:text-2xl text-white tracking-tight">
                สรุปผลการประเมินดาวเทียมและหน้าดิน
              </h2>

              <p className={`text-sm leading-relaxed font-normal ${heroTheme.insightBox} p-5 rounded-xl shadow-xs`}>
                {data.insight_text}
              </p>

              {/* Feature Highlights Pill Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className={`${heroTheme.miniPillBg} rounded-xl p-3 flex flex-col gap-0.5 border`}>
                  <span className={`text-[10px] ${heroTheme.miniPillLabel} uppercase tracking-wider font-semibold`}>พิกัดดาวเทียม</span>
                  <span className="text-xs font-bold text-white font-mono">{data.area_size.rai} ไร่</span>
                </div>
                <div className={`${heroTheme.miniPillBg} rounded-xl p-3 flex flex-col gap-0.5 border`}>
                  <span className={`text-[10px] ${heroTheme.miniPillLabel} uppercase tracking-wider font-semibold`}>ความละเอียด</span>
                  <span className="text-xs font-bold text-white">10m × 10m</span>
                </div>
                <div className={`${heroTheme.miniPillBg} rounded-xl p-3 flex flex-col gap-0.5 border`}>
                  <span className={`text-[10px] ${heroTheme.miniPillLabel} uppercase tracking-wider font-semibold`}>เกณฑ์ประเมิน</span>
                  <span className="text-xs font-bold text-white">FAO & LDD</span>
                </div>
                <div className={`${heroTheme.miniPillBg} rounded-xl p-3 flex flex-col gap-0.5 border`}>
                  <span className={`text-[10px] ${heroTheme.miniPillLabel} uppercase tracking-wider font-semibold`}>สถานะดาวเทียม</span>
                  <span className={`text-xs font-bold ${heroTheme.miniPillVal}`}>สด 180 วัน</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── 2. Mini Stat Cards: 4 Satellite Parameters ── */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-xl text-emerald-950 tracking-tight flex items-center gap-2">
              <span>🛰️</span>
              <span>ดัชนีกายภาพสดจากดาวเทียม (Satellite Metrics)</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium"> Sentinel-2, Sentinel-1, SRTM & CHIRPS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Stat Card 1: NDVI */}
            <div className="bg-white border border-emerald-100 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-700 group-hover:scale-110 transition-transform">
                    🌿
                  </span>
                  <div>
                    <span className="text-xs font-bold text-slate-500 block">ดัชนีพืชพรรณ</span>
                    <span className="font-heading font-bold text-base text-emerald-950">NDVI (10m)</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono font-black text-2xl text-emerald-800">{data.ndvi_value}</span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {data.ndvi_value >= 0.5 ? "อุดมสมบูรณ์สูง" : "ปานกลาง"}
                  </span>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
                    style={{ width: `${ndviPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Stat Card 2: Soil Moisture SAR */}
            <div className="bg-white border border-sky-100 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-sm hover:shadow-md hover:border-sky-300 transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl p-2.5 bg-sky-50 rounded-xl border border-sky-100 text-sky-700 group-hover:scale-110 transition-transform">
                    💧
                  </span>
                  <div>
                    <span className="text-xs font-bold text-slate-500 block">ความชื้นดิน</span>
                    <span className="font-heading font-bold text-base text-sky-950">SAR Radar</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono font-black text-2xl text-sky-800">{data.soil_moisture}%</span>
                  <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                    {data.soil_moisture > 70 ? "ชื้นสูง" : "ชื้นปานกลาง"}
                  </span>
                </div>
                {/* Visual Gauge Bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${moisturePct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Stat Card 3: DEM Slope */}
            <div className="bg-white border border-amber-100 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-sm hover:shadow-md hover:border-amber-300 transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl p-2.5 bg-amber-50 rounded-xl border border-amber-100 text-amber-700 group-hover:scale-110 transition-transform">
                    ⛰️
                  </span>
                  <div>
                    <span className="text-xs font-bold text-slate-500 block">ความลาดชัน</span>
                    <span className="font-heading font-bold text-base text-amber-950">SRTM DEM</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono font-black text-2xl text-amber-800">{data.slope_degrees}°</span>
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    {data.slope_degrees <= 2 ? "ที่ราบลุ่ม" : data.slope_degrees <= 8 ? "ที่เนิน" : "ที่ชัน"}
                  </span>
                </div>
                {/* Visual Slope Bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${slopePct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Stat Card 4: CHIRPS Rainfall */}
            <div className="bg-white border border-blue-100 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl p-2.5 bg-blue-50 rounded-xl border border-blue-100 text-blue-700 group-hover:scale-110 transition-transform">
                    🌧️
                  </span>
                  <div>
                    <span className="text-xs font-bold text-slate-500 block">ฝนสะสมรายปี</span>
                    <span className="font-heading font-bold text-base text-blue-950">CHIRPS (~5km)</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono font-black text-2xl text-blue-800">{data.rainfall_mm} <span className="text-xs font-normal">มม.</span></span>
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    {data.rainfall_mm >= 1500 ? "ฝนตกชุก" : "ฝนปานกลาง"}
                  </span>
                </div>
                {/* Visual Rain Metric Bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${rainPct}%` }}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── 5. Official LDD Soil Group Card with Icon Specs ── */}
        {data.soil_group && (
          <div className="bg-white border border-emerald-950/10 rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100/70 border border-amber-200 flex items-center justify-center text-2xl shrink-0 shadow-2xs">
                  🟤
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xl text-emerald-950 tracking-tight">
                    {data.soil_group.nameTh}
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    {data.soil_group.nameEn}
                  </span>
                </div>
              </div>
              <span className="px-4 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold rounded-xl self-start sm:self-auto shadow-2xs">
                ฐานข้อมูล 62 กลุ่มชุดดิน (กรมพัฒนาที่ดิน LDD)
              </span>
            </div>

            {/* Icon Spec Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              
              {/* Texture Spec */}
              <div className="bg-[#FAF9F6] border border-slate-200/80 rounded-2xl p-4 flex items-start gap-3 hover:border-emerald-300 transition-colors">
                <span className="text-xl p-2 bg-white border border-slate-200 rounded-xl shadow-2xs">🧬</span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-500 font-semibold block">เนื้อดิน (Texture)</span>
                  <span className="font-bold text-emerald-950 text-sm">{data.soil_group.texture}</span>
                </div>
              </div>

              {/* Drainage Spec */}
              <div className="bg-[#FAF9F6] border border-slate-200/80 rounded-2xl p-4 flex items-start gap-3 hover:border-emerald-300 transition-colors">
                <span className="text-xl p-2 bg-white border border-slate-200 rounded-xl shadow-2xs">🌊</span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-500 font-semibold block">การระบายน้ำ (Drainage)</span>
                  <span className="font-bold text-emerald-950 text-sm">{data.soil_group.drainageTh}</span>
                </div>
              </div>

              {/* Soil pH Spec */}
              <div className="bg-[#FAF9F6] border border-slate-200/80 rounded-2xl p-4 flex items-start gap-3 hover:border-emerald-300 transition-colors">
                <span className="text-xl p-2 bg-white border border-slate-200 rounded-xl shadow-2xs">🧪</span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-500 font-semibold block">ความเป็นกรด-ด่าง (Soil pH)</span>
                  <span className="font-bold text-emerald-950 text-sm">{data.soil_ph ? `pH ${data.soil_ph}` : data.soil_group.phLabel}</span>
                </div>
              </div>

              {/* Depth Spec */}
              <div className="bg-[#FAF9F6] border border-slate-200/80 rounded-2xl p-4 flex items-start gap-3 hover:border-emerald-300 transition-colors">
                <span className="text-xl p-2 bg-white border border-slate-200 rounded-xl shadow-2xs">📏</span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-500 font-semibold block">ความลึกหน้าดิน (Depth)</span>
                  <span className="font-bold text-emerald-950 text-sm">{data.soil_group.depthTh}</span>
                </div>
              </div>

            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-[#F4F2EB] p-4 rounded-2xl border border-slate-200/80">
              <strong className="text-emerald-950 font-bold">💡 คำแนะนำทางปฐพีวิทยา: </strong>
              {data.soil_group.description}
            </p>
          </div>
        )}

        {/* ── Level 2 CTA Banner (Primary Next Step) ──── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white p-8 md:p-10 shadow-xl border border-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-8 mt-2">
          
          <div className="flex flex-col gap-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="px-3 py-0.5 bg-amber-400 text-slate-950 text-xs font-black rounded-full">
                ระดับที่ 2
              </span>
              <span className="text-xs text-emerald-200 font-semibold">
                Crop-specific Suitability Matrix
              </span>
            </div>
            <h3 className="font-heading font-black text-2xl md:text-3xl text-white tracking-tight">
              ดูรายชื่อพืชเศรษฐกิจครบทั้ง {rankedCrops.length} ชนิด
            </h3>
            <p className="text-xs md:text-sm text-emerald-100/90 max-w-xl font-light">
              กรองค่าความเหมาะสมระดับที่ 1 ต่อด้วยพืชเศรษฐกิจหลักตามฐานข้อมูล LDD พร้อมคู่มือคำแนะนำการปลูกและการสอบทานสถิติ สศก.
            </p>
          </div>

          <Link
            href={`/analyze/result/${data.id}/crops${sp.poly ? `?poly=${sp.poly}` : ""}`}
            className="px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-base rounded-2xl hover:scale-105 transition-all shrink-0 shadow-lg cursor-pointer flex items-center gap-2"
          >
            <span>ดูพืชแนะนำทั้งหมด ({rankedCrops.length} ชนิด)</span>
            <span>→</span>
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}
