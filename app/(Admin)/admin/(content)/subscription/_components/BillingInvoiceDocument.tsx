import React from "react";

export interface InvoiceItemData {
  name: string;
  description: string;
  cost: string;
  vatLabel: string;
  vatAmount: string;
  total: string;
  status: string;
}

export interface UnifiedInvoiceData {
  platformName?: string;
  invoiceNumber: string;
  invoiceDate: string;
  billToName: string;
  billToAddress: string;
  billFromName: string;
  items: InvoiceItemData[];
  subtotal: string;
  discountAmount: string;
  grandTotal: string;
  amountInWords?: string;
  status?: string;
  authorizedByImg?: string | null;
  approvedByImg?: string | null;
}

export interface BillingInvoiceDocumentProps {
  data: UnifiedInvoiceData;
}

const BillingInvoiceDocument: React.FC<BillingInvoiceDocumentProps> = ({
  data,
}) => {
  const platformName = data.platformName || "tape";
  const isReceipt =
    data.status?.toUpperCase() === "PAID" ||
    data.status?.toUpperCase() === "SUCCESS";
  const documentType = isReceipt ? "Receipt" : "Invoice";

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
                <div style={{ fontWeight: 700 }}>{data.billToName}</div>
                <div style={{ color: "#6b7280" }}>{data.billToAddress}</div>
                <div style={{ color: "#6b7280", marginTop: "10px" }}>
                  Bill ID :
                </div>
                <div style={{ fontWeight: 700 }}>{data.invoiceNumber}</div>
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
                <div style={{ fontWeight: 700 }}>{data.billFromName}</div>
                <div style={{ color: "#6b7280", marginTop: "10px" }}>
                  Billing Date :
                </div>
                <div style={{ fontWeight: 700 }}>{data.invoiceDate}</div>
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

        <div
          style={{ fontSize: "13px", color: "#6b7280", margin: "10px 0 8px" }}
        >
          {documentType} details
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
                style={{
                  padding: "10px 14px",
                  borderRight: "1px solid #d1d5db",
                }}
              >
                Name
              </th>
              <th
                style={{
                  padding: "10px 14px",
                  borderRight: "1px solid #d1d5db",
                }}
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
                Cost
              </th>
              <th
                style={{
                  padding: "10px 14px",
                  textAlign: "right",
                  borderRight: "1px solid #d1d5db",
                }}
              >
                {data.items[0]?.vatLabel || "Vat"}
              </th>
              <th
                style={{
                  padding: "10px 14px",
                  textAlign: "right",
                  borderRight: "1px solid #d1d5db",
                }}
              >
                Total
              </th>
              <th style={{ padding: "10px 14px", textAlign: "right" }}>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, idx) => (
              <tr key={idx}>
                <td
                  style={{
                    padding: "12px 14px",
                    borderBottom: "1px solid #d1d5db",
                    borderRight: "1px solid #d1d5db",
                  }}
                >
                  {item.name}
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
                  {item.cost}
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
                  {item.total}
                </td>
                <td
                  style={{
                    padding: "12px 14px",
                    borderBottom: "1px solid #d1d5db",
                    textAlign: "right",
                    textTransform: "capitalize",
                  }}
                >
                  {item.status.replace(/_/g, " ")}
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
              <td
                style={{
                  padding: "10px 14px",
                  borderRight: "1px solid #d1d5db",
                }}
              >
                Subtotal
              </td>
              <td style={{ padding: "10px 14px", textAlign: "right" }}>
                {data.subtotal}
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
                {data.discountAmount}
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
                {data.grandTotal}
              </td>
            </tr>
          </tbody>
        </table>

        {data.amountInWords && (
          <div style={{ marginTop: "16px", fontSize: "12px" }}>
            <span style={{ fontWeight: 700 }}>
              Estimated Amount (In words) :{" "}
            </span>
            <span>{data.amountInWords}</span>
          </div>
        )}

        {(data.authorizedByImg || data.approvedByImg) && (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "96px",
            }}
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
                  {data.authorizedByImg && (
                    <div style={{ margin: "0 auto 8px", maxWidth: "160px" }}>
                      <img
                        crossOrigin="anonymous"
                        src={data.authorizedByImg}
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
                  {data.approvedByImg && (
                    <div style={{ margin: "0 auto 8px", maxWidth: "160px" }}>
                      <img
                        crossOrigin="anonymous"
                        src={data.approvedByImg}
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
        )}
      </div>
    </div>
  );
};

export default BillingInvoiceDocument;
