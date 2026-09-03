"use client";

import { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import * as turf from "@turf/turf";

export type DrawingTool = "polygon" | "rectangle" | "circle" | "none";

interface SatelliteMapProps {
  tool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
  selectedPolygon: [number, number][] | null;
  onPolygonChange: (coords: [number, number][], areaRai: number, areaHa: number) => void;
  flyToCoords?: { lat: number; lng: number; zoom?: number } | null;
}

export default function SatelliteMap({
  tool,
  onToolChange,
  selectedPolygon,
  onPolygonChange,
  flyToCoords,
}: SatelliteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polygonLayerRef = useRef<L.Polygon | null>(null);
  const anchorMarkersRef = useRef<L.Marker[]>([]);
  const drawingPointsRef = useRef<[number, number][]>([]);
  const tempDrawingLayerRef = useRef<L.Polyline | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const currentCoordsRef = useRef<[number, number][]>([]);

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
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

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
