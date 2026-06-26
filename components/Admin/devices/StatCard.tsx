import React from 'react';

type StatCardProps = {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon: Icon }) => (
  <div className="bg-navbarBg p-6 rounded-xl border border-border">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm text-gray-500 dark:text-gray-400">{title}</span>
      <Icon className="w-5 h-5 text-gray-400" />
    </div>
    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
    <div className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</div>
  </div>
);

export default StatCard;
