import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Circle, Ban, PencilLine, Trash2, Loader2 } from "lucide-react";
import { TaxRegion } from "@/redux/api/admin/payments/tax/taxApi";

interface TaxTableProps {
  filteredTaxes: TaxRegion[];
  isUpdatingStatus: boolean;
  toggleStatus: (id: string, currentStatus: boolean) => void;
  handleEdit: (item: TaxRegion) => void;
  handleDeleteClick: (item: TaxRegion) => void;
}

const TaxTable = ({
  filteredTaxes,
  isUpdatingStatus,
  toggleStatus,
  handleEdit,
  handleDeleteClick,
}: TaxTableProps) => {
  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="hidden lg:block">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
            <TableRow className="hover:bg-transparent border-b border-gray-200 dark:border-gray-700">
              <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-4">
                Tax
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-4">
                Tax Rate
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
            {filteredTaxes.length > 0 ? (
              filteredTaxes.map((item) => (
                <TableRow
                  key={item.id}
                  className="border-b border-gray-200 dark:border-gray-700 last:border-0 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <TableCell className="py-5 text-[14px] font-bold text-headings">
                    {item.region}
                  </TableCell>
                  <TableCell className="py-5 text-[14px] font-bold text-headings">
                    {item.taxRate}%
                  </TableCell>
                  <TableCell className="py-5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[12px] font-medium border ${
                        item.status
                          ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                          : "bg-[#FEF3F2] text-[#B42318] border-[#FECDCA] dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                      }`}
                    >
                      {item.status ? "Enable" : "Disabled"}
                    </span>
                  </TableCell>
                  <TableCell className="py-5 text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      <button
                        onClick={() => toggleStatus(item.id, item.status)}
                        disabled={isUpdatingStatus}
                        aria-label={item.status ? "Disable tax" : "Enable tax"}
                        className="p-1.5 rounded-md bg-[#E6F4F1] text-muted hover:bg-[#d9eee9] transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isUpdatingStatus ? (
                          <Loader2 className="w-5 h-5 animate-spin text-muted" />
                        ) : item.status ? (
                          <Circle className="w-5 h-5 text-muted" />
                        ) : (
                          <Ban className="w-5 h-5 text-muted" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        aria-label="Edit tax"
                        className="p-1.5 rounded-md border border-[#0EA5E933] bg-[#0EA5E90D] text-[#0EA5E9] hover:bg-[#0EA5E91A] transition-all cursor-pointer"
                      >
                        <PencilLine className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(item)}
                        aria-label="Delete tax"
                        className="p-1.5 rounded-md border border-[#F0443833] bg-[#F044380D] text-[#F04438] hover:bg-[#F044381A] transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-12 text-center text-gray-500"
                >
                  No tax regions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="lg:hidden space-y-4 p-4">
        {filteredTaxes.length > 0 ? (
          filteredTaxes.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="font-bold text-headings text-lg">
                  {item.region}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleStatus(item.id, item.status)}
                    disabled={isUpdatingStatus}
                    aria-label={item.status ? "Disable tax" : "Enable tax"}
                    className="p-1.5 rounded-md bg-[#E6F4F1] text-muted hover:bg-[#d9eee9] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isUpdatingStatus ? (
                      <Loader2 className="w-5 h-5 animate-spin text-muted" />
                    ) : item.status ? (
                      <Circle className="w-5 h-5 text-muted" />
                    ) : (
                      <Ban className="w-5 h-5 text-muted" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(item)}
                    aria-label="Edit tax"
                    className="p-1.5 rounded-md border border-[#0EA5E933] bg-[#0EA5E90D] text-[#0EA5E9] hover:bg-[#0EA5E91A] transition-all cursor-pointer"
                  >
                    <PencilLine className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(item)}
                    aria-label="Delete tax"
                    className="p-1.5 rounded-md border border-[#F0443833] bg-[#F044380D] text-[#F04438] hover:bg-[#F044381A] transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted">Tax Rate:</span>
                <span className="font-semibold text-headings">
                  {item.taxRate}%
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted">Status:</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[12px] font-medium border ${
                    item.status
                      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                      : "bg-[#FEF3F2] text-[#B42318] border-[#FECDCA] dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                  }`}
                >
                  {item.status ? "Enable" : "Disabled"}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-gray-500">
            No tax regions found.
          </div>
        )}
      </div>
    </div>
  );
};

export default TaxTable;
