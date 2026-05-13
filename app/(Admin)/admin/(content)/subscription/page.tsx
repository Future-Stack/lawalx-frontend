/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";
import { useState } from "react";
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
import { InvoicePreview } from "@/components/Admin/invoice";

const SubscriptionPage = () => {
  const [activeTab, setActiveTab] = useState("Subscribers");
  //   const [sheetOpen, setSheetOpen] = useState(false); // Global sheet for "View Reports" button

  const tabs: TabItem<string>[] = [
    { label: "Subscribers", icon: Users },
    { label: "Billing & Invoices", icon: CreditCard },
    { label: "Plans", icon: LayoutGrid },
    { label: "Manage screen size", icon: FileText },
    { label: "Coupons", icon: Ticket },
    { label: "Tax", icon: Globe },
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
            {/* <Image src={profile} alt="Subscription" width={50} height={50} /> */}
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

      {/* Tabs Layout */}
      <div className="space-y-4 md:space-y-6">
        <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === "Subscribers" && <SubscribersTab />}
          {activeTab === "Billing & Invoices" && <BillingTab />}
          {activeTab === "Plans" && <PlansTab />}
          {activeTab === "Manage screen size" && <ManageScreenSizeTab />}
          {activeTab === "Tax" && <TaxTab />}
          {activeTab === "Coupons" && <CouponsTab />}
        </div>
      </div>

      {/* <TransactionSheet
        open={sheetOpen}
        setOpen={setSheetOpen}
        transactionId="REPORT-VIEW"
      /> */}
    </div>
  );
};

export default SubscriptionPage;
