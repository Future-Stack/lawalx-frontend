"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  CircleCheckBig,
  CloudDownload,
  Copy,
  CornerDownLeft,
  ExternalLink,
  Mail,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useGetUserInvoicesQuery } from "@/redux/api/admin/payments/subscribersApi";

interface TransactionSheetProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  userId: string;
}

const TransactionSheet = ({ open, setOpen, userId }: TransactionSheetProps) => {
  const { data, isLoading, isError } = useGetUserInvoicesQuery(userId, {
    skip: !open || !userId,
  });

  const invoiceData = data?.data;
  const payment = invoiceData?.payment;
  const user = invoiceData?.user;
  const subscription = invoiceData?.subscriptions;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const statusUpper = status?.toUpperCase();
    if (statusUpper === "SUCCESS" || statusUpper === "PAID") {
      return "bg-green-100 text-green-700 border-green-200";
    }
    if (statusUpper === "FAILED" || statusUpper === "REJECTED") {
      return "bg-red-100 text-red-700 border-red-200";
    }
    return "bg-gray-100 text-gray-700 border-gray-200";
  };
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-navbarBg">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-muted" />
          </div>
        ) : isError || !invoiceData ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-red-500">Failed to load invoice details</p>
          </div>
        ) : (
          <>
            <SheetHeader className="mb-6">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-xl text-headings flex items-center gap-2">
                  Transaction Details
                  <Badge
                    variant="default"
                    className={getStatusColor(payment?.status || "")}
                  >
                    {payment?.status || "N/A"}
                  </Badge>
                </SheetTitle>
              </div>
              <SheetDescription className="text-body">
                Invoice #{payment?.invoiceNumber || "N/A"}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6">
              {/* Amount Box */}
              <div className="bg-navbarBg p-4 rounded-lg flex justify-between items-center border border-border">
                <div>
                  <p className="text-sm text-muted">Total Amount</p>
                  <div className="text-2xl font-bold text-headings">
                    {formatAmount(
                      payment?.amountPaid || 0,
                      payment?.currency || "USD",
                    )}
                  </div>
                </div>
                <div className="">
                  <CircleCheckBig
                    className={`w-4 h-4 md:w-6 md:h-6 ${
                      payment?.status?.toUpperCase() === "SUCCESS"
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-sm text-headings border-b pb-2">
                  Transaction Information
                </h4>
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                  <div className="text-muted">Transaction ID</div>
                  <div className="text-right font-medium flex items-center justify-end gap-1 text-body">
                    {payment?.transactionId || "N/A"}
                    <Copy className="w-3 h-3 text-muted cursor-pointer" />
                  </div>

                  <div className="text-muted">Date & Time</div>
                  <div className="text-right font-medium text-body">
                    {payment?.date ? formatDate(payment.date) : "N/A"}
                  </div>

                  <div className="text-muted">Status</div>
                  <div className="text-right">
                    <Badge
                      variant="default"
                      className={getStatusColor(payment?.status || "")}
                    >
                      {payment?.status || "N/A"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-sm text-headings border-b pb-2">
                  Customer Information
                </h4>
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                  <div className="text-muted">Customer</div>
                  <div className="text-right font-medium text-body">
                    {user?.username || user?.fullName || "N/A"}
                  </div>

                  <div className="text-muted">Email</div>
                  <div className="text-right font-medium text-body text-xs">
                    {user?.email || "N/A"}
                  </div>

                  <div className="text-muted">Plan</div>
                  <div className="text-right">
                    <Badge
                      variant="default"
                      className="bg-gray-100 text-gray-600"
                    >
                      {payment?.plan || "N/A"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-sm text-headings border-b pb-2">
                  Payment Details
                </h4>
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                  <div className="text-gray-500">Gateway Ref</div>
                  <div className="text-right font-medium flex items-center justify-end gap-1 text-body text-xs">
                    {payment?.transactionId || "N/A"}
                    <Copy className="w-3 h-3 text-gray-400 cursor-pointer" />
                  </div>

                  <div className="text-gray-500">Gateway</div>
                  <div className="text-right font-medium flex items-center justify-end gap-1 text-body">
                    {payment?.gateway
                      ? payment.gateway.charAt(0).toUpperCase() +
                        payment.gateway.slice(1).toLowerCase()
                      : "N/A"}
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </div>

                  <div className="text-gray-500">Billing Cycle</div>
                  <div className="text-right font-medium text-body">
                    {subscription?.billingCycle || "N/A"}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-sm text-headings">
                  Quick Actions
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="default"
                    className="w-full text-xs bg-gray-300 h-9 shadow-customShadow hover:text-bgBlue border border-border"
                  >
                    <CloudDownload className="w-3 h-3 mr-1" /> Invoice
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-xs h-9 text-headings border border-border shadow-customShadow hover:text-bgBlue hover:bg-gray-100"
                  >
                    <Mail className="w-3 h-3 mr-1" /> Receipt
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full text-xs h-9 shadow-customShadow hover:text-gray-100 bg-red-500"
                  >
                    <CornerDownLeft className="w-3 h-3 mr-1" /> Refund
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default TransactionSheet;
