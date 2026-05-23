"use client";

import React, { useState } from "react";
import { useGetSubscribersQuery } from "@/redux/api/admin/payments/subscriber/subscribersApi";
import BaseSelect from "@/common/BaseSelect";

import { Search, Loader2 } from "lucide-react";
import TransactionSheet from "../TransactionSheet";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import SubscriptionTabLayout from "../SubscriptionTabLayout";
import AdditionalPaymentDialog from "./_components/AdditionalPaymentDialog";
import SubscribersTable from "./_components/SubscribersTable";

export interface Subscriber {
  userId: string;
  userName: string;
  email: string;
  plan: string;
  amount: number;
  paymentCycle: string;
  nextBilling: string;
  subscriptionStatus: string;
}

const SubscribersTab = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [additionalPaymentOpen, setAdditionalPaymentOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedSubscriber, setSelectedSubscriber] =
    useState<Subscriber | null>(null);

  const currency = useSelector((state: RootState) => state.settings.currency);

  const { data, isLoading, isError } = useGetSubscribersQuery({
    page,
    limit,
    search: searchTerm || undefined,
    plan: planFilter !== "all" ? planFilter.toUpperCase() : undefined,
  });
  const subscribers = data?.data && data.data.length > 0 ? data.data : [];
  const meta = data?.meta;
  const totalSubscribers = meta?.total || subscribers.length;
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

  const handleAdditionalPayment = (subscriber: Subscriber) => {
    setSelectedSubscriber(subscriber);
    setAdditionalPaymentOpen(true);
  };

  return (
    <SubscriptionTabLayout
      title={`All Users (${totalSubscribers})`}
      filters={
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              placeholder="Search by name, email, or user ID..."
              aria-label="Search subscribers"
              className="w-full bg-navbarBg border border-border rounded-lg pl-10 pr-4 py-2.5 placeholder:text-gray-400 focus-visible:ring-0 focus:outline-none text-gray-900 dark:text-white"
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
                { label: "Basic", value: "basic" },
                { label: "Business", value: "business" },
                { label: "Premium", value: "premium" },
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
              className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-customShadow disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              disabled={page === 1 || isLoading}
              onClick={handlePreviousPage}
            >
              Previous
            </button>
            <span className="text-sm text-muted">
              Page {page} of {totalPages}
            </span>
            <button
              className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-customShadow disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
        <SubscribersTable
          subscribers={subscribers}
          currency={currency}
          formatDate={formatDate}
          handleViewInvoices={handleViewInvoices}
          handleAdditionalPayment={handleAdditionalPayment}
        />
      )}

      {/* Transaction Sheet */}
      <TransactionSheet
        open={sheetOpen}
        setOpen={setSheetOpen}
        userId={selectedUserId}
      />

      {/* Additional Payment Dialog */}
      <AdditionalPaymentDialog
        open={additionalPaymentOpen}
        setOpen={setAdditionalPaymentOpen}
        subscriberData={selectedSubscriber}
      />
    </SubscriptionTabLayout>
  );
};

export default SubscribersTab;
