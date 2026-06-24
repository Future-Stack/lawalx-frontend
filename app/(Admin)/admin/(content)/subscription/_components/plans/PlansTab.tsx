import React, { useState, useEffect, useMemo } from "react";
import {
  useGetYearlyDiscountsQuery,
  useUpdateDiscountMutation,
  useUpdateDiscountStatusMutation,
} from "@/redux/api/admin/payments/discount/discountApi";
import {
  BillingFilter,
  PlanItem,
  useGetPlansQuery,
  useGetActiveScreenSizesQuery,
  useLazyGetSinglePlanQuery,
} from "@/redux/api/admin/payments/plans/plansApi";
import { toast } from "sonner";
import PlanCard from "./_components/PlanCard";
import EditPlanDialog from "./_components/EditPlanDialog";
import BaseSelect from "@/common/BaseSelect";
import SubscriptionTabLayout from "../SubscriptionTabLayout";
import { Loader2 } from "lucide-react";
import { sortPlansByTier } from "@/lib/planSort";

const PlansTab = () => {
  const { data: discountData } = useGetYearlyDiscountsQuery();
  const [updateDiscount] = useUpdateDiscountMutation();
  const [updateDiscountStatus] = useUpdateDiscountStatusMutation();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanItem | null>(null);
  const [yearlyDiscount, setYearlyDiscount] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState("30");
  const [screenSize, setScreenSize] = useState<string>("all");
  const [billing, setBilling] = useState<BillingFilter>("MONTHLY");
  const [getSinglePlan] = useLazyGetSinglePlanQuery();

  // Fetch Screen Sizes
  const { data: screenSizesData, isLoading: isLoadingScreens } =
    useGetActiveScreenSizesQuery();

  const screenSizes = useMemo(
    () => screenSizesData?.data || [],
    [screenSizesData?.data],
  );

  // Fetch Plans based on Screen Size + Billing
  const { data: plansData, isLoading: isLoadingPlans } = useGetPlansQuery({
    screenSize: screenSize === "all" ? undefined : screenSize,
    billing,
  });
  const plans = useMemo(() => {
    const rawPlans = plansData?.data || [];
    return sortPlansByTier(rawPlans);
  }, [plansData?.data]);

  const discountInfo = discountData?.data?.[0];

  useEffect(() => {
    if (discountInfo) {
      setYearlyDiscount(discountInfo.hasYearlyDiscount);
      setDiscountPercentage(discountInfo.yearlyDiscountRate.toString());
    }
  }, [discountInfo]);

  const handleToggleDiscount = async () => {
    if (!discountInfo?.id) {
      toast.error("Discount configuration not found");
      return;
    }

    try {
      await updateDiscountStatus({
        id: discountInfo.id,
        data: { hasYearlyDiscount: !yearlyDiscount },
      }).unwrap();
      toast.success(
        `Yearly discount ${!yearlyDiscount ? "enabled" : "disabled"} successfully!`,
      );
      setYearlyDiscount(!yearlyDiscount);
    } catch (error) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to update discount status");
    }
  };

  const handleSaveDiscount = async () => {
    if (!discountInfo?.id) {
      toast.error("Discount configuration not found");
      return;
    }

    const rate = parseFloat(discountPercentage);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast.error("Please enter a valid discount percentage (0-100)");
      return;
    }

    try {
      await updateDiscount({
        id: discountInfo.id,
        data: {
          yearlyDiscountRate: rate,
          discountType: "PERCENTAGE",
        },
      }).unwrap();
      toast.success("Discount updated successfully!");
    } catch (error) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to update discount");
    }
  };

  const handleEdit = async (plan: PlanItem) => {
    try {
      const singlePlanRes = await getSinglePlan(plan.id).unwrap();
      setSelectedPlan(singlePlanRes.data);
      setEditModalOpen(true);
    } catch (error) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to load plan details");
    }
  };

  const formatPrice = (price: number, currency: string) => {
    const symbol =
      currency === "NGN" ? "₦" : currency === "USD" ? "$" : currency;
    return `${symbol}${price.toLocaleString()}/mo`;
  };

  return (
    <SubscriptionTabLayout
      title="All Plans"
      subtitle="Your plan has been upgraded successfully. New features are now available."
    >
      <div className="space-y-6 sm:space-y-8 px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-full lg:max-w-[580px]">
          {/* Screen Size Selector Card */}
          <div className="w-full rounded-2xl border border-border bg-navbarBg p-4 sm:rounded-[24px] sm:p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-[16px] font-bold text-headings">
                  Screen Size
                </h3>
                <p className="text-[12px] text-muted">
                  Select the screen sizes you need.
                </p>
              </div>
              {isLoadingScreens ? (
                <div className="flex items-center gap-2 text-sm text-muted">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading sizes...
                </div>
              ) : (
                <BaseSelect
                  placeholder="Select Screen Size"
                  options={[
                    { label: "None", value: "all" },
                    ...screenSizes.map((s) => ({
                      label: `${s.size} inches`,
                      value: s.size.toString(),
                    })),
                  ]}
                  value={screenSize}
                  onChange={setScreenSize}
                  showLabel={false}
                />
              )}
            </div>
          </div>

          {/* Billing Selector Card */}
          <div className="w-full rounded-2xl border border-border bg-navbarBg p-4 sm:rounded-[24px] sm:p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-[16px] font-bold text-headings">
                  Billing Type
                </h3>
                <p className="text-[12px] text-muted">
                  Filter plans by billing cycle.
                </p>
              </div>
              <BaseSelect
                placeholder="Select Billing"
                options={[
                  { label: "Monthly", value: "MONTHLY" },
                  { label: "Yearly", value: "YEARLY" },
                ]}
                value={billing}
                onChange={(value) => setBilling(value as BillingFilter)}
                showLabel={false}
              />
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {isLoadingPlans ? (
            <div className="col-span-full flex flex-col items-center justify-center gap-4 py-12 text-muted">
              <Loader2 className="w-8 h-8 animate-spin text-bgBlue" />
              <p>Fetching plans...</p>
            </div>
          ) : plans.length > 0 ? (
            plans.map((plan) => (
              <PlanCard
                key={plan.id}
                name={plan.name}
                price={formatPrice(plan.price, plan.currency)}
                discount={
                  plan.yearlyDiscount.hasYearlyDiscount
                    ? `-${plan.yearlyDiscount.yearlyDiscountRate}% Yearly`
                    : ""
                }
                devices={plan.deviceLimit.toString()}
                storage={`${plan.storageLimitGb} GB`}
                templates={plan.templateLimit.toString()}
                limits={{
                  photo: plan.photoLimit.toString(),
                  audio: plan.audioLimit.toString(),
                  video: plan.videoLimit.toString(),
                }}
                features={plan.features || []}
                onEdit={() => handleEdit(plan)}
              />
            ))
          ) : (
            <div className="col-span-full rounded-2xl border border-dashed border-border bg-bgGray px-4 py-10 text-center text-muted dark:bg-gray-800/40 sm:rounded-[24px] sm:py-12">
              No plans found for the selected filters.
            </div>
          )}
        </div>

        {/* Yearly Discount Configuration Card */}
        <div className="rounded-2xl border border-border bg-cardBackground2 p-4 space-y-6 sm:rounded-[24px] sm:p-6 sm:space-y-8 md:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div className="space-y-1 min-w-0 flex-1">
              <h3 className="text-base font-bold text-headings sm:text-[18px]">
                Yearly Discount
              </h3>
              <p className="text-sm text-muted sm:text-[14px]">
                Offer a discount for yearly billing.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={yearlyDiscount ? "true" : "false"}
              onClick={handleToggleDiscount}
              className={`relative inline-flex h-7 w-12 shrink-0 self-start cursor-pointer items-center rounded-full transition-colors duration-200 sm:self-center ${
                yearlyDiscount ? "bg-bgBlue" : "bg-borderGray dark:bg-gray-700"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                  yearlyDiscount ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="space-y-3">
            <label
              htmlFor="discount-percentage"
              className="text-[14px] font-bold text-headings"
            >
              Discount Percentage %
            </label>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <input
                  id="discount-percentage"
                  type="number"
                  title="Discount Percentage"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(e.target.value)}
                  className="w-full rounded-xl border border-border bg-bgGray px-4 py-3.5 text-[16px] text-headings transition-all focus:outline-none focus:ring-1 focus:ring-bgBlue dark:bg-gray-800"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() =>
                      setDiscountPercentage((prev) =>
                        (parseInt(prev) + 1).toString(),
                      )
                    }
                    className="text-muted transition-colors hover:text-headings"
                  >
                    <svg
                      width="10"
                      height="6"
                      viewBox="0 0 10 6"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 5L5 1L9 5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDiscountPercentage((prev) =>
                        Math.max(0, parseInt(prev) - 1).toString(),
                      )
                    }
                    className="text-muted transition-colors hover:text-headings"
                  >
                    <svg
                      width="10"
                      height="6"
                      viewBox="0 0 10 6"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 1L5 5L1 1"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSaveDiscount}
                className="w-full cursor-pointer rounded-xl bg-bgBlue px-6 py-3 font-bold text-white shadow-sm transition-all hover:bg-blue-500 sm:w-auto sm:px-8"
              >
                Update
              </button>
            </div>
          </div>
        </div>

        <EditPlanDialog
          open={editModalOpen}
          setOpen={setEditModalOpen}
          initialData={selectedPlan}
        />
      </div>
    </SubscriptionTabLayout>
  );
};

export default PlansTab;
