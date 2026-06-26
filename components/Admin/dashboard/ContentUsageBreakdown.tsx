import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useGetContentUsageBreakdownQuery, useGetDunningEffectivenessQuery } from '@/redux/api/admin/dashbaordApi';
import { DateRange } from './DateSelector';

interface ContentUsageBreakdownProps {
  title: string;
  subtitle: string;
  type: 'uploaded' | 'payments';
  dateRange: DateRange;
}

export const ContentUsageBreakdown: React.FC<ContentUsageBreakdownProps> = ({
  title,
  subtitle,
  type,
  dateRange
}) => {
  const { data: contentData, isLoading: isContentLoading } = useGetContentUsageBreakdownQuery(dateRange, { skip: type !== 'uploaded' });
  const { data: dunningData, isLoading: isDunningLoading } = useGetDunningEffectivenessQuery(dateRange, { skip: type !== 'payments' });

  const data = useMemo(() => {
    if (type === 'uploaded') {
      if (!contentData?.success || !contentData.data?.byType) return [];
      return contentData.data.byType.map((item: any) => ({
        label: item.type,
        uploaded: item.uploaded,
        used: item.used || 0
      }));
    } else {
      if (!dunningData?.success || !dunningData.data?.data) return [];
      return dunningData.data.data.map((item: any) => ({
        label: item.label,
        failedPayments: item.failedPayments
      }));
    }
  }, [type, contentData, dunningData]);

  const keys = type === 'uploaded' ? ['uploaded', 'used'] : ['failedPayments'];
  const colors = type === 'uploaded' ? ['#3B82F6', '#93C5FD'] : ['#EF4444'];
  const isLoading = type === 'uploaded' ? isContentLoading : isDunningLoading;

  return (
    <div className="bg-navbarBg rounded-xl p-5 shadow-sm border border-border">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-[180px] flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
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
            <Bar dataKey={keys[0]} fill={colors[0]} radius={[3, 3, 0, 0]} barSize={type === 'uploaded' ? 40 : 30} />
            {type === 'uploaded' && <Bar dataKey={keys[1]} fill={colors[1]} radius={[3, 3, 0, 0]} barSize={40} />}
          </BarChart>
        </ResponsiveContainer>
      )}

      <Link href={type === 'uploaded' ? "/admin/reports/content-and-programs" : "/admin/reports/subscription-&-billing-report?tab=failed-payment"} className="flex justify-end mt-4">
        <button className="text-xs text-black dark:text-white hover:text-blue-400 dark:hover:text-blue-300 cursor-pointer font-medium px-3 py-1.5 border border-border shadow-customShadow rounded-md">View Details</button>
      </Link>
    </div>
  );
};

export default ContentUsageBreakdown;
