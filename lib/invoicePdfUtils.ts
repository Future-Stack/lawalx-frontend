import jsPDF from "jspdf";
import { addPdfHeader } from "./pdfUtils";

export function formatInvoiceAmount(amount: any, currency?: string): string {
  if (!amount && amount !== 0) return "N/A";
  if (typeof amount === "string") return amount;
  if (typeof amount === "object") {
    const isNGN = currency === "NGN";
    const symbol = isNGN ? "₦" : "$";
    const val = isNGN ? (amount.amount ?? amount.originalAmount) : (amount.originalAmount ?? amount.amount);
    return val != null ? `${symbol}${Number(val).toFixed(2)}` : "N/A";
  }
  return String(amount);
}

export async function generateInvoicePdf(invoice: any, currency?: string): Promise<jsPDF> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const left = 14;
  const right = pageWidth - 14;

  const startY = await addPdfHeader(doc, "Invoice", `#${invoice.invoiceNumber}`);
  let y = startY;

  const drawDivider = () => {
    doc.setDrawColor(220, 220, 220);
    doc.line(left, y, right, y);
    y += 8;
  };

  const drawSection = (title: string) => {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text(title, left, y);
    y += 5;
    drawDivider();
  };

  const drawRow = (label: string, value: string, bold = false) => {
    doc.setFontSize(10);
    doc.setTextColor(110, 110, 110);
    doc.setFont("helvetica", "normal");
    doc.text(label, left, y);
    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.text(value, right, y, { align: "right" });
    y += 8;
  };

  // Invoice Details
  drawSection("Invoice Details");
  drawRow("Invoice Number", invoice.invoiceNumber || "N/A");
  drawRow("Transaction ID", invoice.transactionId || "N/A");
  drawRow("Date", invoice.date ? new Date(invoice.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "N/A");
  drawRow("Payment Type", (invoice.paymentType || "N/A").replace(/_/g, " "));
  drawRow("Gateway", (invoice.gateway || "N/A").toUpperCase());
  drawRow("Status", invoice.status === "SUCCESS" ? "Paid" : (invoice.status || "N/A"), true);
  y += 4;

  // Customer
  drawSection("Customer");
  drawRow("Name", invoice.customer?.name || "N/A");
  drawRow("Email", invoice.customer?.email || "N/A");
  if (invoice.customer?.company) drawRow("Company", invoice.customer.company);
  if (invoice.customer?.location) drawRow("Location", invoice.customer.location);
  y += 4;

  // Plan
  if (invoice.plan) {
    drawSection("Subscription Plan");
    drawRow("Plan Name", invoice.plan.name || "N/A");
    drawRow("Billing Cycle", invoice.plan.billingCycle || "N/A");
    if (invoice.plan.startDate) drawRow("Start Date", new Date(invoice.plan.startDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }));
    if (invoice.plan.endDate) drawRow("End Date", new Date(invoice.plan.endDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }));
    y += 4;
  }

  // Payment Method
  if (invoice.card?.last4) {
    drawSection("Payment Method");
    drawRow("Card", `${(invoice.card.brand || "CARD").toUpperCase()} **** **** **** ${invoice.card.last4}`);
    y += 4;
  }

  // Amount Summary
  drawSection("Amount Summary");
  if (invoice.tax) {
    drawRow(`Tax (${invoice.tax.rate || 0}% — ${invoice.tax.country || ""})`, formatInvoiceAmount(invoice.tax, currency));
  }

  // Total highlighted row
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(left - 2, y - 5, right - left + 4, 12, 2, 2, "F");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text("Total Amount", left, y);
  doc.setTextColor(37, 99, 235);
  doc.text(formatInvoiceAmount(invoice.amount, currency), right, y, { align: "right" });

  return doc;
}
