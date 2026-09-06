import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="px-6 lg:px-20 py-12 flex flex-col gap-8 border-t transition-colors duration-300"
      style={{
        background: "var(--bg-surface)",
        borderColor: "var(--border-soft)",
        color: "var(--text-primary)",
      }}
    >
      {/* ── Top Row ──────────────────────────── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        {/* Brand */}
        <div className="flex flex-col gap-2 max-w-md">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
              style={{ background: "var(--grad-brand)", boxShadow: "0 2px 8px var(--color-glow)" }}
            >
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
                  rx="10"
                  ry="4"
                  stroke="#ffffff"
                  strokeWidth="1.6"
                />
                <circle cx="12" cy="12" r="3.5" fill="#ffffff" />
                <circle cx="17" cy="8" r="2.2" fill="#2CC9A0" />
              </svg>
            </div>
            <span
              className="font-heading font-black text-xl tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Aura Farm
            </span>
          </Link>

          <p
            className="text-xs leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            แพลตฟอร์มวิเคราะห์ความเหมาะสมของพื้นที่และแนะนำพืชเศรษฐกิจไทย ด้วยข้อมูลภูมิสารสนเทศและเกณฑ์ FAO สำหรับพืช 13 ชนิด
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap items-center gap-6 text-xs font-semibold">
          <Link
            href="/"
            className="transition-colors hover:text-[var(--color-teal)]"
            style={{ color: "var(--text-secondary)" }}
          >
            หน้าแรก
          </Link>
          <a
            href="#how-it-works"
            className="transition-colors hover:text-[var(--color-teal)]"
            style={{ color: "var(--text-secondary)" }}
          >
            ขั้นตอนการทำงาน
          </a>
          <a
            href="#fao-knowledge"
            className="transition-colors hover:text-[var(--color-teal)]"
            style={{ color: "var(--text-secondary)" }}
          >
            เกณฑ์มาตรฐาน FAO
          </a>
          <Link
            href="/my-parcels"
            className="transition-colors hover:text-[var(--color-teal)]"
            style={{ color: "var(--text-secondary)" }}
          >
            แปลงที่ดินของฉัน
          </Link>
          <Link
            href="/analyze"
            className="transition-colors hover:text-[var(--color-teal)]"
            style={{ color: "var(--text-secondary)" }}
          >
            เริ่มวิเคราะห์แปลง
          </Link>
        </div>
      </div>

      {/* ── Divider ──────────────────────────── */}
      <div
        className="border-t"
        style={{ borderColor: "var(--border-soft)" }}
      />

      {/* ── Bottom Row ───────────────────────── */}
      <div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-[11px] font-mono"
        style={{ color: "var(--text-subtle)" }}
      >
        <span>© 2026 Aura Farm. พัฒนาขึ้นเพื่อเกษตรกรรมแม่นยำสูงในประเทศไทย</span>
        <span>ข้อมูลอ้างอิง: เกณฑ์ FAO • Google Earth Engine • SoilGrids • ESA WorldCover</span>
      </div>
    </footer>
  );
}
