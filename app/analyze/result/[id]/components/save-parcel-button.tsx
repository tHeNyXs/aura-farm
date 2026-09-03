"use client";

import { useState, useEffect } from "react";
import { AnalysisResult } from "@/app/lib/types";

interface SaveParcelButtonProps {
  analysis: AnalysisResult;
}

export interface SavedParcelItem {
  id: string;
  name: string;
  location_name: string;
  saved_at: string;
  area_rai: number;
  area_ha: number;
  suitability_score: number;
  fao_class: string;
  lat: number;
  lng: number;
  polygon: [number, number][];
}

export default function SaveParcelButton({ analysis }: SaveParcelButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [parcelName, setParcelName] = useState(analysis.location_name || "แปลงสำรวจของฉัน");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const existing = localStorage.getItem("aura_farm_saved_parcels");
      if (existing) {
        const list: SavedParcelItem[] = JSON.parse(existing);
        const exists = list.some((item) => item.id === analysis.id);
        setIsSaved(exists);
      }
    } catch {
      // LocalStorage access fallback
    }
  }, [analysis.id]);

  const handleSave = () => {
    try {
      const existing = localStorage.getItem("aura_farm_saved_parcels");
      let list: SavedParcelItem[] = existing ? JSON.parse(existing) : [];

      const coords = analysis.polygon_geojson?.geometry?.coordinates?.[0]
        ? analysis.polygon_geojson.geometry.coordinates[0].map((c: number[]) => [c[1], c[0]])
        : [[analysis.coordinates.lat, analysis.coordinates.lng]];

      const newItem: SavedParcelItem = {
        id: analysis.id,
        name: parcelName.trim() || analysis.location_name,
        location_name: analysis.location_name,
        saved_at: new Date().toLocaleDateString("th-TH", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        area_rai: analysis.area_size.rai,
        area_ha: analysis.area_size.ha,
        suitability_score: analysis.suitability_score,
        fao_class: analysis.fao_class || "S1",
        lat: analysis.coordinates.lat,
        lng: analysis.coordinates.lng,
        polygon: coords,
      };

      // Remove previous duplicate if updating
      list = list.filter((item) => item.id !== analysis.id);
      list.unshift(newItem);

      localStorage.setItem("aura_farm_saved_parcels", JSON.stringify(list));
      setIsSaved(true);
      setShowModal(false);
      setToastMessage("✓ บันทึกแปลงที่ดินนี้เรียบร้อยแล้ว!");
      setTimeout(() => setToastMessage(null), 3000);
    } catch (e) {
      console.error("Save parcel error:", e);
      alert("ไม่สามารถบันทึกแปลงที่ดินได้");
    }
  };

  const handleUnsave = () => {
    try {
      const existing = localStorage.getItem("aura_farm_saved_parcels");
      if (existing) {
        let list: SavedParcelItem[] = JSON.parse(existing);
        list = list.filter((item) => item.id !== analysis.id);
        localStorage.setItem("aura_farm_saved_parcels", JSON.stringify(list));
      }
      setIsSaved(false);
      setToastMessage("ลบแปลงออกจากรายการที่บันทึกแล้ว");
      setTimeout(() => setToastMessage(null), 3000);
    } catch (e) {
      console.error("Unsave error:", e);
    }
  };

  return (
    <>
      <button
        onClick={() => {
          if (isSaved) {
            handleUnsave();
          } else {
            setShowModal(true);
          }
        }}
        title={isSaved ? "แปลงนี้บันทึกไว้แล้ว (คลิกเพื่อยกเลิก)" : "บันทึกแปลงนี้ไว้ดูภายหลัง"}
        className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
          isSaved
            ? "bg-emerald-100 border border-emerald-300 text-emerald-900 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300"
            : "bg-white border border-emerald-300 text-emerald-950 hover:bg-emerald-50"
        }`}
      >
        <span>{isSaved ? "✓ บันทึกแล้ว" : "💾 บันทึกแปลงนี้"}</span>
      </button>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-semibold animate-fade-in flex items-center gap-2 border border-emerald-700">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Save Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FDFBF7] border border-[#E5E0D5] rounded-3xl max-w-md w-full p-6 flex flex-col gap-5 shadow-2xl animate-fade-in text-[#142B18]">
            <div className="flex items-center justify-between border-b border-[#E5E0D5] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💾</span>
                <h3 className="font-heading font-black text-lg text-[#142B18]">
                  บันทึกแปลงที่ดินนี้
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-xs text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#142B18]">
                ตั้งชื่อแปลงที่ดินของคุณ:
              </label>
              <input
                type="text"
                value={parcelName}
                onChange={(e) => setParcelName(e.target.value)}
                placeholder="เช่น แปลงนา 12 ไร่ สุพรรณบุรี หรือ สวนทุเรียนเชิงเขา"
                className="w-full h-11 bg-white border border-[#D5CEBF] rounded-xl px-3.5 text-xs text-slate-800 focus:outline-hidden focus:border-emerald-600 shadow-2xs"
                autoFocus
              />
            </div>

            <div className="bg-white border border-[#E5E0D5] rounded-2xl p-4 text-xs flex flex-col gap-2 shadow-2xs">
              <div className="flex justify-between">
                <span className="text-[#5D7060]">ขนาดพื้นที่:</span>
                <span className="font-bold text-[#142B18]">{analysis.area_size.rai} ไร่</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5D7060]">การประเมิน:</span>
                <span className="font-bold text-emerald-800">เกณฑ์ LDD Matrix (40 ชนิดพืช)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5D7060]">พิกัดศูนย์กลาง:</span>
                <span className="font-mono text-slate-700 text-[11px]">{analysis.coordinates.formatted}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 bg-white border border-[#D5CEBF] rounded-xl text-xs font-semibold text-slate-700 hover:bg-[#F7F4EC] cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2.5 bg-emerald-800 text-white rounded-xl text-xs font-bold hover:bg-emerald-900 transition-colors cursor-pointer shadow-xs"
              >
                ยืนยันการบันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
