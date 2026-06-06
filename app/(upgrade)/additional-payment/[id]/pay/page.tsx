"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, CheckCircle2, Info, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetActiveTaxRegionsQuery } from "@/redux/api/users/tax/tax.api";
import {
  useGetMyAdditionalPaymentByIdQuery,
  usePayAdditionalPaymentMutation,
} from "@/redux/api/users/additional-payment/additionalPayment.api";
import { formatAmount } from "@/lib/currencyUtils";
import { toast } from "sonner";

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
    logo: "/paymentMethods/Stripe_icon_new.png",
  },
  {
    id: "paystack",
    name: "Paystack",
    description: "Safe payments using your Paystack account",
    logo: "/paymentMethods/paystack_icon_new.png",
  },
];

export default function AdditionalPaymentPayPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id ?? "");

  const [selectedGateway, setSelectedGateway] = useState<"stripe" | "paystack">(
    "stripe",
  );
  const [country, setCountry] = useState("");

  const {
    data: invoiceRes,
    isLoading: isInvoiceLoading,
    isError: isInvoiceError,
  } = useGetMyAdditionalPaymentByIdQuery(id, { skip: !id });
  const { data: taxRes, isLoading: isTaxLoading } =
    useGetActiveTaxRegionsQuery();
  const [payAdditionalPayment, { isLoading: isPaying }] =
    usePayAdditionalPaymentMutation();

  const invoice = invoiceRes?.data ?? null;
  const taxRegions = useMemo(() => taxRes?.data ?? [], [taxRes?.data]);

  const selectedRegion = taxRegions.find((region) => region.region === country);
  const taxRate = Number(selectedRegion?.taxRate ?? 0);
  const subtotal = invoice?.subtotal ?? 0;
  const taxAmount = Number(((subtotal * taxRate) / 100).toFixed(2));
  const total = Number((subtotal + taxAmount).toFixed(2));

  useEffect(() => {
    if (country) return;
    if (taxRegions.length > 0) setCountry(taxRegions[0].region);
  }, [country, taxRegions]);

  const isPaid = invoice?.paymentStatus === "SUCCESS";

  const handlePay = async () => {
    if (!id || !country) return;
    try {
      const res = await payAdditionalPayment({
        id,
        gateway: selectedGateway,
        country,
      }).unwrap();
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

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-10 bg-background text-foreground transition-colors duration-300">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.push("/profile-settings/subscriptions")}
            className="flex items-center gap-2 text-muted hover:text-bgBlue transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-color bg-navbarBg shadow-sm transition-all group-hover:bg-hover group-hover:border-bgBlue/30">
              <ArrowLeft className="w-5 h-5 transition-colors group-hover:text-bgBlue" />
            </div>
            <span className="font-medium text-[16px]">Back to Subscriptions</span>
          </button>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-[32px] font-bold text-headings mb-2">
            Pay Additional Payment Invoice
          </h1>
          <p className="text-muted text-[16px]">
            Select a payment provider to complete your invoice payment securely.
          </p>
        </div>

        {isInvoiceLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted">
            <Loader2 className="h-8 w-8 animate-spin text-primary-action" />
            <p>Loading invoice...</p>
          </div>
        ) : isInvoiceError || !invoice ? (
          <div className="text-center py-24 space-y-4">
            <p className="text-red-500">Could not load this invoice.</p>
            <button
              type="button"
              onClick={() => router.push("/profile-settings/subscriptions")}
              className="text-bgBlue font-medium hover:underline"
            >
              Back to subscriptions
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Payment Methods */}
            <div className="lg:col-span-7 space-y-6">
              <div className="mb-2">
                <h2 className="text-[24px] font-bold text-headings mb-1">
                  Select Payment Method
                </h2>
                <p className="text-muted text-[14px]">
                  Choose your preferred gateway to pay this invoice.
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

              {isPaid ? (
                <div className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-[15px] font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>This invoice has already been paid.</span>
                </div>
              ) : (
                  <button
                    onClick={handlePay}
                    disabled={isPaying || !country}
                    className="w-full mt-6 flex items-center justify-center gap-2 py-4 rounded-[12px] bg-primary-action text-white text-[16px] font-bold shadow-lg hover:cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {isPaying ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      `Pay · ${formatAmount(total, invoice.currency)}`
                    )}
                  </button>
              )}
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-5">
              <div className="rounded-[24px] border border-color bg-navbarBg p-6 shadow-sm">
                <h2 className="text-[24px] font-bold text-headings mb-5">
                  Invoice Summary
                </h2>

                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-[16px] font-bold text-headings">
                      {invoice.subject || "Additional payment"}
                    </h3>
                    <p className="text-[14px] text-muted mt-1">
                      {invoice.invoiceNumber}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium border shrink-0 ${
                      isPaid
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-orange-50 text-orange-700 border-orange-200"
                    }`}
                  >
                    {isPaid ? "Paid" : "Unpaid"}
                  </span>
                </div>

                <hr className="border-color my-5" />

                {invoice.items.length > 0 && (
                  <div className="space-y-3 mb-5">
                    {invoice.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-[14px]"
                      >
                        <span className="text-body">
                          {item.description}
                          {item.quantity > 1 ? ` x${item.quantity}` : ""}
                        </span>
                        <span className="text-body font-medium">
                          {formatAmount(item.totalPrice, item.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger
                    className="h-12 w-full rounded-xl border border-color bg-navbarBg text-[14px] font-medium text-headings"
                    disabled={isTaxLoading || taxRegions.length === 0}
                  >
                    <SelectValue placeholder="Country" />
                  </SelectTrigger>
                  <SelectContent>
                    {taxRegions.map((region) => (
                      <SelectItem key={region.id} value={region.region}>
                        {region.region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="mt-5 space-y-3">
                  <div className="flex justify-between text-[14px]">
                    <span className="text-body">Subtotal</span>
                    <span className="text-body font-bold">
                      {formatAmount(invoice.subtotal, invoice.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[14px]">
                    <span className="text-body">VAT ({taxRate}%)</span>
                    <span className="text-body font-bold">
                      {formatAmount(taxAmount, invoice.currency)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-color flex justify-between items-end gap-4">
                  <span className="text-[24px] font-bold text-headings leading-none">
                    Total
                  </span>
                  <span className="text-[24px] font-extrabold text-primary-action leading-none">
                    {formatAmount(total, invoice.currency)}
                  </span>
                </div>
              </div>

              <div className="mt-6 p-5 bg-cardBackground2 rounded-xl flex gap-4 text-body text-[14px] leading-[22px]">
                <Info className="w-6 h-6 text-primary-action shrink-0" />
                <p>
                  You will be redirected to a secure checkout page to complete
                  your payment. Final tax may be calculated based on your
                  selected country.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
