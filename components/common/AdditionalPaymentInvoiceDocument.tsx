import React from "react";
import {
  resolveBillToDisplay,
  resolveSignerImageUrl,
} from "@/lib/additionalPaymentInvoiceUtils";

export interface AdditionalPaymentItem {
  id: string;
  item: string;
  description: string;
  quantity: number;
  vatRate: number;
  unitPrice: number;
  cost: number;
  vatAmount: number;
  totalPrice: number;
  currency: string;
}

export interface AdditionalPaymentSigner {
  id: string;
  name: string;
  imageUrl: string;
}

export interface AdditionalPaymentData {
  id: string;
  invoiceNumber: string;
  billTo: string;
  address: string;
  billFrom: string;
  subject: string;
  billingDate: string;
  paymentStatus: string;
  subtotal: number;
  vatTotal: number;
  totalAmount: number;
  currency: string;
  items: AdditionalPaymentItem[];
  authorizedBy?: AdditionalPaymentSigner | null;
  approvedBy?: AdditionalPaymentSigner | null;
  user?: {
    fullName?: string | null;
    username?: string | null;
    email?: string | null;
  } | null;
}

export interface AdditionalPaymentInvoiceProps {
  data: AdditionalPaymentData;
}

function numberToWords(num: number): string {
  if (num === 0) return "Zero";
  const a = ["", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ", "Ten ", "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const convert_tens = (n: number): string => {
    if (n < 20) return a[n];
    return b[Math.floor(n / 10)] + (n % 10 !== 0 ? "-" + a[n % 10] : "");
  };
  const convert_hundreds = (n: number): string => {
    if (n > 99) {
      return a[Math.floor(n / 100)] + "Hundred " + convert_tens(n % 100);
    } else {
      return convert_tens(n);
    }
  };
  const convert_thousands = (n: number): string => {
    if (n >= 1000000) {
      return convert_hundreds(Math.floor(n / 1000000)) + "Million " + convert_thousands(n % 1000000);
    } else if (n >= 1000) {
      return convert_hundreds(Math.floor(n / 1000)) + "Thousand " + convert_hundreds(n % 1000);
    } else {
      return convert_hundreds(n);
    }
  };
  return convert_thousands(Math.floor(num)).trim();
}

const formatAmount = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(amount);
};

