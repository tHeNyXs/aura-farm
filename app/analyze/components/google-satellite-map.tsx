"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as turf from "@turf/turf";
import type { DrawingTool } from "./satellite-map";

type LatLng = [number, number];

interface GoogleSatelliteMapProps {
  tool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
  selectedPolygon: LatLng[] | null;
  onPolygonChange: (coords: LatLng[], areaRai: number, areaHa: number) => void;
  flyToCoords?: { lat: number; lng: number; zoom?: number } | null;
}

declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_SCRIPT_ID = "aura-farm-google-maps";

function loadGoogleMaps(apiKey: string): Promise<any> {
  if (window.google?.maps?.Map) return Promise.resolve(window.google.maps);

  return new Promise((resolve, reject) => {
    const existing = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(window.google?.maps), { once: true });
      existing.addEventListener("error", () => reject(new Error("Google Maps โหลดไม่สำเร็จ")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&language=th&region=TH&v=weekly`;
    script.onload = () => window.google?.maps ? resolve(window.google.maps) : reject(new Error("Google Maps ไม่พร้อมใช้งาน"));
    script.onerror = () => reject(new Error("Google Maps โหลดไม่สำเร็จ กรุณาตรวจ API key และโดเมนที่อนุญาต"));
    document.head.appendChild(script);
  });
}

export default function GoogleSatelliteMap({
  tool,
  onToolChange,
  selectedPolygon,
  onPolygonChange,
  flyToCoords,
}: GoogleSatelliteMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<any>(null);
  const mapsRef = useRef<any>(null);
  const polygonRef = useRef<any>(null);
  const temporaryLineRef = useRef<any>(null);
  const mapClickListenerRef = useRef<any>(null);
  const polygonListenersRef = useRef<any[]>([]);
  const drawingPointsRef = useRef<LatLng[]>([]);
  const currentCoordsRef = useRef<LatLng[]>([]);
  const rectangleStartRef = useRef<LatLng | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const calculateArea = useCallback((coords: LatLng[]) => {
    if (coords.length < 3) return { rai: 0, ha: 0 };
    const ring = coords.map(([lat, lng]) => [lng, lat]);
    if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) {
      ring.push(ring[0]);
    }
    const sqm = turf.area(turf.polygon([ring]));
    return { rai: Number((sqm / 1600).toFixed(1)), ha: Number((sqm / 10000).toFixed(2)) };
  }, []);

  const clearTemporaryDrawing = useCallback(() => {
    temporaryLineRef.current?.setMap(null);
    temporaryLineRef.current = null;
    drawingPointsRef.current = [];
    rectangleStartRef.current = null;
  }, []);

  const syncPolygonFromMap = useCallback(() => {
    const path = polygonRef.current?.getPath?.();
    if (!path) return;
    const coords: LatLng[] = path.getArray().map((point: any) => [point.lat(), point.lng()]);
    currentCoordsRef.current = coords;
    const area = calculateArea(coords);
    onPolygonChange(coords, area.rai, area.ha);
  }, [calculateArea, onPolygonChange]);

  useEffect(() => {
    if (!apiKey || !mapContainerRef.current || mapRef.current) return;
    let cancelled = false;

    loadGoogleMaps(apiKey)
      .then((maps) => {
        if (cancelled || !mapContainerRef.current) return;
        mapsRef.current = maps;
        mapRef.current = new maps.Map(mapContainerRef.current, {
          center: { lat: 13.75, lng: 100.5 },
          zoom: 7,
          minZoom: 6,
          maxZoom: 20,
          mapTypeId: "satellite",
          streetViewControl: false,
          fullscreenControl: true,
          mapTypeControl: true,
          mapTypeControlOptions: { mapTypeIds: ["satellite", "hybrid", "roadmap"] },
          restriction: {
            latLngBounds: { north: 20.9, south: 5.2, west: 96, east: 106.2 },
            strictBounds: false,
          },
        });
        setMapReady(true);

        if (searchInputRef.current && maps.places?.Autocomplete) {
          const autocomplete = new maps.places.Autocomplete(searchInputRef.current, {
            componentRestrictions: { country: "th" },
            fields: ["geometry", "name", "formatted_address"],
          });
          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            const map = mapRef.current;
            if (!place.geometry || !map) return;
            if (place.geometry.viewport) map.fitBounds(place.geometry.viewport);
            else if (place.geometry.location) {
              map.panTo(place.geometry.location);
              map.setZoom(16);
            }
          });
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Google Maps โหลดไม่สำเร็จ");
      });

    return () => {
      cancelled = true;
      if (mapClickListenerRef.current) mapsRef.current?.event.removeListener(mapClickListenerRef.current);
      polygonListenersRef.current.forEach((listener) => mapsRef.current?.event.removeListener(listener));
      polygonListenersRef.current = [];
      polygonRef.current?.setMap(null);
      temporaryLineRef.current?.setMap(null);
      mapRef.current = null;
      setMapReady(false);
    };
  }, [apiKey]);

  useEffect(() => {
    if (selectedPolygon) currentCoordsRef.current = selectedPolygon;
    const map = mapRef.current;
    const maps = mapsRef.current;
    if (!map || !maps) return;

    polygonListenersRef.current.forEach((listener) => maps.event.removeListener(listener));
    polygonListenersRef.current = [];

    if (!selectedPolygon || selectedPolygon.length < 3) {
      polygonRef.current?.setMap(null);
      polygonRef.current = null;
      return;
    }

    const path = selectedPolygon.map(([lat, lng]) => ({ lat, lng }));
    if (!polygonRef.current) {
      polygonRef.current = new maps.Polygon({
        paths: path,
        strokeColor: "#B4841F",
        strokeOpacity: 1,
        strokeWeight: 3,
        fillColor: "#B4841F",
        fillOpacity: 0.25,
        editable: true,
        draggable: false,
        map,
      });
    } else {
      polygonRef.current.setPath(path);
      polygonRef.current.setMap(map);
    }

    const polygonPath = polygonRef.current.getPath();
    ["set_at", "insert_at", "remove_at"].forEach((eventName) => {
      polygonListenersRef.current.push(polygonPath.addListener(eventName, syncPolygonFromMap));
    });
  }, [selectedPolygon, syncPolygonFromMap, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    const maps = mapsRef.current;
    if (!map || !maps) return;

    if (mapClickListenerRef.current) maps.event.removeListener(mapClickListenerRef.current);
    clearTemporaryDrawing();
    if (tool === "none") return;

    mapClickListenerRef.current = map.addListener("click", (event: any) => {
      const point: LatLng = [event.latLng.lat(), event.latLng.lng()];
      if (tool === "rectangle") {
        if (!rectangleStartRef.current) {
          rectangleStartRef.current = point;
          return;
        }
        const [startLat, startLng] = rectangleStartRef.current;
        const coords: LatLng[] = [
          [startLat, startLng], [startLat, point[1]], [point[0], point[1]], [point[0], startLng],
        ];
        const area = calculateArea(coords);
        onPolygonChange(coords, area.rai, area.ha);
        clearTemporaryDrawing();
        onToolChange("none");
        return;
      }

      const points = [...drawingPointsRef.current, point];
      drawingPointsRef.current = points;
      if (!temporaryLineRef.current) {
        temporaryLineRef.current = new maps.Polyline({
          path: points.map(([lat, lng]) => ({ lat, lng })),
          strokeColor: "#B4841F",
          strokeOpacity: 1,
          strokeWeight: 2,
          map,
        });
      } else {
        temporaryLineRef.current.setPath(points.map(([lat, lng]) => ({ lat, lng })));
      }

      // Keep the established four-corner drawing flow used by the existing map.
      if (points.length === 4) {
        const area = calculateArea(points);
        onPolygonChange(points, area.rai, area.ha);
        clearTemporaryDrawing();
        onToolChange("none");
      }
    });

    return () => {
      if (mapClickListenerRef.current) maps.event.removeListener(mapClickListenerRef.current);
      mapClickListenerRef.current = null;
    };
  }, [tool, calculateArea, clearTemporaryDrawing, onPolygonChange, onToolChange, mapReady]);

  useEffect(() => {
    if (!flyToCoords || !mapRef.current) return;
    mapRef.current.panTo({ lat: flyToCoords.lat, lng: flyToCoords.lng });
    mapRef.current.setZoom(flyToCoords.zoom || 16);
  }, [flyToCoords, mapReady]);

  if (!apiKey) {
    return <div className="w-full h-full bg-[#1a2419] text-line flex items-center justify-center p-6 text-center text-sm">ยังไม่ได้ตั้งค่า Google Maps API key</div>;
  }

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className={`w-full h-full ${tool !== "none" ? "cursor-crosshair" : "cursor-default"}`} />
      <div className="absolute top-3 left-3 z-10 w-[min(360px,calc(100%-24px))]">
        <input
          ref={searchInputRef}
          aria-label="ค้นหาสถานที่"
          placeholder="ค้นหาสถานที่หรือที่อยู่ในประเทศไทย"
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-lg outline-none focus:border-emerald-700"
        />
      </div>
      {error && <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/80 p-6 text-center text-sm text-white">{error}</div>}
    </div>
  );
}
