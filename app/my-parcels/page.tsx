"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/app/components/ui/navbar";
import Footer from "@/app/components/ui/footer";
import { SavedParcelItem } from "@/app/analyze/result/[id]/components/save-parcel-button";

export default function MyParcelsPage() {
  const [parcels, setParcels] = useState<SavedParcelItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("aura_farm_saved_parcels");
      if (stored) {
        setParcels(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load saved parcels:", e);
    } finally {
      setLoaded(true);
    }
  }, []);

  const handleDeleteParcel = (id: string, name: string) => {
    if (!confirm(`คุณต้องการลบแปลง "${name}" ออกจากรายการที่บันทึกไว้ใช่หรือไม่?`)) {
      return;
    }

    try {
      const updated = parcels.filter((p) => p.id !== id);
      setParcels(updated);
      localStorage.setItem("aura_farm_saved_parcels", JSON.stringify(updated));
      setToastMessage(`ลบแปลง "${name}" เรียบร้อยแล้ว`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (e) {
      console.error("Delete parcel error:", e);
    }
  };

  const filteredParcels = parcels.filter((parcel) => {
    return (
      searchQuery === "" ||
      parcel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      parcel.location_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalRai = parcels.reduce((sum, p) => sum + (p.area_rai || 0), 0);

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFBF7] text-[#142B18]">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 md:px-8 py-10 flex flex-col gap-8">
        
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-emerald-700 animate-fade-in">
            <span>✓</span>
            <span className="text-sm font-semibold">{toastMessage}</span>
          </div>
        )}

        {/* ── Page Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#E5E0D5]">
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
              <span>🌾</span>
              <span>แดชบอร์ดจัดการที่ดิน</span>
            </div>
            <h1 className="font-heading font-black text-3xl md:text-4xl text-[#142B18] tracking-tight">
              แปลงที่ดินของฉัน
            </h1>
            <p className="text-sm text-[#4A5D4E]">
              รวมรายการแปลงเกษตรกรรมที่คุณเคยกำหนดขอบเขตและวิเคราะห์ด้วยดาวเทียมไว้ในระบบ
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/analyze"
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>+ วาดแปลงใหม่บนแผนที่</span>
            </Link>
          </div>
        </div>

        {/* ── Real Statistics Bar (No Fake Grades) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-[#E5E0D5] rounded-3xl p-5 flex flex-col gap-1 shadow-2xs hover:border-emerald-500 transition-colors">
            <span className="text-xs text-[#5D7060] font-medium">แปลงที่บันทึกไว้ทั้งหมด</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="font-heading font-black text-3xl text-emerald-900">
                {parcels.length}
              </span>
              <span className="text-xs font-bold text-emerald-700">แปลง</span>
            </div>
          </div>

          <div className="bg-white border border-[#E5E0D5] rounded-3xl p-5 flex flex-col gap-1 shadow-2xs hover:border-emerald-500 transition-colors">
            <span className="text-xs text-[#5D7060] font-medium">เนื้อที่รวมทั้งหมด</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="font-heading font-black text-3xl text-emerald-900">
                {totalRai.toFixed(1)}
              </span>
              <span className="text-xs font-bold text-emerald-700">ไร่</span>
            </div>
          </div>

          <div className="bg-white border border-[#E5E0D5] rounded-3xl p-5 flex flex-col gap-1 shadow-2xs col-span-2 sm:col-span-1 hover:border-emerald-500 transition-colors">
            <span className="text-xs text-[#5D7060] font-medium">ระบบประเมินผล</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="font-heading font-black text-xl text-emerald-900">
                13 ชนิดพืช
              </span>
              <span className="text-xs font-bold text-emerald-700">LDD Matrix</span>
            </div>
          </div>
        </div>

        {/* ── Search Bar ── */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="ค้นหาชื่อแปลง หรือพิกัด..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#D5CEBF] rounded-2xl px-4 py-2.5 pl-10 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
              🔍
            </span>
          </div>

          <span className="text-xs text-[#5D7060] font-medium self-end sm:self-center">
            แสดง {filteredParcels.length} จาก {parcels.length} แปลง
          </span>
        </div>

        {/* ── Parcels Grid ── */}
        {!loaded ? (
          <div className="bg-white border border-[#E5E0D5] rounded-3xl p-16 text-center text-slate-400 flex flex-col items-center gap-3 shadow-2xs">
            <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium text-[#5D7060]">กำลังโหลดรายการแปลงของคุณ...</span>
          </div>
        ) : filteredParcels.length === 0 ? (
          <div className="bg-white border border-[#E5E0D5] rounded-3xl p-16 text-center flex flex-col items-center gap-4 shadow-2xs">
            <span className="text-5xl">🌾</span>
            <div className="flex flex-col gap-1 max-w-sm">
              <h3 className="font-heading font-bold text-lg text-[#142B18]">
                {searchQuery ? "ไม่พบแปลงที่ตรงกับคำค้นหา" : "ยังไม่มีแปลงที่ดินที่บันทึกไว้"}
              </h3>
              <p className="text-xs text-[#5D7060] leading-relaxed">
                {searchQuery
                  ? "ลองเปลี่ยนคำค้นหาใหม่อีกครั้ง"
                  : "เริ่มต้นด้วยการวาดกรอบแปลงบนแผนที่ดาวเทียม แล้วกดปุ่มบันทึกแปลงเพื่อเก็บไว้เปรียบเทียบในอนาคต"}
              </p>
            </div>
            {!searchQuery && (
              <Link
                href="/analyze"
                className="mt-2 px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>เริ่มสำรวจแปลงแรกของคุณ</span>
                <span>→</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredParcels.map((parcel) => (
              <div
                key={parcel.id}
                className="bg-white border border-[#E5E0D5] hover:border-emerald-500 rounded-3xl p-6 flex flex-col justify-between gap-5 shadow-2xs hover:shadow-md transition-all group"
              >
                <div className="flex flex-col gap-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <h3 className="font-heading font-bold text-base text-[#142B18] group-hover:text-emerald-800 transition-colors line-clamp-1">
                        {parcel.name}
                      </h3>
                      <span className="text-xs text-[#5D7060] line-clamp-1">
                        {parcel.location_name}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteParcel(parcel.id, parcel.name)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                      title="ลบแปลงนี้"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>

                  {/* Parcel Specs */}
                  <div className="grid grid-cols-2 gap-2 bg-[#F7F4EC] border border-[#E5E0D5] rounded-2xl p-3 text-xs">
                    <div>
                      <span className="text-[10px] text-[#5D7060] block font-medium">ขนาดพื้นที่</span>
                      <span className="font-bold text-[#142B18]">{parcel.area_rai.toFixed(1)} ไร่</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#5D7060] block font-medium">วันที่สำรวจ</span>
                      <span className="font-bold text-[#142B18]">{parcel.saved_at}</span>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-[#E5E0D5]/60">
                      <span className="text-[10px] text-[#5D7060] block font-medium">พิกัดศูนย์กลางแปลง</span>
                      <span className="font-mono text-[11px] text-slate-700 font-semibold">{parcel.lat ? `${parcel.lat.toFixed(4)}, ${parcel.lng.toFixed(4)}` : "—"}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    href={`/analyze/result/${parcel.id}`}
                    className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl text-center shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>📊 ดูรายงานประเมินฉบับเต็ม</span>
                    <span>→</span>
                  </Link>
                  <Link
                    href={`/analyze/result/${parcel.id}/crops`}
                    className="w-full py-2 bg-white hover:bg-emerald-50 text-emerald-950 border border-emerald-200 text-xs font-semibold rounded-xl text-center transition-all cursor-pointer"
                  >
                    🌾 ดูความเหมาะสม 13 พืช LDD
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