const AdditionalPaymentInvoiceDocument: React.FC<AdditionalPaymentInvoiceProps> = ({
  data,
}) => {
  const platformName = "tape";
  const currency = data.currency || "USD";
  const authorizedByImg = resolveSignerImageUrl(data.authorizedBy?.imageUrl);
  const approvedByImg = resolveSignerImageUrl(data.approvedBy?.imageUrl);
  const { name: billToName, subtext: billToSubtext } = resolveBillToDisplay(data);

  const dateToUse = data.billingDate || (data as any).createdAt || new Date().toISOString();
  const invoiceDate = new Date(dateToUse).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const amountInWords = numberToWords(data.totalAmount);
  const vatHeader = data.items[0]?.vatRate
    ? `Vat ${data.items[0].vatRate}%`
    : "Vat";

  const isPaid = data.paymentStatus === "SUCCESS";
  const sectionLabel = isPaid ? "Receipt details" : "Invoice details";
  const displayStatus = isPaid ? "Paid" : "Unpaid";

  return (
    <div
      data-invoice-root="true"
      style={{
        margin: 0,
        padding: 0,
        fontFamily: "Arial, Helvetica, sans-serif",
        color: "#1f2937",
        background: "#ffffff",
        width: "100%",
      }}
    >
      <div
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          background: "#ffffff",
          padding: "26px 30px 40px",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td
                colSpan={2}
                style={{
                  textAlign: "center",
                  fontSize: "34px",
                  fontWeight: 700,
                  color: "#1d9bf0",
                  letterSpacing: "1px",
                  padding: "6px 0 14px",
                }}
              >
                {platformName}
              </td>
            </tr>
          </tbody>
        </table>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "10px",
          }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  width: "50%",
                  fontSize: "14px",
                  lineHeight: 1.5,
                  verticalAlign: "top",
                }}
              >
                <div style={{ color: "#6b7280" }}>Bill To :</div>
                <div style={{ fontWeight: 700 }}>{billToName}</div>
                {billToSubtext ? (
                  <div style={{ color: "#6b7280" }}>{billToSubtext}</div>
                ) : null}
                <div style={{ color: "#6b7280", marginTop: "10px" }}>Bill ID :</div>
                <div style={{ fontWeight: 700 }}>{data.invoiceNumber || data.id}</div>
              </td>
              <td
                style={{
                  width: "50%",
                  fontSize: "14px",
                  lineHeight: 1.5,
                  verticalAlign: "top",
                  textAlign: "right",
                }}
              >
                <div style={{ color: "#6b7280" }}>Bill From :</div>
                <div style={{ fontWeight: 700 }}>{data.billFrom || "Tape"}</div>
                <div style={{ color: "#6b7280", marginTop: "10px" }}>
                  Billing Date :
                </div>
                <div style={{ fontWeight: 700 }}>{invoiceDate}</div>
              </td>
            </tr>
          </tbody>
        </table>

        <div
          style={{
            borderTop: "1px solid #d1d5db",
            margin: "14px 0 18px",
          }}
        />

        {!isPaid && data.subject && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                color: "#6b7280",
                whiteSpace: "nowrap",
              }}
            >
              Subject :
            </div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                flex: "1 1 auto",
                textAlign: "left",
              }}
            >
              {data.subject}
            </div>
          </div>
        )}

        <div style={{ fontSize: "13px", color: "#6b7280", margin: "10px 0 8px" }}>
          {sectionLabel}
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "12px",
            border: "1px solid #d1d5db",
          }}
        >
          <thead>
            <tr
              style={{
                textAlign: "left",
                borderBottom: "1px solid #9ca3af",
              }}
            >
              <th style={{ padding: "10px 14px", borderRight: "1px solid #d1d5db" }}>Item</th>
              <th style={{ padding: "10px 14px", borderRight: "1px solid #d1d5db" }}>Description</th>
              <th style={{ padding: "10px 14px", textAlign: "right", borderRight: "1px solid #d1d5db" }}>Unit price</th>
              <th style={{ padding: "10px 14px", textAlign: "right", borderRight: "1px solid #d1d5db" }}>QTY</th>
              <th style={{ padding: "10px 14px", textAlign: "right", borderRight: "1px solid #d1d5db" }}>{vatHeader}</th>
              <th style={{ padding: "10px 14px", textAlign: "right", borderRight: "1px solid #d1d5db" }}>Cost</th>
              <th style={{ padding: "10px 14px", textAlign: "right" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, idx) => (
              <tr key={idx}>
                <td style={{ padding: "12px 14px", borderBottom: "1px solid #d1d5db", borderRight: "1px solid #d1d5db" }}>
                  {item.item}
                </td>
                <td style={{ padding: "12px 14px", borderBottom: "1px solid #d1d5db", borderRight: "1px solid #d1d5db" }}>
                  {item.description}
                </td>
                <td style={{ padding: "12px 14px", borderBottom: "1px solid #d1d5db", borderRight: "1px solid #d1d5db", textAlign: "right" }}>
                  {formatAmount(item.unitPrice, currency)}
                </td>
                <td style={{ padding: "12px 14px", borderBottom: "1px solid #d1d5db", borderRight: "1px solid #d1d5db", textAlign: "right" }}>
                  {item.quantity}
                </td>
                <td style={{ padding: "12px 14px", borderBottom: "1px solid #d1d5db", borderRight: "1px solid #d1d5db", textAlign: "right" }}>
                  {formatAmount(item.vatAmount, currency)}
                </td>
                <td style={{ padding: "12px 14px", borderBottom: "1px solid #d1d5db", borderRight: "1px solid #d1d5db", textAlign: "right" }}>
                  {formatAmount(item.totalPrice || item.cost, currency)}
                </td>
                <td style={{ padding: "12px 14px", borderBottom: "1px solid #d1d5db", textAlign: "right" }}>
                  {displayStatus}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "10px",
            fontSize: "12px",
            border: "1px solid #d1d5db",
          }}
        >
          <tbody>
            <tr>
              <td style={{ padding: "10px 14px", borderRight: "1px solid #d1d5db" }}>
                Subtotal
              </td>
              <td style={{ padding: "10px 14px", textAlign: "right" }}>
                {formatAmount(data.subtotal, currency)}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: "10px 14px",
                  borderTop: "1px solid #d1d5db",
                  borderRight: "1px solid #d1d5db",
                }}
              >
                Discount
              </td>
              <td
                style={{
                  padding: "10px 14px",
                  borderTop: "1px solid #d1d5db",
                  textAlign: "right",
                }}
              >
                {formatAmount(0, currency)}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: "10px 14px",
                  borderTop: "1px solid #d1d5db",
                  borderRight: "1px solid #d1d5db",
                }}
              >
                Grand Total
              </td>
              <td
                style={{
                  padding: "10px 14px",
                  borderTop: "1px solid #d1d5db",
                  textAlign: "right",
                }}
              >
                {formatAmount(data.totalAmount, currency)}
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: "16px", fontSize: "12px" }}>
          <span style={{ fontWeight: 700 }}>Estimated Amount (In words) : </span>
          <span>{amountInWords}</span>
        </div>

        <table
          style={{ width: "100%", borderCollapse: "collapse", marginTop: "96px" }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  width: "50%",
                  textAlign: "center",
                  verticalAlign: "top",
                  paddingTop: "6px",
                }}
              >
                {authorizedByImg && (
                  <div style={{ margin: "0 auto 8px", maxWidth: "160px" }}>
                    <img
                      crossOrigin="anonymous"
                      src={authorizedByImg}
                      style={{
                        display: "block",
                        margin: "0 auto",
                        maxWidth: "160px",
                        maxHeight: "60px",
                        objectFit: "contain",
                      }}
                      alt="Authorized By"
                    />
                  </div>
                )}
                <div
                  style={{
                    borderBottom: "1px solid #6b7280",
                    margin: "0 auto 6px",
                    height: "1px",
                    width: "180px",
                  }}
                />
                <div style={{ fontSize: "12px" }}>Authorized By</div>
              </td>
              <td
                style={{
                  width: "50%",
                  textAlign: "center",
                  verticalAlign: "top",
                  paddingTop: "6px",
                }}
              >
                {approvedByImg && (
                  <div style={{ margin: "0 auto 8px", maxWidth: "160px" }}>
                    <img
                      crossOrigin="anonymous"
                      src={approvedByImg}
                      style={{
                        display: "block",
                        margin: "0 auto",
                        maxWidth: "160px",
                        maxHeight: "60px",
                        objectFit: "contain",
                      }}
                      alt="Approved By"
                    />
                  </div>
                )}
                <div
                  style={{
                    borderBottom: "1px solid #6b7280",
                    margin: "0 auto 6px",
                    height: "1px",
                    width: "180px",
                  }}
                />
                <div style={{ fontSize: "12px" }}>Approved By</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdditionalPaymentInvoiceDocument;
