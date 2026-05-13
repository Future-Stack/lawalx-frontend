"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  PencilLine,
  Trash2,
  Circle,
  Ban,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import BaseSelect from "@/common/BaseSelect";
import { Button } from "@/components/ui/button";
import ScreenSizeDialog from "./ScreenSizeDialog";
import DeleteScreenSizeDialog from "./DeleteScreenSizeDialog";
import SubscriptionTabLayout from "./SubscriptionTabLayout";

interface ScreenSizeData {
  id: string;
  size: string;
  price: string;
  status: "Enable" | "Disabled";
}

const initialData: ScreenSizeData[] = [
  { id: "1", size: "40", price: "$600", status: "Disabled" },
  { id: "2", size: "44", price: "$800", status: "Enable" },
  { id: "3", size: "48", price: "$950", status: "Enable" },
  { id: "4", size: "56", price: "$15050", status: "Disabled" },
  { id: "5", size: "48", price: "$600", status: "Disabled" },
  { id: "6", size: "42", price: "$850", status: "Disabled" },
  { id: "7", size: "40", price: "$9666", status: "Disabled" },
];

const ManageScreenSizeTab = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [data, setData] = useState<ScreenSizeData[]>(initialData);

  // Modal states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ScreenSizeData | null>(null);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");

  const handleAdd = () => {
    setDialogMode("add");
    setSelectedItem(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: ScreenSizeData) => {
    setDialogMode("edit");
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (item: ScreenSizeData) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const toggleStatus = (id: string) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === "Enable" ? "Disabled" : "Enable",
            }
          : item,
      ),
    );
  };

  return (
    <SubscriptionTabLayout
      title="Screen Size Management"
      actionButton={
        <Button
          onClick={handleAdd}
          className="bg-white hover:bg-gray-50 text-headings border border-borderGray rounded-lg px-6 py-2 h-auto font-bold shadow-sm flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add
        </Button>
      }
      filters={
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              placeholder="Search by size..."
              aria-label="Search screen sizes"
              className="w-full bg-[#F9FAFB] dark:bg-gray-900 border border-border rounded-lg pl-10 pr-4 py-3 placeholder:text-muted focus-visible:ring-0 focus:outline-none text-body"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full md:w-[200px]">
            <BaseSelect
              placeholder="Status"
              options={[
                { label: "All", value: "all" },
                { label: "Enable", value: "Enable" },
                { label: "Disabled", value: "Disabled" },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              showLabel={false}
            />
          </div>
        </div>
      }
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-border">
            <TableHead className="text-[#667085] font-semibold text-[12px] uppercase tracking-wider py-4">
              Screen Size
            </TableHead>
            <TableHead className="text-[#667085] font-semibold text-[12px] uppercase tracking-wider py-4">
              Price
            </TableHead>
            <TableHead className="text-[#667085] font-semibold text-[12px] uppercase tracking-wider py-4">
              Status
            </TableHead>
            <TableHead className="text-[#667085] font-semibold text-[12px] uppercase tracking-wider py-4 text-right">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow
              key={item.id}
              className="border-b border-border last:border-0 transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
            >
              <TableCell className="py-5 text-[14px] font-medium text-headings">
                {item.size}
              </TableCell>
              <TableCell className="py-5 text-[14px] font-bold text-headings">
                {item.price}
              </TableCell>
              <TableCell className="py-5">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[12px] font-medium border ${
                    item.status === "Enable"
                      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                      : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                  }`}
                >
                  {item.status}
                </span>
              </TableCell>
              <TableCell className="py-5 text-right">
                <div className="flex items-center justify-end gap-2.5">
                  <button
                    onClick={() => toggleStatus(item.id)}
                    aria-label={item.status === "Enable" ? "Disable screen size" : "Enable screen size"}
                    className="p-1.5 rounded-md text-[#667085] hover:text-headings hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
                  >
                    {item.status === "Enable" ? (
                      <Circle className="w-5 h-5 opacity-70" />
                    ) : (
                      <Ban className="w-5 h-5 opacity-70" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(item)}
                    aria-label="Edit screen size"
                    className="p-1.5 rounded-md border border-[#0EA5E933] bg-[#0EA5E90D] text-[#0EA5E9] hover:bg-[#0EA5E91A] transition-all cursor-pointer"
                  >
                    <PencilLine className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(item)}
                    aria-label="Delete screen size"
                    className="p-1.5 rounded-md border border-[#F0443833] bg-[#F044380D] text-[#F04438] hover:bg-[#F044381A] transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ScreenSizeDialog
        open={isDialogOpen}
        setOpen={setIsDialogOpen}
        mode={dialogMode}
        data={selectedItem}
      />
      <DeleteScreenSizeDialog
        open={isDeleteDialogOpen}
        setOpen={setIsDeleteDialogOpen}
        data={selectedItem}
      />
    </SubscriptionTabLayout>
  );
};

export default ManageScreenSizeTab;
