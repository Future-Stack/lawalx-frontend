export interface ActiveTaxRegion {
  id: string;
  region: string;
  taxRate: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaxApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}
