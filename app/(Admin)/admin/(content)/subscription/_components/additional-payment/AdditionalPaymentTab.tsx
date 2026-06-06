"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import AdditionalPaymentTable from "./_components/AdditionalPaymentTable";
import BaseSelect from "@/common/BaseSelect";
import SubscriptionTabLayout from "../SubscriptionTabLayout";
import { useGetAdditionalPaymentsQuery } from "@/redux/api/admin/payments/additional-payment/additionalPaymentApi";
import type { AdditionalPaymentListRow } from "@/redux/api/admin/payments/additional-payment/additionalPayment.type";
import { getUrl } from "@/lib/content-utils";
import { toast } from "sonner";

const STATUS_PARAM: Record<string, string | undefined> = {
  all: "ALL",
  paid: "SUCCESS",
  unpaid: "PENDING",
};

const PERIOD_PARAM: Record<string, string | undefined> = {
  all: undefined,
  "last-30-days": "last 30 days",
};

const AdditionalPaymentTab = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");

  const { data, isLoading, isError } = useGetAdditionalPaymentsQuery({
    page,
    limit,
    search: search || undefined,
    status: STATUS_PARAM[statusFilter],
    period: PERIOD_PARAM[timeFilter],
  });

  const rows = data?.data?.data ?? [];
  const meta = data?.data?.meta;
  const total = meta?.total ?? rows.length;
  const totalPages = meta?.totalPages ?? 1;

  const handleDownloadInvoice = async (item: AdditionalPaymentListRow) => {
    const invoiceUrl = item.downloadUrl || item.invoiceUrl;
    if (!invoiceUrl) {
      toast.error("Invoice file is not available yet.");
      return;
    }
    const baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL ?? "";
    const cleanPath = invoiceUrl.startsWith("/") ? invoiceUrl.slice(1) : invoiceUrl;
    const url = `${baseUrl}/${cleanPath}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `Invoice-${item.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Failed to download PDF:", error);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice-${item.invoiceNumber}.pdf`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleViewInvoice = (item: AdditionalPaymentListRow) => {
    const invoiceUrl = item.invoiceUrl;
    if (!invoiceUrl) {
      toast.error("Invoice file is not available yet.");
      return;
    }
    const baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL ?? "";
    const cleanPath = invoiceUrl.startsWith("/") ? invoiceUrl.slice(1) : invoiceUrl;
    const url = `${baseUrl}/${cleanPath}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <SubscriptionTabLayout
      title={`Payment History (${total})`}
      filters={
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              placeholder="Search by name, email, or Invoice ID..."
              aria-label="Search payments"
              className="w-full bg-navbarBg border border-border rounded-lg pl-10 pr-4 py-2.5 placeholder:text-gray-400 focus-visible:ring-0 focus:outline-none text-gray-900 dark:text-white"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="w-full sm:w-[160px]">
              <BaseSelect
                placeholder="All Status"
                options={[
                  { label: "All Status", value: "all" },
                  { label: "Paid", value: "paid" },
                  { label: "Unpaid", value: "unpaid" },
                ]}
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value);
                  setPage(1);
                }}
                showLabel={false}
              />
            </div>
            <div className="w-full sm:w-[160px]">
              <BaseSelect
                placeholder="All Time"
                options={[
                  { label: "All Time", value: "all" },
                  { label: "Last 30 Days", value: "last-30-days" },
                ]}
                value={timeFilter}
                onChange={(value) => {
                  setTimeFilter(value);
                  setPage(1);
                }}
                showLabel={false}
              />
            </div>
          </div>
        </div>
      }
      pagination={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="text-xs sm:text-sm text-muted text-center sm:text-left">
            Showing {rows.length} of {total} invoices
          </div>
          <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
            <button
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white dark:bg-gray-800 rounded-lg text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-customShadow disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              disabled={page === 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span className="text-xs sm:text-sm text-muted px-1 whitespace-nowrap">
              Page {page} of {totalPages}
            </span>
            <button
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white dark:bg-gray-800 rounded-lg text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-customShadow disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
            Error loading additional payments. Please try again.
          </p>
        </div>
      ) : rows.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted">No additional payments found.</p>
        </div>
      ) : (
        <AdditionalPaymentTable
          rows={rows}
          onDownload={handleDownloadInvoice}
          onView={handleViewInvoice}
        />
      )}
    </SubscriptionTabLayout>
  );
};

export default AdditionalPaymentTab;
