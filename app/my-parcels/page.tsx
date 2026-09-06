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
    <div
      className="aura-parcels-page flex flex-col min-h-screen transition-colors duration-350"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 md:px-8 py-10 flex flex-col gap-8">
        
        {/* Toast Alert */}
        {toastMessage && (
          <div
            className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 anim-slide-down"
            style={{
              background: "var(--color-teal-dark)",
              color: "#ffffff",
              border: "1px solid var(--color-teal)",
              boxShadow: "var(--shadow-glow-strong)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-xs font-semibold">{toastMessage}</span>
          </div>
        )}

        {/* ── Page Header ── */}
        <div
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b"
          style={{ borderColor: "var(--border-soft)" }}
        >
          <div className="flex flex-col gap-2">
            <div
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
              style={{ color: "var(--color-teal)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
              <span>แดชบอร์ดจัดการที่ดิน</span>
            </div>
            <h1 className="font-heading font-black text-3xl md:text-4xl tracking-tight">
              แปลงที่ดินของฉัน
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              รวมรายการแปลงเกษตรกรรมที่คุณเคยกำหนดขอบเขตและวิเคราะห์ด้วยดาวเทียมไว้ในระบบ
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/analyze"
              className="btn-primary"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>วาดแปลงใหม่บนแผนที่</span>
            </Link>
          </div>
        </div>

        {/* ── Real Statistics Bar ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="stat-card items-start text-left p-5">
            <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              แปลงที่บันทึกไว้ทั้งหมด
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="font-heading font-black text-3xl" style={{ color: "var(--text-primary)" }}>
                {parcels.length}
              </span>
              <span className="text-xs font-bold" style={{ color: "var(--color-teal)" }}>
                แปลง
              </span>
            </div>
          </div>

          <div className="stat-card items-start text-left p-5">
            <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              เนื้อที่รวมทั้งหมด
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="font-heading font-black text-3xl" style={{ color: "var(--text-primary)" }}>
                {totalRai.toFixed(1)}
              </span>
              <span className="text-xs font-bold" style={{ color: "var(--color-teal)" }}>
                ไร่
              </span>
            </div>
          </div>

          <div className="stat-card items-start text-left p-5 col-span-2 sm:col-span-1">
            <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              ระบบประเมินผล
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="font-heading font-black text-2xl" style={{ color: "var(--text-primary)" }}>
                13 ชนิดพืช
              </span>
              <span className="text-xs font-bold" style={{ color: "var(--color-teal)" }}>
                FAO Matrix
              </span>
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
              className="w-full rounded-2xl px-4 py-2.5 pl-10 text-xs transition-all outline-none"
              style={{
                background: "var(--glass-bg)",
                backdropFilter: "var(--glass-blur)",
                WebkitBackdropFilter: "var(--glass-blur)",
                border: "1px solid var(--border-soft)",
                color: "var(--text-primary)",
              }}
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
          </div>

          <span className="text-xs font-medium self-end sm:self-center" style={{ color: "var(--text-muted)" }}>
            แสดง {filteredParcels.length} จาก {parcels.length} แปลง
          </span>
        </div>

        {/* ── Parcels Grid ── */}
        {!loaded ? (
          <div className="info-card p-16 text-center flex flex-col items-center gap-3">
            <div
              className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: "var(--color-teal)", borderTopColor: "transparent" }}
            />
            <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              กำลังโหลดรายการแปลงของคุณ...
            </span>
          </div>
        ) : filteredParcels.length === 0 ? (
          <div className="info-card p-16 text-center flex flex-col items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "var(--border-soft)", color: "var(--color-teal)" }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22V12" />
                <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
                <path d="M12 12C12 6 7 3 7 3s0 5 5 9" />
                <path d="M12 12c0-6 5-9 5-9s0 5-5 9" />
              </svg>
            </div>
            <div className="flex flex-col gap-1 max-w-sm">
              <h3 className="font-heading font-bold text-lg" style={{ color: "var(--text-primary)" }}>
                {searchQuery ? "ไม่พบแปลงที่ตรงกับคำค้นหา" : "ยังไม่มีแปลงที่ดินที่บันทึกไว้"}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {searchQuery
                  ? "ลองเปลี่ยนคำค้นหาใหม่อีกครั้ง"
                  : "เริ่มต้นด้วยการวาดกรอบแปลงบนแผนที่ดาวเทียม แล้วกดปุ่มบันทึกแปลงเพื่อเก็บไว้เปรียบเทียบในอนาคต"}
              </p>
            </div>
            {!searchQuery && (
              <Link
                href="/analyze"
                className="mt-2 btn-primary"
              >
                <span>เริ่มสำรวจแปลงแรกของคุณ</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredParcels.map((parcel) => (
              <div
                key={parcel.id}
                className="glass-deep rounded-3xl p-6 flex flex-col justify-between gap-5 group"
              >
                <div className="flex flex-col gap-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <h3
                        className="font-heading font-bold text-base line-clamp-1 transition-colors group-hover:text-[var(--color-teal)]"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {parcel.name}
                      </h3>
                      <span className="text-xs line-clamp-1" style={{ color: "var(--text-muted)" }}>
                        {parcel.location_name}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteParcel(parcel.id, parcel.name)}
                      className="p-2 rounded-xl transition-colors cursor-pointer shrink-0 hover:bg-red-500/10 hover:text-red-500"
                      style={{ color: "var(--text-subtle)" }}
                      title="ลบแปลงนี้"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>

                  {/* Parcel Specs */}
                  <div
                    className="grid grid-cols-2 gap-2 rounded-2xl p-3 text-xs"
                    style={{
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-soft)",
                    }}
                  >
                    <div>
                      <span className="text-[10px] block font-medium" style={{ color: "var(--text-muted)" }}>
                        ขนาดพื้นที่
                      </span>
                      <span className="font-bold" style={{ color: "var(--text-primary)" }}>
                        {parcel.area_rai.toFixed(1)} ไร่
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] block font-medium" style={{ color: "var(--text-muted)" }}>
                        วันที่สำรวจ
                      </span>
                      <span className="font-bold" style={{ color: "var(--text-primary)" }}>
                        {parcel.saved_at}
                      </span>
                    </div>
                    <div
                      className="col-span-2 pt-1.5 border-t"
                      style={{ borderColor: "var(--border-soft)" }}
                    >
                      <span className="text-[10px] block font-medium" style={{ color: "var(--text-muted)" }}>
                        พิกัดศูนย์กลางแปลง
                      </span>
                      <span className="font-mono text-[11px] font-semibold" style={{ color: "var(--color-teal)" }}>
                        {parcel.lat ? `${parcel.lat.toFixed(4)}, ${parcel.lng.toFixed(4)}` : "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    href={`/analyze/result/${parcel.id}`}
                    className="w-full py-2.5 text-white font-bold text-xs rounded-xl text-center shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    style={{ background: "var(--grad-brand)" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="20" x2="18" y2="10" />
                      <line x1="12" y1="20" x2="12" y2="4" />
                      <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                    <span>ดูรายงานประเมินฉบับเต็ม</span>
                    <span>→</span>
                  </Link>
                  <Link
                    href={`/analyze/result/${parcel.id}/crops`}
                    className="w-full py-2 text-xs font-semibold rounded-xl text-center transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    style={{
                      background: "var(--glass-bg)",
                      border: "1px solid var(--border-soft)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    <span>ดูความเหมาะสม 13 พืช LDD</span>
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
