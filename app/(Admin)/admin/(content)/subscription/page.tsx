"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Tabs, { TabItem } from "@/common/Tabs";
import {
  Users,
  CreditCard,
  LayoutGrid,
  Ticket,
  Eye,
  FileText,
  Globe,
} from "lucide-react";
import SubscribersTab from "./_components/subscribers/SubscribersTab";
import BillingTab from "./_components/billings/BillingTab";
import Breadcrumb from "@/common/BreadCrumb";
import Link from "next/link";
import PlansTab from "./_components/plans/PlansTab";
import CouponsTab from "./_components/coupons/CouponsTab";
import ManageScreenSizeTab from "./_components/screen-size/ManageScreenSizeTab";
import TaxTab from "./_components/tax/TaxTab";
import AdditionalPaymentTab from "./_components/additional-payment/AdditionalPaymentTab";

const SUBSCRIPTION_TAB_LABELS = [
  "Subscribers",
  "Billing & Invoices",
  "Plans",
  "Manage screen size",
  "Coupons",
  "Tax",
  "Additional payment",
] as const;

export type SubscriptionTabLabel = (typeof SUBSCRIPTION_TAB_LABELS)[number];

function parseTabParam(raw: string | null): SubscriptionTabLabel {
  if (!raw) return "Subscribers";
  const decoded = decodeURIComponent(raw.trim());
  return (SUBSCRIPTION_TAB_LABELS as readonly string[]).includes(decoded)
    ? (decoded as SubscriptionTabLabel)
    : "Subscribers";
}

const SubscriptionPageInner = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<SubscriptionTabLabel>(() =>
    parseTabParam(tabParam),
  );

  useEffect(() => {
    const fromUrl = parseTabParam(tabParam);
    setActiveTab((prev) => (prev === fromUrl ? prev : fromUrl));
  }, [tabParam]);

  const setActiveTabPersist = useCallback(
    (tab: SubscriptionTabLabel) => {
      setActiveTab(tab);
      const params = new URLSearchParams(searchParams.toString());
      if (tab === "Subscribers") {
        params.delete("tab");
      } else {
        params.set("tab", tab);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const tabs: TabItem<SubscriptionTabLabel>[] = [
    { label: "Subscribers", icon: Users },
    { label: "Billing & Invoices", icon: CreditCard },
    { label: "Plans", icon: LayoutGrid },
    { label: "Manage screen size", icon: FileText },
    { label: "Coupons", icon: Ticket },
    { label: "Tax", icon: Globe },
    { label: "Additional payment", icon: CreditCard },
  ];

  return (
    <div className="">
      <Breadcrumb
        items={[
          { label: "Home", href: "/admin/dashboard" },
          { label: "Subscription & Billing", href: "/subscription" },
        ]}
      />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 mt-5">
        <div>
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg md:text-2xl font-semibold text-headings">
                Subscription & Billing
              </h1>
              <p className="text-muted text-sm md:text-base">
                Manage your subscribers, plans and promotions
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/admin/reports/subscription-&-billing-report"
          className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-3 border border-border rounded-lg font-medium shadow-customShadow cursor-pointer hover:bg-gray-100 hover:text-bgBlue text-headings transition-all duration-300 ease-in-out"
        >
          <Eye className="w-5 h-5 mr-2" /> View Reports
        </Link>
      </div>

      <div className="space-y-4 md:space-y-6">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTabPersist}
        />

        <div className="min-h-[400px]">
          {activeTab === "Subscribers" && <SubscribersTab />}
          {activeTab === "Billing & Invoices" && <BillingTab />}
          {activeTab === "Plans" && <PlansTab />}
          {activeTab === "Manage screen size" && <ManageScreenSizeTab />}
          {activeTab === "Tax" && <TaxTab />}
          {activeTab === "Coupons" && <CouponsTab />}
          {activeTab === "Additional payment" && <AdditionalPaymentTab />}
        </div>
      </div>
    </div>
  );
};

const SubscriptionPage = () => (
  <Suspense fallback={<div className="min-h-[400px]" aria-hidden />}>
    <SubscriptionPageInner />
  </Suspense>
);

export default SubscriptionPage;
