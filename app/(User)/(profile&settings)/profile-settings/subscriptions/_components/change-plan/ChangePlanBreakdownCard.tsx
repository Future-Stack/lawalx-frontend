"use client";

import { CalendarClock, Zap } from "lucide-react";
import type { ChangePlanResponseData } from "@/redux/api/users/payment/payment.type";

interface ChangePlanBreakdownCardProps {
  result: ChangePlanResponseData;
}

function formatMoney(amount: number, currency: string): string {
  const symbol = currency === "NGN" ? "₦" : "$";
  return `${symbol}${amount?.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function ChangePlanBreakdownCard({
  result,
}: ChangePlanBreakdownCardProps) {
  const { breakdown, changeType, effectiveDate, targetPlan } = result;
  const isUpgrade = changeType === "UPGRADE";

  const formattedEffectiveDate = new Date(effectiveDate).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <div className="space-y-4">
      {/* Change type banner */}
      {isUpgrade ? (
        <div className="flex items-start gap-2.5 sm:gap-3 rounded-xl border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/40 p-3 sm:p-4">
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs sm:text-sm font-semibold text-green-800 dark:text-green-200">
              Upgrade — Starts Immediately
            </p>
            <p className="text-[11px] sm:text-xs text-green-700 dark:text-green-300 mt-0.5 leading-relaxed">
              Your {targetPlan || "new"} plan will be active right after payment. The
              remaining credit from your current plan has been deducted.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-2.5 sm:gap-3 rounded-xl border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/40 p-3 sm:p-4">
          <CalendarClock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs sm:text-sm font-semibold text-orange-800 dark:text-orange-200">
              Downgrade — Scheduled
            </p>
            <p className="text-[11px] sm:text-xs text-orange-700 dark:text-orange-300 mt-0.5 leading-relaxed">
              Your {targetPlan || "new"} plan will take effect from{" "}
              <strong>{formattedEffectiveDate}</strong>. You are paying the full
              price of the new plan now.
            </p>
          </div>
        </div>
      )}

      {/* Breakdown rows */}
      <div className="rounded-xl border border-border bg-navbarBg p-4 sm:p-5 space-y-2.5 sm:space-y-3">
        <h3 className="text-xs sm:text-sm font-semibold text-headings mb-3 sm:mb-4">
          Payment Breakdown
        </h3>

        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-muted">Subtotal</span>
          <span className="font-medium text-headings">
            {formatMoney(breakdown?.subtotal, breakdown?.currency)}
          </span>
        </div>

        {breakdown?.remainingCredit > 0 && (
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-muted">Remaining Credit (deducted)</span>
            <span className="font-medium text-green-600 dark:text-green-400">
              − {formatMoney(breakdown?.remainingCredit, breakdown?.currency)}
            </span>
          </div>
        )}

        {breakdown?.couponDiscount > 0 && (
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-muted">Coupon Discount</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              − {formatMoney(breakdown?.couponDiscount, breakdown?.currency)}
            </span>
          </div>
        )}

        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-muted">Tax ({breakdown?.taxRate})</span>
          <span className="font-medium text-headings">
            {formatMoney(breakdown?.tax, breakdown?.currency)}
          </span>
        </div>

        <div className="border-t border-border pt-3 flex justify-between items-center">
          <span className="text-sm sm:text-base font-bold text-headings">
            Total to Pay
          </span>
          <span className="text-sm sm:text-base font-extrabold text-bgBlue">
            {formatMoney(breakdown?.total, breakdown?.currency)}
          </span>
        </div>
      </div>
    </div>
  );
}
