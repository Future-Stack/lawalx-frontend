/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";

interface DropdownProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  icon?: any;
}

const Dropdown = ({ value, options, onChange, icon: Icon }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer flex items-center gap-2 p-3 text-black dark:text-white bg-[#F9FAFB] dark:bg-gray-800 border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium w-full sm:w-auto justify-between sm:justify-start"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5" />}
          {value}
        </div>
        <ChevronDown className="w-4 h-4 ml-2" />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-navbarBg border border-border rounded-lg shadow-lg z-20">
            {options.map((option: string) => (
              <button
                key={option}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className="w-full cursor-pointer text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg text-gray-900 dark:text-white"
              >
                {option}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

interface DevicesFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  statusOptions: string[];
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  typeOptions: string[];
}

export default function DevicesFilter({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  statusOptions,
  typeFilter,
  setTypeFilter,
  typeOptions,
}: DevicesFilterProps) {
  return (
    <div className="p-2 md:p-4 gap-2 rounded-[16px] border border-border bg-navbarBg flex flex-col lg:flex-row items-center self-stretch">
      <div className="flex p-3 items-center gap-2 rounded-lg bg-[#F9FAFB] dark:bg-gray-800 border border-border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex-1 w-full">
        <Search className="w-6 h-6 text-[#A3A3A3]" />
        <input
          type="text"
          placeholder="Search devices..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-sm font-medium text-black dark:text-white placeholder:text-[#A3A3A3] focus:outline-none bg-transparent"
        />
      </div>
      <div className="flex gap-2 w-full lg:w-auto">
        <Dropdown value={statusFilter} options={statusOptions} onChange={setStatusFilter} />
        <Dropdown value={typeFilter} options={typeOptions} onChange={setTypeFilter} />
      </div>
    </div>
  );
}
