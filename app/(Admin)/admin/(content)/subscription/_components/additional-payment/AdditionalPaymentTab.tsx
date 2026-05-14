"use client";

import { useState } from "react";
import {
  Search,
  Eye,
  CloudDownload,
} from "lucide-react";
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
import SubscriptionTabLayout from "../SubscriptionTabLayout";
import InvoicePreview from "./_components/InvoicePreview";

interface PaymentHistoryData {
  id: string;
  billTo: string;
  billFrom: string;
  address: string;
  totalPrice: string;
  status: "Paid" | "Unpaid";
}

const initialData: PaymentHistoryData[] = [
  {
    id: "1",
    billTo: "TechCorp Inc.",
    billFrom: "Tape",
    address: "Antopolis Designs and Technologies",
    totalPrice: "$299.00",
    status: "Unpaid",
  },
  {
    id: "2",
    billTo: "TechCorp Inc.",
    billFrom: "Tape",
    address: "Antopolis Designs and Technologies",
    totalPrice: "$299.00",
    status: "Paid",
  },
  {
    id: "3",
    billTo: "TechCorp Inc.",
    billFrom: "Tape",
    address: "Antopolis Designs and Technologies",
    totalPrice: "$299.00",
    status: "Unpaid",
  },
  {
    id: "4",
    billTo: "TechCorp Inc.",
    billFrom: "Tape",
    address: "Antopolis Designs and Technologies",
    totalPrice: "$299.00",
    status: "Paid",
  },
  {
    id: "5",
    billTo: "TechCorp Inc.",
    billFrom: "Floyd Miles",
    address: "Antopolis Designs and Technologies",
    totalPrice: "$299.00",
    status: "Paid",
  },
  {
    id: "6",
    billTo: "TechCorp Inc.",
    billFrom: "Jerome Bell",
    address: "Antopolis Designs and Technologies",
    totalPrice: "$299.00",
    status: "Paid",
  },
];

const AdditionalPaymentTab = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("this-month");
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<PaymentHistoryData | null>(
    null,
  );
  const [invoiceAction, setInvoiceAction] = useState<"preview" | "download">(
    "preview",
  );

  const handleViewInvoice = (item: PaymentHistoryData) => {
    setSelectedInvoice(item);
    setInvoiceAction("preview");
    setIsInvoiceOpen(true);
  };

  const handleDownloadInvoice = (item: PaymentHistoryData) => {
    setSelectedInvoice(item);
    setInvoiceAction("download");
    setIsInvoiceOpen(true);
  };

  return (
    <SubscriptionTabLayout
      title="Payment History"
      actionButton={
        <Button
          className="bg-white hover:bg-gray-50 text-headings border border-borderGray rounded-lg px-6 py-2 h-auto font-bold shadow-sm flex items-center gap-2"
        >
          Download All
        </Button>
      }
      filters={
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              placeholder="Search by name, email, or Invoice ID..."
              aria-label="Search payments"
              className="w-full bg-[#F9FAFB] dark:bg-gray-900 border border-border rounded-lg pl-10 pr-4 py-3 placeholder:text-muted focus-visible:ring-0 focus:outline-none text-body"
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
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-border">
            <TableHead className="text-[#667085] font-semibold text-[12px] uppercase tracking-wider py-4">
              Bill To
            </TableHead>
            <TableHead className="text-[#667085] font-semibold text-[12px] uppercase tracking-wider py-4">
              Bill From
            </TableHead>
            <TableHead className="text-[#667085] font-semibold text-[12px] uppercase tracking-wider py-4">
              Address
            </TableHead>
            <TableHead className="text-[#667085] font-semibold text-[12px] uppercase tracking-wider py-4">
              Total Price
            </TableHead>
            <TableHead className="text-[#667085] font-semibold text-[12px] uppercase tracking-wider py-4">
              Status
            </TableHead>
            <TableHead className="text-[#667085] font-semibold text-[12px] uppercase tracking-wider py-4 text-right">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialData.map((item) => (
            <TableRow
              key={item.id}
              className="border-b border-border last:border-0 transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
            >
              <TableCell className="py-5 text-[14px] font-bold text-headings">
                {item.billTo}
              </TableCell>
              <TableCell className="py-5 text-[14px] text-headings">
                {item.billFrom}
              </TableCell>
              <TableCell className="py-5 text-[14px] text-headings">
                {item.address}
              </TableCell>
              <TableCell className="py-5 text-[14px] font-bold text-headings">
                {item.totalPrice}
              </TableCell>
              <TableCell className="py-5">
                <span
                  className={`px-3 py-1 rounded-full text-[12px] font-medium border ${item.status === "Paid"
                      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                      : "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800"
                    }`}
                >
                  {item.status}
                </span>
              </TableCell>
              <TableCell className="py-5 text-right">
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => handleDownloadInvoice(item)}
                    aria-label="Download invoice"
                    className="p-1 text-[#667085] hover:text-bgBlue transition-all cursor-pointer"
                  >
                    <CloudDownload className="w-5 h-5 opacity-70" />
                  </button>
                  <button
                    onClick={() => handleViewInvoice(item)}
                    aria-label="View invoice"
                    className="p-1 text-[#667085] hover:text-bgBlue transition-all cursor-pointer"
                  >
                    <Eye className="w-5 h-5 opacity-70" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <InvoicePreview
        open={isInvoiceOpen}
        setOpen={setIsInvoiceOpen}
        invoiceData={selectedInvoice}
        defaultAction={invoiceAction}
        onDefaultActionHandled={() => setInvoiceAction("preview")}
      />
    </SubscriptionTabLayout>
  );
};

export default AdditionalPaymentTab;
