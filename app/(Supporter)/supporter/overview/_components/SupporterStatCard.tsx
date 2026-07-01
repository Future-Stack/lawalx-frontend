import React from 'react';
import { cn } from '@/lib/utils';

interface SupporterStatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  value: string | number;
  className?: string;
}

export default function SupporterStatCard({
  icon,
  iconBg,
  title,
  value,
  className,
}: SupporterStatCardProps) {
  return (
    <div
      className={cn(
        'bg-navbarBg border border-border rounded-xl p-5 shadow-sm flex flex-col gap-3',
        className
      )}
    >
      {/* Icon + title row */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
            iconBg
          )}
        >
          {icon}
        </div>
        <p className="text-sm font-medium text-muted leading-tight">
          {title}
        </p>
      </div>

      {/* Value */}
      <p className="text-3xl font-bold text-headings tracking-tight pl-0.5">
        {value}
      </p>
    </div>
  );
}
