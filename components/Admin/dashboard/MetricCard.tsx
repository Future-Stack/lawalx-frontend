import React from 'react';

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  change: string;
  changeValue?: string;
  isPositive: boolean;
  subtitle?: string;
  isLoading?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  title,
  value,
  change,
  isPositive,
  subtitle,
  isLoading
}) => (
  <div className="bg-navbarBg rounded-lg p-5 shadow-sm border border-border">
    {isLoading ? (
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      </div>
    ) : (
      <>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="text-gray-500 dark:text-gray-400 p-2 rounded-full border border-border">{icon}</div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</span>
          </div>
        </div>
        <div className="space-y-0.5">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
          <div className="flex items-center gap-1.5 text-xs">
            {isPositive ? (
              <span className="text-green-600 dark:text-green-400">{change}</span>
            ) : (
              <span className="text-red-600 dark:text-red-400">{change}</span>
            )}
            <span className="text-gray-500 dark:text-gray-400">From Last Period</span>
          </div>
          {subtitle && <div className="text-[10px] text-gray-400 dark:text-gray-500 pt-0.5">{subtitle}</div>}
        </div>
      </>
    )}
  </div>
);

export default MetricCard;
