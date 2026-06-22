"use client";

import { useMemo, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  useGetActivePlansQuery,
  useGetActiveScreenSizesQuery,
} from "@/redux/api/users/plan/plan.api";
import { useGetActiveTaxRegionsQuery } from "@/redux/api/users/tax/tax.api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sortPlansByTier } from "@/lib/planSort";
import {
  formatScreenSizeLabel,
  parseScreenSize,
  type BillingCycle,
  type UserPlan,
} from "@/redux/api/users/plan/plan.type";
import PlanCard from "@/app/(upgrade)/choose-plan/_components/PlanCard";
import type { ChangePlanPayload } from "@/redux/api/users/payment/payment.type";

interface ChangePlanSelectStepProps {
  currentPlanName: string;
  currentScreenSize: number;
  currentBillingCycle: "MONTHLY" | "ANNUAL";
  isLoading: boolean;
  onPreviewCost: (payload: ChangePlanPayload) => void;
}

const GATEWAYS: { id: "stripe" | "paystack"; name: string }[] = [
  { id: "stripe", name: "Stripe" },
  { id: "paystack", name: "Paystack" },
];

export default function ChangePlanSelectStep({
  currentPlanName,
  currentScreenSize,
  currentBillingCycle,
  isLoading,
  onPreviewCost,
}: ChangePlanSelectStepProps) {
  const [isAnnual, setIsAnnual] = useState(currentBillingCycle === "ANNUAL");
  const [screenSize, setScreenSize] = useState(currentScreenSize);
  const [selectedPlan, setSelectedPlan] = useState<UserPlan | null>(null);
  const [selectedDeviceQty, setSelectedDeviceQty] = useState<number | undefined>(undefined);
  const [gateway, setGateway] = useState<"stripe" | "paystack">("stripe");
  const [country, setCountry] = useState("");

  const billing: BillingCycle = isAnnual ? "YEARLY" : "MONTHLY";

  const { data: screenSizesRes, isLoading: isLoadingSizes } =
    useGetActiveScreenSizesQuery();
  const screenSizes = useMemo(
    () => screenSizesRes?.data ?? [],
    [screenSizesRes?.data]
  );

  useEffect(() => {
    if (screenSizes.length === 0) return;
    const isValidScreenSize = screenSizes.some((s) => s.size === screenSize);
    if (!isValidScreenSize) {
      setScreenSize(screenSizes[0].size);
    }
  }, [screenSize, screenSizes]);

  const { data: plansRes, isLoading: isLoadingPlans } = useGetActivePlansQuery(
    { billing, screenSize },
    { skip: screenSize <= 0 }
  );

  const plans = useMemo(() => {
    const rawPlans = plansRes?.data ?? [];
    return sortPlansByTier(rawPlans);
  }, [plansRes?.data]);

  const { data: taxRes, isLoading: isTaxLoading } = useGetActiveTaxRegionsQuery();
  const taxRegions = useMemo(() => taxRes?.data ?? [], [taxRes?.data]);

  useEffect(() => {
    if (!country && taxRegions.length > 0) {
      setCountry(taxRegions[0].region);
    }
  }, [country, taxRegions]);

  useEffect(() => {
    setSelectedPlan(null);
    setSelectedDeviceQty(undefined);
  }, [billing, screenSize]);

  const canPreview = selectedPlan !== null && country !== "";

  const handleChoosePlan = (plan: UserPlan, customQty?: number) => {
    setSelectedPlan(plan);
    setSelectedDeviceQty(customQty);
  };

  const handlePreview = () => {
    if (!selectedPlan) return;
    const payload: ChangePlanPayload = {
      planId: selectedPlan.id,
      billingCycle: isAnnual ? "ANNUAL" : "MONTHLY",
      screenSize,
      country,
      gateway,
      ...(selectedDeviceQty !== undefined && { deviceQuantity: selectedDeviceQty }),
    };
    onPreviewCost(payload);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-headings">Select New Plan</h2>
        <p className="text-xs sm:text-sm text-muted mt-1">
          Choose the plan you want to switch to.
        </p>
      </div>

      {/* Billing toggle + screen size — stacks on mobile */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className={`text-xs sm:text-sm font-medium ${!isAnnual ? "text-headings" : "text-muted"}`}>
            Monthly
          </span>
          <button
            type="button"
            onClick={() => setIsAnnual((v) => !v)}
            className={`relative h-5 w-9 sm:h-6 sm:w-11 rounded-full p-1 transition-colors ${
              isAnnual ? "bg-bgBlue" : "bg-gray-300 dark:bg-gray-600"
            } cursor-pointer`}
          >
            <span
              className={`block h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-white transition-all ${
                isAnnual ? "translate-x-4 sm:translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
          <span className={`text-xs sm:text-sm font-medium ${isAnnual ? "text-headings" : "text-muted"}`}>
            Annual
          </span>
        </div>

        <div className="w-full sm:w-[180px]">
          <Select
            value={screenSize > 0 ? String(screenSize) : undefined}
            onValueChange={(v) => setScreenSize(parseScreenSize(v))}
            disabled={isLoadingSizes}
          >
            <SelectTrigger className="h-9 rounded-lg border border-color bg-navbarBg text-sm">
              <SelectValue placeholder="Screen size" />
            </SelectTrigger>
            <SelectContent>
              {screenSizes.map((s) => (
                <SelectItem key={s.size} value={String(s.size)}>
                  {formatScreenSizeLabel(s.size)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Plan Cards — horizontal scroll on all screen sizes inside modal */}
      {isLoadingPlans || screenSize <= 0 ? (
        <div className="flex items-center justify-center py-10 gap-2 text-muted">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading plans...</span>
        </div>
      ) : (
        <div className="flex items-stretch gap-4 overflow-x-auto pb-3 -mx-1 px-1 snap-x snap-mandatory custom-scrollbar">
          {plans.map((plan) => {
            const isCurrent =
              plan.name.toUpperCase() === currentPlanName.toUpperCase();
            const isSelected = selectedPlan?.id === plan.id;

            return (
              <div
                key={plan.id}
                className="flex min-h-0 min-w-[260px] flex-shrink-0 snap-start self-stretch sm:min-w-[280px]"
              >
                <PlanCard
                  plan={plan}
                  isAnnual={isAnnual}
                  onChoose={handleChoosePlan}
                  isLoading={isLoading && isSelected}
                  isSelected={isSelected}
                  screenSize={screenSize}
                  billing={billing}
                  buttonLabel="Select Plan"
                  isCurrentPlan={isCurrent}
                  compact={true}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Country + Gateway — stacks on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5 block">
            Country
          </label>
          <Select
            value={country}
            onValueChange={setCountry}
            disabled={isTaxLoading || taxRegions.length === 0}
          >
            <SelectTrigger className="h-10 rounded-lg border border-color bg-navbarBg text-sm">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {taxRegions.map((r) => (
                <SelectItem key={r.id} value={r.region}>
                  {r.region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5 block">
            Payment Gateway
          </label>
          <div className="flex gap-2 sm:gap-3">
            {GATEWAYS.map((gw) => (
              <button
                key={gw.id}
                type="button"
                onClick={() => setGateway(gw.id)}
                className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all cursor-pointer ${
                  gateway === gw.id
                    ? "border-bgBlue bg-bgBlue/5 text-bgBlue"
                    : "border-border text-muted hover:border-bgBlue/50"
                }`}
              >
                {gw.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected plan indicator */}
      {selectedPlan && (
        <div className="flex items-center gap-2 text-xs sm:text-sm text-green-600 dark:text-green-400">
          <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
          <span>
            <strong>
              {selectedPlan.name.charAt(0) +
                selectedPlan.name.slice(1).toLowerCase()}
            </strong>{" "}
            plan selected
          </span>
        </div>
      )}

      {/* Preview Cost CTA */}
      <button
        type="button"
        onClick={handlePreview}
        disabled={!canPreview || isLoading}
        className="w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-xl bg-bgBlue text-white font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Calculating cost...
          </>
        ) : (
          "Preview Cost"
        )}
      </button>
    </div>
  );
}
