"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  PencilLine,
  Trash2,
  Circle,
  Ban,
  Loader2,
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
import SubscriptionTabLayout from "../SubscriptionTabLayout";
import TaxDialog from "./_components/TaxDialog";
import DeleteTaxDialog from "./_components/DeleteTaxDialog";
import {
  useGetTaxesQuery,
  useUpdateTaxStatusMutation,
  TaxRegion,
} from "@/redux/api/admin/payments/tax/taxApi";
import { toast } from "sonner";

const TaxTab = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Modal states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TaxRegion | null>(null);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");

  const { data: response, isLoading } = useGetTaxesQuery({
    page,
    limit: 10,
    search: search || undefined,
  });
  const [updateTaxStatus, { isLoading: isUpdatingStatus }] =
    useUpdateTaxStatusMutation();

  const taxes = response?.data || [];
  const filteredTaxes = taxes.filter((item) => {
    if (statusFilter === "all") return true;
    return statusFilter === "Enable" ? item.status : !item.status;
  });

  const handleAdd = () => {
    setDialogMode("add");
    setSelectedItem(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: TaxRegion) => {
    setDialogMode("edit");
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (item: TaxRegion) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateTaxStatus({
        id,
        data: { isActive: !currentStatus },
      }).unwrap();
      toast.success("Tax status updated successfully");
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to update tax status");
    }
  };

  return (
    <SubscriptionTabLayout
      title="Tax Management"
      actionButton={
        <Button
          onClick={handleAdd}
          className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg px-4 py-2 h-auto text-sm font-medium shadow-customShadow flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add
        </Button>
      }
      filters={
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              placeholder="Search by tax..."
              aria-label="Search tax entries"
              className="w-full bg-navbarBg border border-border rounded-lg pl-10 pr-4 py-2.5 placeholder:text-gray-400 focus-visible:ring-0 focus:outline-none text-gray-900 dark:text-white"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="w-full md:w-[150px]">
            <BaseSelect
              placeholder="Status"
              options={[
                { label: "All", value: "all" },
                { label: "Enable", value: "Enable" },
                { label: "Disabled", value: "Disabled" },
              ]}
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
              showLabel={false}
            />
          </div>
        </div>
      }
    >
      <div className="relative min-h-[400px]">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#00A3FF]" />
            <p>Loading taxes...</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <TableRow className="hover:bg-transparent border-b border-gray-200 dark:border-gray-700">
                <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-4">
                  Tax
                </TableHead>
                <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-4">
                  Tax Rate
                </TableHead>
                <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-4">
                  Status
                </TableHead>
                <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-4 text-right">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTaxes.length > 0 ? (
                filteredTaxes.map((item) => (
                    <TableRow
                      key={item.id}
                      className="border-b border-gray-200 dark:border-gray-700 last:border-0 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <TableCell className="py-5 text-[14px] font-bold text-headings">
                        {item.region}
                      </TableCell>
                      <TableCell className="py-5 text-[14px] font-bold text-headings">
                        {item.taxRate}%
                      </TableCell>
                      <TableCell className="py-5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[12px] font-medium border ${
                            item.status
                              ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                              : "bg-[#FEF3F2] text-[#B42318] border-[#FECDCA] dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                          }`}
                        >
                          {item.status ? "Enable" : "Disabled"}
                        </span>
                      </TableCell>
                      <TableCell className="py-5 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => toggleStatus(item.id, item.status)}
                            disabled={isUpdatingStatus}
                            aria-label={
                              item.status ? "Disable tax" : "Enable tax"
                            }
                            className="p-1.5 rounded-md bg-[#E6F4F1] text-muted hover:bg-[#d9eee9] transition-all cursor-pointer disabled:opacity-50"
                          >
                            {isUpdatingStatus ? (
                              <Loader2 className="w-5 h-5 animate-spin text-muted" />
                            ) : item.status ? (
                              <Circle className="w-5 h-5 text-muted" />
                            ) : (
                              <Ban className="w-5 h-5 text-muted" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            aria-label="Edit tax"
                            className="p-1.5 rounded-md border border-[#0EA5E933] bg-[#0EA5E90D] text-[#0EA5E9] hover:bg-[#0EA5E91A] transition-all cursor-pointer"
                          >
                            <PencilLine className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(item)}
                            aria-label="Delete tax"
                            className="p-1.5 rounded-md border border-[#F0443833] bg-[#F044380D] text-[#F04438] hover:bg-[#F044381A] transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-12 text-center text-gray-500"
                  >
                    No tax regions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <TaxDialog
        open={isDialogOpen}
        setOpen={setIsDialogOpen}
        mode={dialogMode}
        data={selectedItem}
      />
      <DeleteTaxDialog
        open={isDeleteOpen}
        setOpen={setIsDeleteOpen}
        data={selectedItem}
      />
    </SubscriptionTabLayout>
  );
};

export default TaxTab;
