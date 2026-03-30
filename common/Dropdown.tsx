"use client";
import { useState, useRef, useEffect } from "react";

type DropdownOption = {
  value: string | number;
  label: string;
};

interface DropdownProps {
  options?: DropdownOption[];
  value?: DropdownOption['value'] | null;
  onChange: (value: DropdownOption['value']) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export default function Dropdown({
  options = [],
  value,
  onChange,
  placeholder = "Select an option",
  label,
  className = "",
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (option: DropdownOption) => {
    onChange(option.value);
    setIsOpen(false);
  };

  const selectedLabel =
    options.find((opt) => opt.value === value)?.label || placeholder;

  return (
    <div ref={dropdownRef} className={`relative w-full ${className}`}>
      {label && (
        <label className="block mb-2 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 border border-border rounded-lg bg-input cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex justify-between items-center`}
      >
        <span>{selectedLabel}</span>
        <svg
          className={`w-4 h-4 ml-2 transition-transform ${isOpen ? "rotate-180" : "rotate-0"
            }`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <ul className="absolute z-10 w-full mt-1 bg-cardBackground border border-border rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => handleSelect(option)}
              className={`px-4 py-3 cursor-pointer text-sm transition-colors ${value === option.value
                ? "bg-bgBlue text-white font-medium"
                : "text-gray-700 dark:text-gray-300 hover:bg-bgBlue hover:text-white"
                }`}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
