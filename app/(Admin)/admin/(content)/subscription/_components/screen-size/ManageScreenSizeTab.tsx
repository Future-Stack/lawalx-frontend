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
import ScreenSizeDialog from "./_components/ScreenSizeDialog";
import DeleteScreenSizeDialog from "./_components/DeleteScreenSizeDialog";
import SubscriptionTabLayout from "../SubscriptionTabLayout";
import {
  useGetAllScreenSizesQuery,
  useUpdateScreenSizeStatusMutation,
  ScreenSize,
} from "@/redux/api/admin/payments/screenManagement/screenSizeApi";
import { toast } from "sonner";

const ManageScreenSizeTab = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Modal states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ScreenSize | null>(null);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");

  // API Queries
  const { data: response, isLoading } = useGetAllScreenSizesQuery({
    page,
    limit: 10,
    search: search || undefined,
    status: statusFilter === "all" ? undefined : statusFilter === "Enable",
  });

  const [updateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateScreenSizeStatusMutation();

  const screenSizes = response?.data || [];

  const handleAdd = () => {
    setDialogMode("add");
    setSelectedItem(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: ScreenSize) => {
    setDialogMode("edit");
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (item: ScreenSize) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateStatus({
        id,
        data: { isActive: !currentStatus },
      }).unwrap();
      toast.success("Status updated successfully!");
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to update status");
    }
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
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
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
              onChange={(val) => {
                setStatusFilter(val);
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
            <p>Loading screen sizes...</p>
          </div>
        ) : (
          <>
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
                {screenSizes.length > 0 ? (
                  screenSizes.map((item) => (
                    <TableRow
                      key={item.id}
                      className="border-b border-border last:border-0 transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                    >
                      <TableCell className="py-5 text-[14px] font-medium text-headings">
                        {item.size}
                      </TableCell>
                      <TableCell className="py-5 text-[14px] font-bold text-headings">
                        {item.currency === "USD" ? "$" : item.currency}
                        {item.price}
                      </TableCell>
                      <TableCell className="py-5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[12px] font-medium border ${
                            item.isActive
                              ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                              : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                          }`}
                        >
                          {item.isActive ? "Enable" : "Disabled"}
                        </span>
                      </TableCell>
                      <TableCell className="py-5 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => toggleStatus(item.id, item.isActive)}
                            disabled={isUpdatingStatus}
                            aria-label={
                              item.isActive
                                ? "Disable screen size"
                                : "Enable screen size"
                            }
                            className="p-1.5 rounded-md bg-[#E6F4F1] text-muted hover:bg-[#d9eee9] transition-all cursor-pointer disabled:opacity-50"
                          >
                            {isUpdatingStatus ? (
                              <Loader2 className="w-5 h-5 animate-spin text-muted" />
                            ) : item.isActive ? (
                              <Circle className="w-5 h-5 text-muted" />
                            ) : (
                              <Ban className="w-5 h-5 text-muted" />
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-12 text-center text-gray-500"
                    >
                      No screen sizes found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination Placeholder (If needed in future) */}
            {response?.meta && response.meta.totalPages > 1 && (
              <div className="flex justify-center mt-6">
                {/* Pagination logic here */}
              </div>
            )}
          </>
        )}
      </div>

      <ScreenSizeDialog
        open={isDialogOpen}
        setOpen={setIsDialogOpen}
        mode={dialogMode}
        data={selectedItem}
      />
      <DeleteScreenSizeDialog
        open={isDeleteOpen}
        setOpen={setIsDeleteOpen}
        data={selectedItem}
      />
    </SubscriptionTabLayout>
  );
};

export default ManageScreenSizeTab;
