"use client";

import React, { forwardRef } from "react";

export type InvoiceRecord = {
  id: string;
  billTo: string;
  billFrom: string;
  address: string;
  totalPrice: string;
  status: "Paid" | "Unpaid";
  billToSubtext?: string;
  subject?: string;
  billingDate?: string;
};

const parseAmount = (value?: string) => {
  if (!value) return 0;
  const parsed = Number(value.replace(/[^0-9.-]/g, ""));
  return Number.isNaN(parsed) ? 0 : parsed;
};

const formatCurrency = (amount: number) => {
  const hasDecimal = amount % 1 !== 0;
  return `$${amount.toFixed(hasDecimal ? 2 : 0)}`;
};

const formatBillingDate = (dateString?: string) => {
  if (!dateString) return "18 September, 2024";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "18 September, 2024";
  }

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

type InvoiceDocumentProps = {
  data: InvoiceRecord;
  className?: string;
  /** framed: card border | plain: modal / screen | export: fixed A4-width PDF capture (no centering, no scroll shell) */
  variant?: "framed" | "plain" | "export";
};

const InvoiceDocument = forwardRef<HTMLDivElement, InvoiceDocumentProps>(
  function InvoiceDocument({ data, className = "", variant = "framed" }, ref) {
    const baseAmount = parseAmount(data.totalPrice);
    const vatAmount = Number((baseAmount * 0.05).toFixed(2));
    const totalAmount = Number((baseAmount + vatAmount).toFixed(2));
    const discountAmount = 0;
    const grandTotal = Number((totalAmount - discountAmount).toFixed(2));
    const lineDescription =
      data.subject || data.address || "Additional payment";

    const isExport = variant === "export";

    const surfaceClass = isExport
      ? "w-[794px] max-w-none mx-0 box-border bg-white text-gray-900 min-h-[1100px] px-8 py-8 flex flex-col border-0 shadow-none outline-none ring-0 text-left"
      : variant === "plain"
        ? "max-w-[850px] mx-auto bg-white text-gray-900 min-h-[1100px] p-[30px] md:p-[40px] flex flex-col border-0 shadow-none outline-none ring-0"
        : "max-w-[850px] mx-auto bg-white text-gray-900 min-h-[1100px] p-[30px] md:p-[40px] flex flex-col shadow-sm border border-gray-200 print:shadow-none print:border-0";

    const metaGridClass = isExport
      ? "grid grid-cols-2 gap-x-12 gap-y-6 mb-4"
      : "grid grid-cols-1 sm:grid-cols-2 gap-x-8 sm:gap-x-16 gap-y-6 mb-4";

    const tableSectionClass = isExport ? "mb-7 w-full" : "mb-7 overflow-x-auto";
    const tableFrameClass = isExport
      ? "border border-[#CCCCCC] rounded-sm overflow-hidden w-full"
      : "border border-[#CCCCCC] rounded-sm overflow-hidden min-w-[640px]";

    const signaturesClass = isExport
      ? "flex flex-row justify-between gap-8 mt-24 px-2 mb-6"
      : "flex flex-col sm:flex-row justify-between gap-8 mt-16 sm:mt-32 px-2 mb-6";

    return (
      <div
        ref={ref}
        data-invoice-root
        className={`${surfaceClass} ${className}`}
        style={isExport ? { margin: 0 } : undefined}
      >
        <div className="flex justify-center mb-10">
          <div className="text-bgBlue text-[54px] font-semibold tracking-tight lowercase select-none leading-none">
            tape
          </div>
        </div>

        <div className={metaGridClass}>
          <div className="space-y-2">
            <div className="text-[#777777] text-[14px] font-medium leading-none">
              Bill To :
            </div>
            <div className="text-Heading text-[16px] font-bold leading-tight">
              {data.billTo || "-"}
            </div>
            <div className="text-[#909090] text-[14px] leading-none">
              {data.billToSubtext || "Usa"}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-[#777777] text-[14px] font-medium leading-none">
              Bill From :
            </div>
            <div className="text-Heading text-[16px] font-bold leading-tight">
              {data.billFrom || "Tape"}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-[#777777] text-[14px] font-medium leading-none">
              Bill ID :
            </div>
            <div className="text-Heading text-[16px] font-bold leading-tight">
              {data.id || "N/A"}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-[#777777] text-[14px] font-medium leading-none">
              Billing Date :
            </div>
            <div className="text-Heading text-[16px] font-bold leading-tight">
              {formatBillingDate(data.billingDate)}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-[#777777] text-[14px] font-medium">Status:</span>
          <span
            className={`px-3 py-1 rounded-full text-[12px] font-medium border ${
              data.status === "Paid"
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-purple-50 text-purple-700 border-purple-200"
            }`}
          >
            {data.status}
          </span>
        </div>

        <hr className="border-borderGray mb-4" />

        <div className="mb-8">
          <div className="text-[#777777] text-[14px] font-medium leading-none">
            Subject :
          </div>
          <div className="text-Heading text-[14px] font-medium mt-2 leading-tight">
            {lineDescription}
          </div>
        </div>

        <div className={tableSectionClass}>
          <h2 className="text-[#A3A3A3] text-[12px] mb-3 font-medium leading-none">
            Invoice details
          </h2>
          <div className={tableFrameClass}>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#CCCCCC]">
                  <th className="border-r border-[#CCCCCC] p-3 text-left font-medium text-[#3D3C3C] text-[12px] w-[70px]">
                    Item
                  </th>
                  <th className="border-r border-[#CCCCCC] p-3 text-left font-medium text-[#3D3C3C] text-[12px]">
                    Description
                  </th>
                  <th className="border-r border-[#CCCCCC] p-4 text-center font-medium text-[#3D3C3C] text-[12px] w-[90px]">
                    Unit price
                  </th>
                  <th className="border-r border-[#CCCCCC] p-4 text-center font-medium text-[#3D3C3C] text-[12px] w-[70px]">
                    QTY
                  </th>
                  <th className="border-r border-[#CCCCCC] p-4 text-center font-medium text-[#3D3C3C] text-[12px] w-[90px]">
                    Cost
                  </th>
                  <th className="border-r border-[#CCCCCC] p-4 text-center font-medium text-[#3D3C3C] text-[12px] w-[80px]">
                    Vat 5%
                  </th>
                  <th className="p-4 text-center font-medium text-[#3D3C3C] text-[12px] w-[100px]">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#CCCCCC] h-14">
                  <td className="border-r border-[#CCCCCC] p-3 font-medium text-[#3D3C3C] text-[12px]">
                    01
                  </td>
                  <td className="border-r border-[#CCCCCC] p-3 font-medium text-[#3D3C3C] text-[12px]">
                    {lineDescription}
                  </td>
                  <td className="border-r border-[#CCCCCC] p-3 font-medium text-[#3D3C3C] text-[12px] text-center">
                    {formatCurrency(baseAmount)}
                  </td>
                  <td className="border-r border-[#CCCCCC] p-3 font-medium text-[#3D3C3C] text-[12px] text-center">
                    01
                  </td>
                  <td className="border-r border-[#CCCCCC] p-3 font-medium text-[#3D3C3C] text-[12px] text-center">
                    {formatCurrency(baseAmount)}
                  </td>
                  <td className="border-r border-[#CCCCCC] p-3 font-medium text-[#3D3C3C] text-[12px] text-center">
                    {formatCurrency(vatAmount)}
                  </td>
                  <td className="p-3 text-right pr-6 text-Heading text-[12px] font-bold">
                    {formatCurrency(totalAmount)}
                  </td>
                </tr>
                <tr className="border-b border-[#CCCCCC] h-14">
                  <td className="border-r border-[#CCCCCC] p-3"></td>
                  <td className="border-r border-[#CCCCCC] p-3"></td>
                  <td className="border-r border-[#CCCCCC] p-3"></td>
                  <td className="border-r border-[#CCCCCC] p-3"></td>
                  <td className="border-r border-[#CCCCCC] p-3"></td>
                  <td className="border-r border-[#CCCCCC] p-3"></td>
                  <td className="p-3"></td>
                </tr>
                <tr className="border-b border-[#CCCCCC] h-14">
                  <td className="border-r border-[#CCCCCC] p-3"></td>
                  <td className="border-r border-[#CCCCCC] p-3"></td>
                  <td className="border-r border-[#CCCCCC] p-3"></td>
                  <td className="border-r border-[#CCCCCC] p-3"></td>
                  <td className="border-r border-[#CCCCCC] p-3"></td>
                  <td className="border-r border-[#CCCCCC] p-3"></td>
                  <td className="p-3"></td>
                </tr>
                <tr className="border-b border-[#CCCCCC] h-14">
                  <td
                    colSpan={6}
                    className="p-4 font-medium text-[#3D3C3C] text-[12px]"
                  >
                    Total
                  </td>
                  <td className="p-4 text-right pr-6 text-[#3D3C3C] text-[12px] font-semibold">
                    {formatCurrency(totalAmount)}
                  </td>
                </tr>
                <tr className="border-b border-[#CCCCCC] h-14">
                  <td
                    colSpan={6}
                    className="p-4 font-medium text-[#3D3C3C] text-[12px]"
                  >
                    Discount
                  </td>
                  <td className="p-4 text-right pr-6 text-[#3D3C3C] text-[12px] font-semibold">
                    {formatCurrency(discountAmount)}
                  </td>
                </tr>
                <tr className="h-14">
                  <td
                    colSpan={6}
                    className="p-4 font-medium text-[#3D3C3C] text-[12px]"
                  >
                    Grand Total
                  </td>
                  <td className="p-4 text-right pr-6 text-[#3D3C3C] text-[12px] font-semibold">
                    {formatCurrency(grandTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-auto">
          <div className="text-[#3D3C3C] font-bold text-[12px] leading-tight">
            Estimated Amount (In words) : Three Thousand One hundred Fifty
          </div>
        </div>

        <div className={signaturesClass}>
          <div className="text-center flex-1">
            <div className="max-w-[270px] mx-auto border-t border-borderGray pt-5">
              <span className="text-[#3D3C3C] font-semibold text-[14px]">
                Authorized By
              </span>
            </div>
          </div>
          <div className="text-center flex-1">
            <div className="max-w-[270px] mx-auto border-t border-borderGray pt-5">
              <span className="text-[#3D3C3C] font-semibold text-[14px]">
                Approved By
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

export default InvoiceDocument;
