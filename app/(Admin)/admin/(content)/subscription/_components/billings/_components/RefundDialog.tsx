"use client";

import React, { useState } from "react";
import BaseDialog from "@/common/BaseDialog";
import { Label } from "@/components/ui/label";
import BaseSelect from "@/common/BaseSelect";
import { Checkbox } from "@/components/ui/checkbox";

import { PaymentHistoryItem } from "@/redux/api/admin/payments/billings/billingsApi";
import {
  useProcessRefundMutation,
  ProcessRefundRequest,
} from "@/redux/api/admin/refund/refundApi";
import { toast } from "sonner";

interface RefundDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  payment: PaymentHistoryItem | null;
}

const RefundDialog = ({ open, setOpen, payment }: RefundDialogProps) => {
  const [refundType, setRefundType] =
    useState<ProcessRefundRequest["refundType"]>("FULL");
  const [reason, setReason] =
    useState<ProcessRefundRequest["reason"]>("DUPLICATE_CHARGE");
  const [cancelSub, setCancelSub] = useState(false);
  const [sendReceipt, setSendReceipt] = useState(false);
  const [internalNote, setInternalNote] = useState("");
  const [refundAmount, setRefundAmount] = useState<number | "">("");

  const [processRefund, { isLoading }] = useProcessRefundMutation();

  if (!payment) return null;

  const handleProcessRefund = async () => {
    if (
      refundType === "PARTIAL" &&
      (!refundAmount || Number(refundAmount) <= 0)
    ) {
      toast.error("Please enter a valid refund amount for partial refund.");
      return;
    }

    try {
      const payload: ProcessRefundRequest = {
        paymentId: payment.paymentId,
        refundType,
        reason,
        internalNote,
        cancelSubscription: cancelSub,
        sendReceipt,
      };

      if (refundType === "PARTIAL") {
        payload.refundAmount = Number(refundAmount);
      }

      await processRefund(payload).unwrap();
      toast.success("Refund processed successfully");
      setOpen(false);
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to process refund");
    }
  };

  return (
    <BaseDialog
      open={open}
      setOpen={setOpen}
      title={`Refund Transaction ${payment.invoice}`}
      description={`Customer: ${payment.user.name} | Original Amount: $${payment.amount.toLocaleString()}`}
      maxWidth="lg"
      hideScrollbar={true}
    >
      <div className="space-y-4">
        {/* Refund Type */}
        <div className="space-y-3">
          <h4 className="font-semibold text-headings">Refund Type</h4>
          <BaseSelect
            options={[
              { label: "Full Refund", value: "FULL" },
              { label: "Prorated Refund", value: "PRORATED" },
              { label: "Partial/Custom Amount", value: "PARTIAL" },
            ]}
            value={refundType}
            onChange={(v) =>
              setRefundType(v as ProcessRefundRequest["refundType"])
            }
            placeholder="Select refund type"
          />
          {refundType === "PARTIAL" && (
            <div className="space-y-2 mt-4">
              <Label className="text-body">Refund Amount</Label>
              <input
                type="number"
                placeholder="Enter amount"
                value={refundAmount}
                onChange={(e) =>
                  setRefundAmount(e.target.value ? Number(e.target.value) : "")
                }
                className="w-full rounded-md border border-border bg-input px-4 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-muted"
                min="0.01"
                step="0.01"
              />
            </div>
          )}
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox
              id="cancelSub"
              checked={cancelSub}
              onCheckedChange={(c) => setCancelSub(!!c)}
              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:bg-blue-500"
            />
            <label
              htmlFor="cancelSub"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-20 text-body"
            >
              Cancel Subscription?
            </label>
          </div>
        </div>

        <div className="bg-border h-px w-full" />

        {/* Refund Details */}
        <div className="space-y-3">
          <h4 className="font-semibold text-headings">Refund Details</h4>
          <BaseSelect
            label="Reason for Refund"
            options={[
              { label: "Duplicate Charge", value: "DUPLICATE_CHARGE" },
              {
                label: "Service Dissatisfaction",
                value: "SERVICE_DISSATISFACTION",
              },
              { label: "Other", value: "OTHER" },
            ]}
            value={reason}
            onChange={(v) => setReason(v as ProcessRefundRequest["reason"])}
            placeholder="Select reason"
          />

          <div className="space-y-2">
            <Label className="text-body">Internal Note</Label>
            <textarea
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              placeholder="Add internal comments (e.g., 'Approved by Manager')..."
              className="w-full min-h-[90px] resize-none rounded-md border border-border bg-input px-4 py-3 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-muted"
            />
          </div>
        </div>

        <div className="bg-borderGray h-px w-full" />

        {/* Documentation */}
        <div className="space-y-3">
          <h4 className="font-semibold text-headings">Documentation</h4>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sendReceipt"
              checked={sendReceipt}
              onCheckedChange={(c) => setSendReceipt(!!c)}
              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:bg-blue-500"
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="sendReceipt"
                className="text-sm md:text-base font-medium leading-none peer-disabled:cursor-not-allowed text-headings"
              >
                Send Refund Receipt to Customer
              </label>
              <p className="text-sm text-muted">
                Email confirmation will be sent to {payment.user.name}.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-6 py-2.5 border border-borderGray dark:border-gray-600 rounded-lg font-bold shadow-customShadow cursor-pointer hover:bg-gray-100 text-headings transition-all duration-300 ease-in-out"
          >
            Cancel
          </button>
          <button
            onClick={handleProcessRefund}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold shadow-customShadow cursor-pointer hover:opacity-90 text-white transition-all duration-300 ease-in-out bg-[#ef4444] disabled:opacity-50"
          >
            {isLoading ? "Processing..." : "Process Refund"}
          </button>
        </div>
      </div>
    </BaseDialog>
  );
};

export default RefundDialog;
