"use client";

export default function PrintReportButton() {
  return (
    <button
      onClick={() => window.print()}
      title="พิมพ์รายงานสรุปผล หรือ บันทึกเป็น PDF"
      className="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs bg-[var(--bg-surface)] border border-[var(--border-soft)] text-[var(--text-main)] hover:border-emerald-500/50 hover:bg-emerald-500/10"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
        <polyline points="6 9 6 2 18 2 18 9" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect width="12" height="8" x="6" y="14" />
      </svg>
      <span>พิมพ์รายงาน / PDF</span>
    </button>
  );
}
