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
    "ประเมินคุณค่าและความพร้อมของดิน แหล่งน้ำ ความลาดชัน และความสูงต่ำของแปลงที่ดินด้วย AI และเทคโนโลยีรีโมทเซนซิง",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable} ${notoSansThai.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
