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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Eye,
  ExternalLink,
  CloudDownload,
  Loader2,
  RotateCcw,
  ArrowUpCircle,
  Mail,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatAmount as formatCurrency } from "@/lib/currencyUtils";
import {
  PaymentStatus,
  PaymentHistoryItem,
} from "@/redux/api/admin/payments/billings/billingsApi";
import { downloadBillingInvoicePdf } from "../../_utils/downloadBillingInvoicePdf";

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
          <TableHeader className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
            <TableRow>
              <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Invoice
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                User
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Payment Method
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Amount
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Status
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
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
                className={`${isFetching ? "opacity-60 pointer-events-none" : ""} hover:bg-gray-50 dark:hover:bg-gray-700/50`}
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
                    onClick={() => handleDownload(payment)}
                    disabled={downloadLoadingId === payment.paymentId}
                    className="text-muted hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {downloadLoadingId === payment.paymentId ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CloudDownload className="w-4 h-4" />
                    )}
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
                      {/* <DropdownMenuItem
                        onClick={() => handleViewDetails(payment.user.id)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem> */}
                      <DropdownMenuItem>
                        <ArrowUpCircle className="mr-2 h-4 w-4" />
                        change plan
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Mail className="mr-2 h-4 w-4" />
                        Resend Receipt
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
                      {payment.status !== "REFUNDED" && (
                        <DropdownMenuItem
                          className="text-red-500 focus:text-red-500"
                          onClick={() => handleRefund(payment)}
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Refund
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
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
              className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
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
            className={`${isFetching ? "opacity-60 pointer-events-none" : ""} bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3 shadow-sm`}
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
                  className="h-8 w-8 text-muted hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {downloadLoadingId === payment.paymentId ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CloudDownload className="w-4 h-4" />
                  )}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Payment options"
                      className="h-8 w-8 text-muted hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    {/* <DropdownMenuItem
                      onClick={() => handleViewDetails(payment.user.id)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem> */}
                    <DropdownMenuItem>
                      <ArrowUpCircle className="mr-2 h-4 w-4" />
                      change plan
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Mail className="mr-2 h-4 w-4" />
                      Resend Receipt
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
                    {payment.status !== "REFUNDED" && (
                      <DropdownMenuItem
                        className="text-red-500 focus:text-red-500"
                        onClick={() => handleRefund(payment)}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Refund
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between text-sm gap-2">
              <span className="text-muted whitespace-nowrap">
                Payment Method:
              </span>
              <div className="flex-shrink-0">
                <PaymentMethodBadge method={payment.paymentMethod} />
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between text-sm gap-2">
              <span className="text-muted whitespace-nowrap">Amount:</span>
              <span className="font-semibold text-headings break-all">
                {formatCurrency(payment.amount, currency)}
              </span>
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
