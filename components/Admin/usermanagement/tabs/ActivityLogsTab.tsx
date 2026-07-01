"use client";

import React, { useState, useMemo } from "react";
import { Monitor, FileText, MapPin, Search, Calendar, X } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import TablePagination from "@/components/shared/TablePagination";

const ITEMS_PER_PAGE = 10;

export default function ActivityLogsTab({ activities }: { activities?: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const data = activities || [];

  const filteredData = useMemo(() => {
    return data.filter((log) => {
      const desc = log.description || log.title || "";
      const location = log.location || "";
      const deviceAndIp = log.deviceAndIp || "";
      const matchesSearch =
        desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deviceAndIp.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesDate = true;
      const logDate = new Date(log.timeAndDate || log.time || 0);
      if (startDate && endDate) {
        const start = new Date(startDate).setHours(0, 0, 0, 0);
        const end = new Date(endDate).setHours(23, 59, 59, 999);
        matchesDate = logDate.getTime() >= start && logDate.getTime() <= end;
      } else if (startDate) {
        matchesDate = logDate.getTime() >= new Date(startDate).setHours(0, 0, 0, 0);
      }

      return matchesSearch && matchesDate;
    });
  }, [data, searchTerm, startDate, endDate]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const currentItems = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Activity Logs</h3>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-navbarBg border border-border rounded-lg text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none w-full md:w-64"
            />
          </div>
          <div className="relative flex items-center bg-navbarBg border border-border rounded-lg px-3 py-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Calendar className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
            <div className="flex items-center gap-2">
              <DatePicker
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => {
                  const [start, end] = update;
                  setStartDate(start);
                  setEndDate(end);
                }}
                isClearable={false}
                placeholderText="Select Date Range"
                className="bg-transparent border-none text-sm text-gray-700 dark:text-gray-300 outline-none cursor-pointer w-full"
              />
              {(startDate || endDate) && (
                <button onClick={() => { setStartDate(null); setEndDate(null); }} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors">
                  <X className="w-3 h-3 text-gray-500" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-navbarBg border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto thin-gray-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-border">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-nowrap">Activity</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-nowrap">Location</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-nowrap">Device & IP</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-nowrap">Time & Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {currentItems.length > 0 ? (
                currentItems.map((log) => {
                  const [ipAddress, deviceName] = (log.deviceAndIp || "\n").split("\n");
                  return (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-5 text-nowrap">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            {log.activity === "UPLOAD" ? (
                              <FileText className="w-4 h-4 text-gray-500" />
                            ) : (
                              <Monitor className="w-4 h-4 text-gray-500" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{log.activity || "N/A"}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{log.description || "N/A"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white font-bold text-nowrap">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {log.location || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-nowrap">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{ipAddress?.trim() || "N/A"}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{deviceName?.trim() || "N/A"}</p>
                      </td>
                      <td className="px-6 py-5 text-nowrap">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {log.timeAndDate ? new Date(log.timeAndDate).toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "N/A"}
                        </p>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No activity found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredData.length > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredData.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}
