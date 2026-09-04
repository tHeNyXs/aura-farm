"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import L from "leaflet";
import * as turf from "@turf/turf";

export type DrawingTool = "polygon" | "rectangle" | "circle" | "none";

interface SatelliteMapProps {
  tool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
  selectedPolygon: [number, number][] | null;
  onPolygonChange: (coords: [number, number][], areaRai: number, areaHa: number) => void;
  flyToCoords?: { lat: number; lng: number; zoom?: number } | null;
  zoningCropId?: string | null;
}

const ZONING_STYLES: Record<string, { fillColor: string; color: string; label: string }> = {
  S1: { fillColor: "#16a34a", color: "#15803d", label: "เหมาะสมมาก" },
  S2: { fillColor: "#eab308", color: "#ca8a04", label: "เหมาะสมปานกลาง" },
  S3: { fillColor: "#f97316", color: "#ea580c", label: "มีข้อจำกัด" },
  N: { fillColor: "#dc2626", color: "#b91c1c", label: "ไม่เหมาะสม" },
};

export default function SatelliteMap({
  tool,
  onToolChange,
  selectedPolygon,
  onPolygonChange,
  flyToCoords,
  zoningCropId,
}: SatelliteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polygonLayerRef = useRef<L.Polygon | null>(null);
  const anchorMarkersRef = useRef<L.Marker[]>([]);
  const drawingPointsRef = useRef<[number, number][]>([]);
  const tempDrawingLayerRef = useRef<L.Polyline | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const currentCoordsRef = useRef<[number, number][]>([]);
  const zoningLayerRef = useRef<L.GeoJSON | null>(null);
  const zoningRequestRef = useRef<AbortController | null>(null);
  const zoningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [zoningStatus, setZoningStatus] = useState<string | null>(null);

  // DOM refs for overlay stats
  const gridCodeRef = useRef<HTMLSpanElement>(null);
  const scaleRef = useRef<HTMLSpanElement>(null);
  const centerCoordsRef = useRef<HTMLSpanElement>(null);

  // Sync coords ref
  useEffect(() => {
    if (selectedPolygon) {
      currentCoordsRef.current = selectedPolygon;
    }
  }, [selectedPolygon]);

  // Calculate area from coordinates using Turf
  const calculateArea = useCallback((coords: [number, number][]) => {
    if (coords.length < 3) return { rai: 0, ha: 0, sqm: 0 };
    try {
      const turfCoords = coords.map(([lat, lng]) => [lng, lat]);
      if (
        turfCoords[0][0] !== turfCoords[turfCoords.length - 1][0] ||
        turfCoords[0][1] !== turfCoords[turfCoords.length - 1][1]
      ) {
        turfCoords.push(turfCoords[0]);
      }
      const poly = turf.polygon([turfCoords]);
      const sqm = turf.area(poly);
      const rai = Number((sqm / 1600).toFixed(1));
      const ha = Number((sqm / 10000).toFixed(2));
      return { rai, ha, sqm };
    } catch {
      return { rai: 0, ha: 0, sqm: 0 };
    }
  }, []);

  // Update draggable anchor markers on vertices with native pointer events
  const updateAnchorMarkers = useCallback((coords: [number, number][]) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (isDraggingRef.current) return;

    // Clear old markers
    anchorMarkersRef.current.forEach((m) => m.remove());
    anchorMarkersRef.current = [];

    coords.forEach(([lat, lng], index) => {
      // 24px easy-touch draggable handle with prominent gold color and white border
      const anchorIcon = L.divIcon({
        className: "custom-vertex-handle-container",
        html: `
          <div style="
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: grab;
            user-select: none;
            touch-action: none;
          ">
            <div style="
              width: 16px;
              height: 16px;
              background: #B4841F;
              border: 3px solid #FFFFFF;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(0,0,0,0.8), 0 0 0 2px #B4841F;
              transition: transform 0.1s ease;
            "></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([lat, lng], {
        icon: anchorIcon,
        interactive: true,
        zIndexOffset: 2000,
      }).addTo(map);

      // Attach native pointer events for 100% reliable drag
      const element = marker.getElement();
      if (element) {
        L.DomEvent.disableClickPropagation(element);
        L.DomEvent.disableScrollPropagation(element);

        const onPointerDown = (e: PointerEvent) => {
          e.stopPropagation();
          e.preventDefault();
          isDraggingRef.current = true;

          const target = e.currentTarget as HTMLElement;
          target.setPointerCapture(e.pointerId);

          if (mapInstanceRef.current) {
            mapInstanceRef.current.dragging.disable();
          }

          const onPointerMove = (moveEvt: PointerEvent) => {
            moveEvt.stopPropagation();
            moveEvt.preventDefault();

            const currentMap = mapInstanceRef.current;
            if (!currentMap) return;

            const mapRect = currentMap.getContainer().getBoundingClientRect();
            const mouseX = moveEvt.clientX - mapRect.left;
            const mouseY = moveEvt.clientY - mapRect.top;

            const newLatLng = currentMap.containerPointToLatLng(L.point(mouseX, mouseY));
            marker.setLatLng(newLatLng);

            const updated: [number, number][] = currentCoordsRef.current.map((c, i) =>
              i === index ? [newLatLng.lat, newLatLng.lng] : c
            );
            currentCoordsRef.current = updated;

            if (polygonLayerRef.current) {
              polygonLayerRef.current.setLatLngs(updated);
            }

            const areaInfo = calculateArea(updated);
            onPolygonChange(updated, areaInfo.rai, areaInfo.ha);
          };

          const onPointerUp = (upEvt: PointerEvent) => {
            upEvt.stopPropagation();
            upEvt.preventDefault();

            target.releasePointerCapture(e.pointerId);
            target.removeEventListener("pointermove", onPointerMove);
            target.removeEventListener("pointerup", onPointerUp);
            target.removeEventListener("pointercancel", onPointerUp);

            isDraggingRef.current = false;

            if (mapInstanceRef.current) {
              mapInstanceRef.current.dragging.enable();
            }

            const finalCoords = currentCoordsRef.current;
            const areaInfo = calculateArea(finalCoords);
            onPolygonChange(finalCoords, areaInfo.rai, areaInfo.ha);
            updateAnchorMarkers(finalCoords);
          };

          target.addEventListener("pointermove", onPointerMove);
          target.addEventListener("pointerup", onPointerUp);
          target.addEventListener("pointercancel", onPointerUp);
        };

        element.addEventListener("pointerdown", onPointerDown);
      }

      anchorMarkersRef.current.push(marker);
    });
  }, [calculateArea, onPolygonChange]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = 13.75;
    const initialLng = 100.5;
    const initialZoom = 7;

    const thailandBounds = L.latLngBounds([5.2, 96.0], [20.9, 106.2]);

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      minZoom: 6,
      maxZoom: 20,
      maxBounds: thailandBounds,
      maxBoundsViscosity: 0.85,
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true,
      zoomSnap: 1,
      zoomDelta: 1,
      wheelPxPerZoomLevel: 60,
      wheelDebounceTime: 40,
      zoomAnimation: true,
      fadeAnimation: true,
    });

    const satelliteLayer = L.tileLayer(
      "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
      {
        maxZoom: 20,
        maxNativeZoom: 19,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
        keepBuffer: 8,
        attribution: "Google Satellite",
      }
    );
    satelliteLayer.addTo(map);

    L.control.zoom({ position: "topright" }).addTo(map);

    mapInstanceRef.current = map;

    const updateStats = () => {
      const center = map.getCenter();
      const zoom = Math.round(map.getZoom());

      const scales: Record<number, string> = {
        13: "1:25,000",
        14: "1:15,000",
        15: "1:5,000",
        16: "1:2,500",
        17: "1:1,200",
        18: "1:600",
        19: "1:300",
        20: "1:150",
      };

      if (gridCodeRef.current) {
        gridCodeRef.current.innerText = `GRID S-${Math.abs(Math.round(center.lat * 2))}-W`;
      }
      if (scaleRef.current) {
        scaleRef.current.innerText = `SCALE ${scales[zoom] || "1:5,000"}`;
      }
      if (centerCoordsRef.current) {
        centerCoordsRef.current.innerText = `LAT: ${center.lat.toFixed(4)}° N, LON: ${center.lng.toFixed(4)}° E`;
      }
    };

    map.on("move", updateStats);
    map.on("zoomend", updateStats);
    updateStats();

    return () => {
      map.off("move", updateStats);
      map.off("zoomend", updateStats);
      zoningRequestRef.current?.abort();
      if (zoningTimerRef.current) clearTimeout(zoningTimerRef.current);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Fetch only the zoning polygons in the current viewport. This keeps the nationwide
  // LDD data responsive even on slower connections.
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const clearLayer = () => {
      zoningLayerRef.current?.remove();
      zoningLayerRef.current = null;
    };
    if (!zoningCropId) {
      zoningRequestRef.current?.abort();
      clearLayer();
      setZoningStatus(null);
      return;
    }

    const loadLayer = async () => {
      const zoom = Math.round(map.getZoom());
      if (zoom < 11) {
        clearLayer();
        setZoningStatus("ซูมเข้าอีกนิดเพื่อแสดงระดับความเหมาะสม");
        return;
      }
      const bounds = map.getBounds();
      zoningRequestRef.current?.abort();
      const controller = new AbortController();
      zoningRequestRef.current = controller;
      setZoningStatus("กำลังโหลดชั้นข้อมูล LDD...");

      try {
        const params = new URLSearchParams({
          crop_id: zoningCropId,
          west: String(bounds.getWest()),
          south: String(bounds.getSouth()),
          east: String(bounds.getEast()),
          north: String(bounds.getNorth()),
          zoom: String(zoom),
        });
        const response = await fetch(`/api/zoning-map?${params}`, { signal: controller.signal, cache: "no-store" });
        if (!response.ok) throw new Error("ไม่สามารถโหลดข้อมูล LDD ได้");
        const data = await response.json();
        if (controller.signal.aborted) return;
        clearLayer();
        if (data?.features?.length) {
          zoningLayerRef.current = L.geoJSON(data, {
            style: (feature) => {
              const style = ZONING_STYLES[String(feature?.properties?.suitability)] || ZONING_STYLES.N;
              return { ...style, fillOpacity: 0.38, opacity: 0.9, weight: 1 };
            },
          }).addTo(map);
        }
        setZoningStatus(data?.zoom_required ? "ซูมเข้าอีกนิดเพื่อแสดงระดับความเหมาะสม" : data?.features?.length ? `แสดง ${data.features.length} เขตข้อมูล LDD` : "บริเวณนี้ไม่มีข้อมูล LDD สำหรับพืชนี้");
      } catch (loadError) {
        if ((loadError as Error).name !== "AbortError") {
          clearLayer();
          setZoningStatus("ยังโหลดชั้นข้อมูล LDD ไม่สำเร็จ");
        }
      }
    };

    const scheduleLoad = () => {
      if (zoningTimerRef.current) clearTimeout(zoningTimerRef.current);
      zoningTimerRef.current = setTimeout(loadLayer, 350);
    };
    map.on("moveend", scheduleLoad);
    map.on("zoomend", scheduleLoad);
    scheduleLoad();

    return () => {
      map.off("moveend", scheduleLoad);
      map.off("zoomend", scheduleLoad);
      zoningRequestRef.current?.abort();
      if (zoningTimerRef.current) clearTimeout(zoningTimerRef.current);
    };
  }, [zoningCropId]);

  // Handle flyToCoords changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !flyToCoords) return;
    map.flyTo([flyToCoords.lat, flyToCoords.lng], flyToCoords.zoom || 16, {
      duration: 1.5,
      easeLinearity: 0.25,
    });
  }, [flyToCoords]);

  // Update Polygon Layer and Draggable Anchors
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (isDraggingRef.current) return;

    if (selectedPolygon && selectedPolygon.length >= 3) {
      if (polygonLayerRef.current) {
        polygonLayerRef.current.setLatLngs(selectedPolygon);
      } else {
        polygonLayerRef.current = L.polygon(selectedPolygon, {
          color: "#B4841F",
          weight: 3,
          fillColor: "#B4841F",
          fillOpacity: 0.25,
          smoothFactor: 1,
        }).addTo(map);
      }
      updateAnchorMarkers(selectedPolygon);
    } else {
      if (polygonLayerRef.current) {
        polygonLayerRef.current.remove();
        polygonLayerRef.current = null;
      }
      anchorMarkersRef.current.forEach((m) => m.remove());
      anchorMarkersRef.current = [];
    }
  }, [selectedPolygon, updateAnchorMarkers]);

  // Interactive Drawing Handlers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const clearTemp = () => {
      if (tempDrawingLayerRef.current) {
        tempDrawingLayerRef.current.remove();
        tempDrawingLayerRef.current = null;
      }
      drawingPointsRef.current = [];
    };

    if (tool === "none") {
      clearTemp();
      return;
    }

    if (tool === "polygon") {
      const onClick = (e: L.LeafletMouseEvent) => {
        if (isDraggingRef.current) return;

        const { lat, lng } = e.latlng;
        const newPoint: [number, number] = [lat, lng];
        const points = [...drawingPointsRef.current, newPoint];
        drawingPointsRef.current = points;

        if (points.length >= 4) {
          const areaInfo = calculateArea(points);
          onPolygonChange(points, areaInfo.rai, areaInfo.ha);
          clearTemp();
          onToolChange("none");
          return;
        }

        if (tempDrawingLayerRef.current) {
          tempDrawingLayerRef.current.setLatLngs(points);
        } else {
          tempDrawingLayerRef.current = L.polyline(points, {
            color: "#B4841F",
            weight: 2,
            dashArray: "4, 6",
          }).addTo(map);
        }
      };

      const onDblClick = () => {
        const points = drawingPointsRef.current;
        if (points.length >= 3) {
          const areaInfo = calculateArea(points);
          onPolygonChange(points, areaInfo.rai, areaInfo.ha);
        }
        clearTemp();
        onToolChange("none");
      };

      map.on("click", onClick);
      map.on("dblclick", onDblClick);

      return () => {
        map.off("click", onClick);
        map.off("dblclick", onDblClick);
      };
    }

    if (tool === "rectangle") {
      let startPoint: [number, number] | null = null;

      const onClick = (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        if (!startPoint) {
          startPoint = [lat, lng];
          drawingPointsRef.current = [startPoint];
        } else {
          const p1 = startPoint;
          const p2: [number, number] = [p1[0], lng];
          const p3: [number, number] = [lat, lng];
          const p4: [number, number] = [lat, p1[1]];
          const rectCoords: [number, number][] = [p1, p2, p3, p4];

          const areaInfo = calculateArea(rectCoords);
          onPolygonChange(rectCoords, areaInfo.rai, areaInfo.ha);
          clearTemp();
          onToolChange("none");
        }
      };

      map.on("click", onClick);

      return () => {
        map.off("click", onClick);
      };
    }
  }, [tool, calculateArea, onPolygonChange, onToolChange]);

  return (
    <div className="w-full h-full relative">
      <div
        ref={mapContainerRef}
        className={`w-full h-full z-0 ${
          tool !== "none" ? "cursor-crosshair" : "cursor-default"
        }`}
      />

      {zoningCropId && (
        <div className="absolute right-3 top-3 z-[1000] w-48 rounded-lg border border-line bg-panel/95 p-3 text-xs text-ink-body shadow-lg backdrop-blur-sm pointer-events-none">
          <div className="mb-2 font-bold text-primary-dark">ระดับความเหมาะสม LDD</div>
          {Object.entries(ZONING_STYLES).map(([level, style]) => (
            <div key={level} className="mb-1 flex items-center gap-2 last:mb-0">
              <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: style.fillColor }} />
              <span><b>{level}</b> — {style.label}</span>
            </div>
          ))}
          {zoningStatus && <div className="mt-2 border-t border-line pt-2 text-[11px] text-ink-soft">{zoningStatus}</div>}
        </div>
      )}

      {/* Coordinate & Scale HUD Overlay at Bottom-Left */}
      <div className="absolute bottom-6 left-6 z-[1000] bg-panel/90 backdrop-blur-xs border border-line rounded px-3 py-1.5 flex items-center gap-3 font-mono text-[11px] text-ink-body shadow-md select-none pointer-events-none">
        <span ref={gridCodeRef} className="text-accent font-bold">
          GRID S-29-W
        </span>
        <span className="w-px h-3 bg-line" />
        <span ref={scaleRef}>SCALE 1:5,000</span>
        <span className="w-px h-3 bg-line" />
        <span ref={centerCoordsRef}>LAT: 13.7500° N, LON: 100.5000° E</span>
      </div>
    </div>
  );
}
