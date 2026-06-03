"use client";

import { useEffect, useState } from "react";
import BaseDialog from "@/common/BaseDialog";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Subscriber } from "../SubscribersTab";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { getCurrencySymbol } from "@/lib/currencyUtils";
import {
  useCreateAdditionalPaymentMutation,
  useGetAdditionalPaymentSignersQuery,
} from "@/redux/api/admin/payments/additional-payment/additionalPaymentApi";
import { toast } from "sonner";

interface DetailItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
}

interface AdditionalPaymentDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  subscriberData: Subscriber | null;
}

const emptyItem = (): DetailItem => ({
  id: Math.random().toString(36).slice(2, 11),
  description: "",
  qty: 0,
  unitPrice: 0,
});

const AdditionalPaymentDialog = ({
  open,
  setOpen,
  subscriberData,
}: AdditionalPaymentDialogProps) => {
  const [billTo, setBillTo] = useState("");
  const [billFrom, setBillFrom] = useState("Tape");
  const [address, setAddress] = useState("");
  const [subject, setSubject] = useState("");
  const [billingDate, setBillingDate] = useState("");
  const [authorizedById, setAuthorizedById] = useState("");
  const [approvedById, setApprovedById] = useState("");
  const [items, setItems] = useState<DetailItem[]>([emptyItem()]);

  const currency = useSelector((state: RootState) => state.settings.currency);
  const currencySymbol = getCurrencySymbol(currency);

  const { data: authorizedSignersRes, isLoading: isAuthorizedLoading } =
    useGetAdditionalPaymentSignersQuery({ type: "AUTHORIZED_BY" });
  const authorizedSigners = authorizedSignersRes?.data ?? [];

  const { data: approvedSignersRes, isLoading: isApprovedLoading } =
    useGetAdditionalPaymentSignersQuery({ type: "APPROVED_BY" });
  const approvedSigners = approvedSignersRes?.data ?? [];

  const [createAdditionalPayment, { isLoading: isCreating }] =
    useCreateAdditionalPaymentMutation();

  useEffect(() => {
    if (!open) return;
    setBillTo(subscriberData?.userName ?? "");
    setAddress(subscriberData?.userName ?? "");
  }, [open, subscriberData]);

  const addNewItem = () => setItems((prev) => [...prev, emptyItem()]);

  const removeItem = (id: string) => {
    setItems((prev) => (prev.length > 1 ? prev.filter((i) => i.id !== id) : prev));
  };

  const updateItem = (
    id: string,
    field: keyof Omit<DetailItem, "id">,
    value: string | number,
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const resetForm = () => {
    setBillFrom("Tape");
    setSubject("");
    setBillingDate("");
    setAuthorizedById("");
    setApprovedById("");
    setItems([emptyItem()]);
  };

  const handleSend = async () => {
    if (!subscriberData?.userId) {
      toast.error("No subscriber selected.");
      return;
    }
    if (!subject.trim()) {
      toast.error("Subject is required.");
      return;
    }
    if (!authorizedById || !approvedById) {
      toast.error("Please select the authorized and approved signers.");
      return;
    }
    const validItems = items.filter(
      (i) => i.description.trim() && i.qty > 0 && i.unitPrice > 0,
    );
    if (validItems.length === 0) {
      toast.error(
        "Add at least one item with description, quantity and unit price.",
      );
      return;
    }

    try {
      await createAdditionalPayment({
        userId: subscriberData.userId,
        subject: subject.trim(),
        billFrom: billFrom.trim() || undefined,
        billingDate: billingDate || undefined,
        authorizedById,
        approvedById,
        details: validItems.map((i, index) => ({
          item: String(index + 1).padStart(2, "0"),
          description: i.description.trim(),
          quantity: i.qty,
          unitPrice: i.unitPrice,
        })),
      }).unwrap();

      toast.success("Additional payment invoice submitted successfully");
      resetForm();
      setOpen(false);
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(
        err?.data?.message || "Failed to create additional payment invoice.",
      );
    }
  };

  return (
    <BaseDialog
      open={open}
      setOpen={setOpen}
      title=""
      description=""
      maxWidth="4xl"
      className="p-0 bg-bgGray dark:bg-gray-950 overflow-hidden [&>div:first-child]:hidden"
    >
      <div className="p-8 space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header Title */}
        <div className="mb-2">
          <h2 className="text-2xl font-bold text-headings">
            Create Additional Payment Invoice
          </h2>
          <p className="text-sm text-muted mt-1">
            Generate a custom payment invoice for specific services or features.
          </p>
        </div>

        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label
              htmlFor="bill-to"
              className="text-[14px] font-semibold text-headings"
            >
              Bill To
            </Label>
            <input
              id="bill-to"
              type="text"
              aria-label="Bill To"
              value={billTo}
              onChange={(e) => setBillTo(e.target.value)}
              className="w-full bg-white dark:bg-gray-900 border border-transparent rounded-lg px-4 py-3 text-[14px] text-headings shadow-sm focus:outline-none focus:ring-1 focus:ring-bgBlue transition-all"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="bill-from"
              className="text-[14px] font-semibold text-headings"
            >
              Bill From
            </Label>
            <input
              id="bill-from"
              type="text"
              aria-label="Bill From"
              value={billFrom}
              onChange={(e) => setBillFrom(e.target.value)}
              className="w-full bg-white dark:bg-gray-900 border border-transparent rounded-lg px-4 py-3 text-[14px] text-headings shadow-sm focus:outline-none focus:ring-1 focus:ring-bgBlue transition-all"
            />
          </div>
        </div>

        {/* Address + Billing Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label
              htmlFor="address"
              className="text-[14px] font-semibold text-headings"
            >
              Address
            </Label>
            <input
              id="address"
              type="text"
              aria-label="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-white dark:bg-gray-900 border border-transparent rounded-lg px-4 py-3 text-[14px] text-headings shadow-sm focus:outline-none focus:ring-1 focus:ring-bgBlue transition-all"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="billing-date"
              className="text-[14px] font-semibold text-headings"
            >
              Billing Date
            </Label>
            <input
              id="billing-date"
              type="date"
              aria-label="Billing Date"
              value={billingDate}
              onChange={(e) => setBillingDate(e.target.value)}
              className="w-full bg-white dark:bg-gray-900 border border-transparent rounded-lg px-4 py-3 text-[14px] text-headings shadow-sm focus:outline-none focus:ring-1 focus:ring-bgBlue transition-all"
            />
          </div>
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <Label
            htmlFor="subject"
            className="text-[14px] font-semibold text-headings"
          >
            Subject <span className="text-red-500">*</span>
          </Label>
          <input
            id="subject"
            type="text"
            placeholder="Type subject"
            aria-label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-white dark:bg-gray-900 border border-transparent rounded-lg px-4 py-3 text-[14px] text-headings shadow-sm focus:outline-none focus:ring-1 focus:ring-bgBlue transition-all"
          />
        </div>

        {/* Signers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label
              htmlFor="authorized-by"
              className="text-[14px] font-semibold text-headings"
            >
              Authorized By <span className="text-red-500">*</span>
            </Label>
            <select
              id="authorized-by"
              aria-label="Authorized By"
              value={authorizedById}
              onChange={(e) => setAuthorizedById(e.target.value)}
              disabled={isAuthorizedLoading}
              className="w-full bg-white dark:bg-gray-900 border border-transparent rounded-lg px-4 py-3 text-[14px] text-headings shadow-sm focus:outline-none focus:ring-1 focus:ring-bgBlue transition-all disabled:opacity-60"
            >
              <option value="">
                {isAuthorizedLoading ? "Loading signers..." : "Select signer"}
              </option>
              {authorizedSigners.map((signer) => (
                <option key={signer.id} value={signer.id}>
                  {signer.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="approved-by"
              className="text-[14px] font-semibold text-headings"
            >
              Approved By <span className="text-red-500">*</span>
            </Label>
            <select
              id="approved-by"
              aria-label="Approved By"
              value={approvedById}
              onChange={(e) => setApprovedById(e.target.value)}
              disabled={isApprovedLoading}
              className="w-full bg-white dark:bg-gray-900 border border-transparent rounded-lg px-4 py-3 text-[14px] text-headings shadow-sm focus:outline-none focus:ring-1 focus:ring-bgBlue transition-all disabled:opacity-60"
            >
              <option value="">
                {isApprovedLoading ? "Loading signers..." : "Select signer"}
              </option>
              {approvedSigners.map((signer) => (
                <option key={signer.id} value={signer.id}>
                  {signer.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-4">
          <h3 className="text-[18px] font-semibold text-headings">Details</h3>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#CCCCCC] text-left">
                  <th className="pb-3 text-[12px] font-semibold text-headings uppercase tracking-wider w-[60px]">
                    Item
                  </th>
                  <th className="pb-3 text-[12px] font-semibold text-headings uppercase tracking-wider min-w-[250px] px-3">
                    Description
                  </th>
                  <th className="pb-3 text-[12px] font-semibold text-headings uppercase tracking-wider w-[80px] px-3 text-center">
                    Qty
                  </th>
                  <th className="pb-3 text-[12px] font-semibold text-headings uppercase tracking-wider w-[130px] px-3">
                    Unit Price
                  </th>
                  <th className="pb-3 text-[12px] font-semibold text-headings uppercase tracking-wider w-[130px] px-3">
                    Cost
                  </th>
                  <th className="pb-3 text-[12px] font-semibold text-headings uppercase tracking-wider w-[50px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-transparent">
                {items.map((item, index) => (
                  <tr key={item.id} className="group">
                    <td className="py-4">
                      <div className="bg-white dark:bg-gray-900 rounded-lg h-[48px] flex items-center justify-center font-bold text-headings text-[12px]">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      <input
                        type="text"
                        placeholder="Description"
                        aria-label={`Description for item ${index + 1}`}
                        value={item.description}
                        onChange={(e) =>
                          updateItem(item.id, "description", e.target.value)
                        }
                        className="w-full h-10 bg-white dark:bg-gray-900 border border-border rounded-md px-2 text-[13px] text-headings focus:outline-none focus:ring-1 focus:ring-bgBlue"
                      />
                    </td>
                    <td className="py-4 px-3">
                      <input
                        type="number"
                        aria-label={`Quantity for item ${index + 1}`}
                        value={item.qty || ""}
                        placeholder="00"
                        onChange={(e) =>
                          updateItem(item.id, "qty", Number(e.target.value))
                        }
                        className="w-full h-10 bg-white dark:bg-gray-900 border border-border rounded-md px-2 text-center text-[13px] font-semibold text-headings focus:outline-none focus:ring-1 focus:ring-bgBlue [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </td>
                    <td className="py-4 px-3">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-headings font-medium">
                          {currencySymbol}
                        </span>
                        <input
                          type="number"
                          placeholder="0.00"
                          aria-label={`Unit Price for item ${index + 1}`}
                          value={item.unitPrice || ""}
                          onChange={(e) =>
                            updateItem(
                              item.id,
                              "unitPrice",
                              Number(e.target.value),
                            )
                          }
                          className="w-full h-10 bg-white dark:bg-gray-900 border border-border rounded-md pl-8 pr-3 text-[13px] text-headings focus:outline-none focus:ring-1 focus:ring-bgBlue [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-headings font-medium">
                          {currencySymbol}
                        </span>
                        <input
                          type="number"
                          placeholder="0.00"
                          aria-label={`Cost for item ${index + 1}`}
                          value={item.qty * item.unitPrice || ""}
                          readOnly
                          className="w-full h-10 bg-white dark:bg-gray-900 border border-border rounded-md pl-8 pr-3 text-[13px] text-headings focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </td>
                    <td className="py-4 pl-4">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={addNewItem}
            className="flex items-center gap-2 text-headings font-medium hover:text-bgBlue transition-all mt-4"
          >
            <div className="w-8 h-8 rounded-full bg-bgBlue flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <span>New Item</span>
          </button>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleSend}
            disabled={isCreating}
            className="px-12 py-2 bg-white border-2 border-[#00A3FF] text-headings text-[18px] font-bold rounded-xl hover:bg-blue-50/50 transition-all shadow-[0_8px_20px_rgba(0,163,255,0.15)] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isCreating && <Loader2 className="w-5 h-5 animate-spin" />}
            Send
          </button>
        </div>
      </div>
    </BaseDialog>
  );
};

export default AdditionalPaymentDialog;
