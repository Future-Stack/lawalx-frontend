"use client";

import React, { useRef } from "react";
import { ChevronLeft, FileText, Mail, Printer } from "lucide-react";
import jsPDF from "jspdf";

const InvoicePreview = () => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handlePrintAction = () => {
    const printContent = invoiceRef.current;
    if (!printContent) return;

    // Create a hidden iframe or new window for printing
    const printWindow = window.open("", "_blank", "width=900,height=1100");
    if (!printWindow) {
      alert("Please allow popups for printing");
      return;
    }

    // Collect all styles from the current document
    let stylesHtml = "";
    const styleTags = document.querySelectorAll('style, link[rel="stylesheet"]');
    styleTags.forEach((tag) => {
      stylesHtml += tag.outerHTML;
    });

    // Write the content to the new window
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - Tape</title>
          ${stylesHtml}
          <style>
            @media print {
              @page { margin: 0; size: auto; }
              body { margin: 0; padding: 0; background: white !important; }
            }
            body { 
              background: white !important; 
              font-family: "Inter", sans-serif;
              margin: 0;
              padding: 0;
            }
            .print-wrapper {
              padding: 40px !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            /* Reset card styles for print */
            .invoice-card-print {
              box-shadow: none !important;
              border: none !important;
              margin: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
              min-height: auto !important;
            }
          </style>
        </head>
        <body>
          <div class="print-wrapper">
            <div class="invoice-card-print">
              ${printContent.innerHTML}
            </div>
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const handlePrint = () => handlePrintAction();
  
  const handleDownloadPDF = () => {
    const element = invoiceRef.current;
    if (!element) return;

    // Create jsPDF instance
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    // Generate PDF from HTML element
    doc.html(element, {
      callback: function (doc) {
        doc.save("invoice.pdf");
      },
      x: 0,
      y: 0,
      width: 595.28, // A4 width in points
      windowWidth: 850, // Match your card width
      autoPaging: "text",
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-8 font-inter overflow-y-auto custom-scrollbar">
      {/* Toolbar */}
      <div className="max-w-[900px] mx-auto flex justify-between items-center mb-8 no-print">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-200 rounded-full transition-colors cursor-pointer">
            <ChevronLeft className="w-8 h-8 text-[#171717]" />
          </button>
          <h1 className="text-3xl font-bold text-[#171717]">Preview</h1>
        </div>

        <div className="flex items-center gap-8">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 text-[#171717] hover:opacity-70 transition-opacity cursor-pointer"
          >
            <FileText className="w-6 h-6" />
            <span className="text-lg font-medium">PDF</span>
          </button>
          <button className="flex items-center gap-2 text-[#171717] hover:opacity-70 transition-opacity cursor-pointer">
            <Mail className="w-6 h-6" />
            <span className="text-lg font-medium">Email</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 text-[#171717] hover:opacity-70 transition-opacity cursor-pointer"
          >
            <Printer className="w-6 h-6" />
            <span className="text-lg font-medium">Print Page</span>
          </button>
        </div>
      </div>

      {/* Invoice Card */}
      <div ref={invoiceRef} className="max-w-[850px] mx-auto bg-white shadow-[0_4px_30px_rgba(0,0,0,0.06)] min-h-[1100px] p-[60px] flex flex-col border border-gray-100 mb-20">
        {/* Logo */}
        <div className="flex justify-center mb-14">
          <div className="text-[#0FA6FF] text-[58px] font-semibold tracking-tight lowercase select-none">
            tape
          </div>
        </div>

        {/* Invoice Info Grid */}
        <div className="grid grid-cols-2 gap-x-24 gap-y-12">
          <div className="space-y-2">
            <div className="text-[#777777] text-[14px] font-medium">Bill To :</div>
            <div className="h-6"></div>
          </div>
          <div className="space-y-2">
            <div className="text-[#777777] text-[14px] font-medium">Bill From :</div>
            <div className="text-[#171717] text-[14px] font-bold">
              Antopolis Designs and Technologies
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-[#777777] text-[14px] font-medium">Bill ID :</div>
            <div className="h-6"></div>
          </div>
          <div className="space-y-2">
            <div className="text-[#777777] text-[14px] font-medium">Billing Date :</div>
            <div className="h-6"></div>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-[#E5E5E5] mb-4" />

        {/* Subject */}
        <div className="mb-6">
          <div className="text-[#777777] text-[14px] font-medium">Subject :</div>
          <div className="h-6"></div>
        </div>

        {/* Invoice Details Table */}
        <div className="mb-7">
          <h2 className="text-[#A3A3A3] text-[12px] mb-4 font-medium">
            Invoice details
          </h2>
          <div className="border border-[#CCCCCC] rounded-sm overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#CCCCCC]">
                  <th className="border-r border-[#CCCCCC] p-3 text-left font-medium text-[#3D3C3C] text-[12px] w-[70px]">Item</th>
                  <th className="border-r border-[#CCCCCC] p-3 text-left font-medium text-[#3D3C3C] text-[12px]">Description</th>
                  <th className="border-r border-[#CCCCCC] p-4 text-center font-medium text-[#3D3C3C] text-[12px] w-[90px]">Unit price</th>
                  <th className="border-r border-[#CCCCCC] p-4 text-center font-medium text-[#3D3C3C] text-[12px] w-[70px]">QTY</th>
                  <th className="border-r border-[#CCCCCC] p-4 text-center font-medium text-[#3D3C3C] text-[12px] w-[90px]">Cost</th>
                  <th className="border-r border-[#CCCCCC] p-4 text-center font-medium text-[#3D3C3C] text-[12px] w-[80px]">Vat 5%</th>
                  <th className="p-4 text-center font-medium text-[#3D3C3C] text-[12px] w-[100px]">Total</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map((i) => (
                  <tr key={i} className="border-b border-[#CCCCCC] h-14">
                    <td className="border-r border-[#CCCCCC] p-3 font-medium text-[#3D3C3C] text-[12px]"></td>
                    <td className="border-r border-[#CCCCCC] p-3 font-medium text-[#3D3C3C] text-[12px]"></td>
                    <td className="border-r border-[#CCCCCC] p-3 font-medium text-[#3D3C3C] text-[12px]"></td>
                    <td className="border-r border-[#CCCCCC] p-3 font-medium text-[#3D3C3C] text-[12px]"></td>
                    <td className="border-r border-[#CCCCCC] p-3 font-medium text-[#3D3C3C] text-[12px]"></td>
                    <td className="border-r border-[#CCCCCC] p-3 font-medium text-[#3D3C3C] text-[12px]"></td>
                    <td className="p-3 text-right pr-6 font-bold text-[#171717] text-[12px]">₦</td>
                  </tr>
                ))}
                <tr className="border-b border-[#CCCCCC] h-14">
                  <td colSpan={3} className="border-r border-[#CCCCCC] p-4 font-bold text-[#3D3C3C] text-[12px]">Total</td>
                  <td className="border-r border-[#CCCCCC] p-4"></td>
                  <td className="border-r border-[#CCCCCC] p-4"></td>
                  <td className="border-r border-[#CCCCCC] p-4"></td>
                  <td className="p-4 text-right pr-6 font-bold text-[#3D3C3C] text-[12px]">₦</td>
                </tr>
                <tr className="border-b border-[#CCCCCC] h-14">
                  <td colSpan={3} className="border-r border-[#CCCCCC] p-4 font-bold text-[#3D3C3C] text-[12px]">Discount</td>
                  <td className="border-r border-[#CCCCCC] p-4"></td>
                  <td className="border-r border-[#CCCCCC] p-4"></td>
                  <td className="border-r border-[#CCCCCC] p-4"></td>
                  <td className="p-4 text-right pr-6 font-bold text-[#3D3C3C] text-[12px]">₦</td>
                </tr>
                <tr className="h-14">
                  <td colSpan={6} className="p-4 font-bold text-[#3D3C3C] text-[12px]">Grand Total</td>
                  <td className="p-4 text-right pr-6 font-bold text-[#3D3C3C] text-[12px]">₦</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Estimated Amount */}
        <div className="mb-auto">
          <div className="text-[#3D3C3C] font-bold text-[12px] mb-4">
            Estimated Amount (In words)
          </div>
          <div className="h-6"></div>
        </div>

        {/* Signatures */}
        <div className="flex justify-between mt-32 px-4 mb-10">
          <div className="text-center">
            <div className="w-[280px] border-t border-[#CCCCCC] pt-5">
              <span className="text-[#3D3C3C] font-semibold text-[14px]">Authorized By</span>
            </div>
          </div>
          <div className="text-center">
            <div className="w-[280px] border-t border-[#CCCCCC] pt-5">
              <span className="text-[#3D3C3C] font-semibold text-[14px]">Approved By</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
