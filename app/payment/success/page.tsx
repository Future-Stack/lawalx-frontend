"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-navbarBg p-8 shadow-sm text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
          <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>

        <h1 className="text-3xl font-bold text-headings mb-2">
          Payment Successful
        </h1>
        <p className="text-muted mb-8">
          Your subscription has been activated successfully.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-bgBlue px-6 py-3 text-white font-semibold hover:opacity-90 transition-all"
          >
            Go to Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/profile-settings/subscriptions"
            className="inline-flex items-center justify-center rounded-xl border border-border px-6 py-3 text-headings font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          >
            View Subscription
          </Link>
        </div>
      </div>
    </div>
  );
}
