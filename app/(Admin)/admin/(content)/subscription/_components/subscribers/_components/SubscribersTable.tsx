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
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  FileText,
  XCircle,
  ArrowUpCircle,
  CreditCard,
} from "lucide-react";
import { formatAmount as formatCurrency } from "@/lib/currencyUtils";
import { Subscriber } from "../SubscribersTab";

interface SubscribersTableProps {
  subscribers: Subscriber[];
  currency: string;
  formatDate: (date: string) => string;
  handleViewInvoices: (userId: string) => void;
  handleAdditionalPayment: (subscriber: Subscriber) => void;
  handleCancelPlan: (userId: string) => void;
}

const SubscribersTable = ({
  subscribers,
  currency,
  formatDate,
  handleViewInvoices,
  handleAdditionalPayment,
  handleCancelPlan,
}: SubscribersTableProps) => {
  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="hidden lg:block">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
            <TableRow>
              <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                User
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Plan
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Amount
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Payment Cycle
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Next Billing
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Status
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscribers.map((sub) => (
              <TableRow
                key={sub.userId}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <TableCell>
                  <div>
                    <div className="font-medium text-headings">
                      {sub.userName}
                    </div>
                    <div className="text-sm text-muted">{sub.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="default"
                    className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-none font-normal"
                  >
                    {sub.plan}
                  </Badge>
                </TableCell>
                <TableCell className="font-semibold text-headings">
                  {formatCurrency(sub.amount, currency)}
                </TableCell>
                <TableCell className="text-headings">
                  {sub.paymentCycle}
                </TableCell>
                <TableCell className="text-muted">
                  {formatDate(sub.nextBilling)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="default"
                    className={`border-none font-normal ${
                      sub.subscriptionStatus === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : sub.subscriptionStatus === "CANCELLED"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {sub.subscriptionStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        aria-label="Subscriber options"
                        className="h-8 w-8 text-muted hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleViewInvoices(sub.userId)}
                      >
                        <FileText className="mr-2 h-4 w-4" /> View Invoices
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleAdditionalPayment(sub)}
                      >
                        <CreditCard className="mr-2 h-4 w-4" /> Additional
                        payment
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ArrowUpCircle className="mr-2 h-4 w-4" /> Change Plan
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-500 focus:text-red-500"
                        onClick={() => handleCancelPlan(sub.userId)}
                      >
                        <XCircle className="mr-2 h-4 w-4" /> Cancel Plan
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
        {subscribers.map((sub) => (
          <div
            key={sub.userId}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3 shadow-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="font-medium text-headings truncate">
                  {sub.userName}
                </div>
                <div className="text-sm text-muted truncate">{sub.email}</div>
              </div>
              <div className="flex-shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      aria-label="Subscriber options"
                      className="h-8 w-8 text-muted hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleViewInvoices(sub.userId)}
                    >
                      <FileText className="mr-2 h-4 w-4" /> View Invoices
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleAdditionalPayment(sub)}
                    >
                      <CreditCard className="mr-2 h-4 w-4" /> Additional payment
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ArrowUpCircle className="mr-2 h-4 w-4" /> Change Plan
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-500 focus:text-red-500"
                      onClick={() => handleCancelPlan(sub.userId)}
                    >
                      <XCircle className="mr-2 h-4 w-4" /> Cancel Plan
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between text-sm gap-2">
              <span className="text-muted whitespace-nowrap">Plan:</span>
              <div className="flex-shrink-0">
                <Badge
                  variant="default"
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-none font-normal"
                >
                  {sub.plan}
                </Badge>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between text-sm gap-2">
              <span className="text-muted whitespace-nowrap">Amount:</span>
              <span className="font-semibold text-headings break-all">
                {formatCurrency(sub.amount, currency)}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between text-sm gap-2">
              <span className="text-muted whitespace-nowrap">
                Payment Cycle:
              </span>
              <span className="text-headings whitespace-nowrap">
                {sub.paymentCycle}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between text-sm gap-2">
              <span className="text-muted whitespace-nowrap">
                Next Billing:
              </span>
              <span className="text-headings whitespace-nowrap">
                {formatDate(sub.nextBilling)}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between text-sm gap-2">
              <span className="text-muted whitespace-nowrap">Status:</span>
              <div className="flex-shrink-0">
                <Badge
                  variant="default"
                  className={`border-none font-normal ${
                    sub.subscriptionStatus === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : sub.subscriptionStatus === "CANCELLED"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {sub.subscriptionStatus}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscribersTable;
