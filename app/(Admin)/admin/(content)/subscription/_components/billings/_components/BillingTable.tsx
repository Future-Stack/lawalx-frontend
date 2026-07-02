import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  CloudDownload,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatAmount as formatCurrency } from "@/lib/currencyUtils";
import {
  PaymentStatus,
  PaymentHistoryItem,
} from "@/redux/api/admin/payments/billings/billingsApi";
import { downloadBillingInvoicePdf } from "../../_utils/downloadBillingInvoicePdf";
import { CardIcon } from "./CardLogos";

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
function PaymentMethodBadge({
  method,
  brand,
  last4,
}: {
  method: string;
  brand?: string | null;
  last4?: string | null;
}) {
  const isStripe = method.toLowerCase() === "stripe";

  if (brand && last4) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <CardIcon brand={brand} />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[13px] font-medium text-headings capitalize leading-none">
            {brand}
          </span>
          <span className="text-[11px] text-muted tracking-widest leading-none mt-1">
            **** {last4}
          </span>
        </div>
      </div>
    );
  }

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

interface BillingTableProps {
  payments: PaymentHistoryItem[];
  isLoading: boolean;
  isFetching: boolean;
  currency: string;
  gatewayLoadingId: string | null;
  handleViewDetails: (userId: string) => void;
  handleRefund: (payment: PaymentHistoryItem) => void;
  handleViewInGateway: (paymentId: string) => void;
}

