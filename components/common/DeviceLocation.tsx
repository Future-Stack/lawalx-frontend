"use client";

import React, { useState, useEffect } from "react";

// Simple cache for geocoding results to avoid redundant API calls across all instances
const geocodeCache: { [key: string]: string } = {};

interface DeviceLocationProps {
    lat: number;
    lng: number;
    fallbackLabel?: string;
}

const DeviceLocation: React.FC<DeviceLocationProps> = ({ lat, lng, fallbackLabel }) => {
    const [address, setAddress] = useState<string>(fallbackLabel || `Lat: ${lat.toFixed(2)}, Lng: ${lng.toFixed(2)}`);

    useEffect(() => {
        const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
        if (geocodeCache[cacheKey]) {
            setAddress(geocodeCache[cacheKey]);
            return;
        }

        const fetchAddress = async () => {
            try {
                // Using Nominatim (OpenStreetMap) for free reverse geocoding
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
                    { headers: { 'User-Agent': 'Lawalx-Frontend/1.0' } }
                );
                const data = await response.json();

                if (data.display_name) {
                    const a = data.address;
                    const city = a.city || a.town || a.village || a.suburb || a.county || '';
                    const country = a.country || '';
                    const formatted = city && country ? `${city}, ${country}` : data.display_name.split(',').slice(0, 2).join(',');

                    geocodeCache[cacheKey] = formatted;
                    setAddress(formatted);
                }
            } catch (error) {
                console.error("Geocoding error:", error);
            }
        };

        const timer = setTimeout(fetchAddress, 500); // Debounce to respect rate limits
        return () => clearTimeout(timer);
    }, [lat, lng]);

    return <span>{address}</span>;
}

export default DeviceLocation;
