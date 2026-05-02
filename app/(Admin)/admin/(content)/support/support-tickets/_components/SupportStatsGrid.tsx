"use client"
import React from 'react';
import { Ticket, UserCheck, UserX, CheckCircle2, TicketX } from 'lucide-react';
import SupportStatCard from './SupportStatCard';
import { useGetTicketStatisticsQuery } from '@/redux/api/admin/support/adminSupportTicketApi';

export default function SupportStatsGrid() {
  const { data: statsResponse, isLoading } = useGetTicketStatisticsQuery();
  const statsData = statsResponse?.data || { total: 0, open: 0, assigned: 0, unassigned: 0, solved: 0 };

  const stats = [
    {
      icon: <Ticket className="w-6 h-6 text-white" />,
      iconBg: 'bg-[#069576]',
      title: 'Opened Tickets',
      value: statsData.open,
    },
    {
      icon: <UserCheck className="w-6 h-6 text-white" />,
      iconBg: 'bg-[#756CF5]',
      title: 'Assigned Ticket',
      value: statsData.assigned,
    },
    {
      icon: <TicketX className="w-6 h-6 text-white" />,
      iconBg: 'bg-[#0FA6FF]',
      title: 'Unassigned Ticket',
      value: statsData.unassigned,
    },
    {
      icon: <CheckCircle2 className="w-6 h-6 text-white" />,
      iconBg: 'bg-[#DA4352]',
      title: 'Solved Ticket',
      value: statsData.solved,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <SupportStatCard
          key={stat.title}
          icon={stat.icon}
          iconBg={stat.iconBg}
          title={stat.title}
          value={isLoading ? '...' : stat.value}
        />
      ))}
    </div>
  );
}
