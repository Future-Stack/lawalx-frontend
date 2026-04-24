'use client';

import React from 'react';
import { LayoutGrid, Users, MousePointer, AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtext?: string;
  subtextClass?: string;
  icon: React.ReactNode;
  iconBgClass: string;
  iconColorClass: string;
}

const StatCard = ({ title, value, icon, iconBgClass, iconColorClass }: StatCardProps) => (
  <div className="bg-navbarBg p-6 rounded-xl border border-border shadow-sm flex flex-col justify-between">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-full ${iconBgClass} ${iconColorClass}`}>
        {icon}
      </div>
    </div>
    <div>
      <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</h3>
      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{value}</div>
      {/* <p className={`text-xs font-medium ${subtextClass}`}>{subtext}</p> */}
    </div>
  </div>
);

export default function BannerStats() {
  const stats: StatCardProps[] = [
    {
      title: 'Total Banners',
      value: '1,100',
      // subtext: '↘ -8.2 % From Last Month',
      // subtextClass: 'text-red-500 dark:text-red-400',
      icon: <LayoutGrid size={20} />,
      iconBgClass: 'bg-gray-100 dark:bg-gray-700',
      iconColorClass: 'text-gray-600 dark:text-gray-400',
    },
    {
      title: 'Total Views',
      value: '1,100',
      // subtext: '↗ +8.2 % From Last Month',
      // subtextClass: 'text-green-500 dark:text-green-400',
      icon: <Users size={20} />,
      iconBgClass: 'bg-green-50 dark:bg-green-900/30',
      iconColorClass: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Total Clicks',
      value: '1,100',
      // subtext: '45 % Conversion rate',
      // subtextClass: 'text-gray-500 dark:text-gray-400',
      icon: <MousePointer size={20} />,
      iconBgClass: 'bg-gray-100 dark:bg-gray-700',
      iconColorClass: 'text-gray-600 dark:text-gray-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}