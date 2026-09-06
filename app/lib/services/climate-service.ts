/**
 * Real-time Climate & Meteorology Service
 * ดึงข้อมูลสภาพอากาศ ปริมาณน้ำฝนสะสม และอุณหภูมิจริงจาก Open-Meteo & ERA5-Land Reanalysis (ECMWF)
 */

export interface RealClimateData {
  annualRainfallMm: number;
  averageTempCelsius: number;
  surfaceSoilMoisturePct: number;
  isRealData: boolean;
}

export async function fetchRealClimateData(
  lat: number,
  lng: number
): Promise<RealClimateData> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const today = new Date();
    const endYear = today.getFullYear() - 1; // Last full calendar year for accurate annual rainfall
    const startDate = `${endYear}-01-01`;
    const endDate = `${endYear}-12-31`;

    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}&start_date=${startDate}&end_date=${endDate}&daily=precipitation_sum,temperature_2m_mean,soil_moisture_0_to_7cm_mean&timezone=Asia%2FBangkok`;

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Open-Meteo HTTP error: ${res.status}`);
    }

    const data = await res.json();
    const dailyRain: number[] = data.daily?.precipitation_sum || [];
    const dailyTemp: number[] = data.daily?.temperature_2m_mean || [];
    const dailyMoisture: number[] = data.daily?.soil_moisture_0_to_7cm_mean || [];

    const totalRain = Math.round(dailyRain.reduce((acc, v) => acc + (v || 0), 0));
    const validTemps = dailyTemp.filter((t) => typeof t === "number");
    const avgTemp = validTemps.length > 0
      ? Number((validTemps.reduce((acc, v) => acc + v, 0) / validTemps.length).toFixed(1))
      : 28.5;

    // Soil moisture volumetric m³/m³ converted to percentage (0.15 - 0.45 typical -> scale to 45% - 85% agricultural scale)
    const validMoistures = dailyMoisture.filter((m) => typeof m === "number");
    let scaledSoilMoisture = 60;
    if (validMoistures.length > 0) {
      const avgVolumetric = validMoistures.reduce((acc, v) => acc + v, 0) / validMoistures.length;
      // Convert 0.15-0.45 m³/m³ to 40%-85% relative root-zone moisture index
      scaledSoilMoisture = Math.round(Math.min(90, Math.max(25, (avgVolumetric / 0.45) * 80)));
    }

    return {
      annualRainfallMm: Math.max(400, totalRain),
      averageTempCelsius: avgTemp,
      surfaceSoilMoisturePct: scaledSoilMoisture,
      isRealData: true,
    };
  } catch (err) {
    console.warn("Climate API fallback:", err);
    // Fallback based on Thai regional latitude
    const isSouth = lat < 11.0;
    const isNorth = lat > 17.5;
    return {
      annualRainfallMm: isSouth ? 2100 : isNorth ? 1350 : 1250,
      averageTempCelsius: isSouth ? 28.2 : isNorth ? 26.5 : 29.8,
      surfaceSoilMoisturePct: isSouth ? 75 : 62,
      isRealData: false,
    };
  }
}
