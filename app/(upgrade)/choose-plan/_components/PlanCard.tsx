import {
  Monitor,
  Database,
  Video,
  LayoutTemplate,
  Loader2,
  Image as ImageIcon,
  Music,
  Check,
} from "lucide-react";
import type { UserPlan, BillingCycle } from "@/redux/api/users/plan/plan.type";
import { formatAmount } from "@/lib/currencyUtils";
import { formatPlanName, getPlanUi } from "../_lib/planUi";
import { useState, useEffect } from "react";
import { useGetPlanByIdQuery } from "@/redux/api/users/plan/plan.api";

interface PlanCardProps {
  plan: UserPlan;
  isAnnual: boolean;
  onChoose: (plan: UserPlan, customQty?: number) => void;
  isLoading: boolean;
  isSelected: boolean;
  screenSize: number;
  billing: BillingCycle;
}

export default function PlanCard({
  plan,
  isAnnual,
  onChoose,
  isLoading,
  isSelected,
  screenSize,
  billing,
}: PlanCardProps) {
  const [customDeviceQuantity, setCustomDeviceQuantity] = useState<number | "">(
    plan.deviceLimit,
  );
  const [debouncedQty, setDebouncedQty] = useState<number | "">(
    plan.deviceLimit,
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQty(customDeviceQuantity);
    }, 500);
    return () => clearTimeout(timer);
  }, [customDeviceQuantity]);

  const isDefaultOrEmpty =
    debouncedQty === "" ||
    debouncedQty <= 0 ||
    debouncedQty === plan.deviceLimit;

  const { data: updatedPlanRes, isFetching } = useGetPlanByIdQuery(
    {
      id: plan.id,
      billing,
      screenSize,
      deviceQuantity: debouncedQty === "" ? undefined : debouncedQty,
    },
    {
      skip: isDefaultOrEmpty,
    },
  );

  const displayPlan = isDefaultOrEmpty ? plan : updatedPlanRes?.data || plan;
  const ui = getPlanUi(displayPlan);
  const displayName = formatPlanName(displayPlan.name);
  const priceLabel = isAnnual ? "/year" : "/month";

  return (
    <div
      className={`relative flex w-full flex-col overflow-hidden rounded-[24px] border bg-navbarBg transition-all duration-300 ${ui.borderColor} ${isSelected ? "ring-2 ring-primary-action" : ""}`}
    >
      <div className="p-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-4">
            <h2 className="font-inter text-[20px] font-bold leading-normal text-headings">
              {displayName}
            </h2>
            {ui.highlight && (
              <div className="rounded-full bg-[#7F56D9] px-3 py-1 text-[11px] font-semibold text-white">
                Most Popular
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-color" />

      <div className="p-6 space-y-6">
        <div className="flex w-full items-baseline justify-center gap-1 rounded-[8px] bg-cardBackground2 px-4 py-5 relative">
          {isFetching && (
            <div className="absolute top-2 right-2">
              <Loader2 className="w-4 h-4 animate-spin text-muted" />
            </div>
          )}
          <span className="font-inter text-[32px] font-bold leading-normal text-headings">
            {formatAmount(displayPlan.price, displayPlan.currency)}
          </span>
          <span className="font-inter text-[16px] font-normal leading-[24px] text-muted">
            {priceLabel}
          </span>
        </div>
        {isAnnual && displayPlan.yearlyDiscount?.hasYearlyDiscount && (
          <p className="text-center text-[13px] font-medium text-bgGreen">
            {displayPlan.yearlyDiscount.yearlyDiscountRate}% yearly discount
            applied
          </p>
        )}
      </div>

      <div className="px-6 pb-4 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Monitor className="h-6 w-6 text-body flex-shrink-0" />
            <div className="flex flex-col flex-1 w-full overflow-hidden">
              <p className="font-inter text-[14px] font-normal leading-[20px] text-body">
                Devices
              </p>
              <input
                type="number"
                min={1}
                placeholder={String(plan.deviceLimit)}
                value={customDeviceQuantity}
                onChange={(e) => {
                  const val = e.target.value;
                  setCustomDeviceQuantity(val === "" ? "" : Number(val));
                }}
                className="w-[60px] h-[24px] bg-transparent border-b border-color text-[14px] font-bold leading-[20px] text-headings focus:outline-none focus:border-primary-action px-1 mt-0.5"
                aria-label="Custom device quantity"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Database className="h-6 w-6 text-body" />
            <div>
              <p className="font-inter text-[14px] font-normal leading-[20px] text-body">
                Storage
              </p>
              <p className="font-inter text-[14px] font-bold leading-[20px] text-headings">
                {displayPlan.storageLimitGb} GB
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-color pt-4">
          <div className="flex items-center gap-3">
            <LayoutTemplate className="h-6 w-6 text-body" />
            <div>
              <p className="font-inter text-[14px] font-normal leading-[20px] text-body">
                Templates
              </p>
              <p className="font-inter text-[14px] font-bold leading-[20px] text-headings">
                {displayPlan.templateLimit}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-color mx-6" />

      <div className="p-6 pt-5">
        <p className="font-inter text-[12px] font-bold tracking-wider text-muted mb-4 uppercase">
          UPLOAD LIMITS
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ImageIcon className="h-4 w-4 text-headings" />
            <span className="text-[13px] font-medium text-headings">
              {displayPlan.photoLimit} Photo
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Music className="h-4 w-4 text-headings" />
            <span className="text-[13px] font-medium text-headings">
              {displayPlan.audioLimit} Audio
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Video className="h-4 w-4 text-headings" />
            <span className="text-[13px] font-medium text-headings">
              {displayPlan.videoLimit} Video
            </span>
          </div>
        </div>
      </div>

      {displayPlan.features.length > 0 && (
        <div className="p-6 pt-0">
          <p className="font-inter text-[12px] font-bold tracking-wider text-gray mb-4 uppercase">
            Features
          </p>
          <div className="rounded-[14px] bg-cardBackground2 p-4 space-y-3 border border-color">
            {displayPlan.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <Check className="h-4 w-4 text-bgGreen" />
                <span className="text-[14px] font-medium text-body">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto p-6">
        <button
          type="button"
          onClick={() =>
            onChoose(
              displayPlan,
              debouncedQty === "" ? undefined : debouncedQty,
            )
          }
          disabled={isLoading}
          className={`flex w-full cursor-pointer items-center justify-center rounded-[12px] px-4 py-4 text-[16px] font-bold transition-all active:scale-[0.98] ${ui.buttonColor}`}
        >
          {isLoading ? (
            <span className="inline-flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" /> Processing...
            </span>
          ) : (
            "Get Started"
          )}
        </button>
      </div>
    </div>
  );
}
