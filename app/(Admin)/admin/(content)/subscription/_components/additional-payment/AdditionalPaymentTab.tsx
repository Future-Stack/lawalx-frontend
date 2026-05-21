"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import AdditionalPaymentTable from "./_components/AdditionalPaymentTable";
import BaseSelect from "@/common/BaseSelect";
import { Button } from "@/components/ui/button";
import SubscriptionTabLayout from "../SubscriptionTabLayout";
import {
  ADDITIONAL_PAYMENT_ROWS,
  type PaymentHistoryRow,
} from "../../_data/additionalPaymentMock";
import { downloadInvoicePdf } from "./_utils/downloadInvoicePdf";
import InvoiceViewModal from "./_components/InvoiceViewModal";
import { toast } from "sonner";

const AdditionalPaymentTab = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("this-month");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [viewRow, setViewRow] = useState<PaymentHistoryRow | null>(null);

  const handleDownloadInvoice = async (item: PaymentHistoryRow) => {
    try {
      setDownloadingId(item.id);
      await downloadInvoicePdf({
        ...item,
        subject: item.address,
      });
      toast.success("Invoice downloaded");
    } catch (e) {
      console.error(e);
      toast.error("Could not generate PDF. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  const invoiceModalData = viewRow
    ? { ...viewRow, subject: viewRow.address }
    : null;

  return (
    <SubscriptionTabLayout
      title="Payment History"
      actionButton={
        <Button className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg px-4 py-2 h-auto text-sm font-medium shadow-customShadow flex items-center gap-2">
          Download All
        </Button>
      }
      filters={
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              placeholder="Search by name, email, or Invoice ID..."
              aria-label="Search payments"
              className="w-full bg-navbarBg border border-border rounded-lg pl-10 pr-4 py-2.5 placeholder:text-gray-400 focus-visible:ring-0 focus:outline-none text-gray-900 dark:text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="w-full sm:w-[160px]">
              <BaseSelect
                placeholder="All Status"
                options={[
                  { label: "All Status", value: "all" },
                  { label: "Paid", value: "Paid" },
                  { label: "Unpaid", value: "Unpaid" },
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                showLabel={false}
              />
            </div>
            <div className="w-full sm:w-[160px]">
              <BaseSelect
                placeholder="This Month"
                options={[
                  { label: "This Month", value: "this-month" },
                  { label: "Last Month", value: "last-month" },
                  { label: "Last 6 Months", value: "last-6-months" },
                ]}
                value={timeFilter}
                onChange={setTimeFilter}
                showLabel={false}
              />
            </div>
          </div>
        </div>
      }
    >
      <AdditionalPaymentTable
        ADDITIONAL_PAYMENT_ROWS={ADDITIONAL_PAYMENT_ROWS}
        downloadingId={downloadingId}
        handleDownloadInvoice={handleDownloadInvoice}
        setViewRow={setViewRow}
      />
      <InvoiceViewModal
        open={viewRow !== null}
        onClose={() => setViewRow(null)}
        data={invoiceModalData}
      />
    </SubscriptionTabLayout>
  );
};

export default AdditionalPaymentTab;
