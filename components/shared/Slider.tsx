"use client";

import React from "react";

interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  label?: string;
  unit?: string;
  className?: string;
}

const Slider: React.FC<SliderProps> = ({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  label,
  unit = "%",
  className = "",
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`flex flex-col gap-1 min-w-[180px] ${className}`}>
      {label && (
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {label}
          </span>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
            {value}{unit}
          </span>
        </div>
      )}
      <div className="relative h-9 flex items-center px-4 bg-navbarBg border border-border rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 appearance-none bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer outline-none transition-all focus:ring-0"
          style={{
            background: `linear-gradient(to right, #3b82f6 ${percentage}%, #e5e7eb ${percentage}%)`,
          }}
        />
        {/* Custom CSS for the thumb to make it look premium */}
        <style jsx>{`
          input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            width: 14px;
            height: 14px;
            background: #ffffff;
            border: 2px solid #3b82f6;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: all 0.2s ease;
          }
          input[type="range"]::-webkit-slider-thumb:hover {
            transform: scale(1.1);
            box-shadow: 0 0 8px rgba(59, 130, 246, 0.4);
          }
          input[type="range"]::-moz-range-thumb {
            width: 14px;
            height: 14px;
            background: #ffffff;
            border: 2px solid #3b82f6;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: all 0.2s ease;
          }
        `}</style>
      </div>
    </div>
  );
};

export default Slider;
