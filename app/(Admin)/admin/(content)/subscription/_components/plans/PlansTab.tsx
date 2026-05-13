/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import {
  useGetYearlyDiscountsQuery,
  useUpdateDiscountMutation,
  useUpdateDiscountStatusMutation,
} from "@/redux/api/admin/payments/discount/discountApi";
import { toast } from "sonner";
import PlanCard from "./_components/PlanCard";
import EditPlanDialog from "./_components/EditPlanDialog";
import BaseSelect from "@/common/BaseSelect";
import SubscriptionTabLayout from "../SubscriptionTabLayout";

const staticPlans = [
  {
    id: "basic",
    name: "Basic",
    price: "₦29,999/mo",
    discount: "-10% Yearly",
    devices: "5",
    storage: "10 GB",
    templates: "1",
    limits: { photo: "5", audio: "10", video: "5" },
    features: [
      "5 Devices",
      "10 GB Storage",
      "Basic Analytics",
      "Email Support",
    ],
  },
  {
    id: "business",
    name: "Business",
    price: "₦49,999/mo",
    discount: "-10% Yearly",
    devices: "20",
    storage: "50 GB",
    templates: "1",
    limits: { photo: "5", audio: "10", video: "5" },
    features: [
      "20 Devices",
      "50 GB Storage",
      "Advanced Analytics",
      "Priority Support",
      "Content Creation Tools",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: "₦59,999/mo",
    discount: "-10% Yearly",
    devices: "100",
    storage: "500 GB",
    templates: "1",
    limits: { photo: "5", audio: "10", video: "5" },
    features: [
      "Unlimited Devices",
      "Unlimited Storage",
      "24/7 Dedicated Support",
      "Custom Integrations",
      "SLA Agreement",
    ],
  },
];

const PlansTab = () => {
  const { data: discountData } = useGetYearlyDiscountsQuery();
  const [updateDiscount] = useUpdateDiscountMutation();
  const [updateDiscountStatus] = useUpdateDiscountStatusMutation();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [yearlyDiscount, setYearlyDiscount] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState("30");
  const [screenSize, setScreenSize] = useState("42 inches");

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

  const handleEdit = (plan: any) => {
    setSelectedPlan(plan);
    setEditModalOpen(true);
  };

  return (
    <SubscriptionTabLayout
      title="All Plans"
      subtitle="Your plan has been upgraded successfully. New features are now available."
    >
      <div className="space-y-8">
        {/* Screen Size Selector Card */}
        <div className="bg-white dark:bg-gray-900 border border-[#F2F4F7] dark:border-gray-800 rounded-[24px] p-6 max-w-[280px]">
          <div className="space-y-4">
            <div>
              <h3 className="text-[16px] font-bold text-headings">
                Screen Size
              </h3>
              <p className="text-[#667085] text-[12px]">
                Select the screen sizes you need.
              </p>
            </div>
            <BaseSelect
              options={[
                { label: "42 inches", value: "42 inches" },
                { label: "55 inches", value: "55 inches" },
                { label: "65 inches", value: "65 inches" },
              ]}
              value={screenSize}
              onChange={setScreenSize}
              showLabel={false}
            />
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {staticPlans.map((plan) => (
            <PlanCard key={plan.id} {...plan} onEdit={() => handleEdit(plan)} />
          ))}
        </div>

        {/* Yearly Discount Configuration Card */}
        <div className="bg-[#FFF9F5] dark:bg-gray-900/40 border border-[#F2F4F7] dark:border-gray-800 rounded-[24px] p-8 space-y-8">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h3 className="text-[18px] font-bold text-[#7A271A] dark:text-orange-400">
                Yearly Discount
              </h3>
              <p className="text-[#7A271A]/70 dark:text-orange-300/70 text-[14px]">
                Offer a discount for yearly billing.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={yearlyDiscount ? "true" : "false"}
              onClick={handleToggleDiscount}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 cursor-pointer ${
                yearlyDiscount ? "bg-[#00A3FF]" : "bg-gray-300"
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
              className="text-[14px] font-bold text-[#7A271A] dark:text-orange-400"
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
                  className="w-full bg-white dark:bg-gray-950 border border-[#D0D5DD] dark:border-gray-800 rounded-xl px-4 py-3.5 text-[16px] text-headings focus:outline-none focus:ring-1 focus:ring-[#00A3FF] transition-all"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() =>
                      setDiscountPercentage((prev) =>
                        (parseInt(prev) + 1).toString(),
                      )
                    }
                    className="text-gray-400 hover:text-gray-600 transition-colors"
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
                    className="text-gray-400 hover:text-gray-600 transition-colors"
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
                className="px-8 py-3 bg-[#00A3FF] text-white rounded-xl font-bold hover:bg-[#00A3FF]/90 transition-all shadow-sm cursor-pointer"
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
