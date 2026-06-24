"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import AdditionalPaymentTable from "./_components/AdditionalPaymentTable";
import BaseSelect from "@/common/BaseSelect";
import SubscriptionTabLayout from "../SubscriptionTabLayout";
import { useGetAdditionalPaymentsQuery, useLazyGetAdditionalPaymentByIdQuery } from "@/redux/api/admin/payments/additional-payment/additionalPaymentApi";
import type { AdditionalPaymentListRow } from "@/redux/api/admin/payments/additional-payment/additionalPayment.type";
import { toast } from "sonner";
import { downloadAdditionalPaymentInvoicePdf } from "@/components/common/downloadAdditionalPaymentInvoice";
import { AdditionalPaymentData } from "@/components/common/AdditionalPaymentInvoiceDocument";
import InvoiceViewModal from "./_components/InvoiceViewModal";

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
  
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<AdditionalPaymentData | null>(null);

  const [getAdditionalPaymentDetails] = useLazyGetAdditionalPaymentByIdQuery();

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
    let toastId: string | number | undefined;
    try {
      toastId = toast.loading("Preparing invoice download...");
      const response = await getAdditionalPaymentDetails(item.id).unwrap();
      if (response?.data) {
        await downloadAdditionalPaymentInvoicePdf(response.data);
        toast.success("Invoice downloaded successfully!", { id: toastId });
      } else {
        toast.error("Failed to fetch invoice details.", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      if (toastId) toast.error("Failed to download invoice.", { id: toastId });
      else toast.error("Failed to download invoice.");
    }
  };

  const handleViewInvoice = async (item: AdditionalPaymentListRow) => {
    let toastId: string | number | undefined;
    try {
      toastId = toast.loading("Loading invoice details...");
      const response = await getAdditionalPaymentDetails(item.id).unwrap();
      if (response?.data) {
        toast.dismiss(toastId);
        setSelectedInvoice(response.data);
        setViewModalOpen(true);
      } else {
        toast.error("Failed to fetch invoice details.", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      if (toastId) toast.error("Failed to load invoice.", { id: toastId });
      else toast.error("Failed to load invoice.");
    }
  };

  return (
    <SubscriptionTabLayout
      title={`Payment History (${total})`}
      filters={
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              placeholder="Search by name, email, or Invoice ID..."
              aria-label="Search payments"
              className="w-full rounded-lg border border-border bg-navbarBg py-2.5 pl-10 pr-4 text-headings placeholder:text-muted focus-visible:ring-0 focus:outline-none"
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
              className="cursor-pointer rounded-lg bg-navbarBg px-3 py-1.5 text-xs font-medium text-headings shadow-customShadow transition-colors hover:bg-bgGray disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-800 sm:px-4 sm:py-2 sm:text-sm"
              disabled={page === 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span className="text-xs sm:text-sm text-muted px-1 whitespace-nowrap">
              Page {page} of {totalPages}
            </span>
            <button
              className="cursor-pointer rounded-lg bg-navbarBg px-3 py-1.5 text-xs font-medium text-headings shadow-customShadow transition-colors hover:bg-bgGray disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-800 sm:px-4 sm:py-2 sm:text-sm"
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
      
      <InvoiceViewModal 
        open={viewModalOpen} 
        onClose={() => {
          setViewModalOpen(false);
          setTimeout(() => setSelectedInvoice(null), 300);
        }} 
        data={selectedInvoice} 
      />
    </SubscriptionTabLayout>
  );
};

export default AdditionalPaymentTab;
