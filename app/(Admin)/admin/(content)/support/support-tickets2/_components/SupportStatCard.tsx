import React from 'react';
import { cn } from '@/lib/utils';

interface SupportStatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  value: string | number;
  className?: string;
}

export default function SupportStatCard({
  icon,
  iconBg,
  title,
  value,
  className,
}: SupportStatCardProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm flex flex-col gap-3',
        className
      )}
    >
      {/* Top row: icon + title */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
            iconBg
          )}
        >
          {icon}
        </div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-tight">
          {title}
        </p>
      </div>

      {/* Bottom: big value */}
      <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight pl-0.5">
        {value}
      </p>
    </div>
  );
}
