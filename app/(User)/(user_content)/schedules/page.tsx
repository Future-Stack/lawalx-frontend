"use client";

import { useState, useMemo } from "react";
import SchedulesHeader from "./_components/SchedulesHeader";
import SearchFilterBar from "./_components/SearchFilterBar";
import SchedulesTable from "./_components/SchedulesTable";
import CalendarView from "./_components/CalendarView";
import { useGetAllSchedulesDataQuery } from "@/redux/api/users/schedules/schedules.api";

export default function SchedulesPage() {
  const { data: schedulesData } = useGetAllSchedulesDataQuery(undefined);
  const [view, setView] = useState<"list" | "calendar">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("Recent");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  console.log("all schedules", schedulesData);

  const sortOptions = [
    { label: "Recent", value: "Recent" },
    { label: "Name A-Z", value: "A-Z" },
    { label: "Name Z-A", value: "Z-A" },
  ];

  const allSchedules = schedulesData?.data || [];

  const filteredSchedules = useMemo(() => {
    let result = [...allSchedules].filter((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (sortOption === "A-Z") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === "Z-A") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [allSchedules, searchQuery, sortOption]);

  const paginatedSchedules = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSchedules.slice(start, start + itemsPerPage);
  }, [filteredSchedules, currentPage]);

  const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage);

  return (
    <div className="min-h-screen space-y-6">
      <SchedulesHeader
        title="My Schedules"
        subtitle="Schedule when and where your content should play"
      />

      <SearchFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortOption={sortOption}
        setSortOption={setSortOption}
        sortOptions={sortOptions}
        view={view}
        setView={setView}
      />

      {view === "list" ? (
        <SchedulesTable
          schedules={paginatedSchedules}
          totalFiltered={filteredSchedules.length}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      ) : (
        <CalendarView />
      )}
    </div>
  );
}
