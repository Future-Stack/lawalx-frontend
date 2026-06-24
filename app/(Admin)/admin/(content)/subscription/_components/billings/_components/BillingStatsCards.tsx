import React from "react";
import { useGetBillingStatsQuery } from "@/redux/api/admin/payments/billings/billingsApi";
import { formatAmount as formatCurrency } from "@/lib/currencyUtils";
import { Loader2, TrendingUp, AlertCircle, Clock, CheckCircle2, XCircle, RotateCcw } from "lucide-react";

export function BillingStatsCards() {
  const { data, isLoading, isError } = useGetBillingStatsQuery({});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 mb-6 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-800/20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (isError || !data?.data) {
    return null; // Fail gracefully
  }

  const stats = data.data;

  // Configure which cards to show based on standard metrics
  const cards = [
    {
      title: "Success Payments",
      amount: stats.totalSuccessPaymentsAmount,
      originalAmount: stats.totalSuccessPaymentsOriginalAmount,
      count: stats.totalSuccessPaymentsCount,
      currency: stats.totalSuccessPaymentsCurrency,
      originalCurrency: stats.totalSuccessPaymentsOriginalCurrency,
      icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50/50 dark:bg-green-900/10",
      border: "border-green-100 dark:border-green-900/20",
    },
    {
      title: "Pending Payments",
      amount: stats.totalPendingPaymentsAmount,
      originalAmount: stats.totalPendingPaymentsOriginalAmount,
      count: stats.totalPendingPaymentsCount,
      currency: stats.totalPendingPaymentsCurrency,
      originalCurrency: stats.totalPendingPaymentsOriginalCurrency,
      icon: <Clock className="w-5 h-5 text-amber-500" />,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50/50 dark:bg-amber-900/10",
      border: "border-amber-100 dark:border-amber-900/20",
    },
    {
      title: "Failed Payments",
      amount: stats.totalFailedPaymentsAmount,
      originalAmount: stats.totalFailedPaymentsOriginalAmount,
      count: stats.totalFailedPaymentsCount,
      currency: stats.totalFailedPaymentsCurrency,
      originalCurrency: stats.totalFailedPaymentsOriginalCurrency,
      icon: <AlertCircle className="w-5 h-5 text-red-500" />,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50/50 dark:bg-red-900/10",
      border: "border-red-100 dark:border-red-900/20",
    },
    {
      title: "Refunded Payments",
      amount: stats.totalRefundedPaymentsAmount,
      originalAmount: stats.totalRefundedPaymentsOriginalAmount,
      count: stats.totalRefundedPaymentsCount,
      currency: stats.totalRefundedPaymentsCurrency,
      originalCurrency: stats.totalRefundedPaymentsOriginalCurrency,
      icon: <RotateCcw className="w-5 h-5 text-purple-500" />,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50/50 dark:bg-purple-900/10",
      border: "border-purple-100 dark:border-purple-900/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`p-5 rounded-2xl border ${card.border} ${card.bg} flex flex-col justify-between shadow-sm hover:shadow transition-shadow`}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
                {card.icon}
              </div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {card.title}
              </h3>
            </div>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${card.color} bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700`}>
              {card.count}
            </span>
          </div>
          <div className="mt-2">
            <div className={`text-2xl font-bold ${card.color} break-all leading-tight`}>
              {formatCurrency(card.amount, card.currency || "NGN")}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
