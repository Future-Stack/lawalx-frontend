"use client";

import { Download } from "lucide-react";
import type { SubscriptionPayment } from "@/redux/api/users/payment/payment.type";
import { formatCurrency, formatDateTime } from "./format";

interface BillingHistoryTableProps {
  payments: SubscriptionPayment[];
}

export default function BillingHistoryTable({
  payments,
}: BillingHistoryTableProps) {
  return (
    <div className="border border-border rounded-xl overflow-hidden text-sm">
      <table className="w-full text-left">
        <thead className="bg-gray-50 dark:bg-gray-800 text-muted font-medium border-b border-border">
          <tr>
            <th className="px-6 py-3 w-10">
              <input
                type="checkbox"
                className="rounded border-gray-300 cursor-pointer"
              />
            </th>
            <th className="px-6 py-3">Invoice</th>
            <th className="px-6 py-3">Amount</th>
            <th className="px-6 py-3">Date</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {payments.length > 0 ? (
            payments.map((row) => {
              const status = row.status === "SUCCESS" ? "Paid" : row.status;
              return (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4 font-medium text-headings">
                    {row.transactionId || row.id}
                  </td>
                  <td className="px-6 py-4 text-muted">
                    {formatCurrency(row.amount, row.currency)}
                  </td>
                  <td className="px-6 py-4 text-muted">
                    {formatDateTime(row.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        status === "Paid"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-orange-50 text-orange-700 border-orange-200"
                      }`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 hover:text-gray-600 cursor-pointer">
                    <Download className="w-4 h-4" />
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={6} className="px-6 py-6 text-center text-muted">
                No billing history found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
