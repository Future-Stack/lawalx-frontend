"use client";

import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

type DropdownProps = {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label?: string;
  className?: string;
  disabled?: boolean;
};

const Dropdown: React.FC<DropdownProps> = ({
  value,
  options,
  onChange,
  icon: Icon,
  label,
  className = "",
  disabled = false
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

        // Viewport boundary check (right side)
        if (typeof window !== 'undefined') {
          const padding = 10;
          if (left + menuWidth > window.innerWidth - padding) {
            left = window.innerWidth - menuWidth - padding;
          }
          // Viewport boundary check (left side)
          if (left < padding) {
            left = padding;
          }
        }

        setCoords({
          top: rect.bottom + 4, // 4px gap
          left: left,
          width: rect.width,
        });
      }
    };

    if (isOpen) {
      updatePosition();
      // Use capture=true for scroll to detect scrolling in parent containers
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

      // Initial boundary check
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
        width: rect.width,
      });
    }
    setIsOpen(!isOpen);
  };

  const dropdownMenu = (
    <>
      <div
        className="fixed inset-0 z-[9998]"
        onClick={() => setIsOpen(false)}
      />
      <div
        className="fixed z-[9999] bg-navbarBg border border-border rounded-lg shadow-lg py-1 animate-in fade-in duration-200"
        style={{
          top: `${coords.top}px`,
          left: `${coords.left}px`,
          width: `${coords.width}px`,
          maxHeight: '250px',
          overflowY: 'auto',
          transformOrigin: 'top',
        }}
      >
        {options.map((option) => (
          <button
            key={option}
            onClick={() => {
              onChange(option);
              setIsOpen(false);
            }}
            className={`w-full cursor-pointer text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${value === option ? 'text-blue-600 dark:text-blue-400 font-medium bg-blue-50/50 dark:bg-blue-900/20' : 'text-gray-700 dark:text-gray-300'
              }`}
          >
            {option}
          </button>
        ))}
      </div>
    </>
  );

  return (
    <div className={`relative ${className}`}>
      <button
        ref={triggerRef}
        onClick={toggleDropdown}
        disabled={disabled}
        className="cursor-pointer flex items-center gap-2 px-4 py-2 text-black dark:text-white bg-navbarBg border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm w-full h-full justify-between outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-gray-400" />}
          <span className="truncate">
            {label && <span className="text-gray-500 mr-1">{label}:</span>}
            {value}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(dropdownMenu, document.body)}
    </div>
  );
};

export default Dropdown;
