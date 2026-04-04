"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { ZoomIn, ZoomOut, Monitor, MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Device } from "@/redux/api/users/programs/programs.type";
import ResolvedLocation from "@/common/ResolvedLocation";

// --- Re-center and Fit Bounds Hook/Component ---
const ReCenterMap: React.FC<{ devices: Device[] }> = ({ devices }) => {
  const map = useMap();

  React.useEffect(() => {
    if (devices.length > 0) {
      const validLocations = devices
        .filter((d) => d.location && typeof d.location.lat === "number" && typeof d.location.lng === "number")
        .map((d) => [d.location!.lat, d.location!.lng] as [number, number]);

      if (validLocations.length === 1) {
        map.setView(validLocations[0], 12, { animate: true });
      } else if (validLocations.length > 1) {
        const bounds = L.latLngBounds(validLocations);
        map.fitBounds(bounds, { padding: [50, 50], animate: true });
      }
    }
  }, [devices, map]);

  return null;
};

// Custom DivIcon (Monitor Marker)
const customIcon = L.divIcon({
  className: "border-none",
  html: `
    <div style="position: relative;">
      <svg width="60" height="80" viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M30 0C13.5 0 0 13.5 0 30C0 47.5 30 80 30 80C30 80 60 47.5 60 30C60 13.5 46.5 0 30 0Z" fill="#2563EB"/>
      </svg>
      <div style="position: absolute; top: 12px; left: 50%; transform: translateX(-50%); width: 36px; height: 36px; background: white; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect width="20" height="14" x="2" y="3" rx="2"/>
          <line x1="8" x2="16" y1="21" y2="21"/>
          <line x1="12" x2="12" y1="17" y2="21"/>
        </svg>
      </div>
    </div>
  `,
  iconSize: [60, 80],
  iconAnchor: [30, 80],
  popupAnchor: [0, -80],
}) as L.DivIcon;

// Custom Zoom Controls
const ZoomControls: React.FC = () => {
  const map = useMap();

  if (!map) return null;

  return (
    <div className="absolute top-4 left-4 z-500 flex flex-col gap-2">
      <button
        onClick={() => map?.zoomIn()}
        className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        aria-label="Zoom in"
        type="button"
      >
        <ZoomIn className="w-5 h-5 text-gray-700" />
      </button>
      <button
        onClick={() => map?.zoomOut()}
        className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        aria-label="Zoom out"
        type="button"
      >
        <ZoomOut className="w-5 h-5 text-gray-700" />
      </button>
    </div>
  );
};

interface MapLocationProps {
  devices?: Device[];
}

const MapLocation: React.FC<MapLocationProps> = ({ devices = [] }) => {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      // @ts-ignore
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });
    }
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="relative">
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-semibold text-headings mb-3">Locations</h1>
          <div className="flex justify-between items-center">
            <h2 className="text-base text-muted">Map</h2>
            <h2 className="text-base text-muted">
              Time Zone: <span className="text-headings font-semibold">Asia/Dhaka</span>
            </h2>
          </div>
        </div>
        <div className="relative bg-white rounded-xl shadow-sm border border-border overflow-hidden h-96 flex items-center justify-center bg-gray-50">
          <p className="text-muted text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  const defaultPosition: [number, number] = [23.8103, 90.4125];
  const centerPosition: [number, number] =
    devices.length > 0 && devices[0].location ? [devices[0].location.lat, devices[0].location.lng] : defaultPosition;

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-xl md:text-2xl font-semibold text-headings">Locations</h1>
        </div>
        <div className="flex justify-between items-center">
          <h2 className="text-base text-muted">Map</h2>
          <h2 className="text-base text-muted">
            Time Zone: <span className="text-headings font-semibold">Asia/Dhaka</span>
          </h2>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative bg-white rounded-xl shadow-sm border border-border overflow-hidden z-0">
        <div className="relative h-96 overflow-hidden rounded-xl">
          <MapContainer
            center={centerPosition}
            zoom={devices.length > 0 ? 12 : 6}
            zoomControl={false}
            className="rounded-xl z-0"
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <ZoomControls />
            <ReCenterMap devices={devices} />

            {devices.map((device) =>
              device.location ? (
                <Marker key={device.id} position={[device.location.lat, device.location.lng]} icon={customIcon}>
                  <Popup>
                    <div className="text-center p-3 min-w-[180px]">
                      <Monitor className="w-10 h-10 text-blue-600 mx-auto mb-2" />
                      <p className="font-bold text-gray-900 text-sm">{device.name}</p>
                      <div className="flex items-center justify-center gap-1.5 mt-1.5 text-gray-600">
                        <MapPin className="w-3.5 h-3.5 text-blue-500" />
                        <p className="text-xs font-medium">
                          <ResolvedLocation lat={device.location.lat} lng={device.location.lng} />
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <span className={`w-2 h-2 rounded-full ${device.status?.toUpperCase() === "ONLINE" || device.status?.toUpperCase() === "PAIRED" ? "bg-green-500" : "bg-red-500"}`} />
                        <span className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">
                          {device.status}
                        </span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ) : null
            )}

            {devices.length === 0 && (
              <Marker position={defaultPosition} icon={customIcon}>
                <Popup>
                  <div className="text-center p-2">
                    <Monitor className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="font-semibold text-gray-900">Default Location</p>
                    <p className="text-sm text-gray-600">Dhaka, Bangladesh</p>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </div>

      {/* Tailwind inline override for Leaflet internal layers */}
      <style>
        {`
        .leaflet-container {
          z-index: 0 !important;
          border-radius: 0.75rem; /* matches rounded-xl */
          overflow: hidden;
        }
        .leaflet-pane,
        .leaflet-tile,
        .leaflet-overlay-pane,
        .leaflet-shadow-pane,
        .leaflet-popup-pane {
          z-index: 0 !important;
        }
        .leaflet-popup {
          z-index: 10 !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 0;
        }
        .leaflet-popup-content {
          margin: 0;
        }
      `}
      </style>
    </div>
  );
};

export default MapLocation;
