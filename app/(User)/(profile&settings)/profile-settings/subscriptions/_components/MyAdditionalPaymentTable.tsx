"use client";

import { Download, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useGetMyAdditionalPaymentsQuery } from "@/redux/api/users/additional-payment/additionalPayment.api";
import { getUrl } from "@/lib/content-utils";
import { formatCurrency, formatDateTime } from "./format";

export default function MyAdditionalPaymentTable() {
  const router = useRouter();
  const { data, isLoading } = useGetMyAdditionalPaymentsQuery();
  const invoices = data?.data ?? [];

  const handleDownload = async (invoiceUrl: string, invoiceNumber: string) => {
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
      link.download = `Invoice-${invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Failed to download PDF:", error);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice-${invoiceNumber}.pdf`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden text-sm">
      <table className="w-full text-left">
        <thead className="bg-gray-50 dark:bg-gray-800 text-muted font-medium border-b border-border">
          <tr>
            <th className="px-6 py-3">Invoice</th>
            <th className="px-6 py-3">Subject</th>
            <th className="px-6 py-3">Amount</th>
            <th className="px-6 py-3">Date</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {isLoading ? (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-muted">
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading additional payments...
                </span>
              </td>
            </tr>
          ) : invoices.length > 0 ? (
            invoices.map((row) => {
              const isPaid = row.paymentStatus === "SUCCESS";
              const statusText = isPaid
                ? "Paid"
                : row.paymentStatus === "PENDING"
                  ? "Unpaid"
                  : row.paymentStatus.charAt(0) +
                    row.paymentStatus.slice(1).toLowerCase();
              return (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <td className="px-6 py-4 font-medium text-headings">
                    {row.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 text-muted">{row.subject}</td>
                  <td className="px-6 py-4 text-muted">
                    {formatCurrency(row.totalAmount, row.currency)}
                  </td>
                  <td className="px-6 py-4 text-muted">
                    {formatDateTime(row.billingDate || row.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        isPaid
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-orange-50 text-orange-700 border-orange-200"
                      }`}
                    >
                      {statusText}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3">
                      {!isPaid && (
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/additional-payment/${row.id}/pay`)
                          }
                          className="px-3 py-1.5 bg-bgBlue text-white text-xs font-medium rounded-lg hover:bg-bgBlue/90 cursor-pointer shadow-customShadow"
                        >
                          Pay
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          handleDownload(row.invoiceUrl, row.invoiceNumber)
                        }
                        aria-label="Download invoice"
                        className="text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={6} className="px-6 py-6 text-center text-muted">
                No additional payments found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
