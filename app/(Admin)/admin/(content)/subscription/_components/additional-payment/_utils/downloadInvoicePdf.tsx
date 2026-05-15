"use client";

import { createRoot } from "react-dom/client";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import InvoiceDocument from "../_components/InvoiceDocument";
import type { InvoiceRecord } from "../_components/InvoiceDocument";

/** A4 width at 96dpi — matches export invoice root for clean PDF alignment */
const EXPORT_PX_WIDTH = 794;

export async function downloadInvoicePdf(data: InvoiceRecord): Promise<void> {
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
        <InvoiceDocument data={data} variant="export" />
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

    const dataUrl = await toPng(element, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#ffffff",
      width: w,
      height: h,
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
    pdf.save(`invoice-${data.id || "document"}.pdf`);
  } finally {
    root.unmount();
    document.body.removeChild(host);
  }
}
