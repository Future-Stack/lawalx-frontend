"use client";

import React, { useEffect, useRef, useState } from 'react';
import { X, Monitor, User, MapPin, Database, Cpu, Activity } from 'lucide-react';
import "leaflet/dist/leaflet.css";

interface AdminLeafletMapModalProps {
    isOpen: boolean;
    onClose: () => void;
    lat: number;
    lng: number;
    label: string;
    device: any;
}

const AdminLeafletMapModal: React.FC<AdminLeafletMapModalProps> = ({ isOpen, onClose, lat, lng, device }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markerRef = useRef<any>(null);

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Online': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'Offline': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'Syncing': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    useEffect(() => {
        const mapElement = mapRef.current;
        if (!isOpen || !mapElement) return;

        import('leaflet').then((L) => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
            }

            const map = L.map(mapElement, {
                center: [lat || 0, lng || 0],
                zoom: 14,
                zoomControl: false,
                attributionControl: false,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
            }).addTo(map);

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
            markerRef.current = marker;

            if (device) {
                const popupContent = `
                    <div class="p-1 min-w-[200px] text-gray-900">
                        <div class="flex items-center gap-2 mb-2 border-b pb-2">
                            <div class="p-1.5 bg-blue-50 rounded-lg">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                                    <line x1="8" y1="21" x2="16" y2="21"/>
                                    <line x1="12" y1="17" x2="12" y2="21"/>
                                </svg>
                            </div>
                            <div>
                                <p class="text-sm font-bold leading-tight">${device.device}</p>
                                <p class="text-[10px] text-gray-500 font-medium">${device.model}</p>
                            </div>
                        </div>
                        <div class="space-y-2">
                            <div class="flex items-center justify-between text-[11px]">
                                <div class="flex items-center gap-1.5 text-gray-500">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                    <span>Customer</span>
                                </div>
                                <span class="font-semibold">${device.customer}</span>
                            </div>
                            <div class="flex items-center justify-between text-[11px]">
                                <div class="flex items-center gap-1.5 text-gray-500">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                                    <span>Status</span>
                                </div>
                                <span class="px-2 py-0.5 rounded-full font-bold text-[10px] ${device.status === 'Online' ? 'bg-green-100 text-green-700' : device.status === 'Offline' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}">
                                    ${device.status}
                                </span>
                            </div>
                            <div class="flex items-center justify-between text-[11px]">
                                <div class="flex items-center gap-1.5 text-gray-500">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
                                    <span>Storage</span>
                                </div>
                                <span class="font-semibold text-blue-600">${device.storage}</span>
                            </div>
                        </div>
                    </div>
                `;
                marker.bindPopup(popupContent);
            }

            L.control.zoom({ position: 'topright' }).addTo(map);
            mapInstanceRef.current = map;
        });

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [isOpen, lat, lng, device]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-200 dark:border-gray-800 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Live Tracking</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Viewing real-time location for {device?.device}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors group cursor-pointer"
                    >
                        <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                    </button>
                </div>

                <div className="p-1">
                    <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800">
                        <div ref={mapRef} style={{ width: '100%', height: '450px' }} />
                    </div>
                </div>

                <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <MapPin className="w-4 h-4" />
                        <span>Coordinates: {lat.toFixed(4)}, {lng.toFixed(4)}</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="cursor-pointer px-6 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm active:scale-95"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminLeafletMapModal;
