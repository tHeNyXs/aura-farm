import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CROP_DATABASE } from "@/app/lib/crop-database";
import Navbar from "@/app/components/ui/navbar";
import Footer from "@/app/components/ui/footer";

import CropBackButton from "../components/crop-back-button";

interface PageProps {
  params: Promise<{ cropId: string }>;
  searchParams?: Promise<{ analysisId?: string }>;
}

function findCrop(cropId: string) {
  const dbCrop = CROP_DATABASE.find((c) => c.id === cropId);
  if (dbCrop) {
    return {
      ...dbCrop,
      pros: dbCrop.pros_template,
      cautions: dbCrop.cautions_template,
    };
  }
  return null;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { cropId } = await params;
  const crop = findCrop(cropId);
  return {
    title: crop ? `${crop.name} — คู่มือการเพาะปลูกและเกณฑ์ FAO | Aura Farm` : "รายละเอียดพืช",
    description: crop?.description,
  };
}

export default async function CropDetailPage({ params, searchParams }: PageProps) {
  const { cropId } = await params;
  const sp = searchParams ? await searchParams : {};
  const analysisId = sp.analysisId;
  const crop = findCrop(cropId);

  if (!crop) {
    notFound();
  }

  const crit = crop.ldd_criteria;

  return (
    <div className="aura-crop-page flex flex-col min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 md:px-8 py-10 flex flex-col gap-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold">
          <CropBackButton analysisId={analysisId} className="hover:underline flex items-center gap-1 cursor-pointer">
            <span>←</span>
            <span>กลับหน้าผลการวิเคราะห์</span>
          </CropBackButton>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500 font-medium">คู่มือการเพาะปลูกและเกณฑ์ FAO</span>
          <span className="text-slate-300">•</span>
          <span className="text-emerald-900 font-bold">{crop.name}</span>
        </div>

        {/* Hero Header */}
        <div className="bg-white border border-[#E5E0D5] rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-5">
            <span className="text-5xl bg-[#F7F4EC] border border-[#E5E0D5] rounded-2xl p-4 shadow-inner">
              {crop.icon_emoji}
            </span>
            <div className="flex flex-col gap-1.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>{crop.category}</span>
              </span>
              <h1 className="font-heading font-black text-2xl md:text-3xl text-[#142B18]">
                {crop.name}
              </h1>
              <p className="text-xs md:text-sm text-[#4A5D4E] max-w-xl leading-relaxed">
                {crop.description}
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white p-5 rounded-2xl text-center flex flex-col items-center shrink-0 shadow-sm border border-emerald-700/40">
            <span className="text-[11px] text-emerald-200 font-medium">มาตรฐานอ้างอิง</span>
            <span className="font-heading font-black text-lg text-amber-300 mt-0.5 tracking-tight">
              FAO (เกณฑ์พืช)
            </span>
            <span className="text-[10px] text-emerald-300/80 mt-0.5">เกณฑ์ที่ใช้ในระบบ</span>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-[#E5E0D5] rounded-2xl p-4 flex flex-col gap-1 shadow-2xs hover:border-emerald-500 transition-colors">
            <span className="text-[11px] text-[#5D7060] font-medium">
              ระยะเวลาเก็บเกี่ยว
            </span>
            <span className="font-heading font-bold text-base text-[#142B18]">
              {crop.growth_duration}
            </span>
          </div>

          <div className="bg-white border border-[#E5E0D5] rounded-2xl p-4 flex flex-col gap-1 shadow-2xs hover:border-emerald-500 transition-colors">
            <span className="text-[11px] text-[#5D7060] font-medium">
              ความต้องการน้ำ
            </span>
            <span className="font-heading font-bold text-base text-[#142B18]">
              {crop.water_requirement}
            </span>
          </div>

          <div className="bg-white border border-[#E5E0D5] rounded-2xl p-4 flex flex-col gap-1 shadow-2xs hover:border-emerald-500 transition-colors">
            <span className="text-[11px] text-[#5D7060] font-medium">
              ผลผลิตเฉลี่ย
            </span>
            <span className="font-heading font-bold text-base text-[#142B18]">
              {crop.estimated_yield}
            </span>
          </div>

          <div className="bg-white border border-[#E5E0D5] rounded-2xl p-4 flex flex-col gap-1 shadow-2xs hover:border-emerald-500 transition-colors">
            <span className="text-[11px] text-[#5D7060] font-medium">
              อุณหภูมิที่เหมาะสม
            </span>
            <span className="font-heading font-bold text-base text-[#142B18]">
              {crop.ideal_temperature_range}
            </span>
          </div>
        </div>

        {/* ── FAO criteria table ── */}
        {crit && (
          <div className="bg-white border border-[#E5E0D5] rounded-3xl p-6 md:p-8 flex flex-col gap-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E5E0D5]">
              <div>
                <h3 className="font-heading font-bold text-lg text-[#142B18] flex items-center gap-2">
                  <span>📋</span>
                  <span>ตารางเกณฑ์ความต้องการพืชตาม FAO</span>
                </h3>
                <p className="text-xs text-[#5D7060] mt-0.5">
                  ช่วงค่าทางกายภาพที่ใช้ตัดสินชั้นความเหมาะสม S1, S2, S3 และ N ด้วยวิธีปัจจัยจำกัดสูงสุด
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/70 border border-emerald-300 px-3 py-1 rounded-full w-fit">
                {crop.source_citation}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-[#5D7060]">
                    <th className="py-2.5 font-bold">ปัจจัยที่ตรวจวัด</th>
                    <th className="py-2.5 font-bold text-emerald-800">S1 (เหมาะสมมาก)</th>
                    <th className="py-2.5 font-bold text-amber-800">S2 (เหมาะสมปานกลาง)</th>
                    <th className="py-2.5 font-bold text-orange-800">S3 (เหมาะสมน้อย)</th>
                    <th className="py-2.5 font-bold text-rose-800">N (ไม่เหมาะสม)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  <tr>
                    <td className="py-3 font-semibold text-[#142B18]">ความลาดชัน (Slope)</td>
                    <td className="py-3 text-emerald-800 font-mono">{crit.slope_deg.s1[0]} - {crit.slope_deg.s1[1]}°</td>
                    <td className="py-3 text-amber-800 font-mono">{crit.slope_deg.s2[0]} - {crit.slope_deg.s2[1]}°</td>
                    <td className="py-3 text-orange-800 font-mono">{crit.slope_deg.s3[0]} - {crit.slope_deg.s3[1]}°</td>
                    <td className="py-3 text-rose-800 font-mono">&gt; {crit.slope_deg.s3[1]}°</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-[#142B18]">ความเป็นกรด-ด่างดิน (pH)</td>
                    <td className="py-3 text-emerald-800 font-mono">{crit.soil_ph.s1[0]} - {crit.soil_ph.s1[1]}</td>
                    <td className="py-3 text-amber-800 font-mono">{crit.soil_ph.s2[0]} - {crit.soil_ph.s2[1]}</td>
                    <td className="py-3 text-orange-800 font-mono">{crit.soil_ph.s3[0]} - {crit.soil_ph.s3[1]}</td>
                    <td className="py-3 text-rose-800 font-mono">&lt; {crit.soil_ph.s3[0]} หรือ &gt; {crit.soil_ph.s3[1]}</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-[#142B18]">ความชื้นผิวดินเรดาร์</td>
                    <td className="py-3 text-emerald-800 font-mono">{crit.soil_moisture.s1[0]} - {crit.soil_moisture.s1[1]}%</td>
                    <td className="py-3 text-amber-800 font-mono">{crit.soil_moisture.s2[0]} - {crit.soil_moisture.s2[1]}%</td>
                    <td className="py-3 text-orange-800 font-mono">{crit.soil_moisture.s3[0]} - {crit.soil_moisture.s3[1]}%</td>
                    <td className="py-3 text-rose-800 font-mono">นอกเกณฑ์ S1-S3</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-[#142B18]">ปริมาณฝนสะสมรายปี</td>
                    <td className="py-3 text-emerald-800 font-mono">{crit.annual_rainfall.s1[0]} - {crit.annual_rainfall.s1[1]} มม.</td>
                    <td className="py-3 text-amber-800 font-mono">{crit.annual_rainfall.s2[0]} - {crit.annual_rainfall.s2[1]} มม.</td>
                    <td className="py-3 text-orange-800 font-mono">{crit.annual_rainfall.s3[0]} - {crit.annual_rainfall.s3[1]} มม.</td>
                    <td className="py-3 text-rose-800 font-mono">&lt; {crit.annual_rainfall.s3[0]} มม.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detailed Guidelines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pros */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-3xl p-6 flex flex-col gap-4 shadow-2xs">
            <h3 className="font-heading font-bold text-base text-emerald-950 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">✓</span>
              <span>จุดเด่นและปัจจัยที่เอื้ออำนวย</span>
            </h3>
            <ul className="flex flex-col gap-2.5 text-xs md:text-sm text-[#2C4A32]">
              {crop.pros.map((pro, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-700 font-bold">•</span>
                  <span>{pro}</span>
                </li>
              ))}
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold">•</span>
                <span>ตอบสนองดีต่อการจัดการดินและการใส่ปุ๋ยอินทรีย์ตามระยะเจริญเติบโต</span>
              </li>
            </ul>
          </div>

          {/* Cautions & Management */}
          <div className="bg-amber-50/60 border border-amber-200 rounded-3xl p-6 flex flex-col gap-4 shadow-2xs">
            <h3 className="font-heading font-bold text-base text-amber-950 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs">⚠️</span>
              <span>ข้อควรระวังและการจัดการแปลง</span>
            </h3>
            <ul className="flex flex-col gap-2.5 text-xs md:text-sm text-[#4E4432]">
              {crop.cautions.map((caution, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-700 font-bold">•</span>
                  <span>{caution}</span>
                </li>
              ))}
              <li className="flex items-start gap-2">
                <span className="text-amber-700 font-bold">•</span>
                <span>ตรวจวัดความชื้นหน้าดินสม่ำเสมอเพื่อวางแผนการให้น้ำอย่างมีประสิทธิภาพ</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Soil & Environment Summary */}
        <div className="bg-white border border-[#E5E0D5] rounded-3xl p-6 flex flex-col gap-3 shadow-2xs">
          <h3 className="font-heading font-bold text-base text-[#142B18] flex items-center gap-2">
            <span>🟤</span>
            <span>ลักษณะดินและสภาพแวดล้อมที่เหมาะสม</span>
          </h3>
          <p className="text-xs md:text-sm leading-relaxed text-[#4A5D4E] bg-[#F7F4EC] p-4 rounded-2xl border border-[#E5E0D5]">
            {crop.soil_preference} เหมาะกับการเพาะปลูกในฤดู {crop.best_season} โดยแนะนำให้เตรียมดินลึกและปรับค่าความเป็นกรด-ด่าง (pH) ให้เหมาะสมก่อนเริ่มปลูก
          </p>
        </div>

        {/* Back action */}
        <div className="flex justify-between items-center pt-2">
          <CropBackButton
            analysisId={analysisId}
            className="px-6 py-3 bg-white border border-[#D5CEBF] text-xs font-bold text-emerald-900 rounded-xl hover:bg-[#F7F4EC] transition-colors shadow-2xs flex items-center gap-2 cursor-pointer"
          >
            <span>←</span>
            <span>กลับไปหน้าผลการวิเคราะห์</span>
          </CropBackButton>
        </div>
      </main>

      <Footer />
    </div>
  );
}
