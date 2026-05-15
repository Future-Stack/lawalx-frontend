export interface PaymentHistoryRow {
  id: string;
  billTo: string;
  billFrom: string;
  address: string;
  totalPrice: string;
  status: "Paid" | "Unpaid";
}

export const ADDITIONAL_PAYMENT_ROWS: PaymentHistoryRow[] = [
  {
    id: "1",
    billTo: "TechCorp Inc.",
    billFrom: "Tape",
    address: "Antopolis Designs and Technologies",
    totalPrice: "$299.00",
    status: "Unpaid",
  },
  {
    id: "2",
    billTo: "TechCorp Inc.",
    billFrom: "Tape",
    address: "Antopolis Designs and Technologies",
    totalPrice: "$299.00",
    status: "Paid",
  },
  {
    id: "3",
    billTo: "TechCorp Inc.",
    billFrom: "Tape",
    address: "Antopolis Designs and Technologies",
    totalPrice: "$299.00",
    status: "Unpaid",
  },
  {
    id: "4",
    billTo: "TechCorp Inc.",
    billFrom: "Tape",
    address: "Antopolis Designs and Technologies",
    totalPrice: "$299.00",
    status: "Paid",
  },
  {
    id: "5",
    billTo: "TechCorp Inc.",
    billFrom: "Floyd Miles",
    address: "Antopolis Designs and Technologies",
    totalPrice: "$299.00",
    status: "Paid",
  },
  {
    id: "6",
    billTo: "TechCorp Inc.",
    billFrom: "Jerome Bell",
    address: "Antopolis Designs and Technologies",
    totalPrice: "$299.00",
    status: "Paid",
  },
];

export function getAdditionalPaymentById(
  id: string,
): PaymentHistoryRow | undefined {
  return ADDITIONAL_PAYMENT_ROWS.find((r) => r.id === id);
}
