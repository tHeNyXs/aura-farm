export interface SoilGridsData {
  phH2O: number;
  clayPct: number;
  sandPct: number;
  organicCarbonGKg: number;
  isRealApiData: boolean;
}

/**
 * Fetches real-time Soil pH and Soil Texture properties from ISRIC SoilGrids REST API v2.0
 */
export async function fetchRealSoilGridsData(
  lat: number,
  lng: number,
  fallbackPh: number = 6.2
): Promise<SoilGridsData> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const url = `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${lng}&lat=${lat}&property=phh2o&property=clay&property=sand&property=soc&depth=0-5cm&value=mean`;
    const res = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "AuraFarm-LandEvaluation-v1.0" },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const properties = data.properties?.layers || [];
      
      let phValue = fallbackPh;
      let clayVal = 30;
      let sandVal = 40;
      let socVal = 12;

      for (const layer of properties) {
        if (layer.name === "phh2o") {
          const rawPh = layer.depths?.[0]?.values?.mean;
          if (typeof rawPh === "number") {
            phValue = Number((rawPh / 10).toFixed(1));
          }
        } else if (layer.name === "clay") {
          const rawClay = layer.depths?.[0]?.values?.mean;
          if (typeof rawClay === "number") {
            clayVal = Number((rawClay / 10).toFixed(1));
          }
        } else if (layer.name === "sand") {
          const rawSand = layer.depths?.[0]?.values?.mean;
          if (typeof rawSand === "number") {
            sandVal = Number((rawSand / 10).toFixed(1));
          }
        }
      }

      return {
        phH2O: phValue,
        clayPct: clayVal,
        sandPct: sandVal,
        organicCarbonGKg: socVal,
        isRealApiData: true,
      };
    }
  } catch {
    clearTimeout(timeoutId);
  }

  return {
    phH2O: fallbackPh,
    clayPct: 32,
    sandPct: 38,
    organicCarbonGKg: 10,
    isRealApiData: false,
  };
}
