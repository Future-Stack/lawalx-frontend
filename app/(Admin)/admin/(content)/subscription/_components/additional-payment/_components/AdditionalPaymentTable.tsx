import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, CloudDownload, Loader2 } from "lucide-react";
import { PaymentHistoryRow } from "../../../_data/additionalPaymentMock";

interface AdditionalPaymentTableProps {
  ADDITIONAL_PAYMENT_ROWS: PaymentHistoryRow[];
  downloadingId: string | null;
  handleDownloadInvoice: (item: PaymentHistoryRow) => void;
  setViewRow: (item: PaymentHistoryRow) => void;
}

const AdditionalPaymentTable = ({
  ADDITIONAL_PAYMENT_ROWS,
  downloadingId,
  handleDownloadInvoice,
  setViewRow,
}: AdditionalPaymentTableProps) => {
  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="hidden lg:block">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
            <TableRow className="hover:bg-transparent border-b border-gray-200 dark:border-gray-700">
              <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-4">
                Bill To
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-4">
                Bill From
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-4">
                Address
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-4">
                Total Price
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-4">
                Status
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-4 text-right">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ADDITIONAL_PAYMENT_ROWS.map((item) => (
              <TableRow
                key={item.id}
                className="border-b border-gray-200 dark:border-gray-700 last:border-0 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
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
                      type="button"
                      onClick={() => handleDownloadInvoice(item)}
                      disabled={downloadingId === item.id}
                      aria-label="Download invoice PDF"
                      className="p-1 text-[#667085] hover:text-bgBlue transition-all cursor-pointer disabled:opacity-50"
                    >
                      {downloadingId === item.id ? (
                        <Loader2 className="w-5 h-5 opacity-70 animate-spin" />
                      ) : (
                        <CloudDownload className="w-5 h-5 opacity-70" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewRow(item)}
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
      </div>
      <div className="lg:hidden space-y-4 p-4">
        {ADDITIONAL_PAYMENT_ROWS.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-headings text-lg">{item.billTo}</div>
                <div className="text-sm text-muted">From: {item.billFrom}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadInvoice(item)}
                  disabled={downloadingId === item.id}
                  aria-label="Download invoice PDF"
                  className="p-1 text-[#667085] hover:text-bgBlue transition-all cursor-pointer disabled:opacity-50"
                >
                  {downloadingId === item.id ? (
                    <Loader2 className="w-5 h-5 opacity-70 animate-spin" />
                  ) : (
                    <CloudDownload className="w-5 h-5 opacity-70" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setViewRow(item)}
                  aria-label="View invoice"
                  className="p-1 text-[#667085] hover:text-bgBlue transition-all cursor-pointer"
                >
                  <Eye className="w-5 h-5 opacity-70" />
                </button>
              </div>
            </div>
            
            <div className="text-sm text-headings">
              <span className="text-muted">Address:</span> {item.address}
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Total Price:</span>
              <span className="font-bold text-headings">{item.totalPrice}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Status:</span>
              <span
                className={`px-3 py-1 rounded-full text-[12px] font-medium border ${item.status === "Paid"
                    ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                    : "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800"
                  }`}
              >
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdditionalPaymentTable;
