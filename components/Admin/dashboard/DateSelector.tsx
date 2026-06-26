import React, { useState } from 'react';
import { Calendar, Clock, ChevronDown } from 'lucide-react';

export type DateRange = '1d' | '7d' | '1m' | '1y';

interface DateSelectorProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({ dateRange, onDateRangeChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const dateRangeOptions: { value: DateRange; label: string }[] = [
    { value: '1d', label: '1 Day' },
    { value: '7d', label: '7 Days' },
    { value: '1m', label: '30 Days' },
    { value: '1y', label: '1 Year' }
  ];

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const selectedOption = dateRangeOptions.find(opt => opt.value === dateRange);

  return (
    <div className="flex items-center justify-center flex-col sm:flex-row sm:justify-start gap-3 mb-5">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-navbarBg border border-border rounded-md text-[.65rem] md:text-xs text-nowrap">
        <Clock className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
        <span className="text-gray-700 dark:text-gray-300">{currentDate}</span>
      </div>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 bg-navbarBg border border-border rounded-md text-[.65rem] md:text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-nowrap"
        >
          <Calendar className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
          <span className="text-gray-700 dark:text-gray-300">Date Range:</span>
          <span className="ml-1 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px] text-gray-600 dark:text-gray-400">
            {selectedOption?.label}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1 bg-navbarBg border border-border rounded-md shadow-lg z-10 min-w-[140px]">
            {dateRangeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onDateRangeChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${dateRange === option.value ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DateSelector;
