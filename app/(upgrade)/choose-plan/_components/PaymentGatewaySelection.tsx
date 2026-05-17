
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Monitor,
  Cloud,
  Info,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Image as ImageIcon,
  Music,
  Video,
  Headphones,
  Ruler,
} from "lucide-react";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserPlan } from "@/redux/api/users/plan/plan.type";
import { formatAmount } from "@/lib/currencyUtils";
import { formatPlanName } from "../_lib/planUi";
import { useGetActiveTaxRegionsQuery } from "@/redux/api/users/tax/tax.api";
import { useVerifyCouponMutation } from "@/redux/api/users/plan/plan.api";
import type { CouponData } from "@/redux/api/users/plan/plan.type";
import { toast } from "sonner";

interface PaymentGatewaySelectionProps {
  selectedPlan: UserPlan;
  /** Screen size chosen on plan step (e.g. "40 inches") — shown in order summary per design */
  selectedSize: string;
  selectedScreenSize: number;
  isAnnual: boolean;
  onBack: () => void;
  onComplete: (gateway: "stripe" | "paystack", country: string, couponCode?: string) => void;
  isLoading: boolean;
}

const gateways: Array<{
  id: "stripe" | "paystack";
  name: string;
  description: string;
  logo: string;
}> = [
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


function formatMoney(amount: number, currency: string, withDecimals = false) {
  if (withDecimals) {
    const symbol = currency === "NGN" ? "₦" : "$";
    return `${symbol}${amount.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return formatAmount(amount, currency);
}

export default function PaymentGatewaySelection({
  selectedPlan,
  selectedSize,
  selectedScreenSize,
  isAnnual,
  onBack,
  onComplete,
  isLoading,
}: PaymentGatewaySelectionProps) {
  const [selectedGateway, setSelectedGateway] = useState<"stripe" | "paystack">(
    "stripe",
  );
  const [country, setCountry] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [verifiedCouponData, setVerifiedCouponData] = useState<CouponData | null>(null);
  const [verifyCoupon, { isLoading: isVerifyingCoupon }] = useVerifyCouponMutation();
  const { data: taxRes, isLoading: isTaxLoading } = useGetActiveTaxRegionsQuery();

  const taxRegions = useMemo(() => taxRes?.data ?? [], [taxRes?.data]);

  useEffect(() => {
    if (country) return;
    if (taxRegions.length > 0) {
      setCountry(taxRegions[0].region);
    }
  }, [country, taxRegions]);

  const price = selectedPlan.price;
  const currency = selectedPlan.currency;
  const priceSuffix = isAnnual ? "/yr" : "/mo";
  const subtotal = verifiedCouponData?.originalPrice ?? price;
  const planTitle = formatPlanName(selectedPlan.name);
  const discountedTotal = verifiedCouponData
    ? verifiedCouponData.discountPrice
    : subtotal;
  const selectedRegion = taxRegions.find((region) => region.region === country);
  const taxRate = Number(selectedRegion?.taxRate ?? 0);
  const taxAmount = Number(((discountedTotal * taxRate) / 100).toFixed(2));
  const total = Number((discountedTotal + taxAmount).toFixed(2));

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    try {
      const billing = isAnnual ? "YEARLY" : "MONTHLY";
      const normalizedCode = couponInput.trim().toUpperCase();
      const res = await verifyCoupon({
        code: normalizedCode,
        planId: selectedPlan.id,
        billing,
        screenSize: selectedScreenSize,
      }).unwrap();

      if (res.success) {
        setVerifiedCouponData(res.data);
        setCouponApplied(true);
        toast.success(res.message || "Coupon applied successfully");
      } else {
        toast.error(res.message || "Failed to verify coupon");
      }
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Invalid coupon code");
    }
  };

  const handleComplete = () => {
    if (!country) return;
    const couponCode = couponApplied && verifiedCouponData?.coupon?.code ? verifiedCouponData.coupon.code : undefined;
    onComplete(selectedGateway, country, couponCode);
  };

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
            onClick={handleComplete}
            disabled={isLoading || !country}
            className="w-full mt-8 flex items-center justify-center gap-2 py-4 rounded-[12px] bg-primary-action text-white text-[16px] font-bold shadow-lg hover:cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              `Complete Payment · ${formatMoney(total, currency)}`
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

        {/* Right Side: Order Summary (matches design reference) */}
        <div className="lg:col-span-5">
          <div className="rounded-[24px] border border-color bg-navbarBg p-6 shadow-sm">
            <h2 className="text-[24px] font-bold text-headings mb-5">
              Order Summary
            </h2>

            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="text-[16px] font-bold text-headings">
                  {planTitle} Plan
                </h3>
                <p className="text-[14px] text-muted mt-1">
                  {isAnnual ? "Yearly Billing" : "Monthly Billing"}
                </p>
              </div>
              <p className="text-[16px] font-bold text-headings shrink-0 text-right">
                {formatMoney(price, currency)}
                {priceSuffix}
              </p>
            </div>

            <hr className="border-color my-5" />

            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger
                className="h-12 w-full rounded-xl border border-color bg-navbarBg text-[14px] font-medium text-headings"
                disabled={isTaxLoading || taxRegions.length === 0}
              >
                <SelectValue placeholder="Country Any" />
              </SelectTrigger>
              <SelectContent>
                {taxRegions.map((region) => (
                  <SelectItem key={region.id} value={region.region}>
                    {region.region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="mt-5 space-y-4">
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5 shrink-0 text-primary-action" />
                <span className="text-[14px] font-medium text-body">
                  {selectedPlan.deviceLimit} Devices
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Cloud className="w-5 h-5 shrink-0 text-primary-action" />
                <span className="text-[14px] font-medium text-body">
                  {selectedPlan.storageLimitGb} GB Storage
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Headphones className="w-5 h-5 shrink-0 text-primary-action" />
                <span className="text-[14px] font-medium text-body">
                  {selectedPlan.templateLimit} Templates
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Ruler className="w-5 h-5 shrink-0 text-primary-action" />
                <span className="text-[14px] font-medium text-body">
                  {selectedSize}
                </span>
              </div>

              <div className="pt-1">
                <p className="text-[12px] font-bold text-muted mb-2 uppercase tracking-wider">
                  UPLOAD LIMITS
                </p>
                <div className="flex flex-wrap items-center gap-6">
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

            <hr className="border-color my-6" />

            <div className="space-y-3">
              <div className="flex justify-between text-[14px]">
                <span className="text-body">Subtotal</span>
                <span className="text-body font-bold">
                  {formatMoney(subtotal, currency)}
                </span>
              </div>
              {couponApplied && (
                <div className="flex justify-between text-[14px] text-emerald-600 dark:text-emerald-400">
                  <span>Discount</span>
                  <span className="font-bold">
                    -{formatMoney(verifiedCouponData?.coupon?.discount ?? 0, currency)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-[14px]">
                <span className="text-body">Taxes ({taxRate}%)</span>
                <span className="text-body font-bold">
                  {formatMoney(taxAmount, currency, true)}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-color flex justify-between items-end gap-4">
              <span className="text-[24px] font-bold text-headings leading-none">
                Total
              </span>
              <div className="flex flex-col items-end gap-0.5 sm:flex-row sm:items-baseline sm:gap-2">
                <span className="text-[24px] font-extrabold text-primary-action leading-none">
                  {formatMoney(total, currency)}
                </span>
                {couponApplied && (
                  <span className="text-[15px] font-semibold text-muted line-through sm:translate-y-0.5">
                    {formatMoney(subtotal, currency)}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:gap-3">
              <input
                type="text"
                value={
                  couponApplied
                    ? verifiedCouponData?.coupon?.code || "Coupon Applied"
                    : couponInput
                }
                onChange={(e) => {
                  if (!couponApplied) setCouponInput(e.target.value);
                }}
                readOnly={couponApplied}
                placeholder="Enter coupon code"
                className={`min-h-[48px] flex-1 rounded-xl px-4 py-3 text-[15px] outline-none transition-colors ${
                  couponApplied
                    ? "border border-violet-400 bg-violet-50 text-violet-900 placeholder:text-violet-600 dark:border-violet-500 dark:bg-violet-950/40 dark:text-violet-100"
                    : "border border-color bg-input text-headings placeholder:text-muted"
                }`}
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={couponApplied || !couponInput.trim() || isVerifyingCoupon}
                className="min-h-[48px] shrink-0 rounded-xl bg-sky-100 px-8 py-3 text-[15px] font-bold text-headings shadow-sm transition-colors hover:bg-sky-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
              >
                {isVerifyingCoupon ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Apply"
                )}
              </button>
            </div>
            <p className="mt-3 text-[13px] text-muted">
              Discount will be applied instantly at checkout.
            </p>

            {couponApplied && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-[15px] font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>
                  Coupon Applied - {formatMoney(verifiedCouponData?.coupon?.discount ?? 0, currency)} Off
                </span>
              </div>
            )}
          </div>

          <div className="mt-6 p-5 bg-cardBackground2 rounded-xl flex gap-4 text-body text-[14px] leading-[22px]">
            <Info className="w-6 h-6 text-primary-action shrink-0" />
            <p>
              Your subscription will automatically renew at{" "}
              {formatMoney(price, currency)}
              {priceSuffix}. You can cancel any time in{" "}
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
