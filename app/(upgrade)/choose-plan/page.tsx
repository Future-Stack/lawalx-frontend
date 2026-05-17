"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Crown, Monitor, Database, Video, LayoutTemplate, ArrowLeft, Loader2 } from "lucide-react";
import { useGetUserProfileQuery } from "@/redux/api/users/userProfileApi";
import { useGetProfileQuery } from "@/redux/api/users/settings/personalApi";
import { useCreateCheckoutMutation } from "@/redux/api/users/payment/payment.api";
import { toast } from "sonner";
import {
  useGetActivePlansQuery,
  useGetActiveScreenSizesQuery,
  useGetPlanByIdQuery,
  useGetYearlyDiscountsQuery,
} from "@/redux/api/users/plan/plan.api";
import {
  formatScreenSizeLabel,
  parseScreenSize,
  type BillingCycle,
  type UserPlan,
} from "@/redux/api/users/plan/plan.type";
import PlanCard from "./_components/PlanCard";
import PaymentGatewaySelection from "./_components/PaymentGatewaySelection";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function parseBillingParam(raw: string | null): BillingCycle {
  return raw === "YEARLY" ? "YEARLY" : "MONTHLY";
}

function ChoosePlanPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const stepParam = searchParams.get("step");
  const planIdParam = searchParams.get("planId");
  const billingParam = searchParams.get("billing");
  const screenSizeParam = searchParams.get("screenSize");

  const isCheckout = stepParam === "checkout" && Boolean(planIdParam);
  const billing = parseBillingParam(billingParam);
  const isAnnual = billing === "YEARLY";

  const [screenSize, setScreenSize] = useState(() =>
    parseScreenSize(screenSizeParam),
  );
  const [choosingPlanId, setChoosingPlanId] = useState<string | null>(null);

  const { data: userData } = useGetUserProfileQuery();
  const { data: profileData } = useGetProfileQuery();
  const [createCheckout, { isLoading: isCreatingPayment }] =
    useCreateCheckoutMutation();
  const { data: yearlyDiscountRes } = useGetYearlyDiscountsQuery();

  const { data: screenSizesRes, isLoading: isLoadingSizes } =
    useGetActiveScreenSizesQuery();

  const screenSizes = useMemo(
    () => screenSizesRes?.data ?? [],
    [screenSizesRes?.data],
  );
  
  const hasYearlyDiscount =
    yearlyDiscountRes?.data?.[0]?.hasYearlyDiscount ?? false;
  const yearlyDiscountRate = hasYearlyDiscount
    ? yearlyDiscountRes?.data?.[0]?.yearlyDiscountRate ?? 0
    : 0;

  const syncUrl = useCallback(
    (opts: {
      step?: "plans" | "checkout";
      planId?: string | null;
      billing?: BillingCycle;
      screen?: number;
    }) => {
      const params = new URLSearchParams();
      const nextBilling = opts.billing ?? billing;
      const nextScreen = opts.screen ?? screenSize;
      const nextStep = opts.step ?? (isCheckout ? "checkout" : "plans");
      const nextPlanId =
        opts.planId !== undefined ? opts.planId : planIdParam;

      if (nextScreen > 0) params.set("screenSize", String(nextScreen));
      params.set("billing", nextBilling);

      if (nextStep === "checkout" && nextPlanId) {
        params.set("step", "checkout");
        params.set("planId", nextPlanId);
      }

      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [billing, isCheckout, pathname, planIdParam, router, screenSize],
  );

  useEffect(() => {
    if (screenSize > 0) return;
    const fromUrl = parseScreenSize(screenSizeParam);
    if (fromUrl > 0) {
      setScreenSize(fromUrl);
      return;
    }
    if (screenSizes.length > 0) {
      setScreenSize(screenSizes[0].size);
    }
  }, [screenSize, screenSizeParam, screenSizes]);

  const {
    data: plansRes,
    isLoading: isLoadingPlans,
    isFetching: isFetchingPlans,
    isError: isPlansError,
  } = useGetActivePlansQuery(
    { billing, screenSize },
    { skip: screenSize <= 0 || isCheckout },
  );

  const {
    data: planRes,
    isLoading: isLoadingCheckoutPlan,
    isError: isCheckoutPlanError,
  } = useGetPlanByIdQuery(
    { id: planIdParam!, billing, screenSize },
    { skip: !isCheckout || !planIdParam || screenSize <= 0 },
  );

  const checkoutPlan = planRes?.data ?? null;
  const plans = useMemo(() => {
    const rawPlans = plansRes?.data ?? [];
    const order: Record<string, number> = { basic: 1, business: 2, premium: 3 };
    return [...rawPlans].sort(
      (a, b) => (order[a.name?.toLowerCase()] || 99) - (order[b.name?.toLowerCase()] || 99)
    );
  }, [plansRes?.data]);

  const handleBillingToggle = () => {
    const next = isAnnual ? "MONTHLY" : "YEARLY";
    syncUrl({ billing: next, step: isCheckout ? "checkout" : "plans" });
  };

  const handleScreenSizeChange = (value: string) => {
    const next = parseScreenSize(value);
    if (next <= 0) return;
    setScreenSize(next);
    syncUrl({
      screen: next,
      step: isCheckout ? "checkout" : "plans",
      planId: planIdParam,
    });
  };

  const handleChoosePlan = async (plan: UserPlan) => {
    if (!userData?.data && !profileData?.data) {
      toast.error("Please login to continue");
      return;
    }
    setChoosingPlanId(plan.id);
    syncUrl({ step: "checkout", planId: plan.id, billing, screen: screenSize });
    setChoosingPlanId(null);
  };

  const handleBackToPlans = () => {
    syncUrl({ step: "plans", planId: null, billing, screen: screenSize });
  };

  const handleCompletePayment = async (
    gateway: "stripe" | "paystack",
    country: string,
  ) => {
    if (!checkoutPlan) return;
    try {
      const checkoutBillingCycle: "MONTHLY" | "ANNUAL" =
        billing === "YEARLY" ? "ANNUAL" : "MONTHLY";
      const payload = {
        planId: checkoutPlan.id,
        billingCycle: checkoutBillingCycle,
        screenSize,
        country,
        gateway,
      };

      const res = await createCheckout(payload).unwrap();
      if (res?.data?.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      } else {
        toast.error("Checkout URL missing. Please try again.");
      }
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Something went wrong. Please try again.");
    }
  };

  const screenSizeLabel =
    screenSize > 0 ? formatScreenSizeLabel(screenSize) : "";

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-10 bg-background text-foreground transition-colors duration-300">
      <div className="mx-auto w-full max-w-7xl">
        {!isCheckout ? (
          <>
            <div className="mb-8">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-2 text-muted hover:text-bgBlue transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-color bg-navbarBg shadow-sm transition-all group-hover:bg-hover group-hover:border-bgBlue/30">
                  <ArrowLeft className="w-5 h-5 transition-colors group-hover:text-bgBlue" />
                </div>
                <span className="font-medium text-[16px] transition-colors">
                  Back to Dashboard
                </span>
              </button>
            </div>

            <div className="relative z-10 text-center mx-auto max-w-3xl mb-8">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center">
                <Crown className="h-8 w-8 text-primary-action" />
              </div>
              <h1 className="text-[40px] font-bold leading-tight text-headings">
                Choose Your Plan
              </h1>
              <p className="mt-4 text-[16px] leading-[24px] text-muted">
                Scale your digital signage network with the right plan for your
                business.
              </p>
            </div>

            <div className="relative z-10 mb-6 flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap">
              <div className="flex items-center gap-4">
                <span
                  className={`text-[16px] font-medium leading-[24px] ${!isAnnual ? "text-headings" : "text-muted"}`}
                >
                  Monthly
                </span>
                <button
                  type="button"
                  onClick={handleBillingToggle}
                  className={`relative h-[24px] w-[44px] rounded-full p-1 transition-colors duration-300 ${isAnnual ? "bg-bgGreen" : "bg-borderGray"} cursor-pointer focus:outline-none`}
                  aria-label="Toggle billing cycle"
                >
                  <span
                    className={`block h-[16px] w-[16px] rounded-full bg-white shadow transition-all duration-300 ${isAnnual ? "translate-x-[20px]" : "translate-x-0"}`}
                  />
                </button>
                <span
                  className={`text-[16px] font-medium leading-[24px] ${isAnnual ? "text-headings" : "text-muted"}`}
                >
                  Annual
                  {hasYearlyDiscount && yearlyDiscountRate > 0 && (
                    <span className="text-bgGreen ml-1">
                      ({yearlyDiscountRate}% off)
                    </span>
                  )}
                </span>
              </div>

              <div className="w-full max-w-[220px] sm:w-[220px]">
                <Select
                  value={screenSize > 0 ? String(screenSize) : undefined}
                  onValueChange={handleScreenSizeChange}
                  disabled={isLoadingSizes || screenSizes.length === 0}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl border border-color bg-navbarBg text-sm font-medium text-body">
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

            {isLoadingPlans || isFetchingPlans || screenSize <= 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted">
                <Loader2 className="h-8 w-8 animate-spin text-primary-action" />
                <p>Loading plans...</p>
              </div>
            ) : isPlansError ? (
              <p className="text-center py-12 text-red-500">
                Failed to load plans. Please try again.
              </p>
            ) : plans.length === 0 ? (
              <p className="text-center py-12 text-muted">
                No active plans for this screen size and billing cycle.
              </p>
            ) : (
              <div className="grid gap-8 xl:grid-cols-3 justify-items-center">
                {plans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    isAnnual={isAnnual}
                    onChoose={handleChoosePlan}
                    isLoading={choosingPlanId === plan.id}
                    isSelected={planIdParam === plan.id}
                  />
                ))}
              </div>
            )}

            <div className="relative z-10 mt-12 overflow-hidden rounded-[24px] border border-color p-6 shadow-sm flex flex-col lg:flex-row items-center gap-10 justify-between add-bg-img bg-navbarBg transition-colors duration-300">
              <div className="relative z-10 flex flex-col items-start gap-6 lg:w-1/2">
                <div>
                  <h2 className="font-inter text-[18px] font-semibold leading-normal text-headings">
                    Custom
                  </h2>
                  <p className="mt-2 font-inter text-[14px] font-normal leading-[20px] text-muted">
                    Custom solutions for large organizations that requires
                    flexible limits and Enterprise-level scalability and
                    support.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/request-custom-plan")}
                  className="inline-flex items-center justify-center rounded-[10px] bg-bgBlue px-6 py-3 text-[16px] font-bold text-white shadow-customShadow transition-all hover:opacity-90 active:scale-[0.98] cursor-pointer"
                >
                  Request Custom Plan
                </button>
              </div>

              <div className="relative z-10 w-full lg:w-1/2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                  <div className="flex items-center gap-3 pb-5 border-b border-color">
                    <Monitor className="h-5 w-5 text-body" />
                    <div>
                      <p className="font-inter text-[14px] font-normal leading-[20px] text-body">
                        Devices
                      </p>
                      <p className="font-inter text-[14px] font-semibold leading-[20px] text-bgBlue">
                        Custom
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pb-5 border-b border-color">
                    <Database className="h-5 w-5 text-body" />
                    <div>
                      <p className="font-inter text-[14px] font-normal leading-[20px] text-body">
                        Storage
                      </p>
                      <p className="font-inter text-[14px] font-semibold leading-[20px] text-bgBlue">
                        Custom
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-5 border-b border-color sm:border-b-0 pb-5 sm:pb-0">
                    <Video className="h-5 w-5 text-body" />
                    <div>
                      <p className="font-inter text-[14px] font-normal leading-[20px] text-body">
                        Upload Limits
                      </p>
                      <p className="font-inter text-[14px] font-semibold leading-[20px] text-bgBlue">
                        Custom
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-5">
                    <LayoutTemplate className="h-5 w-5 text-body" />
                    <div>
                      <p className="font-inter text-[14px] font-normal leading-[20px] text-body">
                        Templates
                      </p>
                      <p className="font-inter text-[14px] font-semibold leading-[20px] text-bgBlue">
                        Custom
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : isLoadingCheckoutPlan ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted">
            <Loader2 className="h-8 w-8 animate-spin text-primary-action" />
            <p>Loading your plan...</p>
          </div>
        ) : isCheckoutPlanError || !checkoutPlan ? (
          <div className="text-center py-24 space-y-4">
            <p className="text-red-500">Could not load the selected plan.</p>
            <button
              type="button"
              onClick={handleBackToPlans}
              className="text-bgBlue font-medium hover:underline"
            >
              Back to plans
            </button>
          </div>
        ) : (
          <PaymentGatewaySelection
            selectedPlan={checkoutPlan}
            selectedSize={screenSizeLabel}
            selectedScreenSize={screenSize}
            isAnnual={isAnnual}
            onBack={handleBackToPlans}
            onComplete={handleCompletePayment}
            isLoading={isCreatingPayment}
          />
        )}
      </div>
    </div>
  );
}

export default function ChoosePlanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" aria-hidden />}>
      <ChoosePlanPageInner />
    </Suspense>
  );
}
