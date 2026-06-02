"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useCreateEnterpriseCheckoutMutation } from "@/redux/api/users/payment/payment.api";
import { useGetEnterprisePlanByIdQuery } from "@/redux/api/enterpriseRequests/enterpriseRequestsApi";
import {
  parseScreenSize,
  formatScreenSizeLabel,
  type BillingCycle,
  type UserPlan,
} from "@/redux/api/users/plan/plan.type";
import PaymentGatewaySelection from "../choose-plan/_components/PaymentGatewaySelection";
import { toast } from "sonner";

function parseBillingParam(raw: string | null): BillingCycle {
  return raw === "YEARLY" ? "YEARLY" : "MONTHLY";
}

function EnterprisePlanPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const planIdParam = searchParams.get("planId");
  const billingParam = searchParams.get("billing");
  const screenSizeParam = searchParams.get("screenSize");
  const deviceQuantityParam = searchParams.get("deviceQuantity");

  const billing = parseBillingParam(billingParam);
  const isAnnual = billing === "YEARLY";
  const screenSize = parseScreenSize(screenSizeParam);
  const deviceQuantity = deviceQuantityParam
    ? parseInt(deviceQuantityParam, 10)
    : undefined;

  const [createEnterpriseCheckout, { isLoading: isCreatingPayment }] =
    useCreateEnterpriseCheckoutMutation();

  const {
    data: planRes,
    isLoading,
    isError,
  } = useGetEnterprisePlanByIdQuery(planIdParam ?? "", {
    skip: !planIdParam,
  });

  const handleCompletePayment = async (
    gateway: "stripe" | "paystack",
    country: string,
    couponCode?: string,
  ) => {
    if (!planRes?.data) return;
    try {
      const checkoutBillingCycle: "MONTHLY" | "ANNUAL" =
        billing === "YEARLY" ? "ANNUAL" : "MONTHLY";
      const payload = {
        planId: planRes.data.id,
        billingCycle: checkoutBillingCycle,
        screenSize,
        country,
        gateway,
        ...(couponCode && { couponCode }),
        ...(deviceQuantity !== undefined && { deviceQuantity }),
      };

      const res = await createEnterpriseCheckout(payload).unwrap();
      if (res?.data?.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      } else {
        toast.error("Checkout URL missing. Please try again.");
      }
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(
        err?.data?.message || "Something went wrong. Please try again.",
      );
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (!planIdParam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Invalid plan link. Plan ID is missing.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary-action" />
        <p>Loading your enterprise plan...</p>
      </div>
    );
  }

  if (isError || !planRes?.data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-500">
          Could not load your enterprise plan. The link may be invalid or
          expired.
        </p>
        <button
          type="button"
          onClick={handleBack}
          className="text-primary-action font-medium hover:underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  const plan = planRes.data;

  // Map enterprise plan data to the UserPlan shape PaymentGatewaySelection expects
  const mappedPlan: UserPlan = {
    id: plan.id,
    name: plan.name,
    description: plan.description,
    price: plan.computedPrice ?? plan.price,
    currency: plan.currency,
    deviceLimit: plan.deviceLimit,
    storageLimitGb: plan.storageLimitGb,
    templateLimit: plan.templateLimit,
    photoLimit: plan.photoLimit,
    audioLimit: plan.audioLimit,
    videoLimit: plan.videoLimit,
    features: plan.features,
    isActive: plan.isActive,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
    // Required by UserPlan type — not applicable for enterprise, use safe defaults
    originalAmount: plan.originalPrice ?? plan.price,
    originalCurrency: plan.originalCurrency ?? plan.currency,
    billing,
    yearlyDiscount: {
      hasYearlyDiscount: false,
      discountType: "PERCENTAGE",
      yearlyDiscountRate: 0,
      originalAnnualAmount: 0,
      discountAmount: 0,
      discountedAnnualAmount: 0,
      originalAnnualCurrency: plan.currency,
      discountedAnnualCurrency: plan.currency,
    },
  };

  const screenSizeLabel =
    screenSize > 0 ? formatScreenSizeLabel(screenSize) : "";

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-10 bg-background text-foreground transition-colors duration-300">
      <div className="mx-auto w-full max-w-7xl">
        <PaymentGatewaySelection
          selectedPlan={mappedPlan}
          selectedSize={screenSizeLabel}
          selectedScreenSize={screenSize}
          isAnnual={isAnnual}
          onBack={handleBack}
          onComplete={handleCompletePayment}
          isLoading={isCreatingPayment}
          customDeviceQuantity={deviceQuantity ?? plan.deviceQuantity}
        />
      </div>
    </div>
  );
}

export default function EnterprisePlanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" aria-hidden />}>
      <EnterprisePlanPageInner />
    </Suspense>
  );
}
