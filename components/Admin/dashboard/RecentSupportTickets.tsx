import React, { useMemo } from 'react';
import { Clock } from 'lucide-react';
import Link from 'next/link';
import { useGetRecentSupportTicketsQuery } from '@/redux/api/admin/dashbaordApi';
import { DateRange } from './DateSelector';

interface RecentSupportTicketsProps {
  dateRange: DateRange;
  onTicketClick: (ticket: any) => void;
}

export const RecentSupportTickets: React.FC<RecentSupportTicketsProps> = ({
  dateRange,
  onTicketClick
}) => {
  const { data: apiData, isLoading } = useGetRecentSupportTicketsQuery({ limit: 5, filter: dateRange });
  const tickets = useMemo(() => apiData?.data?.tickets || [], [apiData]);

  return (
    <div className="bg-navbarBg rounded-xl p-5 shadow-sm border border-border flex flex-col h-full min-h-[500px]">
      <div className="flex items-center justify-between mb-4 border-b border-border pb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Support Tickets</h3>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">User inquiries and reports</p>
        </div>
        <Link href="/admin/support/support-tickets">
          <button className="text-xs text-black dark:text-white hover:text-blue-400 dark:hover:text-blue-300 cursor-pointer font-medium px-3 py-1.5 border border-border shadow-customShadow rounded-md">View All</button>
        </Link>
      </div>

      <div className="flex-grow grid grid-rows-5 gap-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-md"></div>
          ))
        ) : (
          <>
            {tickets.map((ticket: any, idx: number) => (
              <div
                key={idx}
                onClick={() => onTicketClick(ticket)}
                className="p-4 bg-navbarBg rounded-xl border border-border hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all group cursor-pointer flex flex-col justify-center"
              >
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">{ticket.ticketId}</span>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span className="text-base font-bold text-gray-900 dark:text-white truncate leading-snug">{ticket.subject}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${ticket.priority === 'High'
                          ? 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/50'
                          : ticket.priority === 'Medium'
                            ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50'
                            : 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50'
                          }`}>
                          {ticket.priority}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-50 text-gray-500 border border-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">
                          {ticket.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {tickets.length === 0 && (
              <div className="row-span-5 flex items-center justify-center text-xs text-gray-500">No support tickets found</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RecentSupportTickets;
