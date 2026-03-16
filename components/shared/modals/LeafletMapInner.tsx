"use client";

import React from 'react';
import { X, ZoomIn, ZoomOut, MapPin, Monitor } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import "leaflet/dist/leaflet.css";

// Fix Leaflet icon issue
if (typeof window !== 'undefined') {
    // @ts-ignore - _getIconUrl is an internal Leaflet property
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
}

// Custom Zoom Controls Component
const ZoomControls = () => {
    const map = useMap();
    return (
        <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-3">
            <button
                onClick={() => map.zoomIn()}
                className="w-11 h-11 bg-white dark:bg-gray-800 rounded-full shadow-xl flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer border border-gray-200 dark:border-gray-700 active:scale-95 translate-x-0"
                title="Zoom In"
                type="button"
            >
                <ZoomIn className="w-5 h-5 text-[#171717] dark:text-white" />
            </button>
            <button
                onClick={() => map.zoomOut()}
                className="w-11 h-11 bg-white dark:bg-gray-800 rounded-full shadow-xl flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer border border-gray-200 dark:border-gray-700 active:scale-95 translate-x-0"
                title="Zoom Out"
                type="button"
            >
                <ZoomOut className="w-5 h-5 text-[#171717] dark:text-white" />
            </button>
        </div>
    );
};

interface Props {
    lat: number;
    lng: number;
    device: any;
}

const LeafletMapInner: React.FC<Props> = ({ lat, lng, device }) => {
    // Custom Icon for Leaflet (Monitor Pointer)
    const customIcon = L.divIcon({
        className: "custom-div-icon",
        html: `
            <div style="position: relative; width: 60px; height: 74px;">
                <svg width="60" height="74" viewBox="0 0 60 74" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M30 0C13.4315 0 0 13.4315 0 30C0 52.5 30 74 30 74C30 74 60 52.5 60 30C60 13.4315 46.5685 0 30 0Z" fill="#3B82F6"/>
                    <circle cx="30" cy="30" r="22" fill="white"/>
                </svg>
                <div style="position: absolute; top: 15px; left: 50%; transform: translateX(-50%); color: #3B82F6; display: flex; align-items: center; justify-content: center;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect width="20" height="14" x="2" y="3" rx="2"/>
                        <line x1="8" x2="16" y1="21" y2="21"/>
                        <line x1="12" x2="12" y1="17" y2="21"/>
                    </svg>
                </div>
            </div>
        `,
        iconSize: [60, 74],
        iconAnchor: [30, 74],
        popupAnchor: [0, -70],
    });

    const position: [number, number] = [lat, lng];

    return (
        <MapContainer
            center={position}
            zoom={13}
            zoomControl={false}
            style={{ height: "100%", width: "100%", zIndex: 0 }}
            className="z-0"
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            <ZoomControls />

            <Marker position={position} icon={customIcon}>
                <Popup className="custom-popup">
                    <div className="text-center p-2 min-w-[150px]">
                        <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg mb-2 flex justify-center">
                            <Monitor className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="font-bold text-sm text-gray-900 dark:text-white">{device?.device}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{device?.location}</p>
                    </div>
                </Popup>
            </Marker>
        </MapContainer>
    );
};

export default LeafletMapInner;
