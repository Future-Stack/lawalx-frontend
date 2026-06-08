// src/components/Admin/tabs/SubscriptionTab.tsx
"use client";

import { useState } from "react";
import { Download, Edit2, Loader2 } from "lucide-react";
import TablePagination from "@/components/shared/TablePagination";
import { useLazyGetUserInvoicesQuery, useLazyGetSingleInvoiceQuery } from "@/redux/api/admin/usermanagementApi";
import { generateInvoicePdf } from "@/lib/invoicePdfUtils";
import { toast } from "sonner";
import JSZip from "jszip";

export default function SubscriptionTab({
  onOpenChangePlan,
  currentPlan,
  paymentHistory: paymentHistoryProp,
  monthlyPayment,
  currency,
  userId,
}: {
  onOpenChangePlan: () => void;
  currentPlan?: any;
  paymentHistory?: any[];
  monthlyPayment?: string;
  currency?: string;
  userId?: string;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const ITEMS_PER_PAGE = 10;

  const [triggerGetInvoices] = useLazyGetUserInvoicesQuery();
  const [triggerGetSingleInvoice] = useLazyGetSingleInvoiceQuery();

  const history = paymentHistoryProp && paymentHistoryProp.length > 0 ? paymentHistoryProp : [];

  const formatAmount = (p: any): string => {
    const isNGN = currency === "NGN";
    const symbol = isNGN ? "₦" : "$";
    if (typeof p.amount === "number" && typeof p.originalAmount === "number") {
      const val = isNGN ? p.amount : p.originalAmount;
      return `${symbol}${val.toFixed(2)}`;
    }
    if (typeof p.amount === "string") return p.amount;
    return "N/A";
  };

  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);
  const currentHistory = history.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleDownloadAll = async () => {
    if (!userId) return toast.error("User ID not available");
    setDownloadingAll(true);
    try {
      const { data, isError } = await triggerGetInvoices({ userId, limit: 100 });
      if (isError || !data?.success) return toast.error("Failed to fetch invoices");

      const invoices: any[] = data.data || [];
      if (invoices.length === 0) return toast.info("No invoices found");

      const zip = new JSZip();
      for (const inv of invoices) {
        const doc = await generateInvoicePdf(inv, currency);
        const pdfBlob = doc.output("arraybuffer");
        zip.file(`${inv.invoiceNumber || inv.id}.pdf`, pdfBlob);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoices-${new Date().toISOString().split("T")[0]}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${invoices.length} invoice(s)`);
    } catch (err) {
      toast.error("Failed to download invoices");
    } finally {
      setDownloadingAll(false);
    }
  };
  const handleDownloadSingle = async (invoiceId: string) => {
    if (!userId) return toast.error('User ID not available');
    setDownloadingId(invoiceId);
    try {
      const { data, isError } = await triggerGetSingleInvoice({ userId, paymentId: invoiceId });
      console.log('Single invoice response:', { data, isError });
      if (isError || !data?.success) return toast.error('Failed to fetch invoice');
      const doc = await generateInvoicePdf(data.data, currency);
      doc.save(`${invoiceId}.pdf`);
      toast.success('Invoice downloaded');
    } catch (err) {
      console.error('Error downloading invoice:', err);
      toast.error('Failed to download invoice');
    } finally {
      setDownloadingId(null);
    }
  };


  return (
    <div className="space-y-8">
      {/* Current Plan */}
      <div className="bg-navbarBg rounded-xl border border-border shadow-sm">
        <div className="flex justify-between items-start mb-6 border-b border-border p-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Current Plan</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Active subscription details</p>
          </div>
          <button
            onClick={onOpenChangePlan}
            className="px-4 shadow-customShadow py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
            Change Plan
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6 p-4">
          <div className="flex justify-between items-center py-3 border-b border-border">
            <span className="text-sm text-gray-500 dark:text-gray-400">Plan</span>
            {currentPlan?.plan
              ? <span className="px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-medium border border-orange-200 dark:border-orange-800">{currentPlan.plan}</span>
              : <span className="text-sm font-bold text-gray-900 dark:text-white">N/A</span>}
          </div>
          <div className="flex justify-between items-center py-3 border-b border-border">
            <span className="text-sm text-gray-500 dark:text-gray-400">Billing Cycle</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{currentPlan?.billingCycle || "N/A"}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-border">
            <span className="text-sm text-gray-500 dark:text-gray-400">Price</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{monthlyPayment || currentPlan?.price || "N/A"}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-border">
            <span className="text-sm text-gray-500 dark:text-gray-400">Next Billing</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {currentPlan?.nextBilling ? new Date(currentPlan.nextBilling).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "N/A"}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-border">
            <span className="text-sm text-gray-500 dark:text-gray-400">Auto Renew</span>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{currentPlan?.autoRenew || "N/A"}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-border">
            <span className="text-sm text-gray-500 dark:text-gray-400">Billing Status</span>
            {currentPlan?.billingStatus
              ? <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1.5 w-fit ${
                  currentPlan.billingStatus === "ACTIVE"
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                    : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
                }`}>
                  {currentPlan.billingStatus}
                  <div className={`w-1.5 h-1.5 rounded-full ${currentPlan.billingStatus === "ACTIVE" ? "bg-green-500" : "bg-red-500"}`} />
                </span>
              : <span className="text-sm font-bold text-gray-900 dark:text-white">N/A</span>}
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-navbarBg rounded-xl border border-border shadow-sm">
        <div className="flex justify-between items-center border-b border-border p-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Payment History</h3>
          <button
            onClick={handleDownloadAll}
            disabled={downloadingAll}
            className="px-4 shadow-customShadow py-2 bg-white dark:bg-gray-700 border border-border rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-60"
          >
            {downloadingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Download All
          </button>
        </div>
        <div className="overflow-x-auto px-4">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Invoice</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Payment Method</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Date</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {currentHistory.length > 0 ? currentHistory.map((p, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{p.invoice}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="px-1.5 py-0.5 border border-blue-200 bg-blue-50 text-blue-700 rounded text-[10px] uppercase font-bold">VISA</span>
                    {p.method || p.paymentMethod || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{formatAmount(p)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border inline-block ${
                      p.status === "Paid" || p.status === "SUCCESS"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                        : p.status === "PENDING"
                          ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
                          : p.status === "REFUNDED"
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                            : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
                    }`}>
                      {p.status === "SUCCESS" ? "Paid" : p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {p.date ? new Date(p.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "N/A"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDownloadSingle(p.invoice)}
                      disabled={downloadingId === p.invoice}
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer disabled:opacity-60"
                      title="Download Invoice"
                    >
                      {downloadingId === p.invoice
                        ? <Loader2 className="w-5 h-5 animate-spin" />
                        : <Download className="w-5 h-5" />}
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">No payment history found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {history.length > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={history.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}
