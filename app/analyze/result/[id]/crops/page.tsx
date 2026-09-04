import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAnalysisById } from "@/app/lib/analysis-store";
import Navbar from "@/app/components/ui/navbar";
import Footer from "@/app/components/ui/footer";
import CropsClient from "./crops-client";

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
    title: `พืชแนะนำสำหรับ: ${result.location_name} — Aura Farm`,
    description: "รายชื่อสายพันธุ์พืชที่เหมาะสมที่สุดตามผลการประเมินดาวเทียม 5 มิติและกรมพัฒนาที่ดิน",
  };
}

export default async function CropRecommendationsPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = searchParams ? await searchParams : {};
  let fallbackPoly: [number, number][] | undefined = undefined;
  if (sp.poly && typeof sp.poly === "string") {
    try {
      fallbackPoly = JSON.parse(decodeURIComponent(sp.poly));
    } catch {}
  }
  const storedAnalysis = await getAnalysisById(id, fallbackPoly);

  if (!storedAnalysis) {
    notFound();
  }
  const { result: analysis, rankedCrops } = storedAnalysis;

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFBF7] text-[#142B18]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 md:px-10 py-10 flex flex-col gap-8">
        {/* ── Top Header ──────────────────────────── */}
        <div className="flex flex-col gap-2.5 pb-6 border-b border-[#E5E0D5]">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
            <Link href={`/analyze/result/${id}${sp.poly ? `?poly=${sp.poly}` : ""}`} className="hover:underline flex items-center gap-1">
              <span>←</span>
              <span>กลับไปยังรายงานผลวิเคราะห์ที่ดิน</span>
            </Link>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-medium">การประเมินความเหมาะสม 13 พืชจาก LDD Zoning</span>
          </div>
          <h1 className="font-heading font-black text-2xl md:text-4xl text-[#142B18] tracking-tight">
            รายชื่อพืชแนะนำสำหรับ {analysis.location_name}
          </h1>
          <p className="text-xs sm:text-sm text-[#4A5D4E] leading-relaxed">
            เกรดพืชอ้างอิงจาก <strong>เขตความเหมาะสมของที่ดิน LDD Zoning</strong> สำหรับ 13 พืช และใช้ข้อมูลดาวเทียมเพียงเพื่อตัดพื้นที่น้ำหรือสิ่งปลูกสร้างในสภาพปัจจุบัน หาก LDD ไม่ครอบคลุม ระบบจะไม่จัดเกรด
          </p>
        </div>

        {/* ── Client Filtering & Crops Grid ──────── */}
        <CropsClient analysis={analysis} crops={rankedCrops} />
      </main>

      <Footer />
    </div>
  );
}
