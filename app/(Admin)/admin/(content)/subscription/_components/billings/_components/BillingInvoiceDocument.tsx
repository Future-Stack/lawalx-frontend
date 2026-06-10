import React from "react";
import { formatAmount } from "@/lib/currencyUtils";
import { PaymentHistoryItem } from "@/redux/api/admin/payments/billings/billingsApi";

export interface BillingInvoiceDocumentProps {
  data: PaymentHistoryItem;
  currency?: string;
  platformName?: string;
}

const BillingInvoiceDocument: React.FC<BillingInvoiceDocumentProps> = ({
  data,
  currency = "USD",
  platformName = "Lawalx",
}) => {
  const invoiceDate = new Date(data.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedAmount = formatAmount(data.amount, currency);

  // Since we only have a total amount from the API, we represent it as a single item.
  const item = {
    item: "Subscription Payment",
    description: `Payment via ${data.paymentMethod}`,
    unitPrice: formattedAmount,
    quantity: "-",
    vatAmount: "-",
    cost: formattedAmount,
    total: formattedAmount,
  };

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
                <div style={{ fontWeight: 700 }}>{data.user.name}</div>
                <div style={{ color: "#6b7280" }}>{data.user.email}</div>
                <div style={{ color: "#6b7280", marginTop: "10px" }}>
                  Bill ID :
                </div>
                <div style={{ fontWeight: 700 }}>{data.invoice}</div>
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
                <div style={{ fontWeight: 700 }}>{platformName}</div>
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

        {data.status !== "SUCCESS" && (
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
              Status :
            </div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                flex: "1 1 auto",
                textAlign: "left",
                textTransform: "capitalize",
              }}
            >
              {data.status.replace(/_/g, " ")}
            </div>
          </div>
        )}

        <div style={{ fontSize: "13px", color: "#6b7280", margin: "10px 0 8px" }}>
          Invoice details
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
              <th
                style={{ padding: "10px 14px", borderRight: "1px solid #d1d5db" }}
              >
                Item
              </th>
              <th
                style={{ padding: "10px 14px", borderRight: "1px solid #d1d5db" }}
              >
                Description
              </th>
              <th
                style={{
                  padding: "10px 14px",
                  textAlign: "right",
                  borderRight: "1px solid #d1d5db",
                }}
              >
                Unit price
              </th>
              <th
                style={{
                  padding: "10px 14px",
                  textAlign: "right",
                  borderRight: "1px solid #d1d5db",
                }}
              >
                QTY
              </th>
              <th
                style={{
                  padding: "10px 14px",
                  textAlign: "right",
                  borderRight: "1px solid #d1d5db",
                }}
              >
                Vat
              </th>
              <th
                style={{
                  padding: "10px 14px",
                  textAlign: "right",
                  borderRight: "1px solid #d1d5db",
                }}
              >
                Cost
              </th>
              <th style={{ padding: "10px 14px", textAlign: "right" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid #d1d5db",
                  borderRight: "1px solid #d1d5db",
                }}
              >
                {item.item}
              </td>
              <td
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid #d1d5db",
                  borderRight: "1px solid #d1d5db",
                }}
              >
                {item.description}
              </td>
              <td
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid #d1d5db",
                  borderRight: "1px solid #d1d5db",
                  textAlign: "right",
                }}
              >
                {item.unitPrice}
              </td>
              <td
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid #d1d5db",
                  borderRight: "1px solid #d1d5db",
                  textAlign: "right",
                }}
              >
                {item.quantity}
              </td>
              <td
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid #d1d5db",
                  borderRight: "1px solid #d1d5db",
                  textAlign: "right",
                }}
              >
                {item.vatAmount}
              </td>
              <td
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid #d1d5db",
                  borderRight: "1px solid #d1d5db",
                  textAlign: "right",
                }}
              >
                {item.cost}
              </td>
              <td
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid #d1d5db",
                  textAlign: "right",
                  textTransform: "capitalize",
                }}
              >
                {data.status.replace(/_/g, " ")}
              </td>
            </tr>
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
              <td
                style={{ padding: "10px 14px", borderRight: "1px solid #d1d5db" }}
              >
                Subtotal
              </td>
              <td style={{ padding: "10px 14px", textAlign: "right" }}>
                {formattedAmount}
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
                {formattedAmount}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BillingInvoiceDocument;
