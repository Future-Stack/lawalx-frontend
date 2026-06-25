/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Search } from "lucide-react";
import BaseSelect from "@/common/BaseSelect";

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
    <div className="bg-navbarBg border border-border rounded-xl p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search devices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 md:py-3 bg-bgGray dark:bg-gray-800 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-bgBlue focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm font-medium"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-44">
            <BaseSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions.map((opt) => ({ label: opt, value: opt }))}
              placeholder="All Status"
              showLabel={false}
            />
          </div>
          <div className="w-full sm:w-44">
            <BaseSelect
              value={typeFilter}
              onChange={setTypeFilter}
              options={typeOptions.map((opt) => ({ label: opt, value: opt }))}
              placeholder="All Types"
              showLabel={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
