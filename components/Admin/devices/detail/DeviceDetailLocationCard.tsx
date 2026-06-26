import React from "react";
import { MapPin } from "lucide-react";
import AdminLeafletMap from "@/components/Admin/map/AdminLeafletMap";
import DeviceLocation from "@/components/common/DeviceLocation";
import InfoItem from "./InfoItem";

interface DeviceDetailLocationCardProps {
  device: any;
  lat: number;
  lng: number;
  isNA: boolean;
  onMarkerClick: () => void;
}

export const DeviceDetailLocationCard: React.FC<DeviceDetailLocationCardProps> = ({
  device,
  lat,
  lng,
  isNA,
  onMarkerClick,
}) => {
  return (
    <div className="bg-navbarBg rounded-2xl border border-border overflow-hidden">
      <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/30 border-b border-border">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Location</h2>
        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
          Physical location and network information
        </p>
      </div>

      <div className="p-6 h-fit pt-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 font-semibold">
            <MapPin className="w-4 h-4 text-gray-300" />
            <span>
              {device?.location && typeof device.location === "object" ? (
                <DeviceLocation lat={device.location.lat ?? 0} lng={device.location.lng ?? 0} />
              ) : (
                (typeof device?.location === "string" ? device.location : null) || "N/A"
              )}
            </span>
          </div>
          <div className="text-[11px] font-bold text-gray-400">
            Time Zone:{" "}
            <span className="text-gray-900 dark:text-white">{device?.user?.timeZone || "N/A"}</span>
          </div>
        </div>

        {isNA ? (
          <div className="w-full h-[450px] rounded-3xl overflow-hidden bg-gray-50 dark:bg-gray-800/50 flex flex-col items-center justify-center border border-dashed border-border gap-2 text-muted-foreground p-4">
            <MapPin className="w-8 h-8 text-gray-300" />
            <span className="text-sm font-semibold text-gray-500">Location not set (N/A)</span>
          </div>
        ) : (
          <AdminLeafletMap lat={lat} lng={lng} onMarkerClick={onMarkerClick} />
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 px-2 pb-4">
          <InfoItem label="Network Type" value="WiFi" />
          <InfoItem label="Signal Strength" value="Optimal" />
          <InfoItem label="IP Address" value={device?.ip || "N/A"} />
        </div>
      </div>
    </div>
  );
};

export default DeviceDetailLocationCard;
