"use client";

import { useState } from "react";
import {
  Monitor,
  Cloud,
  FileText,
  LayoutTemplate,
  Info,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Image as ImageIcon,
  Music,
  Video,
} from "lucide-react";
import Image from "next/image";

interface Plan {
  title: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  buttonColor: string;
  borderColor: string;
  cardStyle: string;
  devices: number;
  storage: string;
  templates: number;
  photoLimit: number;
  audioLimit: number;
  videoLimit: number;
  features: string[];
}

interface PaymentGatewaySelectionProps {
  selectedPlan: Plan;
  isAnnual: boolean;
  onBack: () => void;
  onComplete: (gateway: string) => void;
  isLoading: boolean;
}

const gateways = [
  {
    id: "stripe",
    name: "Stripe",
    description: "Credit/Debit cards, Apple Pay, Google Pay",
    logo: "/paymentMethods/Stripe_icon.png",
  },
  {
    id: "paystack",
    name: "Paystack",
    description: "Safe payments using your Paystack account",
    logo: "/paymentMethods/paystack_icon.png",
  },
];

export default function PaymentGatewaySelection({
  selectedPlan,
  isAnnual,
  onBack,
  onComplete,
  isLoading,
}: PaymentGatewaySelectionProps) {
  const [selectedGateway, setSelectedGateway] = useState("stripe");
  const price = isAnnual ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice;
  // const priceLabel = isAnnual ? "/yr" : "/mo";
  const subtotal = price;
  const taxes = 0;
  const total = subtotal + taxes;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-12">
        <h1 className="text-[32px] font-bold text-headings mb-2">
          Choose Your Preferred Payment Gateway
        </h1>
        <p className="text-muted text-[16px]">
          Select a payment provider to continue. Your information is encrypted
          and securely processed.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
        {/* Left Side: Payment Methods */}
        <div className="lg:col-span-7 space-y-6">
          <div className="mb-8">
            <h2 className="text-[24px] font-bold text-headings mb-1">
              Select Payment Method
            </h2>
            <p className="text-muted text-[14px]">
              Choose your preferred gateway to complete your subscription.
            </p>
          </div>

          <div className="space-y-4">
            {gateways.map((gateway) => (
              <div
                key={gateway.id}
                onClick={() => setSelectedGateway(gateway.id)}
                className={`relative flex items-center justify-between p-5 rounded-[16px] border-2 cursor-pointer transition-all duration-300 bg-navbarBg ${
                  selectedGateway === gateway.id
                    ? "border-primary-action shadow-sm"
                    : "border-color hover:border-primary-action/50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-White rounded-lg border border-color overflow-hidden">
                    <Image
                      src={gateway.logo}
                      alt={gateway.name}
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-headings">
                      {gateway.name}
                    </h3>
                    <p className="text-[14px] text-muted">
                      {gateway.description}
                    </p>
                  </div>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedGateway === gateway.id
                      ? "border-primary-action"
                      : "border-color"
                  }`}
                >
                  {selectedGateway === gateway.id && (
                    <div className="w-3 h-3 rounded-full bg-primary-action" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onComplete(selectedGateway)}
            disabled={isLoading}
            className="w-full mt-8 flex items-center justify-center gap-2 py-4 rounded-[12px] bg-primary-action text-white text-[16px] font-bold shadow-lg hover:cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              `Complete Payment · ₦${total.toLocaleString("en-NG")}`
            )}
          </button>

          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted hover:cursor-pointer dark:hover:text-headings transition-colors mt-4 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Change Plan</span>
          </button>
        </div>

        {/* Right Side: Order Summary */}
        <div className="lg:col-span-5">
          <div className="rounded-[24px] border border-color bg-navbarBg p-6 shadow-sm">
            <h2 className="text-[24px] font-bold text-headings mb-5">
              Order Summary
            </h2>

            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-[16px] font-bold text-headings">
                  {selectedPlan.title} Plan
                </h3>
                <p className="text-[14px] text-body mt-1">
                  {isAnnual ? "Yearly Billing" : "Monthly Billing"}
                </p>
              </div>
              <p className="text-[16px] font-bold text-headings">
                ₦{price.toLocaleString("en-NG")}/mo
              </p>
            </div>

            <div className="space-y-4 mb-4 pt-4 border-t border-color">
              <div className="flex items-center gap-3 text-headings">
                <Monitor className="w-5 h-5 text-primary-action" />
                <span className="text-[14px] font-medium text-body">
                  {selectedPlan.devices} Devices
                </span>
              </div>
              <div className="flex items-center gap-3 text-headings">
                <Cloud className="w-5 h-5 text-primary-action" />
                <span className="text-[14px] font-medium text-body">
                  {selectedPlan.storage} Storage
                </span>
              </div>
                <div className="flex items-center gap-3 text-headings">
                <LayoutTemplate className="w-5 h-5 text-primary-action" />
                <span className="text-[14px] font-medium text-body">
                  {selectedPlan.templates} Templates
                </span>
              </div>
              <div className="pt-2">
                <p className="text-[12px] font-bold text-muted mb-2 uppercase tracking-wider">
                  UPLOAD LIMITS
                </p>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-primary-action" />
                    <span className="text-[13px] font-medium text-body">
                      {selectedPlan.photoLimit} Photo
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Music className="w-4 h-4 text-primary-action" />
                    <span className="text-[13px] font-medium text-body">
                      {selectedPlan.audioLimit} Audio
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-primary-action" />
                    <span className="text-[13px] font-medium text-body">
                      {selectedPlan.videoLimit} Video
                    </span>
                  </div>
                </div>
              </div>
            
            </div>

            <div className="space-y-4 pt-6 ">
              <div className="flex justify-between text-[14px]">
                <span className="text-body">Subtotal</span>
                <span className="text-body font-bold">
                  ₦{subtotal.toLocaleString("en-NG")}
                </span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-body">Taxes (0%)</span>
                <span className="text-body font-bold">
                  ₦{taxes.toFixed(2)}
                </span>
              </div>

              <div className="pt-6 mt-2 border-t border-color flex justify-between items-start">
                <span className="text-[24px] font-bold text-headings">
                  Total
                </span>
                <div className="flex items-center justify-between gap-2">
                 
                  <span className="text-[24px] font-extrabold text-primary-action leading-[1.1] text-right">
                    ₦
                    {
                      Math.round(total * 0.8)
                        .toLocaleString("en-NG")
                        .split(",")[0]
                    }
                    ,
                    {
                      Math.round(total * 0.8)
                        .toLocaleString("en-NG")
                        .split(",")[1]
                    }
                  </span>
                   <span className="text-[16px] font-extrabold text-muted mt-2 line-through">
                    ₦{subtotal.toLocaleString("en-NG")}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <input
                type="text"
                placeholder="Coupon Applied - 20% Off"
                className="flex-1 px-4 py-3 rounded-xl border border-color bg-input text-muted text-[15px] outline-none"
                readOnly
              />
              <button className="px-8 py-3 bg-cardBackground2 text-headings font-bold rounded-xl text-[15px] hover:opacity-80 hover:cursor-pointer transition-colors">
                Apply
              </button>
            </div>
            <div className="my-4">
              <p className="text-muted text-[14px]">
                Discount will be applied instantly at checkout.
              </p>
            </div>

            <div className="mt-2 p-4 bg-success-bg rounded-xl flex items-center gap-2 text-success text-[15px] font-medium border border-success">
              <CheckCircle2 className="w-5 h-5" />
              <span>Coupon Applied - 20% Off</span>
            </div>
          </div>

          <div className="mt-6 p-5 bg-cardBackground2 rounded-xl flex gap-4 text-body text-[14px] leading-[22px]">
            <Info className="w-6 h-6 text-primary-action shrink-0" />
            <p>
              Your subscription will automatically renew at ₦
              {price.toLocaleString("en-NG")}/mo. You can cancel any time in{" "}
              <span className="text-primary-action font-bold cursor-pointer hover:underline">
                Billing Settings
              </span>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
