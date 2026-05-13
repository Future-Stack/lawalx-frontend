"use client";

import React, { useState } from "react";
import { useGetSubscribersQuery } from "@/redux/api/admin/payments/subscriber/subscribersApi";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  FileText,
  XCircle,
  ArrowUpCircle,
  Search,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import TransactionSheet from "./TransactionSheet";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { formatAmount as formatCurrency } from "@/lib/currencyUtils";
import SubscriptionTabLayout from "./SubscriptionTabLayout";

const SubscribersTab = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const currency = useSelector((state: RootState) => state.settings.currency);

  const { data, isLoading, isError } = useGetSubscribersQuery({
    page,
    limit,
    search: searchTerm || undefined,
    plan: planFilter !== "all" ? planFilter.toUpperCase() : undefined,
  });

  const subscribers = data?.data || [];
  const meta = data?.meta;
  const totalSubscribers = meta?.total || 0;
  const totalPages = meta?.totalPages || 1;

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleViewInvoices = (userId: string) => {
    setSelectedUserId(userId);
    setSheetOpen(true);
  };

  return (
    <SubscriptionTabLayout
      title={`All Users (${totalSubscribers})`}
      filters={
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              placeholder="Search by name, email, or user ID..."
              aria-label="Search subscribers"
              className="w-full bg-input border border-border rounded-lg pl-10 pr-4 py-3 placeholder:text-muted focus-visible:ring-0 focus:outline-none text-body"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="w-full md:w-48 shrink-0">
            <BaseSelect
              placeholder="All Plans"
              options={[
                { label: "All Plans", value: "all" },
                { label: "Starter", value: "starter" },
                { label: "Professional", value: "professional" },
                { label: "Business", value: "business" },
              ]}
              value={planFilter}
              onChange={(value) => {
                setPlanFilter(value);
                setPage(1);
              }}
              showLabel={false}
              className="w-full"
            />
          </div>
        </div>
      }
      pagination={
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted">
            Showing {subscribers.length} of {totalSubscribers} users
          </div>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-2 px-4 py-2 border border-borderGray dark:border-gray-600 rounded-lg font-medium shadow-customShadow cursor-pointer hover:bg-gray-100 hover:text-bgBlue text-headings transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={page === 1 || isLoading}
              onClick={handlePreviousPage}
            >
              Previous
            </button>
            <span className="text-sm text-muted">
              Page {page} of {totalPages}
            </span>
            <button
              className="flex items-center gap-2 px-4 py-2 border border-borderGray dark:border-gray-600 rounded-lg font-medium shadow-customShadow cursor-pointer hover:bg-gray-100 hover:text-bgBlue text-headings transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={page === totalPages || isLoading}
              onClick={handleNextPage}
            >
              Next
            </button>
          </div>
        </div>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted" />
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-red-500">
            Error loading subscribers. Please try again.
          </p>
        </div>
      ) : subscribers.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted">No subscribers found.</p>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader className="bg-cardBackground border-b border-border text-body">
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Cycle</TableHead>
                <TableHead>Next Billing</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.map((sub) => (
                <TableRow key={sub.userId}>
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
                          className="h-8 w-8 text-muted hover:bg-gray-100"
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
                        <DropdownMenuItem>
                          <ArrowUpCircle className="mr-2 h-4 w-4" /> Change Plan
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500 focus:text-red-500">
                          <XCircle className="mr-2 h-4 w-4" /> Cancel Plan
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}

      {/* Transaction Sheet */}
      <TransactionSheet
        open={sheetOpen}
        setOpen={setSheetOpen}
        userId={selectedUserId}
      />
    </SubscriptionTabLayout>
  );
};

export default SubscribersTab;
