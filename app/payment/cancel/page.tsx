"use client";

import Link from "next/link";
import { XCircle, RefreshCw, Home } from "lucide-react";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-16 sm:px-6 lg:px-10 flex items-center justify-center">
      <div className="mx-auto max-w-xl w-full rounded-[24px] border border-border bg-navbarBg p-10 sm:p-12 shadow-sm text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
        </div>

        <h1 className="text-[32px] font-bold text-headings mb-3 tracking-tight">
          Payment Cancelled
        </h1>
        <p className="text-muted text-[16px] mb-10 max-w-[400px] mx-auto leading-relaxed">
          Your payment process was cancelled or failed. No charges were made to your
          account. You can safely try again whenever you&apos;re ready.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#20A4FF] px-8 py-3.5 text-white font-bold hover:bg-[#20A4FF]/90 active:scale-[0.98] transition-all shadow-md"
          >
            <Home className="h-[18px] w-[18px]" />
            Go to Dashboard
          </Link>
          <Link
            href="/support"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-color bg-transparent px-8 py-3.5 text-headings font-bold hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-[0.98] transition-all shadow-sm"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
