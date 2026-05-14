"use client";

import { useState } from "react";
import BaseDialog from "@/common/BaseDialog";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Paperclip } from "lucide-react";
import { Subscriber } from "../SubscribersTab";

interface DetailItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
  cost: number;
  vat: number;
  totalPrice: number;
}

interface AdditionalPaymentDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  subscriberData: Subscriber | null;
}

const AdditionalPaymentDialog = ({
  open,
  setOpen,
  subscriberData,
}: AdditionalPaymentDialogProps) => {
  const [billTo, setBillTo] = useState(
    subscriberData?.userName,
  );
  const [billFrom, setBillFrom] = useState(
    "Tape",
  );
  const [address, setAddress] = useState("Antopolis Designs and Technologies");
  const [subject, setSubject] = useState("");

  const [items, setItems] = useState<DetailItem[]>([
    {
      id: "1",
      description: "",
      qty: 0,
      unitPrice: 0,
      cost: 0,
      vat: 0,
      totalPrice: 0,
    },
  ]);

  const addNewItem = () => {
    const newItem: DetailItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: "",
      qty: 0,
      unitPrice: 0,
      cost: 0,
      vat: 0,
      totalPrice: 0,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (
    id: string,
    field: keyof DetailItem,
    value: string | number,
  ) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          // Auto calculate cost and total
          if (field === "qty" || field === "unitPrice" || field === "vat") {
            const qty = field === "qty" ? Number(value) : item.qty;
            const unitPrice =
              field === "unitPrice" ? Number(value) : item.unitPrice;
            const vat = field === "vat" ? Number(value) : item.vat;

            updatedItem.cost = qty * unitPrice;
            updatedItem.totalPrice = updatedItem.cost + vat;
          }

          return updatedItem;
        }
        return item;
      }),
    );
  };

  return (
    <BaseDialog
      open={open}
      setOpen={setOpen}
      title=""
      description=""
      maxWidth="4xl"
      className="p-0 bg-bgGray dark:bg-gray-950 overflow-hidden"
    >
      <div className="p-8 space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
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

        {/* Address */}
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

        {/* Subject */}
        <div className="space-y-2">
          <Label
            htmlFor="subject"
            className="text-[14px] font-semibold text-headings"
          >
            Subject
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

        {/* File Uploads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-[14px] font-semibold text-headings">
              Authorized By
            </Label>
            <div className="relative">
              <label className="flex items-center gap-2 w-full bg-white dark:bg-gray-900 border border-transparent rounded-lg px-4 py-3 text-[14px] text-muted shadow-sm cursor-pointer hover:bg-gray-50 transition-all">
                <Paperclip className="w-5 h-5" />
                <span>Choose File</span>
                <input
                  type="file"
                  aria-label="Upload Authorized File"
                  className="hidden"
                />
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[14px] font-semibold text-headings">
              Approved By
            </Label>
            <div className="relative">
              <label className="flex items-center gap-2 w-full bg-white dark:bg-gray-900 border border-transparent rounded-lg px-4 py-3 text-[14px] text-muted shadow-sm cursor-pointer hover:bg-gray-50 transition-all">
                <Paperclip className="w-5 h-5" />
                <span>Choose File</span>
                <input
                  type="file"
                  aria-label="Upload Approved File"
                  className="hidden"
                />
              </label>
            </div>
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
                  <th className="pb-3 text-[12px] font-semibold text-headings uppercase tracking-wider w-[130px] px-3">
                    Vat
                  </th>
                  <th className="pb-3 text-[12px] font-semibold text-headings uppercase tracking-wider w-[130px] px-3">
                    Total Price
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
                        className="w-full h-[48px] bg-white dark:bg-gray-900 border border-transparent rounded-lg px-4 text-[12px] text-headings focus:outline-none focus:ring-1 focus:ring-bgBlue"
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
                        className="w-full h-[48px] bg-[#E8E8E8] dark:bg-gray-800 border border-[#D0D5DD] rounded-lg px-2 text-center text-[12px] font-bold text-headings focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </td>
                    <td className="py-4 px-3">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[12px] text-headings font-bold">
                          $
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
                          className="w-full h-[48px] bg-[#E8E8E8] dark:bg-gray-800 border border-[#D0D5DD] rounded-lg pl-6 pr-2 text-[12px] text-headings focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[12px] text-headings font-bold">
                          $
                        </span>
                        <input
                          type="number"
                          placeholder="0.00"
                          aria-label={`Cost for item ${index + 1}`}
                          value={item.cost || ""}
                          readOnly
                          className="w-full h-[48px] bg-[#E8E8E8] dark:bg-gray-800 border border-[#D0D5DD] rounded-lg pl-6 pr-2 text-[12px] text-headings focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[12px] text-headings font-bold">
                          $
                        </span>
                        <input
                          type="number"
                          placeholder="0.00"
                          aria-label={`Vat for item ${index + 1}`}
                          value={item.vat || ""}
                          onChange={(e) =>
                            updateItem(item.id, "vat", Number(e.target.value))
                          }
                          className="w-full h-[48px] bg-[#E8E8E8] dark:bg-gray-800 border border-[#D0D5DD] rounded-lg pl-6 pr-2 text-[12px] text-headings focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[12px] text-headings font-bold">
                          $
                        </span>
                        <input
                          type="number"
                          placeholder="0.00"
                          aria-label={`Total Price for item ${index + 1}`}
                          value={item.totalPrice || ""}
                          readOnly
                          className="w-full h-[48px] bg-[#E8E8E8] dark:bg-gray-800 border border-[#D0D5DD] rounded-lg pl-6 pr-2 text-[12px] text-headings focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
            onClick={() => setOpen(false)}
            className="px-12 py-2 bg-white border-2 border-[#00A3FF] text-headings text-[18px] font-bold rounded-xl hover:bg-blue-50/50 transition-all shadow-[0_8px_20px_rgba(0,163,255,0.15)] active:scale-95"
          >
            Send
          </button>
        </div>
      </div>
    </BaseDialog>
  );
};

export default AdditionalPaymentDialog;
