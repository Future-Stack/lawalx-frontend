export type AdditionalPaymentStatus =
  | "PENDING"
  | "SUCCESS"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED"
  | "CANCELLED";

export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdditionalPaymentSigner {
  id: string;
  name: string;
  imageUrl: string;
  type?: string;
  createdById?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdditionalPaymentUserBrief {
  id: string;
  name: string;
  email: string;
}

export interface AdditionalPaymentUserFull {
  id: string;
  fullName: string;
  companyName: string | null;
  username: string;
  email: string;
}

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
  originalUnitPrice: number;
  originalCost: number;
  originalVatAmount: number;
  originalTotalPrice: number;
  originalCurrency: string;
}

/** Full invoice shape — returned by create, getById and the user "my" list */
export interface AdditionalPaymentInvoice {
  id: string;
  userId: string;
  paymentId: string | null;
  invoiceNumber: string;
  billTo: string;
  address: string;
  billFrom: string;
  subject: string;
  billingDate: string;
  invoiceUrl: string;
  paidAt: string | null;
  paymentStatus: AdditionalPaymentStatus;
  subtotal: number;
  vatTotal: number;
  totalAmount: number;
  currency: string;
  originalSubtotal: number;
  originalVatTotal: number;
  originalTotalAmount: number;
  originalCurrency: string;
  items: AdditionalPaymentItem[];
  authorizedBy: AdditionalPaymentSigner | null;
  approvedBy: AdditionalPaymentSigner | null;
  user?: AdditionalPaymentUserFull;
  createdAt: string;
  updatedAt: string;
}

/** Condensed row shape — returned by the admin paginated list */
export interface AdditionalPaymentListRow {
  id: string;
  paymentId: string | null;
  invoiceNumber: string;
  billTo: string;
  billFrom: string;
  address: string;
  totalPrice: number;
  currency: string;
  paymentStatus: AdditionalPaymentStatus;
  invoiceUrl: string;
  viewUrl: string;
  downloadUrl: string;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: AdditionalPaymentUserBrief;
}

export type AdditionalPaymentListResponse = ApiResponse<{
  data: AdditionalPaymentListRow[];
  meta: PaginationMeta;
}>;

export type AdditionalPaymentDetailResponse =
  ApiResponse<AdditionalPaymentInvoice>;

export type MyAdditionalPaymentsResponse = ApiResponse<
  AdditionalPaymentInvoice[]
>;

export interface GetAdditionalPaymentsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  period?: string;
  userId?: string;
}

export interface CreateAdditionalPaymentItemDto {
  item?: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateAdditionalPaymentDto {
  userId: string;
  subject: string;
  billFrom?: string;
  billingDate?: string;
  authorizedById: string;
  approvedById: string;
  details: CreateAdditionalPaymentItemDto[];
}

export interface CreateAdditionalPaymentCheckoutDto {
  gateway: "stripe" | "paystack";
  country: string;
}

export interface AdditionalPaymentCheckoutData {
  paymentId: string;
  additionalPaymentId: string;
  checkoutUrl: string;
  referenceId: string;
  gateway: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  message: string;
}

export type AdditionalPaymentCheckoutResponse =
  ApiResponse<AdditionalPaymentCheckoutData>;

/** Signer list (used by the admin create dialog dropdowns) */
export type AdditionalPaymentSignersResponse = ApiResponse<
  AdditionalPaymentSigner[]
>;
