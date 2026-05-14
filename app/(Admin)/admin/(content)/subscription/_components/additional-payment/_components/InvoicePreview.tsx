"use client";

import React, { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";
import BaseDialog from "@/common/BaseDialog";

export interface InvoiceData {
  id: string;
  billTo: string;
  billFrom: string;
  address: string;
  totalPrice: string;
  status: "Paid" | "Unpaid";
  billToSubtext?: string;
  subject?: string;
  billingDate?: string;
}

interface InvoicePreviewProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  invoiceData: InvoiceData | null;
  defaultAction?: "preview" | "download";
  onDefaultActionHandled?: () => void;
}

const InvoicePreview = ({
  open,
  setOpen,
  invoiceData,
  defaultAction = "preview",
  onDefaultActionHandled,
}: InvoicePreviewProps) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

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

  const baseAmount = parseAmount(invoiceData?.totalPrice);
  const vatAmount = Number((baseAmount * 0.05).toFixed(2));
  const totalAmount = Number((baseAmount + vatAmount).toFixed(2));
  const discountAmount = 0;
  const grandTotal = Number((totalAmount - discountAmount).toFixed(2));

  const handleDownloadPDF = async () => {
    const element = invoiceRef.current;
    if (!element || isDownloading) return;

    try {
      setIsDownloading(true);

      const dataUrl = await toPng(element, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invoice-${invoiceData?.id || "preview"}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. Please try the Print option.");
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    if (!open || defaultAction !== "download") return;

    const run = async () => {
      await handleDownloadPDF();
      onDefaultActionHandled?.();
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultAction]);

  return (
    <BaseDialog
      open={open}
      setOpen={setOpen}
      title=""
      description=""
      maxWidth="5xl"
      className="p-0"
    >
      <div className="bg-bgGray dark:bg-gray-900 p-6 font-inter">
        {/* Invoice Card */}
        <div
          ref={invoiceRef}
          className="max-w-[850px] mx-auto bg-white min-h-[1100px] p-[30px] md:p-[40px] flex flex-col"
        >
          <div className="flex justify-center mb-10">
            <div className="text-bgBlue text-[54px] font-semibold tracking-tight lowercase select-none leading-none">
              tape
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-16 gap-y-6 mb-4">
            <div className="space-y-2">
              <div className="text-[#777777] text-[14px] font-medium leading-none">
                Bill To :
              </div>
              <div className="text-Heading text-[16px] font-bold leading-tight">
                {invoiceData?.billTo || "-"}
              </div>
              <div className="text-[#909090] text-[14px] leading-none">
                {invoiceData?.billToSubtext || "Usa"}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-[#777777] text-[14px] font-medium leading-none">
                Bill From :
              </div>
              <div className="text-Heading text-[16px] font-bold leading-tight">
                {invoiceData?.billFrom || "Tape"}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-[#777777] text-[14px] font-medium leading-none">
                Bill ID :
              </div>
              <div className="text-Heading text-[16px] font-bold leading-tight">
                {invoiceData?.id || "N/A"}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-[#777777] text-[14px] font-medium leading-none">
                Billing Date :
              </div>
              <div className="text-Heading text-[16px] font-bold leading-tight">
                {formatBillingDate(invoiceData?.billingDate)}
              </div>
            </div>
          </div>

          <hr className="border-[#D4D4D4] mb-4" />

          <div className="mb-8">
            <div className="text-[#777777] text-[14px] font-medium leading-none">
              Subject :
            </div>
            <div className="text-Heading text-[14px] font-medium mt-2 leading-tight">
              {invoiceData?.subject || ""}
            </div>
          </div>

          <div className="mb-7">
            <h2 className="text-[#A3A3A3] text-[12px] mb-3 font-medium leading-none">
              Invoice details
            </h2>
            <div className="border border-[#CCCCCC] rounded-sm overflow-hidden">
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
                      {invoiceData?.subject || "Dynamic"}
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
              Estimated Amount (In words) :{" "}
              Three Thousand One hundred Fifty
            </div>
          </div>

          <div className="flex justify-between mt-32 px-2 mb-6">
            <div className="text-center">
              <div className="w-[270px] border-t border-[#D4D4D4] pt-5">
                <span className="text-[#3D3C3C] font-semibold text-[14px]">
                  Authorized By
                </span>
              </div>
            </div>
            <div className="text-center">
              <div className="w-[270px] border-t border-[#D4D4D4] pt-5">
                <span className="text-[#3D3C3C] font-semibold text-[14px]">
                  Approved By
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseDialog>
  );
};

export default InvoicePreview;
