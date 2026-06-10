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
  buttonLabel?: string;
  isCurrentPlan?: boolean;
  /** Compact mode for use inside modals — reduces padding and font sizes */
  compact?: boolean;
}

export default function PlanCard({
  plan,
  isAnnual,
  onChoose,
  isLoading,
  isSelected,
  screenSize,
  billing,
  buttonLabel = "Get Started",
  isCurrentPlan = false,
  compact = false,
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

  // Compact-mode size tokens
  const pad = compact ? "p-3" : "p-6";
  const padX = compact ? "px-3" : "px-6";
  const padXpb = compact ? "px-3 pb-3" : "px-6 pb-4";
  const nameSize = compact ? "text-sm" : "text-[20px]";
  const priceSize = compact ? "text-xl" : "text-[32px]";
  const priceSuffixSize = compact ? "text-xs" : "text-[16px]";
  const labelSize = compact ? "text-[11px]" : "text-[14px]";
  const iconSize = compact ? "h-4 w-4" : "h-6 w-6";
  const featureTextSize = compact ? "text-xs" : "text-[14px]";
  const badgeText = compact ? "text-[9px]" : "text-[11px]";
  const btnText = compact ? "text-sm py-2.5" : "text-[16px] py-4";
  const sectionGap = compact ? "space-y-3" : "space-y-6";
  const pricePad = compact ? "px-3 py-3" : "px-4 py-5";
  const featurePad = compact ? "p-3 space-y-2" : "p-4 space-y-3";

  return (
    <div
      className={`relative flex w-full flex-col overflow-hidden rounded-[24px] border bg-navbarBg transition-all duration-300 ${ui.borderColor} ${isSelected ? "ring-2 ring-primary-action" : ""}`}
    >
      {/* Header */}
      <div className={pad}>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className={`font-inter ${nameSize} font-bold leading-normal text-headings`}>
              {displayName}
            </h2>
            {ui.highlight && (
              <div className={`rounded-full bg-[#7F56D9] px-2 py-0.5 ${badgeText} font-semibold text-white`}>
                Most Popular
              </div>
            )}
            {isCurrentPlan && (
              <div className={`rounded-full bg-gray-100 dark:bg-gray-800 border border-border px-2 py-0.5 ${badgeText} font-semibold text-muted`}>
                Current
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-color" />

      {/* Price */}
      <div className={`${pad} ${sectionGap}`}>
        <div className={`flex w-full items-baseline justify-center gap-1 rounded-[8px] bg-cardBackground2 ${pricePad} relative`}>
          {isFetching && (
            <div className="absolute top-2 right-2">
              <Loader2 className="w-3 h-3 animate-spin text-muted" />
            </div>
          )}
          <span className={`font-inter ${priceSize} font-bold leading-normal text-headings`}>
            {formatAmount(displayPlan.price, displayPlan.currency)}
          </span>
          <span className={`font-inter ${priceSuffixSize} font-normal leading-[24px] text-muted`}>
            {priceLabel}
          </span>
        </div>
        {isAnnual && displayPlan.yearlyDiscount?.hasYearlyDiscount && (
          <p className={`text-center ${compact ? "text-[11px]" : "text-[13px]"} font-medium text-bgGreen`}>
            {displayPlan.yearlyDiscount.yearlyDiscountRate}% yearly discount applied
          </p>
        )}
      </div>

      {/* Specs */}
      <div className={`${padXpb} space-y-4`}>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <Monitor className={`${iconSize} text-body flex-shrink-0`} />
            <div className="flex flex-col flex-1 w-full overflow-hidden">
              <p className={`font-inter ${labelSize} font-normal text-body`}>Devices</p>
              <input
                type="number"
                min={1}
                placeholder={String(plan.deviceLimit)}
                value={customDeviceQuantity}
                onChange={(e) => {
                  const val = e.target.value;
                  setCustomDeviceQuantity(val === "" ? "" : Number(val));
                }}
                className={`w-[52px] h-[22px] bg-transparent border-b border-color ${labelSize} font-bold text-headings focus:outline-none focus:border-primary-action px-1 mt-0.5`}
                aria-label="Custom device quantity"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Database className={`${iconSize} text-body`} />
            <div>
              <p className={`font-inter ${labelSize} font-normal text-body`}>Storage</p>
              <p className={`font-inter ${labelSize} font-bold text-headings`}>
                {displayPlan.storageLimitGb} GB
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-color pt-3">
          <div className="flex items-center gap-2">
            <LayoutTemplate className={`${iconSize} text-body`} />
            <div>
              <p className={`font-inter ${labelSize} font-normal text-body`}>Templates</p>
              <p className={`font-inter ${labelSize} font-bold text-headings`}>
                {displayPlan.templateLimit}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-color mx-4" />

      {/* Upload limits */}
      <div className={`${pad} pt-3`}>
        <p className={`font-inter ${compact ? "text-[9px]" : "text-[12px]"} font-bold tracking-wider text-muted mb-2 uppercase`}>
          UPLOAD LIMITS
        </p>
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1">
            <ImageIcon className="h-3.5 w-3.5 text-headings" />
            <span className={`${compact ? "text-[11px]" : "text-[13px]"} font-medium text-headings`}>
              {displayPlan.photoLimit} Photo
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Music className="h-3.5 w-3.5 text-headings" />
            <span className={`${compact ? "text-[11px]" : "text-[13px]"} font-medium text-headings`}>
              {displayPlan.audioLimit} Audio
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Video className="h-3.5 w-3.5 text-headings" />
            <span className={`${compact ? "text-[11px]" : "text-[13px]"} font-medium text-headings`}>
              {displayPlan.videoLimit} Video
            </span>
          </div>
        </div>
      </div>

      {/* Features */}
      {displayPlan.features.length > 0 && (
        <div className={`${padX} pb-3 pt-0`}>
          <p className={`font-inter ${compact ? "text-[9px]" : "text-[12px]"} font-bold tracking-wider text-gray mb-2 uppercase`}>
            Features
          </p>
          <div className={`rounded-[10px] bg-cardBackground2 ${featurePad} border border-color`}>
            {displayPlan.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-bgGreen flex-shrink-0" />
                <span className={`${featureTextSize} font-medium text-body`}>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA button */}
      <div className={`mt-auto ${pad} pt-3`}>
        <button
          type="button"
          onClick={() =>
            onChoose(
              displayPlan,
              debouncedQty === "" ? undefined : debouncedQty,
            )
          }
          disabled={isLoading || isCurrentPlan}
          className={`flex w-full cursor-pointer items-center justify-center rounded-[12px] px-4 ${btnText} font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${ui.buttonColor}`}
        >
          {isLoading ? (
            <span className="inline-flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Processing...
            </span>
          ) : isCurrentPlan ? (
            "Current Plan"
          ) : (
            buttonLabel
          )}
        </button>
      </div>
    </div>
  );
}
