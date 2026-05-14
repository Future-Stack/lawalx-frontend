/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';
import BaseDialog from '@/common/BaseDialog';

// Dynamically import the Map implementation to avoid SSR issues with Leaflet
const LeafletMapInner = dynamic(() => import('./LeafletMapInner'), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full flex items-center justify-center bg-gray-50 dark:bg-gray-800/50">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Loading Map...</p>
            </div>
        </div>
    )
});

interface LeafletMapModalProps {
    isOpen: boolean;
    onClose: () => void;
    lat: number;
    lng: number;
    label: string;
    device: any;
    onLocationSelect?: (lat: number, lng: number) => void;
}

const LeafletMapModal: React.FC<LeafletMapModalProps> = ({ isOpen, onClose, lat, lng, device, onLocationSelect }) => {
    const [isMounted, setIsMounted] = useState(false);
    const [timezone, setTimezone] = useState<string>("Loading...");
    const [currentLat, setCurrentLat] = useState(lat);
    const [currentLng, setCurrentLng] = useState(lng);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        setCurrentLat(lat);
        setCurrentLng(lng);
    }, [lat, lng]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
            );
            const data = await response.json();
            if (data && data.length > 0) {
                const result = data[0];
                const newLat = parseFloat(result.lat);
                const newLng = parseFloat(result.lon);
                setCurrentLat(newLat);
                setCurrentLng(newLng);
            } else {
                alert("Location not found. Please try a different search term.");
            }
        } catch (error) {
            console.error("Search error:", error);
            alert("Failed to search location. Please try again.");
        }
    };

    useEffect(() => {
        if (isOpen && currentLat && currentLng) {
            // First check if metadata already has timezone
            const metadataTz = device?.original?.metadata?.timezone;
            if (metadataTz) {
                setTimezone(metadataTz);
                return;
            }

            const fetchTimezone = async () => {
                try {
                    const response = await fetch(
                        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${currentLat}&longitude=${currentLng}&localityLanguage=en`
                    );
                    const data = await response.json();
                    
                    // The BigDataCloud API provides timezone in the informative section
                    const tzInfo = data.localityInfo?.informative?.find((i: any) => 
                        i.description === 'time zone' || (i.name && i.name.includes('/'))
                    );
                    
                    if (tzInfo) {
                        setTimezone(tzInfo.name);
                    } else {
                        // Fallback
                        setTimezone("UTC"); 
                    }
                } catch (error) {
                    console.error("Failed to fetch timezone:", error);
                    setTimezone("Asia/Dhaka"); // Default fallback
                }
            };
            fetchTimezone();
        }
    }, [isOpen, currentLat, currentLng, device]);

    if (!isMounted) return null;

    return (
        <BaseDialog
            open={isOpen}
            setOpen={(val) => !val && onClose()}
            title="Locations"
            description={typeof device?.device === 'object' ? "Device Location" : (device?.device || "Device Location")}
            maxWidth="4xl"
            maxHeight="xl"
            className="project-font"
        >
            <div className="flex flex-col h-[500px] sm:h-[600px]">
                {/* Map Sub-header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2 text-sm font-medium text-[#737373] dark:text-gray-400">
                        <MapPin className="w-4 h-4" />
                        <span>Map View</span>
                    </div>
                    <div className="text-sm text-[#737373] dark:text-gray-400">
                        Time Zone: <span className="text-[#171717] dark:text-white font-bold ml-1">{timezone}</span>
                    </div>
                </div>

                {/* Search Input */}
                <div className="flex gap-2 mb-4 px-1">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Search for a location..."
                        className="flex-1 h-10 px-3 border border-borderGray dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-bgBlue"
                    />
                    <button
                        onClick={handleSearch}
                        className="px-4 py-2 bg-bgBlue text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer shadow-customShadow"
                    >
                        Search
                    </button>
                </div>

                {/* Map Container Wrapper */}
                <div className="flex-1 relative rounded-[24px] overflow-hidden border border-[#D4D4D4] dark:border-gray-800 shadow-inner bg-gray-50 dark:bg-gray-900/20">
                    <LeafletMapInner
                        lat={currentLat}
                        lng={currentLng}
                        device={device}
                        onLocationSelect={onLocationSelect}
                    />
                </div>
            </div>

            <style jsx global>{`
                .leaflet-container {
                    background: transparent !important;
                    z-index: 0 !important;
                }
                .custom-div-icon {
                    background: transparent !important;
                    border: none !important;
                }
                .leaflet-popup-content-wrapper {
                    border-radius: 16px !important;
                    padding: 4px !important;
                    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1) !important;
                }
                .leaflet-popup-tip {
                    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1) !important;
                }
                .leaflet-control-container {
                    display: none !important;
                }
            `}</style>
        </BaseDialog>
    );
};

export default LeafletMapModal;
