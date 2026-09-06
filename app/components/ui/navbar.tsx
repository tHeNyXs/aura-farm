"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/* ─── SVG Icons (Clean & Inline) ─────────────────── */

function SunIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1"  x2="12" y2="3"  />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22"  x2="5.64" y2="5.64"  />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3"  y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
    </svg>
  );
}

function SatelliteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <ellipse cx="12" cy="12" rx="11" ry="4.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="3.8" fill="var(--color-teal)" />
      <circle cx="18.5" cy="7.5" r="2.5" fill="var(--color-accent)" />
    </svg>
  );
}

function ParcelIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="3 6 12 3 21 6 21 18 12 21 3 18 3 6" />
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="3" y1="12" x2="21" y2="12" />
    </svg>
  );
}

/* ─── Component ──────────────────────────────────── */

export default function Navbar() {
  const [isDark, setIsDark] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  /* Sync theme from <html data-theme> on mount */
  useEffect(() => {
    const html = document.documentElement;
    setIsDark(html.getAttribute("data-theme") === "dark");

    /* Scroll listener for Rolls-Royce floating condensation */
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    const next = isDark ? "light" : "dark";
    html.setAttribute("data-theme", next);
    try { localStorage.setItem("af-theme", next); } catch (_) {}
    setIsDark(!isDark);
  };

  return (
    <>
      <header
        className={`rr-header-wrapper ${isScrolled ? "scrolled" : ""}`}
        role="banner"
      >
        <nav
          className={`rr-navbar aura-nav-enter ${isScrolled ? "glass-specular" : ""}`}
          role="navigation"
          aria-label="Main navigation"
        >
          {/* ── Logo & Brand ────────────────────────── */}
          <Link
            href="/"
            id="nav-logo"
            className="flex items-center gap-2.5 group transition-all duration-300"
            aria-label="Aura Farm Home"
          >
            <div
              className={`rounded-xl flex items-center justify-center border transition-all duration-300 ${
                isScrolled ? "w-8 h-8 scale-95" : "w-9 h-9 scale-100"
              }`}
              style={{
                background: "var(--glass-bg)",
                borderColor: "var(--border-mid)",
                color: "var(--color-teal)",
                boxShadow: "var(--shadow-glow)",
              }}
            >
              <SatelliteIcon />
            </div>

            <div className="flex flex-col leading-none">
              <span
                className={`font-heading font-black tracking-tight transition-all duration-300 ${
                  isScrolled ? "text-lg" : "text-xl"
                }`}
                style={{ color: "var(--text-primary)" }}
              >
                Aura Farm
              </span>
              <span
                className={`text-[9px] font-mono font-semibold tracking-widest uppercase transition-opacity duration-300 ${
                  isScrolled ? "hidden sm:inline opacity-80" : "inline opacity-100"
                }`}
                style={{ color: "var(--color-teal)" }}
              >
                AI เกษตรอัจฉริยะ
              </span>
            </div>
          </Link>

          {/* ── Center Quick Navigation (Rolls-Royce Style Links) ── */}
          <div className="hidden lg:flex items-center gap-7 text-xs font-semibold">
            <a
              href="/#how-it-works"
              className="transition-colors hover:text-[var(--color-teal)]"
              style={{ color: "var(--text-secondary)" }}
            >
              ขั้นตอนการทำงาน
            </a>
            <a
              href="/#fao-knowledge"
              className="transition-colors hover:text-[var(--color-teal)]"
              style={{ color: "var(--text-secondary)" }}
            >
              เกณฑ์มาตรฐาน FAO
            </a>
            <a
              href="/#crops-database"
              className="transition-colors hover:text-[var(--color-teal)]"
              style={{ color: "var(--text-secondary)" }}
            >
              พืชเศรษฐกิจ 13 ชนิด
            </a>
          </div>

          {/* ── Right Actions ─────────────────────────── */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* Quick CTA button when condensed / scrolled */}
            {isScrolled && (
              <Link
                href="/analyze"
                className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-white transition-all hover:scale-105 shadow-sm"
                style={{ background: "var(--grad-brand)" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="3 11 22 2 13 21 11 13 3 11" />
                </svg>
                <span>เริ่มสำรวจแปลง</span>
              </Link>
            )}

            {/* My Parcels Link */}
            <Link
              href="/my-parcels"
              id="nav-my-parcels"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isScrolled ? "scale-95" : "scale-100"
              }`}
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--border-mid)",
                color: "var(--text-primary)",
                backdropFilter: "var(--glass-blur)",
                WebkitBackdropFilter: "var(--glass-blur)",
              }}
            >
              <ParcelIcon />
              <span className="hidden sm:inline">แปลงที่ดินของฉัน</span>
              <span className="sm:hidden">แปลงของฉัน</span>
            </Link>

            {/* Mobile navigation: exposes the same sections and main CTA as desktop. */}
            <button
              type="button"
              className="lg:hidden theme-toggle"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={isMenuOpen ? "ปิดเมนู" : "เปิดเมนู"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                {isMenuOpen ? <><path d="m6 6 12 12" /><path d="m18 6-12 12" /></> : <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>}
              </svg>
            </button>

            {/* Dark / Light Toggle */}
            <button
              id="nav-theme-toggle"
              className={`theme-toggle ${isScrolled ? "scale-90" : "scale-100"}`}
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              title={isDark ? "โหมดสว่าง" : "โหมดมืด"}
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </nav>

        {isMenuOpen && (
          <div
            id="mobile-navigation"
            className="lg:hidden pointer-events-auto mx-3 mt-2 rounded-2xl p-2 shadow-xl anim-slide-down"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-mid)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          >
            <div className="grid grid-cols-1 gap-1">
              {[
                ["/#how-it-works", "ขั้นตอนการทำงาน"],
                ["/#fao-knowledge", "เกณฑ์มาตรฐาน FAO"],
                ["/#crops-database", "พืชเศรษฐกิจ 13 ชนิด"],
              ].map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-semibold transition-colors hover:bg-[var(--border-soft)]"
                  style={{ color: "var(--text-primary)" }}
                >
                  {label}
                </Link>
              ))}
              <Link
                href="/analyze"
                onClick={() => setIsMenuOpen(false)}
                className="btn-primary w-full justify-center mt-1 !py-3 text-sm"
              >
                เริ่มวิเคราะห์พื้นที่ →
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Spacer keeps document flow perfectly aligned under fixed navbar */}
      <div className="h-[4.75rem] w-full shrink-0" aria-hidden="true" />
    </>
  );
}
