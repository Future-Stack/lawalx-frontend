import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useGetSubscriptionDistributionQuery } from '@/redux/api/admin/dashbaordApi';
import { DateRange } from './DateSelector';

interface SubscriptionDistributionProps {
  dateRange: DateRange;
}

export const SubscriptionDistribution: React.FC<SubscriptionDistributionProps> = ({ dateRange }) => {
  const { data: apiData, isLoading } = useGetSubscriptionDistributionQuery(dateRange);

  const data = useMemo(() => {
    if (!apiData?.success || !apiData.data?.plans) {
      return [
        { name: 'Starter', value: 0, color: '#3B82F6' },
        { name: 'Business', value: 0, color: '#FB923C' },
        { name: 'Enterprise', value: 0, color: '#FDE047' }
      ];
    }

    const colors = ['#3B82F6', '#FB923C', '#FDE047', '#10B981', '#A78BFA'];
    return apiData.data.plans.map((plan: any, index: number) => ({
      name: plan.name,
      value: plan.count,
      color: colors[index % colors.length]
    }));
  }, [apiData]);

  const total = useMemo(() => data.reduce((sum: number, item: any) => sum + item.value, 0), [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-[11px] font-bold text-gray-900 dark:text-white mb-1.5 border-b border-gray-100 dark:border-gray-700 pb-1">
            {payload[0].name}
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.color }}></div>
            <p className="text-[10px] text-gray-600 dark:text-gray-400">
              Subscribers: <span className="font-semibold text-gray-900 dark:text-white">{payload[0].value}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-navbarBg rounded-xl p-5 shadow-sm border border-border h-full">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Subscription Plan Distribution</h3>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Active subscribers by tier</p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-[200px] flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-center my-4">
            <div className="relative" style={{ width: '180px', height: '180px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {data.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={<CustomTooltip />}
                    position={{ y: -20 }}
                    allowEscapeViewBox={{ x: true, y: true }}
                    wrapperStyle={{ zIndex: 1000 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{total}</div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">Total</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {data.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-700 dark:text-gray-300">{item.name} ({item.value})</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Link href="/admin/reports/financial-reports?tab=plans" className="flex justify-end mt-4">
        <button className="text-xs text-black dark:text-white hover:text-blue-400 dark:hover:text-blue-300 cursor-pointer font-medium px-3 py-1.5 border border-border shadow-customShadow rounded-md">View Details</button>
      </Link>
    </div>
  );
};

export default SubscriptionDistribution;
