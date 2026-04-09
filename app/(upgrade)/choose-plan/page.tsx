"use client";

import { useState } from "react";
import { Crown, Loader2, ArrowLeft } from "lucide-react";
import { useGetUserProfileQuery } from "@/redux/api/users/userProfileApi";
import { useGetProfileQuery } from "@/redux/api/users/settings/personalApi";
import { useCreatePaymentMutation } from "@/redux/api/subscription/subscription.api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/store/hook";
import { selectCurrentEmail } from "@/redux/features/auth/authSlice";

const plans = [
  {
    title: "Trial",
    price: "$0",
    duration: "/14 days",
    description: "Perfect for testing and evaluation",
    features: [
      "2 Devices",
      "1 GB Storage",
      "Basic Content Upload",
      "Email Support",
      "Screen Splitting",
    ],
    unavailable: [
      "Content Creation Tools",
      "Priority Support",
      "Advanced Analytics",
      "API Access",
      "White-label Options",
    ],
    buttonText: "Current Plan",
    buttonStyle: "border",
    recommended: false,
    metadata: {
      deviceLimit: 2,
      storageGB: 1,
      uploadFileLimit: 50,
      durationDays: 14,
      amount: 0,
    }
  },
  {
    title: "Basic",
    price: "$29",
    duration: "/month",
    billed: "Billed annually: ($348/year)",
    description: "Great for small businesses and startups",
    features: [
      "5 Devices",
      "10 GB Storage",
      "Basic Content Upload",
      "Email Support",
      "Screen Splitting",
      "Content Creation Tools",
      "Priority Support",
      "Advanced Analytics",
      "API Access",
      "White-label Options",
    ],
    buttonText: "Choose Basic",
    buttonStyle: "white",
    recommended: false,
    metadata: {
      deviceLimit: 5,
      storageGB: 10,
      uploadFileLimit: 500,
      monthlyAmount: 29,
      yearlyAmount: 348,
    }
  },
  {
    title: "Premium",
    price: "$49",
    duration: "/month",
    billed: "Billed annually: ($588/year)",
    description: "Perfect for growing businesses with advanced needs",
    features: [
      "20 Devices",
      "50 GB Storage",
      "Advanced Content Upload",
      "Priority Support",
      "Screen Splitting",
      "Content Creation Tools",
      "Advanced Analytics",
      { text: "Content AI", badge: "ai" },
      { text: "White-label Options", badge: "border" },
      "Custom Branding",
    ],
    buttonText: "Upgrade to Premium",
    buttonStyle: "black",
    recommended: true,
    metadata: {
      deviceLimit: 20,
      storageGB: 50,
      uploadFileLimit: 2000,
      monthlyAmount: 49,
      yearlyAmount: 588,
    },
    badge: "Recommended",
  },
  {
    title: "Enterprise",
    price: "Custom",
    billed: "Billed annually: ($2388/year)",
    description: "Custom pricing for large organizations",
    features: [
      "Unlimited Devices",
      "Custom Storage",
      "Advanced Content Upload",
      "Dedicated Support",
      "Screen Splitting",
      "Content Creation Tools",
      "Advanced Analytics",
      "API Access",
      "White-label Options",
      "Custom Integrations",
    ],
    buttonText: "Contact Sales",
    buttonStyle: "white",
    recommended: false,
    metadata: {
      deviceLimit: 1000, // Unlimited
      storageGB: 1000,   // Custom
      uploadFileLimit: 10000,
      monthlyAmount: 199, // Custom placeholder
      yearlyAmount: 2388,
    },
    badge: "Custom",
    badgeColor: "purple",
  },
];

