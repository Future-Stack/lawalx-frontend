"use client";

import { useState, useEffect, useCallback } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Eye,
  ExternalLink,
  Search,
  CloudDownload,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import TransactionSheet from "../TransactionSheet";
import RefundDialog from "./_components/RefundDialog";
import SubscriptionTabLayout from "../SubscriptionTabLayout";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { formatAmount as formatCurrency } from "@/lib/currencyUtils";
import {
  useGetPaymentHistoryQuery,
  useLazyViewInGatewayQuery,
  type PaymentStatus,
  type PaymentHistoryItem,
} from "@/redux/api/admin/payments/billings/billingsApi";

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<PaymentStatus, string> = {
  PENDING:
    "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400",
  SUCCESS:
    "text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400",
  REFUNDED:
    "text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-400",
  PARTIALLY_REFUNDED:
    "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400",
  CANCELLED:
    "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400",
};

function StatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge
      variant="default"
      className={`font-normal border capitalize ${STATUS_STYLES[status] ?? ""}`}
    >
      {status.replace(/_/g, " ")}
    </Badge>
  );
}

// ── Payment method pill ───────────────────────────────────────────────────────

function PaymentMethodBadge({ method }: { method: string }) {
  const isStripe = method.toLowerCase() === "stripe";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${
        isStripe
          ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800"
          : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
      }`}
    >
      {method}
    </span>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const LIMIT = 10;

// ── Component ─────────────────────────────────────────────────────────────────

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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <SubscriptionTabLayout
      title="Payment history"
      actionButton={
        <button className="flex items-center gap-2 px-4 py-2 border border-borderGray dark:border-gray-600 rounded-lg font-medium shadow-customShadow cursor-pointer hover:bg-gray-100 hover:text-bgBlue text-headings transition-all duration-300 ease-in-out">
          Download All
        </button>
      }
      filters={
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              placeholder="Search by name, email, or invoice..."
              aria-label="Search payment history"
              className="w-full bg-input border border-border rounded-lg pl-10 pr-4 py-3 placeholder:text-muted focus-visible:ring-0 focus:outline-none text-body"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="w-[180px]">
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
            <div className="w-[160px]">
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
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted">
            {meta
              ? `Showing ${start}–${end} of ${meta.total} payments`
              : "Loading…"}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isFetching}
              className="flex items-center gap-2 px-4 py-2 border border-borderGray dark:border-gray-600 rounded-lg font-medium shadow-customShadow cursor-pointer hover:bg-gray-100 hover:text-bgBlue text-headings transition-all duration-300 ease-in-out disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-muted px-1">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isFetching}
              className="flex items-center gap-2 px-4 py-2 border border-borderGray dark:border-gray-600 rounded-lg font-medium shadow-customShadow cursor-pointer hover:bg-gray-100 hover:text-bgBlue text-headings transition-all duration-300 ease-in-out disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      }
    >
      <Table>
        <TableHeader className="bg-cardBackground text-muted">
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {(isLoading || isFetching) &&
            payments.length === 0 &&
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={`skel-${i}`}>
                {Array.from({ length: 8 }).map((__, j) => (
                  <TableCell key={j}>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {!isLoading && payments.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="py-12 text-center text-muted">
                No payment records found.
              </TableCell>
            </TableRow>
          )}

          {payments.map((payment) => (
            <TableRow
              key={payment.paymentId}
              className={isFetching ? "opacity-60 pointer-events-none" : ""}
            >
              <TableCell className="font-semibold text-headings">
                {payment.invoice}
              </TableCell>
              <TableCell>
                <div className="font-medium text-headings">
                  {payment.user.name}
                </div>
                <div className="text-sm text-muted">{payment.user.email}</div>
              </TableCell>
              <TableCell>
                <PaymentMethodBadge method={payment.paymentMethod} />
              </TableCell>
              <TableCell className="font-semibold text-headings">
                {formatCurrency(payment.amount, currency)}
              </TableCell>
              <TableCell>
                <StatusBadge status={payment.status} />
              </TableCell>
              <TableCell className="text-muted">
                {formatDate(payment.date)}
              </TableCell>
              <TableCell>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Download invoice"
                  className="text-muted hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <CloudDownload className="w-4 h-4" />
                </Button>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Payment options"
                      className="h-8 w-8 text-muted hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem
                      onClick={() => handleViewDetails(payment.user.id)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleViewInGateway(payment.paymentId)}
                      disabled={gatewayLoadingId === payment.paymentId}
                    >
                      {gatewayLoadingId === payment.paymentId ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ExternalLink className="mr-2 h-4 w-4" />
                      )}
                      View in Gateway
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-500 focus:text-red-500"
                      onClick={() => handleRefund(payment)}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Refund
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
