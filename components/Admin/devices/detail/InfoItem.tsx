import React from "react";

interface InfoItemProps {
  label: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  value: string;
}

export const InfoItem: React.FC<InfoItemProps> = ({
  label,
  icon: Icon,
  value,
}) => {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        {label}
      </p>
      <div className="flex items-center justify-between border-b border-border pb-2 group">
        <div className="flex items-center gap-3">
          {Icon && (
            <Icon className="w-4 h-4 text-gray-300 group-hover:text-bgBlue transition-colors" />
          )}
          <span className="text-sm font-bold text-gray-900 dark:text-white break-all">
            {value || "—"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default InfoItem;
