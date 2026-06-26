import React, { useMemo } from 'react';
import { Clock } from 'lucide-react';
import Link from 'next/link';
import { useGetCriticalActivityQuery } from '@/redux/api/admin/dashbaordApi';
import { DateRange } from './DateSelector';

interface RecentCriticalActivityProps {
  dateRange: DateRange;
}

export const RecentCriticalActivity: React.FC<RecentCriticalActivityProps> = ({ dateRange }) => {
  const { data: apiData, isLoading } = useGetCriticalActivityQuery(dateRange);
  const activities = useMemo(() => apiData?.data?.slice(0, 5) || [], [apiData]);

  return (
    <div className="bg-navbarBg rounded-xl p-5 shadow-sm border border-border flex flex-col h-full min-h-[500px]">
      <div className="flex items-center justify-between mb-4 border-b border-border pb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Critical Activity</h3>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Security and system events</p>
        </div>
        <Link href="/admin/dashboard/recent-crititcal-activity">
          <button className="text-xs text-black dark:text-white hover:text-blue-400 dark:hover:text-blue-300 cursor-pointer font-medium px-3 py-1.5 border border-border shadow-customShadow rounded-md">View All</button>
        </Link>
      </div>

      <div className="flex-grow flex flex-col gap-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex-1 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-md"></div>
          ))
        ) : (
          <>
            {activities.map((activity: any, idx: number) => (
              <div key={idx} className="flex-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 flex flex-col justify-center">
                <div className="flex items-center justify-start gap-4">
                  <span className="text-base font-bold text-gray-900 dark:text-white">{activity.user?.name || 'Unknown'}</span>
                  <span className={`px-1.5 py-0.5 rounded-xl text-[9px] bg-gray-200 dark:bg-gray-50/30 text-gray-800 dark:text-gray-200 uppercase tracking-tight`}>
                    {activity.label}
                  </span>
                </div>
                <p className="text-[12px] text-gray-600 dark:text-gray-400 line-clamp-2 mb-1 leading-relaxed">{activity.action}</p>
                <div className="flex items-center gap-1 text-[12px] text-gray-400 dark:text-gray-500 mt-auto">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(activity.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <div className="flex-1 flex items-center justify-center text-xs text-gray-500">No recent activities found</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RecentCriticalActivity;
