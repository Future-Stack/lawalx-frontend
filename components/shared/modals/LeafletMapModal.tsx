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
}

const LeafletMapModal: React.FC<LeafletMapModalProps> = ({ isOpen, onClose, lat, lng, device }) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return (
        <BaseDialog
            open={isOpen}
            setOpen={(val) => !val && onClose()}
            title="Locations"
            description={device?.device || "Device Location"}
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
                        Time Zone: <span className="text-[#171717] dark:text-white font-bold ml-1">Asia/Dhaka</span>
                    </div>
                </div>

                {/* Map Container Wrapper */}
                <div className="flex-1 relative rounded-[24px] overflow-hidden border border-[#D4D4D4] dark:border-gray-800 shadow-inner bg-gray-50 dark:bg-gray-900/20">
                    <LeafletMapInner
                        lat={lat}
                        lng={lng}
                        device={device}
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
