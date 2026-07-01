import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Ban, Copy } from "lucide-react";
import { toast } from "sonner";
import { CouponItem } from "@/redux/api/admin/payments/coupons/couponsApi";

interface CouponsTableProps {
  coupons: CouponItem[];
  isUpdatingStatus: boolean;
  getStatusColor: (status: string) => string;
  formatDate: (dateString: string) => string;
  handleEditClick: (coupon: CouponItem) => void;
  handleStopCoupon: (coupon: CouponItem) => void;
}

const CouponsTable = ({
  coupons,
  isUpdatingStatus,
  getStatusColor,
  formatDate,
  handleEditClick,
  handleStopCoupon,
}: CouponsTableProps) => {
  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="hidden lg:block">
        <Table>
          <TableHeader className="border-b border-border bg-bgGray dark:bg-gray-800/40">
            <TableRow>
              <TableHead className="text-xs font-medium uppercase text-muted">
                Name
              </TableHead>
              <TableHead className="text-xs font-medium uppercase text-muted">
                Code
              </TableHead>
              <TableHead className="text-xs font-medium uppercase text-muted">
                Discount
              </TableHead>
              <TableHead className="text-xs font-medium uppercase text-muted">
                Usage
              </TableHead>
              <TableHead className="text-xs font-medium uppercase text-muted">
                Status
              </TableHead>
              <TableHead className="text-xs font-medium uppercase text-muted">
                Expiry Date
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((coupon) => (
              <TableRow
                key={coupon.id}
                className="hover:bg-bgGray dark:hover:bg-gray-800/50"
              >
                <TableCell className="font-medium text-headings whitespace-nowrap">
                  {coupon.name}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-headings">{coupon.code}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(coupon.code);
                        toast.success("Coupon code copied!");
                      }}
                      className="text-muted hover:text-bgBlue transition-colors cursor-pointer p-1 rounded-md hover:bg-bgGray dark:hover:bg-gray-800"
                      title="Copy code"
                      type="button"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-headings whitespace-nowrap">
                  {coupon.discountType === "PERCENTAGE"
                    ? `${coupon.discountValue}%`
                    : `$${coupon.discountValue}`}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <div className="flex items-center gap-3 w-48">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-bgGray dark:bg-gray-800">
                      <div
                        className="h-full bg-bgBlue rounded-full"
                        style={{
                          width: `${
                            coupon.useLimit > 0
                              ? (coupon.usedCount / coupon.useLimit) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted font-medium whitespace-nowrap">
                      {coupon.usedCount} / {coupon.useLimit}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <Badge
                    variant="default"
                    className={`font-normal border ${getStatusColor(coupon.status)}`}
                  >
                    {coupon.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted whitespace-nowrap">
                  {formatDate(coupon.expiryDate)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-bgGray dark:hover:bg-gray-800"
                        disabled={isUpdatingStatus}
                        aria-label="Coupon options"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onClick={() => handleEditClick(coupon)}
                        className="cursor-pointer"
                      >
                        <Edit className="mr-2 h-4 w-4" /> Edit coupon
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStopCoupon(coupon)}
                        className="cursor-pointer text-red-500 focus:text-red-500"
                        disabled={isUpdatingStatus}
                      >
                        <Ban className="mr-2 h-4 w-4" />
                        {coupon.status === "ACTIVE"
                          ? "Stop Coupon"
                          : "Activate Coupon"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="lg:hidden space-y-4 p-4">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="rounded-lg border border-border bg-navbarBg p-4 space-y-3 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-headings text-lg">
                  {coupon.name}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="font-bold text-headings text-sm">
                    {coupon.code}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(coupon.code);
                      toast.success("Coupon code copied!");
                    }}
                    className="text-muted hover:text-bgBlue transition-colors cursor-pointer p-1 rounded-md hover:bg-bgGray dark:hover:bg-gray-800"
                    title="Copy code"
                    type="button"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-bgGray dark:hover:bg-gray-800"
                    disabled={isUpdatingStatus}
                    aria-label="Coupon options"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    onClick={() => handleEditClick(coupon)}
                    className="cursor-pointer"
                  >
                    <Edit className="mr-2 h-4 w-4" /> Edit coupon
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleStopCoupon(coupon)}
                    className="cursor-pointer text-red-500 focus:text-red-500"
                    disabled={isUpdatingStatus}
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    {coupon.status === "ACTIVE"
                      ? "Stop Coupon"
                      : "Activate Coupon"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Discount:</span>
              <span className="font-semibold text-headings">
                {coupon.discountType === "PERCENTAGE"
                  ? `${coupon.discountValue}%`
                  : `$${coupon.discountValue}`}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Usage:</span>
              <div className="flex items-center gap-3 w-32">
                <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-bgGray dark:bg-gray-800">
                  <div
                    className="h-full bg-bgBlue rounded-full"
                    style={{
                      width: `${
                        coupon.useLimit > 0
                          ? (coupon.usedCount / coupon.useLimit) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <span className="text-xs text-muted font-medium whitespace-nowrap">
                  {coupon.usedCount} / {coupon.useLimit}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Expiry Date:</span>
              <span className="text-muted">
                {formatDate(coupon.expiryDate)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Status:</span>
              <Badge
                variant="default"
                className={`font-normal border ${getStatusColor(coupon.status)}`}
              >
                {coupon.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CouponsTable;
