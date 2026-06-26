import React from "react";
import { User, Maximize2 } from "lucide-react";
import InfoItem from "./InfoItem";

interface DeviceDetailInfoCardProps {
  device: any;
}

export const DeviceDetailInfoCard: React.FC<DeviceDetailInfoCardProps> = ({ device }) => {
  return (
    <div className="bg-navbarBg rounded-2xl border border-border overflow-hidden">
      <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/30 border-b border-border">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Device Information</h2>
        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
          Hardware and software specifications
        </p>
      </div>

      <div className="p-6 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          <div className="space-y-8">
            <InfoItem
              label="Owner"
              icon={User}
              value={device?.user?.full_name || device?.user?.username || "N/A"}
            />
            <InfoItem
              label="Email"
              value={device?.user?.account?.email || device?.user?.email || "N/A"}
            />
          </div>
          <div className="space-y-8">
            <InfoItem label="Model" value={device?.model || "N/A"} />
            <InfoItem
              label="Screen Size"
              icon={Maximize2}
              value={device?.metadata?.screenSize || "N/A"}
            />
          </div>
        </div>

        <div className="mt-8 h-px bg-border" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <InfoItem label="Device Type" value={device?.deviceType || "N/A"} />
          <InfoItem label="OS Version" value={device?.metadata?.osVersion || "N/A"} />
          <InfoItem label="Firmware" value={device?.metadata?.firmware || "N/A"} />
        </div>
      </div>
    </div>
  );
};

export default DeviceDetailInfoCard;
