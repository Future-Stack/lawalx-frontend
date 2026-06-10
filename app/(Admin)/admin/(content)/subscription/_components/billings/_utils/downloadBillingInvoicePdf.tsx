"use client";

import { createRoot } from "react-dom/client";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

import { PaymentHistoryItem } from "@/redux/api/admin/payments/billings/billingsApi";
import BillingInvoiceDocument, { UnifiedInvoiceData } from "../../BillingInvoiceDocument";
import { formatAmount } from "@/lib/currencyUtils";

const EXPORT_PX_WIDTH = 794;

export function mapPaymentToUnifiedData(
  payment: PaymentHistoryItem,
  currency: string
): UnifiedInvoiceData {
  const formattedAmount = formatAmount(payment.amount, currency);
  return {
    platformName: "Tape",
    invoiceNumber: payment.invoice || payment.paymentId,
    invoiceDate: new Date(payment.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    billToName: payment.user.name,
    billToAddress: payment.user.email,
    billFromName: "Tape",
    status: payment.status,
    items: [
      {
        name: payment.planName || "Subscription Payment",
        description: payment.planDescription || `Payment via ${payment.paymentMethod}`,
        cost: formattedAmount,
        vatLabel: "Vat 0%",
        vatAmount: formatAmount(0, currency),
        total: formattedAmount,
        status: payment.status,
      },
    ],
    subtotal: formattedAmount,
    discountAmount: formatAmount(0, currency),
    grandTotal: formattedAmount,
  };
}

export async function generateBillingInvoicePdfBlob(
  data: PaymentHistoryItem,
  currency: string,
): Promise<ArrayBuffer> {
  const unifiedData = mapPaymentToUnifiedData(data, currency);

  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = `position:fixed;left:0;top:0;width:${EXPORT_PX_WIDTH}px;margin:0;padding:0;pointer-events:none;opacity:0;z-index:-1;overflow:visible;background:#ffffff;`;

  document.body.appendChild(host);

  const mount = document.createElement("div");
  mount.style.cssText = `width:${EXPORT_PX_WIDTH}px;margin:0;padding:0;background:#ffffff;`;
  host.appendChild(mount);

  const root = createRoot(mount);

  try {
    root.render(
      <div
        style={{
          background: "#ffffff",
          padding: 0,
          margin: 0,
          width: EXPORT_PX_WIDTH,
          display: "block",
        }}
      >
        <BillingInvoiceDocument data={unifiedData} />
      </div>,
    );

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
    await new Promise((r) => setTimeout(r, 200));

    const element = mount.querySelector(
      "[data-invoice-root]",
    ) as HTMLElement | null;
    if (!element) {
      throw new Error("Invoice root not found");
    }

    const w = Math.ceil(element.offsetWidth);
    const h = Math.ceil(element.offsetHeight);

    try {
      const dataUrl = await toPng(element, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        width: w,
        height: h,
        imagePlaceholder: "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" // Blank 1x1 image fallback
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
      return pdf.output("arraybuffer");
    } catch (pdfErr) {
      console.error("Failed to generate PDF from element:", pdfErr);
      throw pdfErr;
    }
  } finally {
    root.unmount();
    document.body.removeChild(host);
  }
}

export async function downloadBillingInvoicePdf(
  data: PaymentHistoryItem,
  currency: string,
): Promise<void> {
  const arrayBuffer = await generateBillingInvoicePdfBlob(data, currency);
  const blob = new Blob([arrayBuffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `invoice-${data.invoice || data.paymentId}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
