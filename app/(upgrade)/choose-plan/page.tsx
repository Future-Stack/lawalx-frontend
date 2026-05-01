/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Crown, Loader2, Monitor, Database, Video, LayoutTemplate, ArrowLeft } from "lucide-react";
import { useGetUserProfileQuery } from "@/redux/api/users/userProfileApi";
import { useGetProfileQuery } from "@/redux/api/users/settings/personalApi";
import { useCreatePaymentMutation } from "@/redux/api/subscription/subscription.api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/store/hook";
import { selectCurrentEmail } from "@/redux/features/auth/authSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const plans = [
  {
    title: "Basic",
    description: "For trying out this platform",
    monthlyPrice: 29999,
    yearlyPrice: Math.round(29999 * 12 * 0.85),
    buttonColor: "bg-[#111827] text-white hover:bg-slate-800 shadow-customShadow",
    borderColor: "border-border",
    cardStyle: "bg-white",
  },
  {
    title: "Business",
    description: "Perfect for growing businesses with advanced needs",
    monthlyPrice: 49999,
    yearlyPrice: Math.round(49999 * 12 * 0.85),
    buttonColor: "bg-bgBlue text-white hover:opacity-90 shadow-customShadow",
    borderColor: "border-border",
    cardStyle: "bg-white",
  },
  {
    title: "Premium",
    description: "Perfect for growing businesses with advanced needs",
    monthlyPrice: 59999,
    yearlyPrice: Math.round(59999 * 12 * 0.85),
    buttonColor: "bg-[#7F56D9] text-white hover:opacity-90 shadow-customShadow",
    borderColor: "border-[#7F56D9] border-2",
    cardStyle: "bg-white",
    highlight: true,
  },
];

