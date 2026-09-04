import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const REQUIRED_KEYS = ["crop_id", "west", "south", "east", "north", "zoom"];

export async function GET(request: NextRequest) {
  const backendBase = (process.env.PYTHON_BACKEND_URL || "").replace(/\/$/, "");
  if (!backendBase) {
    return NextResponse.json({ error: "ยังไม่ได้เชื่อมต่อระบบแผนที่ Zoning" }, { status: 503 });
  }
  const params = new URLSearchParams();
  for (const key of REQUIRED_KEYS) {
    const value = request.nextUrl.searchParams.get(key);
    if (!value) return NextResponse.json({ error: "คำขอแผนที่ไม่ครบถ้วน" }, { status: 400 });
    params.set(key, value);
  }
  try {
    const response = await fetch(`${backendBase}/api/v1/zoning-map?${params}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    const body = await response.text();
    return new NextResponse(body, {
      status: response.status,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ error: "ยังโหลดชั้นข้อมูล Zoning ไม่สำเร็จ" }, { status: 503 });
  }
}