const BillingTable = ({
  payments,
  isLoading,
  isFetching,
  currency,
  gatewayLoadingId,
  handleViewDetails,
  handleRefund,
  handleViewInGateway,
}: BillingTableProps) => {
  const [downloadLoadingId, setDownloadLoadingId] = React.useState<
    string | null
  >(null);

  const handleDownload = async (payment: PaymentHistoryItem) => {
    try {
      setDownloadLoadingId(payment.paymentId);
      await downloadBillingInvoicePdf(payment, currency);
    } catch (err) {
      console.error("Failed to download invoice", err);
    } finally {
      setDownloadLoadingId(null);
    }
  };

  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="hidden lg:block">
        <Table>
          <TableHeader className="border-b border-border bg-bgGray dark:bg-gray-800/40">
            <TableRow>
              <TableHead className="text-xs font-medium uppercase text-muted">
                Invoice
              </TableHead>
              <TableHead className="text-xs font-medium uppercase text-muted">
                User
              </TableHead>
              <TableHead className="text-xs font-medium uppercase text-muted">
                Payment Method
              </TableHead>
              <TableHead className="text-xs font-medium uppercase text-muted">
                Amount
              </TableHead>
              <TableHead className="text-xs font-medium uppercase text-muted">
                Status
              </TableHead>
              <TableHead className="text-xs font-medium uppercase text-muted">
                Date
              </TableHead>
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
                      <div className="h-4 animate-pulse rounded bg-bgGray dark:bg-gray-800" />
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
                className={`${isFetching ? "opacity-60 pointer-events-none" : ""} hover:bg-bgGray dark:hover:bg-gray-800/50`}
              >
                <TableCell className="font-semibold text-headings whitespace-nowrap">
                  {payment.invoice}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <div className="font-medium text-headings">
                    {payment.user.name}
                  </div>
                  <div className="text-sm text-muted">{payment.user.email}</div>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <PaymentMethodBadge
                    method={payment.paymentMethod}
                    brand={payment.brand}
                    last4={payment.last4}
                  />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <div className="font-semibold text-headings">
                    {formatCurrency(payment.amount, currency)}
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <StatusBadge status={payment.status} />
                </TableCell>
                <TableCell className="text-muted whitespace-nowrap">
                  {formatDate(payment.date)}
                </TableCell>
                <TableCell>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Download invoice"
                    onClick={() => handleDownload(payment)}
                    disabled={downloadLoadingId === payment.paymentId}
                    className="text-muted hover:bg-bgGray dark:hover:bg-gray-800"
                  >
                    {downloadLoadingId === payment.paymentId ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CloudDownload className="w-4 h-4" />
                    )}
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2.5">
                    <button
                      onClick={() => handleViewInGateway(payment.paymentId)}
                      disabled={gatewayLoadingId === payment.paymentId}
                      className="cursor-pointer rounded-md border border-cyan-200 bg-cyan-50 p-1.5 text-cyan-600 transition-all hover:bg-cyan-100 dark:border-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400 disabled:opacity-50"
                      title="View in Gateway"
                    >
                      {gatewayLoadingId === payment.paymentId ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ExternalLink className="w-4 h-4" />
                      )}
                    </button>
                    {payment.status !== "REFUNDED" && (
                      <button
                        onClick={() => handleRefund(payment)}
                        className="cursor-pointer rounded-md border border-red-200 bg-red-50 p-1.5 text-red-500 transition-all hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
                        title="Refund"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="lg:hidden space-y-4 p-4">
        {(isLoading || isFetching) &&
          payments.length === 0 &&
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={`skel-mob-${i}`}
              className="h-32 animate-pulse rounded-lg bg-bgGray dark:bg-gray-800"
            />
          ))}

        {!isLoading && payments.length === 0 && (
          <div className="py-12 text-center text-muted">
            No payment records found.
          </div>
        )}

        {payments.map((payment) => (
          <div
            key={payment.paymentId}
            className={`${isFetching ? "opacity-60 pointer-events-none" : ""} rounded-lg border border-border bg-navbarBg p-4 space-y-3 shadow-sm`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="font-medium text-headings text-sm truncate">
                  Invoice:{" "}
                  <span className="font-semibold">{payment.invoice}</span>
                </div>
                <div className="text-sm mt-1 min-w-0">
                  <span className="font-medium text-headings truncate block">
                    {payment.user.name}
                  </span>
                  <span className="text-muted block text-xs truncate">
                    {payment.user.email}
                  </span>
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Download invoice"
                  onClick={() => handleDownload(payment)}
                  disabled={downloadLoadingId === payment.paymentId}
                  className="h-8 w-8 text-muted hover:bg-bgGray dark:hover:bg-gray-800"
                >
                  {downloadLoadingId === payment.paymentId ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CloudDownload className="w-4 h-4" />
                  )}
                </Button>
                <div className="flex items-center justify-end gap-2.5">
                  <button
                    onClick={() => handleViewInGateway(payment.paymentId)}
                    disabled={gatewayLoadingId === payment.paymentId}
                    className="cursor-pointer rounded-md border border-cyan-200 bg-cyan-50 p-1.5 text-cyan-600 transition-all hover:bg-cyan-100 dark:border-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400 disabled:opacity-50"
                    title="View in Gateway"
                  >
                    {gatewayLoadingId === payment.paymentId ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ExternalLink className="w-4 h-4" />
                    )}
                  </button>
                  {payment.status !== "REFUNDED" && (
                    <button
                      onClick={() => handleRefund(payment)}
                      className="cursor-pointer rounded-md border border-red-200 bg-red-50 p-1.5 text-red-500 transition-all hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
                      title="Refund"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between text-sm gap-2">
              <span className="text-muted whitespace-nowrap">
                Payment Method:
              </span>
              <div className="flex-shrink-0">
                <PaymentMethodBadge
                  method={payment.paymentMethod}
                  brand={payment.brand}
                  last4={payment.last4}
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between text-sm gap-2">
              <span className="text-muted whitespace-nowrap">Amount:</span>
              <div className="text-right">
                <div className="font-semibold text-headings break-all">
                  {formatCurrency(payment.amount, currency)}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between text-sm gap-2">
              <span className="text-muted whitespace-nowrap">Date:</span>
              <span className="text-muted whitespace-nowrap">
                {formatDate(payment.date)}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between text-sm gap-2">
              <span className="text-muted whitespace-nowrap">Status:</span>
              <div className="flex-shrink-0">
                <StatusBadge status={payment.status} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BillingTable;
