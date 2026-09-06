import type { Metadata } from "next";
import AreaSelectionClient from "./components/area-selection-client";

export const metadata: Metadata = {
  title: "เลือกพื้นที่เพาะปลูก — Aura Farm",
  description:
    "ค้นหาตำแหน่งที่ตั้ง วาดขอบเขตแปลงที่ดิน หรืออัปโหลดไฟล์ KML/GeoJSON เพื่อวิเคราะห์ความพร้อมของผืนดินด้วยดาวเทียม",
};

export default function AnalyzePage() {
  return <AreaSelectionClient />;
}
