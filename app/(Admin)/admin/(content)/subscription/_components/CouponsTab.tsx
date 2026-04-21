"use client";

import { useState } from "react";
import {
  useGetCouponsQuery,
  useUpdateCouponStatusMutation,
  CouponItem,
} from "@/redux/api/admin/payments/coupons/couponsApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import BaseSelect from "@/common/BaseSelect";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Search, Edit, Ban, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CreateCouponDialog from "./CreateCouponDialog";
import { toast } from "sonner";

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
        `Coupon ${newStatus === "DISABLED" ? "disabled" : "activated"} successfully!`
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
    return "text-gray-400 bg-gray-50 border-gray-200";
  };

  return (
    <div className="">
      {/* Table Component */}
      <div className="rounded-xl border border-border bg-navbarBg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
          <h2 className="text-headings text-lg font-semibold">
            Coupon Management
          </h2>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-borderGray dark:border-gray-600 rounded-lg font-medium shadow-customShadow cursor-pointer hover:bg-gray-100 hover:text-bgBlue text-headings transition-all duration-300 ease-in-out"
          >
            Create New Coupon
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center p-4 md:p-6 bg-navbarBg border-b border-border">
          {/* Search Input */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              placeholder="Search by code..."
              className="w-full bg-input border border-border rounded-lg pl-10 pr-4 py-3 placeholder:text-muted focus-visible:ring-0 focus:outline-none text-body"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-[160px]">
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

        {/* Table Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted" />
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-red-500">Error loading coupons. Please try again.</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted">No coupons found.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-cardBackground border-b border-border text-body">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-medium text-headings">
                    {coupon.name}
                  </TableCell>
                  <TableCell className="font-bold text-headings">
                    {coupon.code}
                  </TableCell>
                  <TableCell className="font-semibold text-headings">
                    {coupon.discountType === "PERCENTAGE"
                      ? `${coupon.discountValue}%`
                      : `$${coupon.discountValue}`}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3 w-48">
                      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-bgBlue rounded-full"
                          style={{
                            width: `${
                              coupon.useLimit > 0
                                ? (coupon.usedCount / coupon.useLimit) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted font-medium whitespace-nowrap">
                        {coupon.usedCount} / {coupon.useLimit}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default" className={`font-normal border ${getStatusColor(coupon.status)}`}>
                      {coupon.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted">{formatDate(coupon.expiryDate)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="h-8 w-8 text-muted hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                          disabled={isUpdatingStatus}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={() => handleEditClick(coupon)}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" /> Edit coupon
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStopCoupon(coupon)}
                          className="cursor-pointer text-red-500 focus:text-red-500"
                          disabled={isUpdatingStatus}
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          {coupon.status === "ACTIVE" ? "Stop Coupon" : "Activate Coupon"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 md:p-6 border-t border-border bg-navbarBg">
          <div className="text-sm text-muted">Showing {coupons.length} of {totalCoupons} coupons</div>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-2 px-4 py-2 border border-borderGray dark:border-gray-600 rounded-lg font-medium shadow-customShadow cursor-pointer hover:bg-gray-100 hover:text-bgBlue text-headings transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={page === 1 || isLoading}
              onClick={handlePreviousPage}
            >
              Previous
            </button>
            <span className="text-sm text-muted">
              Page {page} of {totalPages}
            </span>
            <button
              className="flex items-center gap-2 px-4 py-2 border border-borderGray dark:border-gray-600 rounded-lg font-medium shadow-customShadow cursor-pointer hover:bg-gray-100 hover:text-bgBlue text-headings transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={page === totalPages || isLoading}
              onClick={handleNextPage}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <CreateCouponDialog open={createModalOpen} setOpen={setCreateModalOpen} />

      <CreateCouponDialog
        open={editModalOpen}
        setOpen={setEditModalOpen}
        editMode={true}
        initialData={selectedCoupon}
      />
    </div>
  );
};

export default CouponsTab;
