"use client";

import React, { useState, useEffect } from "react";

interface ReverseGeocodeProps {
  lat: number;
  lng: number;
  fallback?: string;
  onAddressResolved?: (address: string) => void;
}

const ReverseGeocode: React.FC<ReverseGeocodeProps> = ({
  lat,
  lng,
  fallback = "N/A",
  onAddressResolved,
}) => {
  const [address, setAddress] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!lat || !lng || (lat === 0 && lng === 0)) {
      setAddress(fallback);
      setLoading(false);
      return;
    }

    const fetchAddress = async () => {
      setLoading(true);
      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

        // Try to use JS Geocoder if available (it might already be loaded by other components)
        // @ts-ignore
        if (typeof window !== 'undefined' && window.google?.maps?.Geocoder) {
          // @ts-ignore
          const geocoder = new window.google.maps.Geocoder();
          const response = await geocoder.geocode({ location: { lat, lng } });
          if (response.results && response.results[0]) {
            const result = response.results[0].formatted_address;
            setAddress(result);
            if (onAddressResolved) onAddressResolved(result);
            setLoading(false);
            return;
          }
        }

        // Fallback to direct HTTP fetch if JS Geocoder is not ready or failed
        if (!apiKey) {
          console.warn("ReverseGeocode: Missing Google Maps API Key");
          setAddress(fallback);
          setLoading(false);
          return;
        }

        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === "OK" && data.results.length > 0) {
          const formattedAddress = data.results[0].formatted_address;
          setAddress(formattedAddress);
          if (onAddressResolved) onAddressResolved(formattedAddress);
        } else {
          console.error(`ReverseGeocode Error (${data.status}):`, data.error_message || "No results found");
          // If falling back, show the coordinates with more precision maybe? Or just use fallback
          setAddress(fallback);
        }
      } catch (error) {
        console.error("ReverseGeocode Fetch Exception:", error);
        setAddress(fallback);
      } finally {
        setLoading(false);
      }
    };

    fetchAddress();
  }, [lat, lng, fallback, onAddressResolved]);

  if (loading) {
    return (
      <span className="flex items-center gap-1.5 text-gray-400">
        <div className="w-1.5 h-1.5 rounded-full bg-bgBlue animate-ping shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-widest animate-pulse">Resolving...</span>
      </span>
    );
  }

  return <span className="whitespace-nowrap">{address || fallback}</span>;
};

export default ReverseGeocode;
