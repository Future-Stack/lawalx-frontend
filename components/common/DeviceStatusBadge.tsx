import { WifiOff } from "lucide-react";

interface DeviceStatusBadgeProps {
  status: string;
  className?: string;
}

const DeviceStatusBadge = ({ status, className = "" }: DeviceStatusBadgeProps) => {
  const normStatus = status?.toUpperCase() || "OFFLINE";

  switch (normStatus) {
    case "ONLINE":
    case "PAIRED":
      return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] text-[10px] font-semibold uppercase ${className}`}>
          <span className="w-2 h-2 rounded-full bg-[#10B981]" />
          Online
        </div>
      );
    case "OFFLINE":
      return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-[10px] font-semibold uppercase ${className}`}>
          <WifiOff className="w-3.5 h-3.5" />
          Offline
        </div>
      );
    case "WAITING":
      return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-[10px] font-semibold uppercase ${className}`}>
          <span className="w-2 h-2 rounded-full bg-orange-500" />
          Waiting
        </div>
      );
    default:
      return (
        <div className={`inline-flex items-center px-2.5 py-1 rounded-full bg-[#F5F5F5] border border-[#E5E5E5] text-[#737373] text-[10px] font-semibold uppercase ${className}`}>
          {status}
        </div>
      );
  }
};

export default DeviceStatusBadge;



// import { WifiOff } from "lucide-react";

// interface DeviceStatusBadgeProps {
//   status: string;
//   className?: string;
// }

// const DeviceStatusBadge = ({ status, className = "" }: DeviceStatusBadgeProps) => {
//   const normStatus = status?.toUpperCase() || "OFFLINE";

//   switch (normStatus) {
//     case "ONLINE":
//       return (
//         <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] text-[10px] font-semibold uppercase ${className}`}>
//           <span className="w-2 h-2 rounded-full bg-[#10B981]" />
//           Online
//         </div>
//       );
//     case "OFFLINE":
//       return (
//         <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-[10px] font-semibold uppercase ${className}`}>
//           <WifiOff className="w-3.5 h-3.5" />
//           Offline
//         </div>
//       );
//     case "PAIRED":
//       return (
//         <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-semibold uppercase ${className}`}>
//           <span className="w-2 h-2 rounded-full bg-blue-500" />
//           Paired
//         </div>
//       );
//     case "WAITING":
//       return (
//         <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-[10px] font-semibold uppercase ${className}`}>
//           <span className="w-2 h-2 rounded-full bg-orange-500" />
//           Waiting
//         </div>
//       );
//     default:
//       return (
//         <div className={`inline-flex items-center px-2.5 py-1 rounded-full bg-[#F5F5F5] border border-[#E5E5E5] text-[#737373] text-[10px] font-semibold uppercase ${className}`}>
//           {status}
//         </div>
//       );
//   }
// };

// export default DeviceStatusBadge;
