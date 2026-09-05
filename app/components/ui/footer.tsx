import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-primary-dark text-bg px-6 lg:px-20 py-12 flex flex-col gap-8 border-t border-primary/20">
      {/* ── Top Row ──────────────────────────── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        {/* Brand */}
        <div className="flex flex-col gap-2 max-w-md">
          <Link href="/" className="flex items-center gap-2">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <ellipse
                cx="12"
                cy="12"
                rx="11"
                ry="4.5"
                stroke="#6B8E5A"
                strokeWidth="1.2"
              />
              <circle cx="12" cy="12" r="4" fill="#6B8E5A" />
              <circle cx="18" cy="8" r="3" fill="#B4841F" />
            </svg>
            <span className="font-heading font-bold text-xl text-[#EDE8D9]">
              Aura Farm
            </span>
          </Link>

          <p className="text-xs leading-relaxed text-line/80">
            แพลตฟอร์มวิเคราะห์ความเหมาะสมของพื้นที่และแนะนำพืชเศรษฐกิจไทย ด้วยข้อมูลภูมิสารสนเทศและเกณฑ์ FAO สำหรับพืช 13 ชนิด
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap items-center gap-6 text-xs text-line/80">
          <Link href="/" className="hover:text-bg transition-colors">หน้าแรก</Link>
          <a href="#how-it-works" className="hover:text-bg transition-colors">ขั้นตอนการทำงาน</a>
        </div>
      </div>

      {/* ── Divider ──────────────────────────── */}
      <div className="border-t border-line/20" />

      {/* ── Bottom Row ───────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[11px] text-line/60 font-mono">
        <span>© 2026 Aura Farm. พัฒนาขึ้นเพื่อเกษตรกรรมแม่นยำสูงในประเทศไทย</span>
        <span>ข้อมูลอ้างอิง: เกณฑ์ FAO • Google Earth Engine • SoilGrids • ESA WorldCover</span>
      </div>
    </footer>
  );
}
