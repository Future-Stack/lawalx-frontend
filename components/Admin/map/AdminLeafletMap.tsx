"use client";

import { useEffect, useRef } from "react";

interface Props {
  lat: number;
  lng: number;
  onMarkerClick?: () => void;
}

export default function AdminLeafletMap({ lat, lng, onMarkerClick }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamically import leaflet to avoid SSR issues
    import("leaflet").then((L) => {
      // Fix default marker icons
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!mapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [lat || 0, lng || 0],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      // Custom blue device marker
      const deviceIcon = L.divIcon({
        html: `<div style="
          width: 40px; height: 40px;
          background: #3B82F6;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(59,130,246,0.5);
          display: flex; align-items: center; justify-content: center;
        ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
        </div>`,
        className: "",
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -24],
      });

      const marker = L.marker([lat || 0, lng || 0], { icon: deviceIcon }).addTo(map);

      if (onMarkerClick) {
        marker.on("click", onMarkerClick);
      }

      // Add zoom control in top-right
      L.control.zoom({ position: "topright" }).addTo(map);

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Pan to new coords if they change
  useEffect(() => {
    if (mapInstanceRef.current && (lat || lng)) {
      mapInstanceRef.current.setView([lat, lng], 13);
    }
  }, [lat, lng]);

  return (
    <>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div
        ref={mapRef}
        className="w-full h-[450px] rounded-3xl overflow-hidden z-0"
        style={{ position: "relative" }}
      />
    </>
  );
}
