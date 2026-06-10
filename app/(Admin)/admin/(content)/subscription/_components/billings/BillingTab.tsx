"use client";

import { useState, useEffect, useCallback } from "react";
import BaseSelect from "@/common/BaseSelect";
import { Search } from "lucide-react";
import TransactionSheet from "../TransactionSheet";
import RefundDialog from "./_components/RefundDialog";
import SubscriptionTabLayout from "../SubscriptionTabLayout";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import {
  useGetPaymentHistoryQuery,
  useLazyViewInGatewayQuery,
  type PaymentStatus,
  type PaymentHistoryItem,
} from "@/redux/api/admin/payments/billings/billingsApi";
import BillingTable from "./_components/BillingTable";
import JSZip from "jszip";
import { generateBillingInvoicePdfBlob } from "../_utils/downloadBillingInvoicePdf";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const LIMIT = 10;
const BillingTab = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">(
    "all",
  );
  const [period, setPeriod] = useState("ALL");

  const currency = useSelector((state: RootState) => state.settings.currency);

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");

  const [refundOpen, setRefundOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] =
    useState<PaymentHistoryItem | null>(null);

  const [gatewayLoadingId, setGatewayLoadingId] = useState<string | null>(null);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  // Debounce search input (400 ms)
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page when filters change
  const handleStatusChange = useCallback((val: string) => {
    setStatusFilter(val as PaymentStatus | "all");
    setPage(1);
  }, []);

  const handlePeriodChange = useCallback((val: string) => {
    setPeriod(val);
    setPage(1);
  }, []);

  // ── API queries ───────────────────────────────────────────────────────────

  const { data, isLoading, isFetching } = useGetPaymentHistoryQuery({
    page,
    limit: LIMIT,
    search: debouncedSearch || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    period,
  });

  const [triggerViewInGateway] = useLazyViewInGatewayQuery();

  const payments: PaymentHistoryItem[] = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const start = meta ? (meta.page - 1) * meta.limit + 1 : 0;
  const end = meta ? Math.min(meta.page * meta.limit, meta.total) : 0;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleViewDetails = (userId: string) => {
    setSelectedUserId(userId);
    setSheetOpen(true);
  };

  const handleRefund = (payment: PaymentHistoryItem) => {
    setSelectedPayment(payment);
    setRefundOpen(true);
  };

  const handleViewInGateway = async (paymentId: string) => {
    try {
      setGatewayLoadingId(paymentId);
      const result = await triggerViewInGateway(paymentId).unwrap();
      if (result?.data?.viewUrl) {
        window.open(result.data.viewUrl, "_blank", "noopener,noreferrer");
      }
    } catch {
      // Gateway URL fetch failed silently
    } finally {
      setGatewayLoadingId(null);
    }
  };

  const handleDownloadAll = async () => {
    if (payments.length === 0) {
      toast.info("No invoices to download.");
      return;
    }

    setIsDownloadingAll(true);
    try {
      const zip = new JSZip();
      for (const payment of payments) {
        const arrayBuffer = await generateBillingInvoicePdfBlob(
          payment,
          currency,
        );
        zip.file(
          `invoice-${payment.invoice || payment.paymentId}.pdf`,
          arrayBuffer,
        );
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `all-invoices-${new Date().toISOString().split("T")[0]}.zip`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(`Downloaded ${payments.length} invoice(s)`);
    } catch (err) {
      console.error("Failed to download all invoices", err);
      toast.error("Failed to generate zip file.");
    } finally {
      setIsDownloadingAll(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <SubscriptionTabLayout
      title="Payment history"
      actionButton={
        <button
          onClick={handleDownloadAll}
          disabled={isDownloadingAll || payments.length === 0}
          className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-customShadow cursor-pointer flex items-center gap-2 disabled:opacity-60"
        >
          {isDownloadingAll && <Loader2 className="w-4 h-4 animate-spin" />}
          Download All
        </button>
      }
      filters={
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              placeholder="Search by name, email, or invoice..."
              aria-label="Search payment history"
              className="w-full bg-navbarBg border border-border rounded-lg pl-10 pr-4 py-2.5 placeholder:text-gray-400 focus-visible:ring-0 focus:outline-none text-gray-900 dark:text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="w-full sm:w-[180px]">
              <BaseSelect
                placeholder="All Status"
                options={[
                  { label: "All Status", value: "all" },
                  { label: "Success", value: "SUCCESS" },
                  { label: "Pending", value: "PENDING" },
                  { label: "Refunded", value: "REFUNDED" },
                  { label: "Partially Refunded", value: "PARTIALLY_REFUNDED" },
                  { label: "Cancelled", value: "CANCELLED" },
                ]}
                value={statusFilter}
                onChange={handleStatusChange}
                showLabel={false}
              />
            </div>
            <div className="w-full sm:w-[160px]">
              <BaseSelect
                placeholder="All Time"
                options={[
                  { label: "All Time", value: "ALL" },
                  { label: "This Month", value: "THIS_MONTH" },
                  { label: "Last Month", value: "LAST_MONTH" },
                  { label: "Last 7 Days", value: "LAST_7_DAYS" },
                  { label: "Last 30 Days", value: "LAST_30_DAYS" },
                  { label: "This Year", value: "THIS_YEAR" },
                ]}
                value={period}
                onChange={handlePeriodChange}
                showLabel={false}
              />
            </div>
          </div>
        </div>
      }
      pagination={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="text-xs sm:text-sm text-muted text-center sm:text-left">
            {meta
              ? `Showing ${start}–${end} of ${meta.total} payments`
              : "Loading…"}
          </div>
          <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isFetching}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white dark:bg-gray-800 rounded-lg text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-customShadow cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-xs sm:text-sm text-muted px-1 whitespace-nowrap">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isFetching}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white dark:bg-gray-800 rounded-lg text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-customShadow cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      }
    >
      <BillingTable
        payments={payments}
        isLoading={isLoading}
        isFetching={isFetching}
        currency={currency}
        gatewayLoadingId={gatewayLoadingId}
        handleViewDetails={handleViewDetails}
        handleRefund={handleRefund}
        handleViewInGateway={handleViewInGateway}
      />
      <TransactionSheet
        open={sheetOpen}
        setOpen={setSheetOpen}
        userId={selectedUserId}
      />
      <RefundDialog
        open={refundOpen}
        setOpen={setRefundOpen}
        payment={selectedPayment}
      />
    </SubscriptionTabLayout>
  );
};

export default BillingTab;
