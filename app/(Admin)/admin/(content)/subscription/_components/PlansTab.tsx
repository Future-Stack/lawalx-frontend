"use client";

import React, { useState, useEffect } from "react";
import {
  useGetPlansQuery,
  PlanItem,
} from "@/redux/api/admin/payments/plans/plansApi";
import {
  useGetYearlyDiscountsQuery,
  useUpdateDiscountMutation,
  useUpdateDiscountStatusMutation,
} from "@/redux/api/admin/payments/discount/discountApi";
import {
  Monitor,
  Database,
  UploadCloud,
  Layout,
  Edit,
  Loader2,
  Save,
} from "lucide-react";
import CreatePlanDialog from "./CreatePlanDialog";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { getCurrencySymbol } from "@/lib/currencyUtils";
import SubscriptionTabLayout from "./SubscriptionTabLayout";

const PlansTab = () => {
  const { data, isLoading, isError } = useGetPlansQuery();
  const { data: discountData, isLoading: isDiscountLoading } =
    useGetYearlyDiscountsQuery();
  const [updateDiscount, { isLoading: isUpdatingDiscount }] =
    useUpdateDiscountMutation();
  const [updateDiscountStatus, { isLoading: isUpdatingStatus }] =
    useUpdateDiscountStatusMutation();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanItem | null>(null);
  const [yearlyDiscount, setYearlyDiscount] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState("30");
  const [allPlansActive, setAllPlansActive] = useState(true);

  const currency = useSelector((state: RootState) => state.settings.currency);
  const currencySymbol = getCurrencySymbol(currency);

  const plans = data?.data || [];
  const discountInfo = discountData?.data?.[0];

  useEffect(() => {
    if (discountInfo) {
      setYearlyDiscount(discountInfo.hasYearlyDiscount);
      setDiscountPercentage(discountInfo.yearlyDiscountRate.toString());
    }
  }, [discountInfo]);

  const handleEditClick = (plan: PlanItem) => {
    setSelectedPlan(plan);
    setEditModalOpen(true);
  };

  const formatPrice = (price: string) => {
    return `${currencySymbol}${parseFloat(price).toLocaleString()}`;
  };

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

  return (
    <SubscriptionTabLayout
      title="All Plans"
      subtitle="Your plan has been upgraded successfully. New features are now available."
      actionButton={
        <button
          onClick={() => setAllPlansActive(!allPlansActive)}
          aria-label="Toggle all plans status"
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${allPlansActive ? "bg-[#3B82F6]" : "bg-gray-200 dark:bg-gray-700"}`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${allPlansActive ? "translate-x-5" : "translate-x-0"}`}
          />
        </button>
      }
    >
      <div className="space-y-8">
        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted" />
            </div>
          ) : isError ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <p className="text-red-500">
                Error loading plans. Please try again.
              </p>
            </div>
          ) : plans.length === 0 ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <p className="text-muted">No plans found.</p>
            </div>
          ) : (
            plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-navbarBg rounded-2xl border border-borderGray p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
              >
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-headings mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted line-clamp-2">
                    {plan.description}
                  </p>
                </div>

                <div className="flex items-baseline justify-between mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-headings">
                      {formatPrice(plan.price)}
                    </span>
                    <span className="text-sm text-muted">/month</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8 grow">
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-muted" />
                      <div>
                        <div className="text-[10px] text-muted uppercase font-bold">
                          Devices
                        </div>
                        <div className="text-sm font-semibold text-headings">
                          {plan.deviceLimit}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-muted" />
                      <div>
                        <div className="text-[10px] text-muted uppercase font-bold">
                          Storage
                        </div>
                        <div className="text-sm font-semibold text-headings">
                          {plan.storageLimitGb} GB
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <UploadCloud className="w-4 h-4 text-muted" />
                      <div>
                        <div className="text-[10px] text-muted uppercase font-bold">
                          File Limit
                        </div>
                        <div className="text-sm font-semibold text-headings">
                          {plan.fileLimit}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Layout className="w-4 h-4 text-muted" />
                      <div>
                        <div className="text-[10px] text-muted uppercase font-bold">
                          Templates
                        </div>
                        <div className="text-sm font-semibold text-headings">
                          N/A
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleEditClick(plan)}
                  className="w-full py-2.5 border border-border rounded-lg font-medium text-headings flex items-center justify-center gap-2 transition-colors shadow-customShadow cursor-pointer hover:text-bgBlue"
                >
                  <Edit className="w-4 h-4" /> Edit
                </button>
              </div>
            ))
          )}
        </div>

        {/* Yearly Discount Section */}
        <div className="bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 rounded-2xl p-6">
          {isDiscountLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-6 h-6 animate-spin text-muted" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-orange-900 dark:text-orange-200 font-bold">
                  Yearly Discount
                </h3>
                <button
                  onClick={handleToggleDiscount}
                  disabled={isUpdatingStatus}
                  aria-label="Toggle yearly discount"
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                    yearlyDiscount ? "bg-bgBlue" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      yearlyDiscount ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
              <p className="text-sm text-orange-800/70 dark:text-orange-300/60 mb-6">
                Offer a discount for yearly billing.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1 w-full space-y-2">
                  <label
                    htmlFor="discount-percentage"
                    className="text-sm font-bold text-headings"
                  >
                    Discount Percentage %
                  </label>
                  <div className="relative">
                    <input
                      id="discount-percentage"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="e.g. 30"
                      value={discountPercentage}
                      onChange={(e) => setDiscountPercentage(e.target.value)}
                      className="w-full bg-white dark:bg-gray-900 border border-borderGray dark:border-gray-700 rounded-lg py-3 px-4 focus:outline-none text-headings"
                      disabled={isUpdatingDiscount}
                    />
                  </div>
                </div>
                <button
                  onClick={handleSaveDiscount}
                  disabled={isUpdatingDiscount}
                  className="h-[46px] w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-bgBlue text-white rounded-lg font-medium shadow-customShadow cursor-pointer hover:bg-bgBlue/90 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdatingDiscount ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Discount
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <CreatePlanDialog
        open={editModalOpen}
        setOpen={setEditModalOpen}
        editMode={true}
        initialData={selectedPlan}
      />
    </SubscriptionTabLayout>
  );
};

export default PlansTab;
