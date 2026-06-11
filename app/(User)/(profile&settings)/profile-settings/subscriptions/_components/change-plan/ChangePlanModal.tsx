"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useChangePlanMutation } from "@/redux/api/users/payment/payment.api";
import type {
  ChangePlanPayload,
  ChangePlanResponseData,
} from "@/redux/api/users/payment/payment.type";
import ChangePlanSelectStep from "./ChangePlanSelectStep";
import ChangePlanConfirmStep from "./ChangePlanConfirmStep";

interface ChangePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlanName: string;
  currentScreenSize: number;
  currentBillingCycle: "MONTHLY" | "ANNUAL";
}

type ModalStep = "select" | "confirm";

export default function ChangePlanModal({
  isOpen,
  onClose,
  currentPlanName,
  currentScreenSize,
  currentBillingCycle,
}: ChangePlanModalProps) {
  const [step, setStep] = useState<ModalStep>("select");
  const [changePlanResult, setChangePlanResult] =
    useState<ChangePlanResponseData | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const [changePlan, { isLoading: isCalcLoading }] = useChangePlanMutation();

  const handlePreviewCost = async (payload: ChangePlanPayload) => {
    try {
      const res = await changePlan(payload).unwrap();
      if (!res.success || !res.data) {
        toast.error(res.message || "Failed to calculate plan cost.");
        return;
      }
      setChangePlanResult(res.data);
      setStep("confirm");
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(
        error?.data?.message || "Something went wrong. Please try again."
      );
    }
  };

  const handleConfirmPayment = () => {
    if (!changePlanResult?.checkoutUrl) {
      toast.error("Checkout URL is missing. Please try again.");
      return;
    }
    setIsRedirecting(true);
    window.location.href = changePlanResult.checkoutUrl;
  };

  const handleBackToSelect = () => {
    setStep("select");
    setChangePlanResult(null);
  };

  const handleClose = () => {
    if (isCalcLoading || isRedirecting) return;
    setStep("select");
    setChangePlanResult(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    /* Full-screen overlay; on mobile the modal fills the screen */
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4">
      <div className="relative w-full sm:max-w-5xl h-[95dvh] sm:h-auto sm:max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-border bg-navbarBg shadow-xl flex flex-col">

        {/* Header — sticky */}
        <div className="flex items-center justify-between border-b border-border px-4 sm:px-6 py-3 sm:py-4 sticky top-0 bg-navbarBg z-10 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Step indicator */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span
                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[10px] sm:text-xs font-bold flex items-center justify-center ${
                  step === "select"
                    ? "bg-bgBlue text-white"
                    : "bg-green-500 text-white"
                }`}
              >
                {step === "select" ? "1" : "✓"}
              </span>
              <div className="w-6 sm:w-8 h-px bg-border" />
              <span
                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[10px] sm:text-xs font-bold flex items-center justify-center ${
                  step === "confirm"
                    ? "bg-bgBlue text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-muted"
                }`}
              >
                2
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-headings">
              {step === "select" ? "Change Plan" : "Confirm Change"}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isCalcLoading || isRedirecting}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-muted" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="px-4 sm:px-6 py-4 sm:py-6 flex-1 overflow-y-auto">
          {step === "select" && (
            <ChangePlanSelectStep
              currentPlanName={currentPlanName}
              currentScreenSize={currentScreenSize}
              currentBillingCycle={currentBillingCycle}
              isLoading={isCalcLoading}
              onPreviewCost={handlePreviewCost}
            />
          )}

          {step === "confirm" && changePlanResult && (
            <ChangePlanConfirmStep
              result={changePlanResult}
              isRedirecting={isRedirecting}
              onConfirm={handleConfirmPayment}
              onBack={handleBackToSelect}
            />
          )}
        </div>
      </div>
    </div>
  );
}
