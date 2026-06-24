import { useState } from "react";
import { Search, Plus, Loader2 } from "lucide-react";
import ScreenSizeTable from "./_components/ScreenSizeTable";
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
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { getCurrencySymbol } from "@/lib/currencyUtils";

const ManageScreenSizeTab = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Modal states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ScreenSize | null>(null);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");

  const globalCurrency = useSelector(
    (state: RootState) => state.settings.currency,
  );
  const currencySymbol = getCurrencySymbol(globalCurrency);

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
          className="flex h-auto items-center gap-2 rounded-lg bg-navbarBg px-4 py-2 text-sm font-medium text-headings shadow-customShadow transition-colors hover:bg-bgGray dark:hover:bg-gray-800"
        >
          <Plus className="w-5 h-5" /> Add
        </Button>
      }
      filters={
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              placeholder="Search by size..."
              aria-label="Search screen sizes"
              className="w-full rounded-lg border border-border bg-navbarBg py-2.5 pl-10 pr-4 text-headings placeholder:text-muted focus-visible:ring-0 focus:outline-none"
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
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-muted">
            <Loader2 className="w-8 h-8 animate-spin text-bgBlue" />
            <p>Loading screen sizes...</p>
          </div>
        ) : (
          <>
            <ScreenSizeTable
              screenSizes={screenSizes}
              isUpdatingStatus={isUpdatingStatus}
              currencySymbol={currencySymbol}
              toggleStatus={toggleStatus}
              handleEdit={handleEdit}
              handleDeleteClick={handleDeleteClick}
            />
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
