import type { Metadata } from "next";
import {
  Fraunces,
  Inter,
  JetBrains_Mono,
  Noto_Sans_Thai,
} from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-thai",
  subsets: ["thai"],
});

export const metadata: Metadata = {
  title: "Aura Farm — วิเคราะห์พื้นที่เพาะปลูกด้วยข้อมูลดาวเทียม",
  description:
    "ประเมินความเหมาะสมของแปลงที่ดินด้วย AI และเทคโนโลยีดาวเทียม วิเคราะห์ความลาดชัน ปริมาณน้ำฝน pH และระดับความสูง พร้อมเกณฑ์ FAO สำหรับพืชเศรษฐกิจ 13 ชนิด",
};

/* ─── Prevent FOUC: read saved theme before first paint ── */
const themeScript = `
(function() {
  try {
    var t = localStorage.getItem('af-theme');
    if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  } catch(e) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable} ${notoSansThai.variable} antialiased`}
    >
      {/* Inline script runs before CSS paint — prevents theme flash */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
