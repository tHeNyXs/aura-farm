"use client";

import { useState } from "react";
import Link from "next/link";
import { AnalysisResult, Crop, FAOSuitabilityClass } from "@/app/lib/types";

interface CropsClientProps {
  analysis: AnalysisResult;
  crops: Crop[];
}

const CATEGORIES = [
  "ทั้งหมด",
  "พืชไร่ / ธัญพืช",
  "ไม้ยืนต้น / อุตสาหกรรม",
  "ไม้ผลเศรษฐกิจ",
] as const;

export default function CropsClient({ analysis, crops }: CropsClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ทั้งหมด");
  const [selectedFaoClass, setSelectedFaoClass] = useState<string>("ALL");

  const filteredCrops = crops.filter((crop) => {
    const matchesCategory =
      selectedCategory === "ทั้งหมด" || crop.category === selectedCategory;
    const matchesFao =
      selectedFaoClass === "ALL"
        ? true
        : Boolean(crop.ldd_data_available || crop.is_masked_out) && crop.fao_class === selectedFaoClass;
    return matchesCategory && matchesFao;
  });

  const getFaoBadgeStyle = (faoClass: FAOSuitabilityClass) => {
    switch (faoClass) {
      case "S1":
        return "bg-emerald-700 text-white border-emerald-800 shadow-2xs";
      case "S2":
        return "bg-amber-700 text-white border-amber-800 shadow-2xs";
      case "S3":
        return "bg-orange-700 text-white border-orange-800 shadow-2xs";
      case "N":
        return "bg-rose-700 text-white border-rose-800 shadow-2xs";
      default:
        return "bg-slate-700 text-white border-slate-800";
    }
  };

  const getCropCardStyle = (faoClass: FAOSuitabilityClass) => {
    switch (faoClass) {
      case "S1":
        return {
          cardBg: "bg-emerald-50/70 border-emerald-200 hover:border-emerald-500 text-emerald-950",
          specBg: "bg-emerald-100/50 border-emerald-200/80",
          badgeClass: "เหมาะสมมาก (S1)",
          btnStyle: "bg-emerald-800 text-white hover:bg-emerald-900 shadow-2xs",
        };
      case "S2":
        return {
          cardBg: "bg-amber-50/70 border-amber-200 hover:border-amber-500 text-amber-950",
          specBg: "bg-amber-100/50 border-amber-200/80",
          badgeClass: "เหมาะสมปานกลาง (S2)",
          btnStyle: "bg-amber-800 text-white hover:bg-amber-900 shadow-2xs",
        };
      case "S3":
        return {
          cardBg: "bg-orange-50/70 border-orange-200 hover:border-orange-500 text-orange-950",
          specBg: "bg-orange-100/50 border-orange-200/80",
          badgeClass: "เหมาะสมน้อย (S3)",
          btnStyle: "bg-orange-800 text-white hover:bg-orange-900 shadow-2xs",
        };
      case "N":
        return {
          cardBg: "bg-rose-50/70 border-rose-200 hover:border-rose-500 text-rose-950 opacity-90",
          specBg: "bg-rose-100/50 border-rose-200/80",
          badgeClass: "ไม่แนะนำ (N)",
          btnStyle: "bg-rose-800 text-white hover:bg-rose-900 shadow-2xs",
        };
      default:
        return {
          cardBg: "bg-white border-slate-200 hover:border-emerald-500 text-slate-800",
          specBg: "bg-slate-50 border-slate-200",
          badgeClass: "",
          btnStyle: "bg-emerald-800 text-white hover:bg-emerald-900",
        };
    }
  };

  const gradedCrops = crops.filter((crop) => crop.ldd_data_available || crop.is_masked_out);
  const cropGroupCount = new Set(
    crops.map((crop) =>
      crop.id === "arabica_coffee" || crop.id === "robusta_coffee"
        ? "coffee"
        : crop.id
    )
  ).size;
  const s1Count = gradedCrops.filter((c) => c.fao_class === "S1").length;
  const s2Count = gradedCrops.filter((c) => c.fao_class === "S2").length;
  const s3Count = gradedCrops.filter((c) => c.fao_class === "S3").length;
  const nCount = gradedCrops.filter((c) => c.fao_class === "N").length;

  return (
    <div className="flex flex-col gap-8">
      {/* ── Top Summary Banner ──────────────────── */}
      <div className="bg-white border border-[#E5E0D5] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-800 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 22V12" /><path d="M5 12H2a10 10 0 0 0 20 0h-3" /><path d="M12 12C12 6 7 3 7 3s0 5 5 9" />
              </svg>
              การจำแนกตามเกณฑ์ FAO
            </span>
            <span className="text-xs text-[#5D7060]">• เปรียบเทียบปัจจัยพื้นที่กับช่วงเกณฑ์พืช</span>
          </div>
          <h2 className="font-heading font-black text-xl md:text-2xl text-[#142B18]">
            พืชเศรษฐกิจสำหรับแปลงนี้ ({cropGroupCount} กลุ่มพืช)
          </h2>
          <p className="text-xs text-[#5D7060]">
            เกรด S1–N คำนวณจากเกณฑ์ FAO ของพืชแต่ละชนิด; ระบบตรวจน้ำและสิ่งปลูกสร้างจากข้อมูลภูมิสารสนเทศในสภาพปัจจุบัน
          </p>
        </div>

        {/* FAO Class Counter Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedFaoClass("ALL")}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              selectedFaoClass === "ALL"
                ? "bg-emerald-900 text-white border-emerald-950 shadow-xs"
                : "bg-white text-[#142B18] border-[#D5CEBF] hover:border-emerald-600"
            }`}
          >
            ทั้งหมด ({cropGroupCount} กลุ่มพืช)
          </button>
          <button
            onClick={() => setSelectedFaoClass("S1")}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              selectedFaoClass === "S1"
                ? "bg-emerald-700 text-white border-emerald-800 shadow-xs"
                : "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
            }`}
          >
            เหมาะสมมาก S1 ({s1Count})
          </button>
          <button
            onClick={() => setSelectedFaoClass("S2")}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              selectedFaoClass === "S2"
                ? "bg-amber-700 text-white border-amber-800 shadow-xs"
                : "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
            }`}
          >
            ปานกลาง S2 ({s2Count})
          </button>
          <button
            onClick={() => setSelectedFaoClass("S3")}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              selectedFaoClass === "S3"
                ? "bg-orange-700 text-white border-orange-800 shadow-xs"
                : "bg-orange-50 text-orange-800 border-orange-300 hover:bg-orange-100"
            }`}
          >
            มีข้อจำกัด S3 ({s3Count})
          </button>
          {nCount > 0 && (
            <button
              onClick={() => setSelectedFaoClass("N")}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                selectedFaoClass === "N"
                  ? "bg-rose-700 text-white border-rose-800 shadow-xs"
                  : "bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100"
              }`}
            >
              ไม่แนะนำ N ({nCount})
            </button>
          )}
        </div>
      </div>

      {/* ── Urban / Built-up Land Special Guidance ── */}
      {analysis.soil_group?.groupId === 99 && (
        <div className="bg-amber-500/10 border border-amber-500/40 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-4">
            <span className="text-3xl p-2.5 bg-white border border-amber-300 rounded-2xl shadow-inner">🏢</span>
            <div className="flex flex-col gap-1">
              <h3 className="font-heading font-bold text-base text-amber-950">
                คำแนะนำพิเศษ: พื้นที่สิ่งปลูกสร้าง / อาคารและหลังคาคอนกรีต
              </h3>
              <p className="text-xs text-[#4E4432] leading-relaxed max-w-2xl">
                เนื่องจากพื้นผิวถูกปิดทับด้วยหลังคา/คอนกรีต ไม่มีหน้าดินสำหรับการเพาะปลูกลงดิน จึงจัดอยู่ใน <strong>เกรด N (ไม่แนะนำสำหรับการปลูกลงดิน)</strong> หากต้องการทำเกษตร แนะนำเป็นการทำสวนผักดาดฟ้า (Rooftop Garden), ปลูกผักสวนครัวในกระถาง, หรือระบบไฮโดรโปนิกส์ (Urban Farming)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Category Filter Tabs ────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#E5E0D5]">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? "bg-emerald-900 text-white shadow-xs"
                : "bg-white text-[#4A5D4E] border border-[#E5E0D5] hover:border-emerald-600 hover:text-emerald-900"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Crops Grid ──────────────────────────── */}
      {filteredCrops.length === 0 ? (
        <div className="bg-white border border-[#E5E0D5] rounded-3xl p-16 text-center flex flex-col items-center gap-4 shadow-2xs">
          <span className="text-5xl">🔍</span>
          <h3 className="font-heading font-bold text-lg text-[#142B18]">
            ไม่พบรายการพืชในหมวดหมู่นี้
          </h3>
          <p className="text-xs text-[#5D7060]">
            ลองปรับเปลี่ยนตัวกรองระดับความเหมาะสมหรือเลือกดูหมวดหมู่อื่น
          </p>
          <button
            onClick={() => {
              setSelectedCategory("ทั้งหมด");
              setSelectedFaoClass("ALL");
            }}
            className="mt-2 px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-colors"
          >
            แสดงพืชทั้งหมด (13 ชนิด)
          </button>
        </div>
      ) : (
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-3 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:overflow-visible">
          {filteredCrops.map((crop) => {
            const hasLddGrade = Boolean(crop.ldd_data_available || crop.is_masked_out);
            const badgeStyle = hasLddGrade ? getFaoBadgeStyle(crop.fao_class) : "bg-slate-600 text-white border-slate-700 shadow-2xs";
            const cardTheme = hasLddGrade ? getCropCardStyle(crop.fao_class) : {
              cardBg: "bg-slate-50 border-slate-200 text-slate-800",
              specBg: "bg-slate-100 border-slate-200",
              badgeClass: "ไม่มีข้อมูลเกณฑ์",
              btnStyle: "bg-slate-700 text-white hover:bg-slate-800 shadow-2xs",
            };

            return (
              <div
                key={crop.id}
                className={`min-w-[82vw] snap-start border rounded-3xl p-6 flex flex-col justify-between gap-5 transition-all duration-300 shadow-2xs hover:shadow-lg hover:-translate-y-1 md:min-w-0 ${cardTheme.cardBg}`}
              >
                <div className="flex flex-col gap-4">
                  {/* Header with Emoji & FAO Badge */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl bg-white/90 backdrop-blur-xs border border-white/80 rounded-2xl p-2.5 shadow-2xs">
                        {crop.icon_emoji}
                      </span>
                      <div>
                        <h3 className="font-heading font-bold text-base text-[#142B18]">
                          {crop.name}
                        </h3>
                        <span className="text-xs text-[#5D7060] font-medium">
                          {crop.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${badgeStyle}`}>
                        {hasLddGrade ? `เกรด ${crop.fao_class}` : "ไม่มีข้อมูลเกณฑ์"}
                      </span>
                      <span className="text-[11px] font-bold opacity-90">
                        {cardTheme.badgeClass}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs leading-relaxed font-normal opacity-90">
                    {crop.description}
                  </p>

                  {/* Limiting Factors / Constraint Warning */}
                  {crop.limiting_factors && crop.limiting_factors.length > 0 && (
                    <div className="bg-amber-500/15 border border-amber-500/30 rounded-2xl p-3.5 flex flex-col gap-1 text-[11px] text-amber-950">
                      <span className="font-bold flex items-center gap-1 text-amber-900">
                        ⚠️ ข้อจำกัด / ปัจจัยจำกัด:
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-[11px] leading-relaxed">
                        {crop.limiting_factors.slice(0, 2).map((factor, idx) => (
                          <li key={idx}>{factor}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Quick specs */}
                  <div className={`border rounded-2xl p-3.5 grid grid-cols-2 gap-2 text-xs backdrop-blur-xs ${cardTheme.specBg}`}>
                    <div>
                      <span className="text-[10px] text-slate-500 block font-medium">
                        ระยะเวลาเก็บเกี่ยว
                      </span>
                      <span className="font-bold text-[#142B18]">
                        {crop.growth_duration}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block font-medium">
                        ความต้องการน้ำ
                      </span>
                      <span className="font-bold text-[#142B18]">
                        {crop.water_requirement}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block font-medium">
                        ผลผลิตเฉลี่ย
                      </span>
                      <span className="font-bold text-[#142B18]">
                        {crop.estimated_yield}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block font-medium">
                        ฤดูกาลที่เหมาะสม
                      </span>
                      <span className="font-bold text-[#142B18]">
                        {crop.best_season}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <Link
                  href={`/crops/${crop.id}?analysisId=${analysis.id}`}
                  className={`w-full py-3 font-bold text-xs rounded-xl text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${cardTheme.btnStyle}`}
                >
                  <span>ดูเกณฑ์ FAO และคู่มือการจัดการแปลง</span>
                  <span>→</span>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
