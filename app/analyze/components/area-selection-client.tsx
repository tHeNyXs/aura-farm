"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DrawingTool } from "./satellite-map";
import { SavedParcelItem } from "@/app/analyze/result/[id]/components/save-parcel-button";

// Maximum allowable area size in Rai for optimal satellite resolution
const MAX_ALLOWED_RAI = 200;
const RECOMMENDED_MAX_RAI = 80;

// Dynamically import map component with SSR disabled to prevent Leaflet window errors
const SatelliteMap = dynamic(() => import("./satellite-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#1a2419] text-line gap-3">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      <span className="font-mono text-xs uppercase tracking-wider text-accent">
        กำลังโหลดแผนที่ดาวเทียมความละเอียดสูง...
      </span>
    </div>
  ),
});

const AI_ANALYZING_STEPS = [
  "🛰️ กำลังเชื่อมต่อข้อมูลดาวเทียม Sentinel-2...",
  "🌿 วิเคราะห์สเปกตรัมสะท้อนแสงเพื่อคำนวณดัชนีพืชพรรณ (NDVI)...",
  "💧 ประเมินระดับความชื้นในดิน (SAR Soil Moisture) และการอุ้มน้ำ...",
  "⛰️ คำนวณความลาดชันและการระบายน้ำจากแบบจำลอง DEM...",
  "🤖 AI กำลังคำนวณคะแนนและจับคู่พืชเศรษฐกิจที่เหมาะสม...",
];

