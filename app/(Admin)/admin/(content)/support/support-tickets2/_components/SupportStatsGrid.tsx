import React from 'react';
import { Ticket, UserCheck, UserX, CheckCircle2 } from 'lucide-react';
import SupportStatCard from './SupportStatCard';

const stats = [
  {
    icon: <Ticket className="w-6 h-6 text-green-600 dark:text-green-400" />,
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    title: 'Opened Tickets',
    value: 520,
  },
  {
    icon: <UserCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    title: 'Assigned Ticket',
    value: 150,
  },
  {
    icon: <UserX className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    title: 'Unassigned Ticket',
    value: 15,
  },
  {
    icon: <CheckCircle2 className="w-6 h-6 text-orange-600 dark:text-orange-400" />,
    iconBg: 'bg-orange-100 dark:bg-orange-900/30',
    title: 'Solved Ticket',
    value: 25,
  },
];

export default function SupportStatsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <SupportStatCard
          key={stat.title}
          icon={stat.icon}
          iconBg={stat.iconBg}
          title={stat.title}
          value={stat.value}
        />
      ))}
    </div>
  );
}
