"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import InvoiceDocument, { type InvoiceRecord } from "./InvoiceDocument";

type InvoiceViewModalProps = {
  open: boolean;
  onClose: () => void;
  data: InvoiceRecord | null;
};

export default function InvoiceViewModal({
  open,
  onClose,
  data,
}: InvoiceViewModalProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !data) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invoice-modal-title"
      onClick={onClose}
    >
      <div
        className="relative my-6 w-full max-w-[880px] rounded-xl bg-white shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-end rounded-t-xl border-b border-gray-100 bg-white px-3 py-2 sm:px-4">
          <span id="invoice-modal-title" className="sr-only">
            Invoice {data.id}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close invoice"
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(100vh-8rem)] overflow-y-auto overscroll-contain px-3 pb-4 pt-2 sm:px-5 sm:pb-6">
          <InvoiceDocument data={data} variant="plain" />
        </div>
      </div>
    </div>
  );
}