export default function ChoosePlanPage() {
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(true);
  const [selectedPlanTitle, setSelectedPlanTitle] = useState<string | null>(null);

  const [selectedSize, setSelectedSize] = useState("40 inch");
  const { data: userData } = useGetUserProfileQuery();
  const { data: profileData } = useGetProfileQuery();
  const authEmail = useAppSelector(selectCurrentEmail);
  const [createPayment, { isLoading: isCreatingPayment }] = useCreatePaymentMutation();

  const handleChoosePlan = async (plan: typeof plans[number]) => {
    if (!userData?.data && !profileData?.data) {
      toast.error("Please login to continue");
      return;
    }

    setSelectedPlanTitle(plan.title);

    try {
      const user = profileData?.data || userData?.data;
      const payload = {
        email: authEmail || user?.email || user?.username,
        amount: isAnnual ? plan.yearlyPrice : plan.monthlyPrice,
        transactionId: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        planName: plan.title,
        billingCycle: isAnnual ? "YEARLY" : "MONTHLY",
        deviceLimit: 20,
        storageGB: 10,
        uploadFileLimit: 20,
        durationDays: isAnnual ? 365 : 30,
        subscription: true,
        userId: user.id || user._id,
      };

      const res = await createPayment(payload).unwrap();
      if (res?.data?.url) {
        window.location.href = res.data.url;
      } else {
        toast.success(res.message || "Subscription successful!");
        router.push("/dashboard");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Something went wrong. Please try again.");
      setSelectedPlanTitle(null);
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-[#737373] hover:text-bgBlue transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-white shadow-sm transition-all group-hover:bg-blue-50 group-hover:border-bgBlue/30">
              <ArrowLeft className="w-5 h-5 transition-colors group-hover:text-bgBlue" />
            </div>
            <span className="font-medium text-[16px] transition-colors">Back to Dashboard</span>
          </button>
        </div>

        <div className="">
          <div className="" />
          <div className="relative z-10 text-center mx-auto max-w-3xl mb-12">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center">
              <Crown className="h-8 w-8 text-[#0EA5E9]" />
            </div>
            <h1 className="text-[40px] font-bold leading-tight text-[#171717]" style={{ fontFamily: "Inter" }}>
              Choose Your Plan
            </h1>
            <p className="mt-4 text-[16px] leading-[24px] text-[#737373]" style={{ fontFamily: "Inter" }}>
              Scale your digital signage network with the right plan for your business.
            </p>
          </div>

          <div className="relative z-10 mb-10 flex items-center justify-center gap-4">
            <span className={`text-[16px] font-medium leading-[24px] ${!isAnnual ? "text-[#171717]" : "text-[#737373]"}`}>
              Monthly
            </span>
            <button
              type="button"
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative h-[24px] w-[44px] rounded-full p-1 transition-colors duration-300 ${isAnnual ? "bg-[#22C55E]" : "bg-[#D4D4D4]"} cursor-pointer focus:outline-none`}
              aria-label="Toggle billing cycle"
            >
              <span className={`block h-[16px] w-[16px] rounded-full bg-white shadow transition-all duration-300 ${isAnnual ? "translate-x-[20px]" : "translate-x-0"}`} />
            </button>
            <span className={`text-[16px] font-medium leading-[24px] ${isAnnual ? "text-[#171717]" : "text-[#737373]"}`}>
              Annual<span className="text-[#22C55E] ml-1">(15% off)</span>
            </span>
          </div>

          <div className="grid gap-8 xl:grid-cols-3 justify-items-center">
            {plans.map((plan) => {
              const value = isAnnual
                ? plan.yearlyPrice.toLocaleString("en-NG")
                : plan.monthlyPrice.toLocaleString("en-NG");
              const label = isAnnual ? "/year" : "/month";
              const selected = selectedPlanTitle === plan.title;

              return (
                <div
                  key={plan.title}
                  className={`relative flex w-full flex-col overflow-hidden rounded-[16px] border bg-white transition-all duration-300 ${plan.borderColor} ${selected ? "ring-2 ring-slate-900" : ""}`}>
                  
                  {/* Header Section */}
                  <div className="p-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-4">
                        <h2 className="font-inter text-[18px] font-semibold leading-normal text-[#171717]">{plan.title}</h2>
                        {plan.highlight && (
                          <div className="rounded-full bg-[#7F56D9] px-3 py-1 text-[11px] font-semibold text-white">
                            Most Popular
                          </div>
                        )}
                      </div>
                      <p className="font-inter text-[14px] font-normal leading-[20px] text-[#737373]">{plan.description}</p>
                    </div>
                  </div>

                  <div className="border-t border-border" />

                  {/* Pricing & Selection Section */}
                  <div className="p-6 space-y-6">
                    <Select value={selectedSize} onValueChange={setSelectedSize}>
                      <SelectTrigger className="flex w-full items-center justify-between rounded-[12px] border border-border bg-white px-5 py-[14px] h-auto text-sm font-medium text-[#404040] transition hover:bg-slate-50 focus:ring-0 outline-none">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30 inch">30 inch</SelectItem>
                        <SelectItem value="40 inch">40 inch</SelectItem>
                        <SelectItem value="others">others</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex w-full items-baseline justify-center gap-1 rounded-[8px] bg-[#F0FAFF] px-4 py-4">
                      <span className="font-inter text-[24px] font-semibold leading-normal text-[#171717]">₦{value}</span>
                      <span className="font-inter text-[14px] font-normal leading-[20px] text-[#737373]">{label}</span>
                    </div>
                  </div>

                  {/* Features Section */}
                  <div className="px-6 pb-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4 pt-5">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-5 w-5 text-[#404040]" />
                        <div>
                          <p className="font-inter text-[14px] font-normal leading-[20px] text-[#404040]">Devices</p>
                          <p className="font-inter text-[14px] font-semibold leading-[20px] text-[#171717]">20</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-[#404040]" />
                        <div>
                          <p className="font-inter text-[14px] font-normal leading-[20px] text-[#404040]">Storage</p>
                          <p className="font-inter text-[14px] font-semibold leading-[20px] text-[#171717]">10 GB</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-y border-border py-5">
                      <div className="flex items-center gap-2">
                        <Video className="h-5 w-5 text-[#404040]" />
                        <div>
                          <p className="font-inter text-[14px] font-normal leading-[20px] text-[#404040]">Upload Limits</p>
                          <p className="font-inter text-[14px] font-semibold leading-[20px] text-[#171717]">Max 20 Files</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <LayoutTemplate className="h-5 w-5 text-[#404040]" />
                        <div>
                          <p className="font-inter text-[14px] font-normal leading-[20px] text-[#404040]">Templates</p>
                          <p className="font-inter text-[14px] font-semibold leading-[20px] text-[#171717]">1</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Section */}
                  <div className="mt-auto p-6">
                    <button
                      type="button"
                      onClick={() => handleChoosePlan(plan)}
                      disabled={isCreatingPayment}
                      className={`flex w-full cursor-pointer flex-col items-center justify-center gap-[6px] rounded-[10px] px-4 py-3 text-sm font-semibold transition-all active:scale-[0.98] ${plan.buttonColor}`}
                    >
                      {isCreatingPayment && selectedPlanTitle === plan.title ? (
                        <span className="inline-flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                        </span>
                      ) : (
                        "Get Started"
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom Section with specific high-fidelity styling */}
          <div className="relative z-10 mt-12 overflow-hidden rounded-[24px] border border-border p-6 shadow-sm flex flex-col lg:flex-row items-center gap-10 justify-between add-bg-img !bg-white">
            <div className="relative z-10 flex flex-col items-start gap-6 lg:w-1/2">
              <div>
                <h2 className="font-inter text-[18px] font-semibold leading-normal text-[#171717]">Custom</h2>
                <p className="mt-2 font-inter text-[14px] font-normal leading-[20px] text-[#737373]">
                  Custom solutions for large organizations that requires flexible limits and Enterprise-level scalability and support.
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
                {/* Row 1 */}
                <div className="flex items-center gap-3 pb-5 border-b border-border">
                  <Monitor className="h-5 w-5 text-[#404040]" />
                  <div>
                    <p className="font-inter text-[14px] font-normal leading-[20px] text-[#404040]">Devices</p>
                    <p className="font-inter text-[14px] font-semibold leading-[20px] text-bgBlue">Custom</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pb-5 border-b border-border">
                  <Database className="h-5 w-5 text-[#404040]" />
                  <div>
                    <p className="font-inter text-[14px] font-normal leading-[20px] text-[#404040]">Storage</p>
                    <p className="font-inter text-[14px] font-semibold leading-[20px] text-bgBlue">Custom</p>
                  </div>
                </div>
                {/* Row 2 */}
                <div className="flex items-center gap-3 pt-5 border-b border-border sm:border-b-0 pb-5 sm:pb-0">
                  <Video className="h-5 w-5 text-[#404040]" />
                  <div>
                    <p className="font-inter text-[14px] font-normal leading-[20px] text-[#404040]">Upload Limits</p>
                    <p className="font-inter text-[14px] font-semibold leading-[20px] text-bgBlue">Custom</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-5">
                  <LayoutTemplate className="h-5 w-5 text-[#404040]" />
                  <div>
                    <p className="font-inter text-[14px] font-normal leading-[20px] text-[#404040]">Templates</p>
                    <p className="font-inter text-[14px] font-semibold leading-[20px] text-bgBlue">Custom</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
