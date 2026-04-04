"use client";

import React from "react";

interface ResolvedLocationProps {
  lat: number;
  lng: number;
  fallback?: string;
  className?: string;
}

const ResolvedLocation: React.FC<ResolvedLocationProps> = ({ lat, lng, fallback, className }) => {
  const [address, setAddress] = React.useState<string>("Loading location...");

  React.useEffect(() => {
    const fetchAddress = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`
        );
        const data = await res.json();
        if (data.display_name) {
          const a = data.address;
          const city = a.city || a.town || a.village || a.suburb || a.county || "";
          const country = a.country || "";
          setAddress(city && country ? `${city}, ${country}` : data.display_name.split(",").slice(0, 2).join(","));
        } else {
          setAddress(fallback || `${lat.toFixed(2)}, ${lng.toFixed(2)}`);
        }
      } catch (e) {
        setAddress(fallback || `${lat.toFixed(2)}, ${lng.toFixed(2)}`);
      }
    };
    fetchAddress();
  }, [lat, lng, fallback]);

  return <span className={className}>{address}</span>;
};

export default ResolvedLocation;