export default function AreaSelectionClient() {
  const router = useRouter();

  // Tab State: "draw" (Default) | "saved"
  const [activeTab, setActiveTab] = useState<"draw" | "saved">("draw");

  // Polygon & Area State
  const [activePolygon, setActivePolygon] = useState<[number, number][] | null>(null);
  const [areaRai, setAreaRai] = useState<number>(0);
  const [areaHa, setAreaHa] = useState<number>(0);
  const [flyToCoords, setFlyToCoords] = useState<{
    lat: number;
    lng: number;
    zoom?: number;
  } | null>(null);

  // Drawing Tool State (Default to 'polygon')
  const [activeTool, setActiveTool] = useState<DrawingTool>("polygon");

  // Saved Parcels State from LocalStorage
  const [savedParcels, setSavedParcels] = useState<SavedParcelItem[]>([]);

  // AI Processing State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingStepIndex, setAnalyzingStepIndex] = useState(0);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Load saved parcels from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("aura_farm_saved_parcels");
      if (stored) {
        setSavedParcels(JSON.parse(stored));
      }
    } catch {
      // LocalStorage access fallback
    }
  }, []);

  // Handle selecting a saved parcel
  const handleSelectSavedParcel = (parcel: SavedParcelItem) => {
    if (parcel.polygon && parcel.polygon.length >= 3) {
      setActivePolygon(parcel.polygon);
      setAreaRai(parcel.area_rai);
      setAreaHa(parcel.area_ha);
      setFlyToCoords({ lat: parcel.lat, lng: parcel.lng, zoom: 16 });
      setActiveTool("none");
    }
  };

  // Handle deleting a saved parcel
  const handleDeleteSavedParcel = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const updated = savedParcels.filter((p) => p.id !== id);
      setSavedParcels(updated);
      localStorage.setItem("aura_farm_saved_parcels", JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  // Handle custom drawing updates from Leaflet map
  const handlePolygonChange = (
    coords: [number, number][],
    rai: number,
    ha: number
  ) => {
    setActivePolygon(coords);
    setAreaRai(rai);
    setAreaHa(ha);
  };

  // Handle clearing polygon
  const handleClearPolygon = () => {
    setActivePolygon(null);
    setAreaRai(0);
    setAreaHa(0);
    setActiveTool("polygon");
  };

  // Handle click "วิเคราะห์พื้นที่นี้" with AI Analysis Engine
  const handleAnalyzeClick = async () => {
    if (!activePolygon || activePolygon.length < 3) {
      alert("กรุณาวาดแปลงที่ดินบนแผนที่ก่อนเริ่มการวิเคราะห์");
      return;
    }

    if (areaRai > MAX_ALLOWED_RAI) {
      alert(
        `ขนาดแปลงที่ดินของคุณอยู่ที่ ${areaRai} ไร่ ซึ่งเกินขีดจำกัดสูงสุด (${MAX_ALLOWED_RAI} ไร่)\n\nเพื่อความแม่นยำในการวิเคราะห์สภาพดินและความลาดชัน กรุณากดปุ่ม "ล้างแปลงที่วาด" เพื่อวาดใหม่ หรือแบ่งเป็นแปลงย่อย`
      );
      return;
    }

    setIsAnalyzing(true);
    setAnalyzingStepIndex(0);

    // Step-by-step progress animation
    const stepInterval = setInterval(() => {
      setAnalyzingStepIndex((prev) => {
        if (prev < AI_ANALYZING_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 550);

    try {
      const freshId = `survey-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          polygon: activePolygon,
          custom_id: freshId,
        }),
      });

      const data = await response.json();
      clearInterval(stepInterval);

      if (data.success && data.analysis_id) {
        const polyParam = encodeURIComponent(JSON.stringify(activePolygon));
        setTimeout(() => {
          router.push(`/analyze/result/${data.analysis_id}?poly=${polyParam}`);
        }, 400);
      } else {
        alert(data.error || "เกิดข้อผิดพลาดในการวิเคราะห์พื้นที่");
        setIsAnalyzing(false);
      }
    } catch (error) {
      clearInterval(stepInterval);
      console.error("Analysis Request Error:", error);
      alert("ไม่สามารถเชื่อมต่อระบบ AI วิเคราะห์พื้นที่ได้");
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-bg">
      {/* ═══════════════════════════════════════════
          HEADER
         ═══════════════════════════════════════════ */}
      <header className="h-16 bg-panel border-b border-line px-4 sm:px-6 lg:px-8 flex items-center justify-between z-30 shrink-0">
        {/* Logo Group */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <ellipse
                cx="12"
                cy="12"
                rx="11"
                ry="4.5"
                stroke="#37523A"
                strokeWidth="1.2"
              />
              <circle cx="12" cy="12" r="4" fill="#37523A" />
              <circle cx="18" cy="8" r="3" fill="#B4841F" />
            </svg>
          </div>
          <span className="font-heading font-bold text-xl text-primary-dark">
            Aura Farm
          </span>
        </Link>

        {/* Mode Indicator */}
        <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-primary">
          <span className="w-2 h-2 rounded-full bg-accent pulse-dot-anim" />
          <span>ระบบดาวเทียม Sentinel-2 ความละเอียดสูง (10m)</span>
        </div>

        {/* Action Button: กลับหน้าหลัก */}
        <Link
          href="/"
          className="px-3.5 py-1.5 bg-panel border border-line rounded-md text-xs font-semibold text-primary hover:bg-bg transition-colors flex items-center gap-1.5"
        >
          <span>←</span>
          <span>กลับหน้าหลัก</span>
        </Link>
      </header>

      {/* ═══════════════════════════════════════════
          SPLIT CONTAINER: SIDEBAR + SATELLITE MAP
         ═══════════════════════════════════════════ */}
      <div className="flex flex-col lg:flex-row flex-1 w-full relative overflow-hidden h-[calc(100vh-64px)] lg:h-auto">
        {/* ── Left Sidebar (380px) ───────────────── */}
        <aside className={`absolute lg:relative inset-0 lg:inset-auto lg:w-[380px] bg-panel lg:border-r border-line flex-col shrink-0 z-[2000] lg:z-20 overflow-y-auto ${isMobileSidebarOpen ? "flex" : "hidden lg:flex"}`}>
          {/* Mobile Close Button */}
          <button 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="lg:hidden absolute top-2 right-2 z-50 w-8 h-8 flex items-center justify-center bg-bg border border-line rounded-full text-ink-body hover:text-red-500 shadow-sm"
          >
            ?
          </button>
          {/* Tabs Row */}
          <div className="h-12 border-b border-line flex items-center shrink-0">
            <button
              onClick={() => {
                setActiveTab("draw");
                setActiveTool("polygon");
              }}
              className={`flex-1 h-full flex items-center justify-center text-xs font-bold transition-colors border-r border-line cursor-pointer ${
                activeTab === "draw"
                  ? "bg-bg text-primary border-b-2 border-b-primary"
                  : "bg-panel text-ink-body hover:bg-bg/50"
              }`}
            >
              ✏️ วาดแปลงที่ดิน
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`flex-1 h-full flex items-center justify-center text-xs font-bold transition-colors cursor-pointer ${
                activeTab === "saved"
                  ? "bg-bg text-primary border-b-2 border-b-primary"
                  : "bg-panel text-ink-body hover:bg-bg/50"
              }`}
            >
              💾 แปลงที่บันทึกไว้ ({savedParcels.length})
            </button>
          </div>

          {/* Tab 1: วาดแปลงที่ดิน (Draw Tab - Default) */}
          {activeTab === "draw" && (
            <div className="p-5 flex flex-col gap-5 flex-1">
              <div className="flex flex-col gap-1.5">
                <h3 className="font-heading font-bold text-base text-primary-dark">
                  เลือกเครื่องมือวาดแปลง
                </h3>
                <p className="text-xs text-ink-body leading-relaxed">
                  คลิกบนแผนที่อย่างน้อย 3 จุดเพื่อปิดล้อมแนวเขตแปลง หรือวาดสี่เหลี่ยม จากนั้นสามารถ<strong>คลิกลากที่จุดมุมสีทอง</strong>เพื่อปรับขนาดได้
                </p>
              </div>

              {/* Drawing options buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setActiveTool("polygon")}
                  className={`p-2.5 border rounded-md text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeTool === "polygon"
                      ? "bg-primary text-bg border-primary shadow-xs"
                      : "bg-bg border-line text-primary hover:border-primary"
                  }`}
                >
                  <span>⬡</span>
                  <span>วาดหลายเหลี่ยม (จุด)</span>
                </button>

                <button
                  onClick={() => setActiveTool("rectangle")}
                  className={`p-2.5 border rounded-md text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeTool === "rectangle"
                      ? "bg-primary text-bg border-primary shadow-xs"
                      : "bg-bg border-line text-primary hover:border-primary"
                  }`}
                >
                  <span>▢</span>
                  <span>วาดกรอบสี่เหลี่ยม</span>
                </button>
              </div>

              {/* Status summary */}
              <div
                className={`border rounded-lg p-4 flex flex-col gap-3 transition-colors ${
                  areaRai > MAX_ALLOWED_RAI
                    ? "bg-red-50/80 border-red-300"
                    : "bg-bg border-line"
                }`}
              >
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <span className="text-xs text-primary font-bold">
                    สถานะแปลง
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      areaRai > MAX_ALLOWED_RAI
                        ? "bg-red-200 text-red-900 border border-red-300"
                        : activePolygon && activePolygon.length >= 3
                        ? "bg-[#EBF5EB] text-[#22543D] border border-[#A3D9A5]"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {areaRai > MAX_ALLOWED_RAI
                      ? `⚠️ เกิน ${MAX_ALLOWED_RAI} ไร่`
                      : activePolygon && activePolygon.length >= 3
                      ? "พร้อมวิเคราะห์"
                      : "รอการวาดบนแผนที่"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-ink-soft">ขนาดพื้นที่คำนวณ:</span>
                  <span
                    className={`font-heading font-bold text-base ${
                      areaRai > MAX_ALLOWED_RAI
                        ? "text-red-700"
                        : "text-primary-dark"
                    }`}
                  >
                    {areaRai > 0
                      ? `${areaRai} ไร่ (${areaHa} ha)`
                      : "0.0 ไร่"}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-ink-soft">จำนวนจุดมุม (Vertices):</span>
                  <span className="font-semibold text-primary">
                    {activePolygon ? activePolygon.length : 0} จุด
                  </span>
                </div>

                {/* Exceeded Warning Banner */}
                {areaRai > MAX_ALLOWED_RAI && (
                  <div className="mt-1 p-2.5 bg-red-100 border border-red-300 rounded text-xs text-red-900 flex flex-col gap-1 leading-relaxed">
                    <span className="font-bold">⚠️ ขนาดแปลงเกินเกณฑ์สูงสุด:</span>
                    <span>
                      แปลงมีขนาด <strong>{areaRai} ไร่</strong> (จำกัดสูงสุด <strong>{MAX_ALLOWED_RAI} ไร่</strong>) กรุณากดปุ่มล้างแปลงแล้ววาดใหม่ หรือแบ่งเป็นแปลงย่อย
                    </span>
                  </div>
                )}
              </div>

              {/* Area Size Guidelines Box */}
              <div className="bg-bg border border-line rounded-lg p-3.5 flex flex-col gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-primary-dark font-bold">
                  <span>📏</span>
                  <span>เกณฑ์ขนาดแปลงเพื่อความแม่นยำสูงสุด:</span>
                </div>
                <div className="flex flex-col gap-1 text-[11px] text-ink-body">
                  <div className="flex items-start gap-1.5">
                    <span className="text-done font-bold">🎯 แนะนำ:</span>
                    <span><strong>2 – {RECOMMENDED_MAX_RAI} ไร่</strong> (ความแม่นยำระดับพิกเซลดาวเทียมสูงสุด)</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-amber-700 font-bold">⚠️ จำกัดสูงสุด:</span>
                    <span>ไม่เกิน <strong>{MAX_ALLOWED_RAI} ไร่</strong> ต่อ 1 การวิเคราะห์</span>
                  </div>
                </div>
              </div>

              {/* Clear Button */}
              {activePolygon && (
                <button
                  onClick={handleClearPolygon}
                  className="px-4 py-2 border border-red-200 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors self-start cursor-pointer flex items-center gap-1.5"
                >
                  <span>🗑️</span>
                  <span>ล้างแปลงที่วาด (วาดใหม่)</span>
                </button>
              )}
            </div>
          )}

          {/* Tab 2: แปลงที่บันทึกไว้ (Saved Parcels Tab) */}
          {activeTab === "saved" && (
            <div className="p-5 flex flex-col gap-4 flex-1">
              <div className="flex flex-col gap-1">
                <h3 className="font-heading font-bold text-sm text-primary-dark">
                  รายการแปลงที่ดินที่บันทึกไว้
                </h3>
                <p className="text-xs text-ink-soft">
                  คลิกที่แปลงเพื่อโหลดแนวเขตขึ้นบนแผนที่ดาวเทียมทันที
                </p>
              </div>

              {savedParcels.length === 0 ? (
                <div className="bg-bg border border-dashed border-line rounded-lg p-8 text-center flex flex-col items-center gap-2 text-ink-soft my-auto">
                  <span className="text-3xl">📂</span>
                  <span className="text-xs font-semibold text-primary-dark">
                    ยังไม่มีแปลงที่ดินที่บันทึกไว้
                  </span>
                  <span className="text-[11px]">
                    เมื่อคุณวาดและวิเคราะห์แปลงเสร็จแล้ว สามารถกดปุ่ม <strong>"💾 บันทึกแปลงนี้"</strong> ในหน้ารายงานได้ครับ
                  </span>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {savedParcels.map((parcel) => (
                    <div
                      key={parcel.id}
                      onClick={() => handleSelectSavedParcel(parcel)}
                      className="p-3.5 bg-bg border border-line hover:border-primary rounded-lg text-left transition-all flex items-center justify-between cursor-pointer group shadow-xs"
                    >
                      <div className="flex flex-col gap-0.5 flex-1 pr-2">
                        <span className="font-bold text-sm text-primary-dark group-hover:text-primary">
                          {parcel.name}
                        </span>
                        <span className="text-[11px] text-ink-soft">
                          {parcel.saved_at} • {parcel.area_rai} ไร่
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                          {parcel.area_rai} ไร่
                        </span>
                        <button
                          onClick={(e) => handleDeleteSavedParcel(e, parcel.id)}
                          title="ลบแปลงนี้"
                          className="text-slate-400 hover:text-red-700 p-1 text-xs transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </aside>

        {/* ── Main Map Area ───────────────────────── */}
        <main className="flex-1 relative h-[550px] lg:h-[calc(100vh-64px)] w-full overflow-hidden">
          <SatelliteMap
            tool={activeTool}
            onToolChange={setActiveTool}
            selectedPolygon={activePolygon}
            onPolygonChange={handlePolygonChange}
            flyToCoords={flyToCoords}
          />

          {/* ═══════════════════════════════════════════
              DRAWING TOOLBAR (Top-Left on Map)
             ═══════════════════════════════════════════ */}
          <div className="absolute top-5 left-5 z-[1000] bg-panel/95 backdrop-blur-sm border border-line rounded-lg p-1.5 flex items-center gap-1.5 shadow-md">
            <button
              onClick={() =>
                setActiveTool(activeTool === "polygon" ? "none" : "polygon")
              }
              title="วาดรูปหลายเหลี่ยม (Polygon)"
              className={`px-2.5 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTool === "polygon"
                  ? "bg-primary text-bg shadow-xs"
                  : "bg-transparent text-primary hover:bg-bg"
              }`}
            >
              <span>⬡</span>
              <span>วาดหลายเหลี่ยม</span>
            </button>

            <button
              onClick={() =>
                setActiveTool(activeTool === "rectangle" ? "none" : "rectangle")
              }
              title="วาดสี่เหลี่ยม (Rectangle)"
              className={`px-2.5 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTool === "rectangle"
                  ? "bg-primary text-bg shadow-xs"
                  : "bg-transparent text-primary hover:bg-bg"
              }`}
            >
              <span>▢</span>
              <span>วาดสี่เหลี่ยม</span>
            </button>

            <span className="w-px h-4 bg-line mx-0.5" />

            <button
              onClick={handleClearPolygon}
              title="ลบแปลงที่วาด (วาดใหม่)"
              className="p-1.5 rounded-md text-ink-soft hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer text-xs"
            >
              🗑️ ล้าง
            </button>
          </div>

          {/* ═══════════════════════════════════════════
              FLOATING AREA BADGE
             ═══════════════════════════════════════════ */}
          {areaRai > 0 && (
            <div
              className={`absolute top-18 left-5 z-[1000] border rounded-lg px-3.5 py-2 flex items-center gap-2.5 shadow-lg animate-fade-in ${
                areaRai > MAX_ALLOWED_RAI
                  ? "bg-red-950 border-red-500 text-red-100"
                  : "bg-primary-dark/95 backdrop-blur-sm border-primary/30 text-bg"
              }`}
            >
              <span className="text-sm">🌾</span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-heading font-bold text-base">
                  {areaRai}
                </span>
                <span className="text-xs opacity-90">
                  ไร่ ({areaHa} ha)
                </span>
              </div>

              {areaRai > MAX_ALLOWED_RAI && (
                <span className="px-2 py-0.5 rounded bg-red-800 text-red-100 text-[10px] font-bold">
                  เกิน {MAX_ALLOWED_RAI} ไร่
                </span>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════
              ACTION FLOATING BAR (Bottom Right on Map)
             ═══════════════════════════════════════════ */}
          <div className="absolute bottom-5 left-5 right-5 md:left-auto md:right-5 z-[1000] bg-panel/95 backdrop-blur-sm border border-line rounded-lg p-3 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xl">
            <div className="flex flex-col text-center md:text-left">
              <span
                className={`font-bold text-sm ${
                  areaRai > MAX_ALLOWED_RAI ? "text-red-700" : "text-primary-dark"
                }`}
              >
                {areaRai > MAX_ALLOWED_RAI
                  ? `⚠️ ขนาดแปลงเกินเกณฑ์ (${areaRai} > ${MAX_ALLOWED_RAI} ไร่)`
                  : areaRai > 0
                  ? `พร้อมวิเคราะห์แปลง (${areaRai} ไร่)`
                  : "คลิกบนแผนที่เพื่อเริ่มวาดแปลง"}
              </span>
              <span className="text-[11px] text-ink-soft">
                {areaRai > MAX_ALLOWED_RAI
                  ? "กรุณาล้างเพื่อวาดใหม่ หรือแบ่งเป็นแปลงย่อย"
                  : "ดาวเทียม Sentinel-1/2 & แบบจำลองดิน LDD"}
              </span>
            </div>

            <button
              onClick={handleAnalyzeClick}
              disabled={
                isAnalyzing ||
                !activePolygon ||
                activePolygon.length < 3 ||
                areaRai > MAX_ALLOWED_RAI
              }
              className={`w-full md:w-auto px-6 py-2.5 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
                areaRai > MAX_ALLOWED_RAI
                  ? "bg-red-100 text-red-500 border border-red-200 cursor-not-allowed opacity-60"
                  : "bg-primary text-bg hover:bg-primary-dark disabled:opacity-50"
              }`}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin" />
                  <span>กำลังวิเคราะห์...</span>
                </>
              ) : areaRai > MAX_ALLOWED_RAI ? (
                "ขนาดเกินเกณฑ์ (วาดใหม่)"
              ) : (
                "วิเคราะห์พื้นที่นี้ →"
              )}
            </button>
          </div>
        </main>
      </div>

      {/* ═══════════════════════════════════════════
          AI SCANNING & ANALYSIS MODAL OVERLAY
         ═══════════════════════════════════════════ */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-[9999] bg-primary-dark/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-panel border-2 border-primary rounded-xl max-w-md w-full p-8 flex flex-col items-center gap-6 shadow-2xl animate-fade-in">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-accent animate-spin" />
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
                <span className="text-2xl animate-pulse">🛰️</span>
              </div>
            </div>

            <div className="flex flex-col items-center text-center gap-1.5">
              <span className="text-xs uppercase text-accent font-bold tracking-wider">
                Aura Farm AI Engine
              </span>
              <h3 className="font-heading font-bold text-2xl text-primary-dark">
                กำลังวิเคราะห์ศักยภาพแปลงที่ดิน
              </h3>
            </div>

            <div className="w-full bg-bg border border-line rounded-lg p-4 text-center">
              <p className="text-xs font-semibold text-primary-dark min-h-[40px] flex items-center justify-center transition-all">
                {AI_ANALYZING_STEPS[analyzingStepIndex]}
              </p>
            </div>

            <div className="w-full flex flex-col gap-1.5">
              <div className="w-full h-2 bg-line/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-300 rounded-full"
                  style={{
                    width: `${((analyzingStepIndex + 1) / AI_ANALYZING_STEPS.length) * 100}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-ink-soft">
                <span>ขั้นตอนที่ {analyzingStepIndex + 1} จาก {AI_ANALYZING_STEPS.length}</span>
                <span>
                  {Math.round(
                    ((analyzingStepIndex + 1) / AI_ANALYZING_STEPS.length) * 100
                  )}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
