import Link from "next/link";

/* ─── Component ──────────────────────────────────── */

export default function Navbar() {
  return (
    <nav className="h-16 sm:h-20 bg-panel border-b border-line px-4 sm:px-6 lg:px-20 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md bg-panel/95">
      {/* ── Logo ─────────────────────────────── */}
      <Link href="/" className="flex items-center gap-2.5 group">
        {/* Satellite orbit mark */}
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-105 transition-transform">
          <svg
            width="20"
            height="20"
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

        <div className="flex flex-col">
          <span className="font-heading font-bold text-lg sm:text-xl leading-tight text-primary-dark tracking-tight">
            Aura Farm
          </span>
          <span className="hidden sm:block text-[10px] font-mono text-accent font-semibold tracking-wider uppercase">
            AI เกษตรอัจฉริยะ
          </span>
        </div>
      </Link>

      {/* ── Right Navigation Actions ─────────── */}
      <div className="flex items-center gap-3">
        <Link
          href="/my-parcels"
          className="px-3 sm:px-4 py-2 bg-white hover:bg-emerald-50 text-emerald-950 border border-emerald-200 hover:border-emerald-500 text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1.5"
        >
          <span>🌾</span>
          <span className="hidden sm:inline">แปลงที่ดินของฉัน</span><span className="sm:hidden">แปลงของฉัน</span>
        </Link>
      </div>
    </nav>
  );
}
