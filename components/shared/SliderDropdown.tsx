"use client";

import React, { useState, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Database } from "lucide-react";

interface SliderDropdownProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  min?: number;
  max?: number;
  unit?: string;
  className?: string;
}

const SliderDropdown: React.FC<SliderDropdownProps> = ({
  value,
  onChange,
  label = "Storage",
  min = 0,
  max = 100,
  unit = "%",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  useLayoutEffect(() => {
    const updatePosition = () => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const menuWidth = rect.width;
        let left = rect.left;

        if (typeof window !== 'undefined') {
          const padding = 10;
          if (left + menuWidth > window.innerWidth - padding) {
            left = window.innerWidth - menuWidth - padding;
          }
          if (left < padding) left = padding;
        }

        setCoords({
          top: rect.bottom + 4,
          left: left,
          width: menuWidth,
        });
      }
    };

    if (isOpen) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
    }

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuWidth = rect.width;
      let left = rect.left;

      if (typeof window !== 'undefined') {
        const padding = 10;
        if (left + menuWidth > window.innerWidth - padding) {
          left = window.innerWidth - menuWidth - padding;
        }
        if (left < padding) left = padding;
      }

      setCoords({
        top: rect.bottom + 4,
        left: left,
        width: menuWidth,
      });
    }
    setIsOpen(!isOpen);
  };

  const percentage = ((value - min) / (max - min)) * 100;

  const dropdownMenu = (
    <>
      <div
        className="fixed inset-0 z-[9998]"
        onClick={() => setIsOpen(false)}
      />
      <div
        className="fixed z-[9999] bg-navbarBg border border-border rounded-lg shadow-lg p-4 animate-in fade-in duration-200"
        style={{
          top: `${coords.top}px`,
          left: `${coords.left}px`,
          width: `${coords.width}px`,
          transformOrigin: 'top',
        }}
      >
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Usage Threshold
            </span>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
              {value}{unit}
            </span>
          </div>

          <div className="relative group py-2">
            <input
              type="range"
              min={min}
              max={max}
              step={1}
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
              className="w-full h-2 appearance-none bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer outline-none transition-all group-hover:bg-gray-300 dark:group-hover:bg-gray-600"
              style={{
                background: `linear-gradient(to right, #3b82f6 ${percentage}%, #e5e7eb ${percentage}%)`,
              }}
            />
            <style jsx>{`
              input[type="range"]::-webkit-slider-thumb {
                appearance: none;
                width: 18px;
                height: 18px;
                background: #ffffff;
                border: 2px solid #3b82f6;
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                transition: transform 0.1s ease;
              }
              input[type="range"]::-webkit-slider-thumb:hover {
                transform: scale(1.2);
              }
              input[type="range"]::-moz-range-thumb {
                width: 18px;
                height: 18px;
                background: #ffffff;
                border: 2px solid #3b82f6;
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
              }
            `}</style>
          </div>

          <div className="flex justify-between text-[10px] text-gray-400 uppercase font-bold tracking-wider">
            <span>{min}{unit}</span>
            <span>{max}{unit}</span>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="mt-2 w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
          >
            Apply Filter
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className={`relative ${className}`}>
      <button
        ref={triggerRef}
        onClick={toggleDropdown}
        className="cursor-pointer flex items-center gap-2 px-4 py-2 text-black dark:text-white bg-navbarBg border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm min-w-[160px] justify-between outline-none shadow-sm"
      >
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-gray-400" />
          <span className="truncate">
            <span className="text-gray-500 mr-1">{label}:</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {value > 0 ? `${value}${unit}` : '0%'}
            </span>
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(dropdownMenu, document.body)}
    </div>
  );
};

export default SliderDropdown;
