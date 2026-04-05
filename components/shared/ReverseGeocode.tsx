"use client";

import React, { useState, useEffect } from 'react';

interface ReverseGeocodeProps {
  lat: number;
  lng: number;
  fallback?: string;
  onAddressResolved?: (address: string) => void;
}

const ReverseGeocode: React.FC<ReverseGeocodeProps> = ({ lat, lng, fallback = "N/A", onAddressResolved }) => {
  const [address, setAddress] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!lat || !lng) {
      setAddress(fallback);
      setLoading(false);
      return;
    }

    const fetchAddress = async () => {
      setLoading(true);
      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          setAddress(`${lat.toFixed(2)}, ${lng.toFixed(2)}`);
          setLoading(false);
          return;
        }

        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
        );
        const data = await response.json();

        if (data.status === "OK" && data.results.length > 0) {
          // Find a clean address (e.g., suburb/city instead of full street if possible, or just formatted_address)
          const result = data.results[0];
          const formattedAddress = result.formatted_address;
          
          // Optional: Parse address components to find a shorter name (e.g. area/city)
          let shortAddress = formattedAddress;
          const route = result.address_components.find((c: any) => c.types.includes("route"))?.long_name;
          const sublocality = result.address_components.find((c: any) => c.types.includes("sublocality"))?.long_name;
          const locality = result.address_components.find((c: any) => c.types.includes("locality"))?.long_name;
          
          if (sublocality && locality) {
            shortAddress = `${sublocality}, ${locality}`;
          } else if (locality) {
            shortAddress = locality;
          }

          setAddress(shortAddress);
          if (onAddressResolved) onAddressResolved(shortAddress);
        } else {
          setAddress(`${lat.toFixed(2)}, ${lng.toFixed(2)}`);
        }
      } catch (error) {
        console.error("Geocoding error:", error);
        setAddress(`${lat.toFixed(2)}, ${lng.toFixed(2)}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAddress();
  }, [lat, lng, fallback, onAddressResolved]);

  if (loading) {
    return <span className="animate-pulse text-gray-400">Resolving...</span>;
  }

  return <span>{address}</span>;
};

export default ReverseGeocode;
