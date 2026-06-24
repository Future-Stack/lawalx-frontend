"use client";

import React from "react";
import {
  Check,
  Monitor,
  HardDrive,
  CreditCard,
  CalendarClock,
  Loader2,
  Download,
} from "lucide-react";
import { useGetMySubscriptionQuery, useCancelSubscriptionMutation, useUpdateRecurringMutation } from "@/redux/api/users/payment/payment.api";
import { useGetPlanByIdQuery } from "@/redux/api/users/plan/plan.api";
import CancelSubscriptionModal from "@/components/common/CancelSubscriptionModal";
import AutoRenewConfirmModal from "@/components/common/AutoRenewConfirmModal";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import BillingHistoryTable from "./_components/BillingHistoryTable";
import MyAdditionalPaymentTable from "./_components/MyAdditionalPaymentTable";
import ChangePlanModal from "./_components/change-plan/ChangePlanModal";

function formatCurrency(amount: number, currency: string) {
  const symbol = currency === "NGN" ? "₦" : "$";
  return `${symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toISOString().split("T")[0];
}

export default function Subscriptions() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = React.useState("visa");
  const [billingTab, setBillingTab] = React.useState<"billing" | "additional">(
    "billing",
  );
  const { data: mySubscriptionRes, isLoading } = useGetMySubscriptionQuery();
  const [cancelSubscription, { isLoading: isCanceling }] = useCancelSubscriptionMutation();
  const [updateRecurring, { isLoading: isUpdatingRecurring }] = useUpdateRecurringMutation();
  const [isCancelModalOpen, setIsCancelModalOpen] = React.useState(false);
  const [isAutoRenewModalOpen, setIsAutoRenewModalOpen] = React.useState(false);
  const [isChangePlanOpen, setIsChangePlanOpen] = React.useState(false);

  const handleCancelPlan = async () => {
    if (!mySubscriptionRes?.data?.userId) return;
    try {
      await cancelSubscription({ userId: mySubscriptionRes.data.userId }).unwrap();
      toast.success("Subscription cancellation scheduled successfully");
      setIsCancelModalOpen(false);
    } catch (error) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to cancel subscription");
    }
  };

  const subscription = mySubscriptionRes?.data ?? null;
  const isAutoRenewEnabled = subscription?.recurring ?? false;

  const { data: currentPlanRes, isLoading: isLoadingCurrentPlan } = useGetPlanByIdQuery(
    {
      id: subscription?.planId || "",
      billing: subscription?.billingCycle === "ANNUAL" ? "YEARLY" : "MONTHLY",
      screenSize: subscription?.screenSize ?? 0,
      deviceQuantity: subscription?.deviceQuantity,
    },
    {
      skip: !subscription?.planId,
    }
  );

  const handleToggleAutoRenew = async () => {
    try {
      await updateRecurring({ recurring: !isAutoRenewEnabled }).unwrap();
      toast.success(`Subscription recurring ${!isAutoRenewEnabled ? 'enabled' : 'disabled'} successfully`);
      setIsAutoRenewModalOpen(false);
    } catch (error) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to update auto-renew setting");
    }
  };
  const payments = subscription?.payments ?? [];
  const latestPayment = payments[0];
  const planName = subscription?.plan?.name
    ? `${subscription.plan.name.charAt(0)}${subscription.plan.name.slice(1).toLowerCase()} Plan`
    : "Premium Plan";
  const billingUnit =
    subscription?.billingCycle === "MONTHLY" ? "month" : "year";
  const nextBilling = subscription?.endDate
    ? formatDate(subscription.endDate)
    : "N/A";

  const currentPlanPrice = currentPlanRes?.data?.price;
  const currentPlanCurrency = currentPlanRes?.data?.currency || "USD";

  const planPriceText = currentPlanPrice !== undefined
    ? `${formatCurrency(currentPlanPrice, currentPlanCurrency)}/${billingUnit}`
    : isLoadingCurrentPlan
    ? `Loading...`
    : `--/${billingUnit}`;
  const planStatus = subscription?.status ?? "Inactive";
  const deviceQuantity = subscription?.deviceQuantity ?? 0;
  const storageLimitGb = subscription?.storageLimitGb ?? 0;
  const hasSubscription = Boolean(subscription?.id);

  const deviceUsage = subscription?.deviceUsage;
  const storageUsage = subscription?.storageUsage;

  const deviceUsed = deviceUsage?.used ?? 0;
  const deviceTotal = deviceUsage?.total ?? deviceQuantity;
  const devicePercentage = deviceTotal > 0 ? Math.min((deviceUsed / deviceTotal) * 100, 100) : 0;

  const storageUsedGb = storageUsage?.usedGb ?? 0;
  const storageTotalGb = storageUsage?.totalGb ?? storageLimitGb;
  const storagePercentage = storageTotalGb > 0 ? Math.min((storageUsedGb / storageTotalGb) * 100, 100) : 0;

  React.useEffect(() => {
    if (!subscription) return;
    if (
      subscription.gateway === "stripe" ||
      subscription.gateway === "paystack"
    ) {
      setSelectedMethod(subscription.gateway);
    }
  }, [subscription]);

  return (
    <div className="space-y-8 border border-border bg-navbarBg rounded-xl p-4 md:p-6">
      {/* My Plan */}
      <section>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
          <h2 className="text-lg md:text-xl font-bold text-headings">
            My Plan
          </h2>
        </div>

        <div className="border border-border rounded-xl p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading subscription...
            </div>
          ) : !hasSubscription ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-lg font-bold text-headings">No Plan</p>
                <p className="text-sm text-muted mt-1">
                  You do not have an active subscription plan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/choose-plan")}
                className="px-4 py-2 bg-bgBlue text-white text-sm font-medium rounded-lg hover:bg-bgBlue/90 cursor-pointer shadow-customShadow"
              >
                Buy Plan
              </button>
            </div>
          ) : (
            <>
              {subscription?.scheduledPlanChange && (
                <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/40 p-4 mb-4">
                  <CalendarClock className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-orange-800 dark:text-orange-200">
                      Scheduled Plan Change
                    </p>
                    <p className="text-xs text-orange-700 dark:text-orange-300 mt-0.5">
                      Your plan will be changed to{" "}
                      <strong>
                        {subscription.scheduledPlanChange.plan.name.charAt(0) +
                          subscription.scheduledPlanChange.plan.name.slice(1).toLowerCase()}
                      </strong>{" "}
                      on{" "}
                      <strong>
                        {new Date(subscription.scheduledPlanChange.effectiveDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </strong>.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-lg font-bold text-headings">
                      {planName}
                    </span>
                    <span
                      className={`px-2 py-0.5 border text-xs font-semibold rounded-full ${
                        planStatus === "ACTIVE"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-orange-50 text-orange-700 border-orange-200"
                      }`}
                    >
                      {planStatus === "ACTIVE" ? "Active" : planStatus}
                    </span>
                  </div>
                  <p className="text-xs text-muted">
                    {/* {planPriceText} • */}
                     Next billing: {nextBilling}
                  </p>
                </div>
                <button
                  className="flex items-center gap-2 rounded-lg border border-border bg-navbarBg px-4 py-2 text-sm font-medium text-headings shadow-customShadow transition-colors hover:bg-bgGray dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => setIsChangePlanOpen(true)}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Change Plan
                </button>
              </div>

              {/* Usage Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-body mb-2">
                    <Monitor className="w-4 h-4" /> Devices
                  </label>
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
                    <div
                      className="bg-bgBlue h-2 rounded-full transition-all duration-500"
                      style={{ width: `${devicePercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted">{deviceUsed} / {deviceTotal}</p>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-body mb-2">
                    <HardDrive className="w-4 h-4" /> Storage
                  </label>
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
                    <div
                      className="bg-bgBlue h-2 rounded-full transition-all duration-500"
                      style={{ width: `${storagePercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted">{storageUsedGb.toFixed(2)} / {storageTotalGb} GB</p>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h4 className="text-sm font-semibold text-headings mb-4">
                  Included Features
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8">
                  {subscription?.features?.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-sm text-body"
                    >
                      <Check className="w-3.5 h-3.5 text-green-500" /> {feature}
                    </div>
                  ))}
                  {subscription?.templateLimit ? (
                    <div className="flex items-center gap-2 text-sm text-body">
                      <Check className="w-3.5 h-3.5 text-green-500" /> Up to{" "}
                      {subscription.templateLimit} Templates
                    </div>
                  ) : null}
                  {subscription?.photoLimit ? (
                    <div className="flex items-center gap-2 text-sm text-body">
                      <Check className="w-3.5 h-3.5 text-green-500" /> Up to{" "}
                      {subscription.photoLimit} Photos
                    </div>
                  ) : null}
                  {subscription?.audioLimit ? (
                    <div className="flex items-center gap-2 text-sm text-body">
                      <Check className="w-3.5 h-3.5 text-green-500" /> Up to{" "}
                      {subscription.audioLimit} Audios
                    </div>
                  ) : null}
                  {subscription?.videoLimit ? (
                    <div className="flex items-center gap-2 text-sm text-body">
                      <Check className="w-3.5 h-3.5 text-green-500" /> Up to{" "}
                      {subscription.videoLimit} Videos
                    </div>
                  ) : null}
                  {!subscription?.features?.length &&
                    !subscription?.templateLimit && (
                      <div className="text-sm text-muted">
                        No specific features listed.
                      </div>
                    )}
                </div>
              </div>

              <div className="flex justify-end items-center pt-2">
                {/* <button className="px-4 py-2 bg-white border border-border text-body text-sm font-medium rounded-lg hover:bg-gray-50 cursor-pointer shadow-customShadow">
                            Stop Plan
                        </button> */}
                <button 
                  type="button"
                  onClick={() => setIsCancelModalOpen(true)}
                  className="px-4 py-2 bg-[#F43F5E] text-white text-sm font-medium rounded-lg hover:bg-red-600 cursor-pointer shadow-customShadow"
                >
                  Cancel Plan
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Payment Method */}
      {/* <section>
        <h2 className="text-lg md:text-xl font-bold text-headings mb-4">
          Payment Method
        </h2>

        <div className="space-y-4 w-full flex flex-col md:flex-row border-y border-border py-5">
          <label className="text-sm font-medium text-body block mb-3 w-1/4">
            Card Details
          </label>
          <div className="w-3/4">
            <div
              onClick={() => setSelectedMethod("visa")}
              className={`border rounded-xl p-4 flex items-start gap-4 mb-3 relative cursor-pointer transition-colors ${selectedMethod === "visa" ? "border-bgBlue" : "border-border"}`}
            >
              <div className="w-12 h-8 bg-white border border-border rounded flex items-center justify-center">
                <span className="font-bold text-blue-800 text-xs">VISA</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-headings text-sm">
                      **** **** **** 4325
                    </p>
                    <p className="text-xs text-muted mb-2">Expiry: 06/2030</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center border ${selectedMethod === "visa" ? "bg-bgBlue border-bgBlue" : "border-gray-300"}`}
                  >
                    {selectedMethod === "visa" && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-white border border-border text-xs font-medium rounded-sm hover:bg-gray-50 cursor-pointer shadow-customShadow">
                    Edit
                  </button>
                </div>
              </div>
            </div>

            <div
              onClick={() => setSelectedMethod("stripe")}
              className={`border rounded-xl p-4 flex items-start gap-4 relative cursor-pointer transition-colors ${selectedMethod === "stripe" ? "border-bgBlue" : "border-border"}`}
            >
              <div className="w-12 h-8 bg-white border border-border rounded flex items-center justify-center">
                <span className="font-bold text-blue-500 text-xs">stripe</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-headings text-sm">
                      **** **** **** 4325
                    </p>
                    <p className="text-xs text-muted mb-2">Expiry: 06/2030</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center border ${selectedMethod === "stripe" ? "bg-bgBlue border-bgBlue" : "border-gray-300"}`}
                  >
                    {selectedMethod === "stripe" && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {selectedMethod !== "stripe" && (
                    <button className="px-3 py-1 bg-bgBlue text-white text-xs font-medium rounded-sm hover:bg-blue-600 cursor-pointer shadow-customShadow">
                      Set Default
                    </button>
                  )}
                  <button className="px-3 py-1 bg-white border border-border text-xs font-medium rounded-sm hover:bg-gray-50 cursor-pointer shadow-customShadow">
                    Edit
                  </button>
                </div>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium text-headings hover:bg-gray-50 cursor-pointer shadow-customShadow mt-3">
              <Plus className="w-4 h-4" /> Add New Payment Method
            </button>
          </div>
        </div>
      </section> */}

      {subscription && (
        <section className="flex items-center justify-between pb-6 border-b border-border">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-headings">
              Auto Renew
            </h2>
            <p className="text-sm text-muted">
              {isAutoRenewEnabled
                ? "Your subscription will be renewed automatically"
                : "Your subscription will not renew automatically"}
            </p>
          </div>
          <button
            onClick={() => setIsAutoRenewModalOpen(true)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${isAutoRenewEnabled ? "bg-bgBlue" : "bg-gray-200 dark:bg-gray-700"}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAutoRenewEnabled ? "translate-x-6" : "translate-x-1"}`}
            />
          </button>
        </section>
      )}

      {/* Billing History & Additional Payment */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="inline-flex rounded-lg border border-border p-1 bg-gray-50 dark:bg-gray-800 w-fit">
            <button
              type="button"
              onClick={() => setBillingTab("billing")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                billingTab === "billing"
                  ? "bg-white dark:bg-gray-900 text-bgBlue shadow-sm"
                  : "text-muted hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              Billing History
            </button>
            <button
              type="button"
              onClick={() => setBillingTab("additional")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                billingTab === "additional"
                  ? "bg-white dark:bg-gray-900 text-bgBlue shadow-sm"
                  : "text-muted hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              Additional Payment
            </button>
          </div>
          {billingTab === "billing" && (
            <button className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg text-xs font-medium text-body hover:bg-gray-50 cursor-pointer shadow-customShadow">
              <Download className="w-3.5 h-3.5" /> Download All
            </button>
          )}
        </div>

        {billingTab === "billing" ? (
          <BillingHistoryTable payments={payments} planName={subscription?.plan?.name || "Premium"} />
        ) : (
          <MyAdditionalPaymentTable />
        )}
      </section>

      <CancelSubscriptionModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelPlan}
        isLoading={isCanceling}
      />
      <AutoRenewConfirmModal
        isOpen={isAutoRenewModalOpen}
        onClose={() => setIsAutoRenewModalOpen(false)}
        onConfirm={handleToggleAutoRenew}
        isLoading={isUpdatingRecurring}
        isEnabling={!isAutoRenewEnabled}
      />
      {subscription && (
        <ChangePlanModal
          isOpen={isChangePlanOpen}
          onClose={() => setIsChangePlanOpen(false)}
          currentPlanName={subscription.plan?.name || ""}
          currentScreenSize={subscription.screenSize ?? 21}
          currentBillingCycle={subscription.billingCycle === "ANNUAL" ? "ANNUAL" : "MONTHLY"}
        />
      )}
    </div>
  );
}