export default function ChoosePlanPage() {
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const { data: userData } = useGetUserProfileQuery();
  const { data: profileData } = useGetProfileQuery();
  const authEmail = useAppSelector(selectCurrentEmail);
  const [createPayment, { isLoading: isCreatingPayment }] = useCreatePaymentMutation();

  const handleChoosePlan = async (plan: any) => {
    if (plan.title === "Trial") return;
    if (!userData?.data && !profileData?.data) {
      toast.error("Please login to continue");
      return;
    }

    setSelectedPlan(plan);

    try {
      const user = profileData?.data || userData?.data;
      const payload = {
        email: authEmail || user?.email || user?.username,
        amount: isAnnual ? plan.metadata.yearlyAmount : plan.metadata.monthlyAmount,
        transactionId: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        planName: plan.title,
        billingCycle: isAnnual ? "YEARLY" : "MONTHLY",
        deviceLimit: plan.metadata.deviceLimit,
        storageGB: plan.metadata.storageGB,
        uploadFileLimit: plan.metadata.uploadFileLimit,
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
      setSelectedPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <div className="bg-gray-50 rounded-2xl max-w-6xl w-full p-8 relative">
        {/* Dashboard Navigation Button */}
        <div className="absolute top-4 left-4 sm:left-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 px-4 py-2 bg-bgBlue border border-gray-200 rounded-lg shadow-customShadow text-sm font-semibold text-white hover:bg-blue-600 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <Crown className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Choose Your Plan
          </h2>
          <p className="text-gray-600 mb-4">
            Scale your digital signage network with the right plan for your
            business.
          </p>

          {/* Trial Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm mb-6">
            <Crown className="w-4 h-4" />
            Trial: 12 days left
          </div>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <span
            onClick={() => setIsAnnual(false)}
            className={`text-sm transition-colors ${!isAnnual ? "text-blue-600 font-bold" : "text-gray-400"
              }`}
          >
            Monthly
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={`relative w-12 h-6 rounded-full transition-colors flex items-center p-1 cursor-pointer ${isAnnual ? "bg-blue-500" : "bg-gray-300"
              }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${isAnnual ? "translate-x-6" : "translate-x-0"
                }`}
            ></div>
          </button>
          <span
            onClick={() => setIsAnnual(true)}
            className={`text-sm transition-colors ${isAnnual ? "text-blue-600 font-bold" : "text-gray-400"
              }`}
          >
            Annual
          </span>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`bg-white border-2 rounded-xl p-6 relative transition-all duration-300 ${selectedPlan?.title === plan.title
                ? "border-blue-600 shadow-lg scale-[1.02]"
                : plan.recommended
                  ? "border-blue-500 shadow-sm"
                  : "border-gray-200"
                }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span
                    className={`${plan.badgeColor === "purple"
                      ? "bg-purple-600"
                      : "bg-blue-500"
                      } text-white text-xs px-3 py-1 rounded-full font-medium`}
                  >
                    {plan.badge}
                  </span>
                </div>
              )}

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {plan.title}
              </h3>

              <div className="mb-1">
                <span className="text-4xl font-bold text-gray-900">
                  {plan.price}
                </span>
                {plan.duration && (
                  <span className="text-gray-600 text-sm">{plan.duration}</span>
                )}
              </div>

              {plan.billed && (
                <p className="text-xs text-gray-500 mb-1">{plan.billed}</p>
              )}

              {plan.description && (
                <p className="text-sm text-gray-600 mb-6">
                  {plan.description}
                </p>
              )}

              <button
                onClick={() => handleChoosePlan(plan)}
                disabled={isCreatingPayment || plan.title === "Trial"}
                className={`w-full py-2.5 rounded-lg font-medium mb-6 text-sm flex items-center justify-center gap-2 transition-all ${selectedPlan?.title === plan.title
                  ? "bg-blue-600 text-white border-blue-600 cursor-default"
                  : plan.buttonStyle === "black"
                    ? "bg-gray-900 text-white hover:bg-gray-800 cursor-pointer shadow-sm hover:shadow-md"
                    : plan.buttonStyle === "border"
                      ? "border-2 border-gray-900 text-gray-900 cursor-default opacity-70"
                      : "border-2 border-gray-200 text-gray-900 hover:border-gray-300 cursor-pointer hover:bg-gray-50"
                  } ${isCreatingPayment && selectedPlan?.title === plan.title ? "opacity-90 cursor-not-allowed" : ""}`}
              >
                {isCreatingPayment && selectedPlan?.title === plan.title && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {plan.title === "Trial" ? "Current Plan" :
                  isCreatingPayment && selectedPlan?.title === plan.title ? "Processing..." : plan.buttonText}
              </button>

              <ul className="space-y-2.5 text-sm">
                {plan.features.map((feature, i) => {
                  const isObject = typeof feature === "object";
                  const featureText = isObject ? feature.text : feature;
                  const badge = isObject ? feature.badge : null;

                  return (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-gray-700"
                    >
                      <span
                        className={`mt-0.5 ${badge === "ai" ? "text-blue-500" : "text-green-500"
                          }`}
                      >
                        ✓
                      </span>
                      <span className="flex items-center gap-1.5 flex-wrap">
                        {badge === "ai" && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded font-medium">
                            AI
                          </span>
                        )}
                        {badge === "border" ? (
                          <span className="border border-blue-400 text-blue-600 text-xs px-2 py-0.5 rounded">
                            {featureText}
                          </span>
                        ) : (
                          <span>{featureText}</span>
                        )}
                      </span>
                    </li>
                  );
                })}
                {plan.unavailable?.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-gray-300"
                  >
                    <span className="mt-0.5">✗</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}