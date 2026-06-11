"use client";

import { Download } from "lucide-react";
import type { SubscriptionPayment } from "@/redux/api/users/payment/payment.type";
import { formatCurrency, formatDateTime } from "./format";
import { downloadBillingInvoicePdf } from "@/app/(Admin)/admin/(content)/subscription/_components/billings/_utils/downloadBillingInvoicePdf";
import { useGetSettingsUserProfileQuery } from "@/redux/api/users/settings/settingsApi";
import { PaymentHistoryItem } from "@/redux/api/admin/payments/billings/billingsApi";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface BillingHistoryTableProps {
  payments: SubscriptionPayment[];
  planName?: string;
}

export default function BillingHistoryTable({
  payments,
  planName = "Premium",
}: BillingHistoryTableProps) {
  const { data: profileRes } = useGetSettingsUserProfileQuery(undefined);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (row: SubscriptionPayment) => {
    setDownloadingId(row.id);
    try {
      // Normalize amount to prevent object conversion issues
      let rawAmount: unknown = row.amount;
      if (typeof rawAmount === "object" && rawAmount !== null) {
        const amtObj = rawAmount as Record<string, number>;
        rawAmount =
          (row.currency === "NGN" ? amtObj.amount : amtObj.originalAmount) ??
          amtObj.amount;
      }
      const finalAmount =
        typeof rawAmount === "number"
          ? rawAmount
          : parseFloat(String(rawAmount)) || 0;

      const invoiceData = {
        paymentId: row.id,
        invoice: row.transactionId,
        date: row.createdAt,
        amount: finalAmount,
        status: row.status,
        paymentMethod: row.gateway,
        planName: planName.toUpperCase(),
        planDescription: `Subscription plan payment for ${planName}`,
        user: {
          name:
            profileRes?.data?.full_name ||
            profileRes?.data?.username ||
            "Tape User",
          email: row.email || profileRes?.data?.email || "",
        },
      };

      // We pass "USD" as default, but ideally it should match row.currency or settings currency
      await downloadBillingInvoicePdf(
        invoiceData as unknown as PaymentHistoryItem,
        row.currency || "USD",
      );
      toast.success("Receipt downloaded successfully!");
    } catch (error) {
      console.error("Failed to download receipt:", error);
      toast.error("Failed to download receipt.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden text-sm">
      <table className="w-full text-left">
        <thead className="bg-gray-50 dark:bg-gray-800 text-muted font-medium border-b border-border">
          <tr>
            <th className="px-6 py-3 w-10">
              <input
                type="checkbox"
                className="rounded border-gray-300 cursor-pointer"
              />
            </th>
            <th className="px-6 py-3">Invoice</th>
            <th className="px-6 py-3">Amount</th>
            <th className="px-6 py-3">Date</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {payments.length > 0 ? (
            payments.map((row) => {
              const status = row.status === "SUCCESS" ? "Paid" : row.status;
              return (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4 font-medium text-headings">
                    {row.transactionId || row.id}
                  </td>
                  <td className="px-6 py-4 text-muted">
                    {formatCurrency(row.amount, row.currency)}
                  </td>
                  <td className="px-6 py-4 text-muted">
                    {formatDateTime(row.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        status === "Paid"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-orange-50 text-orange-700 border-orange-200"
                      }`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 hover:text-gray-600 cursor-pointer">
                    <button
                      type="button"
                      onClick={() => handleDownload(row)}
                      disabled={downloadingId === row.id}
                      className="cursor-pointer disabled:opacity-50"
                      title="Download Receipt"
                    >
                      {downloadingId === row.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={6} className="px-6 py-6 text-center text-muted">
                No billing history found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
