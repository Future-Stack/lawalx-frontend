"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import type { ChangePlanResponseData } from "@/redux/api/users/payment/payment.type";
import ChangePlanBreakdownCard from "./ChangePlanBreakdownCard";

interface ChangePlanConfirmStepProps {
  result: ChangePlanResponseData;
  isRedirecting: boolean;
  onConfirm: () => void;
  onBack: () => void;
}

export default function ChangePlanConfirmStep({
  result,
  isRedirecting,
  onConfirm,
  onBack,
}: ChangePlanConfirmStepProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-headings">
          Confirm Plan Change
        </h2>
        <p className="text-xs sm:text-sm text-muted mt-1">
          Review the details below before confirming.
        </p>
      </div>

      {/* Plan summary header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-cardBackground2 px-4 py-3 sm:px-5 sm:py-4">
        <div>
          <p className="text-[10px] sm:text-xs text-muted uppercase tracking-wider font-semibold">
            Changing to
          </p>
          <p className="text-base sm:text-lg font-bold text-headings capitalize mt-0.5">
            {result.targetPlan
              ? result.targetPlan.charAt(0) +
                result.targetPlan.slice(1).toLowerCase()
              : "Selected"}{" "}
            Plan
          </p>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold border ${
            result.changeType === "UPGRADE"
              ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800"
              : "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800"
          }`}
        >
          {result.changeType}
        </span>
      </div>

      <ChangePlanBreakdownCard result={result} />

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-1">
        <button
          type="button"
          onClick={onConfirm}
          disabled={isRedirecting}
          className="w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-xl bg-bgBlue text-white font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
        >
          {isRedirecting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Redirecting to payment...
            </>
          ) : (
            "Confirm & Pay"
          )}
        </button>

        <button
          type="button"
          onClick={onBack}
          disabled={isRedirecting}
          className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted hover:text-headings transition-colors cursor-pointer disabled:opacity-50 py-1"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Back to plan selection
        </button>
      </div>
    </div>
  );
}
