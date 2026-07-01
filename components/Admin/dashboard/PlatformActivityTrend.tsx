import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RefreshCw } from 'lucide-react';
import { useGetActivityTrendQuery } from '@/redux/api/admin/dashbaordApi';
import { DateRange } from './DateSelector';

interface PlatformActivityTrendProps {
  dateRange: DateRange;
}

export const PlatformActivityTrend: React.FC<PlatformActivityTrendProps> = ({ dateRange }) => {
  const { data: apiData, isLoading } = useGetActivityTrendQuery(dateRange);

  const data = useMemo(() => {
    if (!apiData?.success || !apiData.data?.data) return [];
    return apiData.data.data.map((item: any) => ({
      label: item.label,
      dailyUsers: item.dailyUsers,
      totalProgram: item.totalProgram,
      totalDevices: item.totalDevices
    }));
  }, [apiData]);

  return (
    <div className="bg-navbarBg rounded-xl p-5 shadow-sm border border-border h-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Platform Activity Trend</h3>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Daily active users and task progress</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 mb-3 text-[14px]">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-emerald-500 rounded-sm"></div>
          <span className="text-gray-600 dark:text-gray-400">Daily Users</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-purple-500 rounded-sm"></div>
          <span className="text-gray-600 dark:text-gray-400">Total Programs</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-cyan-400 rounded-sm"></div>
          <span className="text-gray-600 dark:text-gray-400">Total Devices</span>
        </div>
      </div>

      {isLoading ? (
        <div className="h-[240px] flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#22D3EE" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#A78BFA" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="colorLogins" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: '#9CA3AF' }}
              stroke="#E5E7EB"
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9CA3AF' }}
              stroke="#E5E7EB"
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                fontSize: '11px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              labelStyle={{ color: '#374151', fontWeight: 'bold', marginBottom: '4px' }}
            />
            <Area
              type="monotone"
              dataKey="totalDevices"
              stroke="#22D3EE"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
            <Area
              type="monotone"
              dataKey="totalProgram"
              stroke="#A78BFA"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorProgress)"
            />
            <Area
              type="monotone"
              dataKey="dailyUsers"
              stroke="#10B981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorLogins)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default PlatformActivityTrend;
