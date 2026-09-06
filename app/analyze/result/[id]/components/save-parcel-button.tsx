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
            ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40"
            : "bg-[var(--bg-surface)] border border-[var(--border-soft)] text-[var(--text-main)] hover:border-emerald-500/50 hover:bg-emerald-500/10"
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
        </svg>
        <span>{isSaved ? "บันทึกแล้ว" : "บันทึกแปลงนี้"}</span>
      </button>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-emerald-950/90 text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-semibold animate-fade-in flex items-center gap-2 border border-emerald-700/60 backdrop-blur-md">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Save Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-soft)] rounded-3xl max-w-md w-full p-6 flex flex-col gap-5 shadow-2xl animate-fade-in text-[var(--text-main)] glass-specular">
            <div className="flex items-center justify-between border-b border-[var(--border-soft)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                  </svg>
                </div>
                <h3 className="font-heading font-black text-lg text-[var(--text-main)]">
                  บันทึกแปลงที่ดินนี้
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/5 cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[var(--text-main)]">
                ตั้งชื่อแปลงที่ดินของคุณ:
              </label>
              <input
                type="text"
                value={parcelName}
                onChange={(e) => setParcelName(e.target.value)}
                placeholder="เช่น แปลงนา 12 ไร่ สุพรรณบุรี หรือ สวนทุเรียนเชิงเขา"
                className="w-full h-11 bg-[var(--bg-base)] border border-[var(--border-soft)] rounded-xl px-3.5 text-xs text-[var(--text-main)] focus:outline-hidden focus:border-emerald-500 shadow-2xs"
                autoFocus
              />
            </div>

            <div className="bg-[var(--bg-base)] border border-[var(--border-soft)] rounded-2xl p-4 text-xs flex flex-col gap-2 shadow-2xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">ขนาดพื้นที่:</span>
                <span className="font-bold text-[var(--text-main)]">{analysis.area_size.rai} ไร่</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">การประเมิน:</span>
                <span className="font-bold text-emerald-500">เกณฑ์ FAO Suitability Matrix</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">พิกัดศูนย์กลาง:</span>
                <span className="font-mono text-[var(--text-muted)] text-[11px]">{analysis.coordinates.formatted}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 bg-[var(--bg-base)] border border-[var(--border-soft)] rounded-xl text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
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
