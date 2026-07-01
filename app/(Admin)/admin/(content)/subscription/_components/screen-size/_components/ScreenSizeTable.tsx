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
import { ScreenSize } from "@/redux/api/admin/payments/screenManagement/screenSizeApi";
import { formatAmount } from "@/lib/currencyUtils";

interface ScreenSizeTableProps {
  screenSizes: ScreenSize[];
  isUpdatingStatus: boolean;
  currency: string;
  toggleStatus: (id: string, currentStatus: boolean) => void;
  handleEdit: (item: ScreenSize) => void;
  handleDeleteClick: (item: ScreenSize) => void;
}

const ScreenSizeTable = ({
  screenSizes,
  isUpdatingStatus,
  currency,
  toggleStatus,
  handleEdit,
  handleDeleteClick,
}: ScreenSizeTableProps) => {
  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="hidden lg:block">
        <Table>
          <TableHeader className="border-b border-border bg-bgGray dark:bg-gray-800/40">
            <TableRow className="border-b border-border hover:bg-transparent">
              <TableHead className="py-4 text-xs font-medium uppercase tracking-wider text-muted">
                Screen Size
              </TableHead>
              <TableHead className="py-4 text-xs font-medium uppercase tracking-wider text-muted">
                Price
              </TableHead>
              <TableHead className="py-4 text-xs font-medium uppercase tracking-wider text-muted">
                Status
              </TableHead>
              <TableHead className="py-4 text-right text-xs font-medium uppercase tracking-wider text-muted">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {screenSizes.length > 0 ? (
              screenSizes.map((item) => (
                <TableRow
                  key={item.id}
                  className="border-b border-border last:border-0 transition-colors hover:bg-bgGray dark:hover:bg-gray-800/50"
                >
                  <TableCell className="py-5 text-[14px] font-medium text-headings whitespace-nowrap">
                    {item.size}
                  </TableCell>
                  <TableCell className="py-5 text-[14px] font-bold text-headings whitespace-nowrap">
                    {formatAmount(item.price, currency)}
                  </TableCell>
                  <TableCell className="py-5 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[12px] font-medium border ${
                        item.isActive
                          ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                          : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                      }`}
                    >
                      {item.isActive ? "Enable" : "Disabled"}
                    </span>
                  </TableCell>
                  <TableCell className="py-5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2.5">
                      <button
                        onClick={() => toggleStatus(item.id, item.isActive)}
                        disabled={isUpdatingStatus}
                        aria-label={
                          item.isActive
                            ? "Disable screen size"
                            : "Enable screen size"
                        }
                        className="cursor-pointer rounded-md bg-bgGray p-1.5 text-muted transition-all hover:bg-bgGray dark:bg-gray-800 disabled:opacity-50"
                      >
                        {isUpdatingStatus ? (
                          <Loader2 className="w-5 h-5 animate-spin text-muted" />
                        ) : item.isActive ? (
                          <Circle className="w-5 h-5 text-muted" />
                        ) : (
                          <Ban className="w-5 h-5 text-muted" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        aria-label="Edit screen size"
                        className="cursor-pointer rounded-md border border-cyan-200 bg-cyan-50 p-1.5 text-cyan-600 transition-all hover:bg-cyan-100 dark:border-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400"
                      >
                        <PencilLine className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(item)}
                        aria-label="Delete screen size"
                        className="cursor-pointer rounded-md border border-red-200 bg-red-50 p-1.5 text-red-500 transition-all hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
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
                  className="py-12 text-center text-muted"
                >
                  No screen sizes found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="lg:hidden space-y-4 p-4">
        {screenSizes.length > 0 ? (
          screenSizes.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-border bg-navbarBg p-4 space-y-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="font-bold text-headings text-lg">
                  {item.size}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleStatus(item.id, item.isActive)}
                    disabled={isUpdatingStatus}
                    aria-label={
                      item.isActive
                        ? "Disable screen size"
                        : "Enable screen size"
                    }
                    className="cursor-pointer rounded-md bg-bgGray p-1.5 text-muted transition-all hover:bg-bgGray dark:bg-gray-800 disabled:opacity-50"
                  >
                    {isUpdatingStatus ? (
                      <Loader2 className="w-5 h-5 animate-spin text-muted" />
                    ) : item.isActive ? (
                      <Circle className="w-5 h-5 text-muted" />
                    ) : (
                      <Ban className="w-5 h-5 text-muted" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(item)}
                    aria-label="Edit screen size"
                    className="cursor-pointer rounded-md border border-cyan-200 bg-cyan-50 p-1.5 text-cyan-600 transition-all hover:bg-cyan-100 dark:border-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400"
                  >
                    <PencilLine className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(item)}
                    aria-label="Delete screen size"
                    className="cursor-pointer rounded-md border border-red-200 bg-red-50 p-1.5 text-red-500 transition-all hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted">Price:</span>
                <span className="font-semibold text-headings">
                  {formatAmount(item.price, currency)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted">Status:</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[12px] font-medium border ${
                    item.isActive
                      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                      : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                  }`}
                >
                  {item.isActive ? "Enable" : "Disabled"}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-muted">
            No screen sizes found.
          </div>
        )}
      </div>
    </div>
  );
};

export default ScreenSizeTable;
