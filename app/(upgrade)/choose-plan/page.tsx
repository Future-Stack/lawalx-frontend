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
import PlanCard from "./_components/PlanCard";
import PaymentGatewaySelection from "./_components/PaymentGatewaySelection";

const plans = [
  {
    title: "Basic",
    description: "For trying out this platform",
    monthlyPrice: 29999,
    yearlyPrice: Math.round(29999 * 12 * 0.85),
    buttonColor: "bg-[#111827] text-white hover:bg-slate-800 shadow-customShadow",
    borderColor: "border-border",
    cardStyle: "bg-white",
    devices: 5,
    storage: "2 GB",
    templates: 1,
    photoLimit: 2,
    audioLimit: 5,
    videoLimit: 2,
    features: ["5 Devices", "2 GB Storage", "Basic Analytics", "Email Support"],
  },
  {
    title: "Business",
    description: "Perfect for growing businesses with advanced needs",
    monthlyPrice: 49999,
    yearlyPrice: Math.round(49999 * 12 * 0.85),
    buttonColor: "bg-bgBlue text-white hover:opacity-90 shadow-customShadow",
    borderColor: "border-border",
    cardStyle: "bg-white",
    devices: 10,
    storage: "5 GB",
    templates: 1,
    photoLimit: 3,
    audioLimit: 7,
    videoLimit: 3,
    features: ["10 Devices", "5 GB Storage", "Basic Analytics", "Email Support"],
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
    devices: 20,
    storage: "10 GB",
    templates: 1,
    photoLimit: 5,
    audioLimit: 10,
    videoLimit: 5,
    features: ["20 Devices", "10 GB Storage", "Basic Analytics", "Email Support"],
  },
];

export default function ChoosePlanPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isAnnual, setIsAnnual] = useState(true);
  const [selectedPlanTitle, setSelectedPlanTitle] = useState<string | null>(null);

  const [selectedSize, setSelectedSize] = useState("40 inches");
  const { data: userData } = useGetUserProfileQuery();
  const { data: profileData } = useGetProfileQuery();
  const authEmail = useAppSelector(selectCurrentEmail);
  const [createPayment, { isLoading: isCreatingPayment }] = useCreatePaymentMutation();

  const handleChoosePlan = (plan: any) => {
    if (!userData?.data && !profileData?.data) {
      toast.error("Please login to continue");
      return;
    }
    setSelectedPlan(plan);
    setSelectedPlanTitle(plan.title);
    setStep(2);
  };

  const handleCompletePayment = async (gateway: string) => {
    try {
      const user = profileData?.data || userData?.data;
      const payload = {
        email: authEmail || user?.email || user?.username,
        amount: isAnnual ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice,
        transactionId: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        planName: selectedPlan.title,
        billingCycle: isAnnual ? "YEARLY" : "MONTHLY",
        deviceLimit: selectedPlan.devices,
        storageGB: parseInt(selectedPlan.storage),
        uploadFileLimit: 20,
        durationDays: isAnnual ? 365 : 30,
        subscription: true,
        userId: user.id || user._id,
        gateway: gateway,
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
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        {step === 1 ? (
          <>
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
                {plans.map((plan) => (
                  <PlanCard
                    key={plan.title}
                    plan={plan}
                    isAnnual={isAnnual}
                    onChoose={handleChoosePlan}
                    isLoading={false}
                    isSelected={selectedPlanTitle === plan.title}
                    selectedSize={selectedSize}
                    onSizeChange={setSelectedSize}
                  />
                ))}
              </div>

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
          </>
        ) : (
          <PaymentGatewaySelection
            selectedPlan={selectedPlan}
            isAnnual={isAnnual}
            onBack={() => setStep(1)}
            onComplete={handleCompletePayment}
            isLoading={isCreatingPayment}
          />
        )}
      </div>
    </div>
  );
}
