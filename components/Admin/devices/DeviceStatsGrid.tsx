import React from 'react';
import { Monitor, Wifi, WifiOff, UserCheck } from 'lucide-react';
import StatCard from './StatCard';

interface DeviceStatsGridProps {
  stats: {
    total: number;
    online: number;
    offline: number;
    paired: number;
    pairedSubText?: string;
    trendText?: string;
  };
}

export const DeviceStatsGrid: React.FC<DeviceStatsGridProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <StatCard
        title="Total Devices"
        value={stats.total.toLocaleString()}
        subtitle={stats.trendText}
        icon={Monitor}
      />
      <StatCard
        title="Online Devices"
        value={stats.online.toLocaleString()}
        subtitle={stats.total > 0 ? `${((stats.online / stats.total) * 100).toFixed(1)}% Online` : '0% Online'}
        icon={Wifi}
      />
      <StatCard
        title="Offline Devices"
        value={stats.offline}
        subtitle="Requires attention"
        icon={WifiOff}
      />
      <StatCard
        title="Paired Devices"
        value={stats.paired ?? 0}
        subtitle={stats.pairedSubText || (stats.paired && stats.total > 0 ? `${((stats.paired / stats.total) * 100).toFixed(1)}% Paired` : 'No paired devices')}
        icon={UserCheck}
      />
    </div>
  );
};

export default DeviceStatsGrid;
