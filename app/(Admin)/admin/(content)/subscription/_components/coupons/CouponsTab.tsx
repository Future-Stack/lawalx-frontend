"use client";

import { useState } from "react";
import {
  useGetCouponsQuery,
  useUpdateCouponStatusMutation,
  CouponItem,
} from "@/redux/api/admin/payments/coupons/couponsApi";
import BaseSelect from "@/common/BaseSelect";

import { Search, Loader2 } from "lucide-react";
import CouponsTable from "./_components/CouponsTable";
import CreateCouponDialog from "./_components/CreateCouponDialog";
import { toast } from "sonner";
import SubscriptionTabLayout from "../SubscriptionTabLayout";

const CouponsTab = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<CouponItem | null>(null);

  const { data, isLoading, isError } = useGetCouponsQuery({
    page,
    limit,
    search: searchTerm || undefined,
    status:
      statusFilter !== "all"
        ? (statusFilter as "ACTIVE" | "EXPIRED" | "DISABLED")
        : undefined,
  });

  const [updateCouponStatus, { isLoading: isUpdatingStatus }] =
    useUpdateCouponStatusMutation();

  const coupons = data?.data?.data || [];
  const meta = data?.data?.meta;
  const totalCoupons = meta?.total || 0;
  const totalPages = meta?.totalPages || 1;

  const handleEditClick = (coupon: CouponItem) => {
    setSelectedCoupon(coupon);
    setEditModalOpen(true);
  };

  const handleStopCoupon = async (coupon: CouponItem) => {
    const newStatus = coupon.status === "ACTIVE" ? "DISABLED" : "ACTIVE";

    try {
      await updateCouponStatus({
        id: coupon.id,
        data: { status: newStatus },
      }).unwrap();
      toast.success(
        `Coupon ${newStatus === "DISABLED" ? "disabled" : "activated"} successfully!`,
      );
    } catch (error) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to update coupon status");
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    if (status === "ACTIVE") {
      return "text-green-600 bg-green-50 border-green-200";
    }
    if (status === "EXPIRED") {
      return "text-red-600 bg-red-50 border-red-200";
    }
    return "text-muted bg-bgGray border-border dark:bg-gray-800";
  };

  return (
    <SubscriptionTabLayout
      title="Coupon Management"
      actionButton={
        <button
          onClick={() => setCreateModalOpen(true)}
          className="cursor-pointer rounded-lg bg-navbarBg px-4 py-2 text-sm font-medium text-headings shadow-customShadow transition-colors hover:bg-bgGray dark:hover:bg-gray-800"
        >
          Create New Coupon
        </button>
      }
      filters={
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              placeholder="Search by code..."
              aria-label="Search coupons by code"
              className="w-full rounded-lg border border-border bg-navbarBg py-2.5 pl-10 pr-4 text-headings placeholder:text-muted focus-visible:ring-0 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-[160px]">
            <BaseSelect
              placeholder="All Status"
              options={[
                { label: "All Status", value: "all" },
                { label: "Active", value: "ACTIVE" },
                { label: "Expired", value: "EXPIRED" },
                { label: "Disabled", value: "DISABLED" },
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
      pagination={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="text-xs sm:text-sm text-muted text-center sm:text-left">
            Showing {coupons.length} of {totalCoupons} coupons
          </div>
          <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
            <button
              className="cursor-pointer rounded-lg bg-navbarBg px-3 py-1.5 text-xs font-medium text-headings shadow-customShadow transition-colors hover:bg-bgGray disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-800 sm:px-4 sm:py-2 sm:text-sm"
              disabled={page === 1 || isLoading}
              onClick={handlePreviousPage}
            >
              Previous
            </button>
            <span className="text-xs sm:text-sm text-muted px-1 whitespace-nowrap">
              Page {page} of {totalPages}
            </span>
            <button
              className="cursor-pointer rounded-lg bg-navbarBg px-3 py-1.5 text-xs font-medium text-headings shadow-customShadow transition-colors hover:bg-bgGray disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-800 sm:px-4 sm:py-2 sm:text-sm"
              disabled={page === totalPages || isLoading}
              onClick={handleNextPage}
            >
              Next
            </button>
          </div>
        </div>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted" />
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-red-500">
            Error loading coupons. Please try again.
          </p>
        </div>
      ) : coupons.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted">No coupons found.</p>
        </div>
      ) : (
        <CouponsTable
          coupons={coupons}
          isUpdatingStatus={isUpdatingStatus}
          getStatusColor={getStatusColor}
          formatDate={formatDate}
          handleEditClick={handleEditClick}
          handleStopCoupon={handleStopCoupon}
        />
      )}
      <CreateCouponDialog open={createModalOpen} setOpen={setCreateModalOpen} />

      <CreateCouponDialog
        open={editModalOpen}
        setOpen={setEditModalOpen}
        editMode={true}
        initialData={selectedCoupon}
      />
    </SubscriptionTabLayout>
  );
};

export default CouponsTab;
