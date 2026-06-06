/* eslint-disable @typescript-eslint/no-explicit-any */
export interface EnterpriseSubscriptionInfoPayload {
  name: "FREE_TRIAL" | "BASIC" | "BUSINESS" | "PREMIUM" | "ENTERPRISE" | string;
  description: string;
  price: number;
  screenSize: number;
  deviceLimit: number;
  storageLimitGb: number;
  templateLimit: number;
  photoLimit: number;
  audioLimit: number;
  videoLimit: number;
  features: string[];
  originalPrice?: number;
  mainPrice?: number;
  computedPrice?: number;
}

export interface EnterprisePlanDetails {
  id: string;
  ticketId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  screenSize: number;
  deviceLimit: number;
  storageLimitGb: number;
  templateLimit: number;
  photoLimit: number;
  audioLimit: number;
  videoLimit: number;
  features: string[];
  isActive: boolean;
  submittedById: string;
  updatedById: string;
  createdAt: string;
  updatedAt: string;
  computedPrice: number;
  screenSizePrice: number;
  deviceQuantity: number;
  mainPrice: number;
  originalPrice: number;
  originalCurrency: string;
}

export interface SubmitEnterpriseRequestPayload {
  name: string;
  email: string;
  phoneNumber: string;
  industryType: string;
  companySize: string;
  location: string;
  website: string;
  deviceScreenSize: string;
  estimatedDevices: number;
  storageRequirements: string;
  implementationTimeline: string;
  estimatedBudget: number;
  additionalRequirements: string;
}

export interface EnterpriseRequest {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  industryType: string;
  companySize: string;
  location: string;
  website: string;
  deviceScreenSize: string;
  estimatedDevices: number;
  storageRequirements: string;
  implementationTimeline: string;
  estimatedBudget: number;
  additionalRequirements: string;
  status: string;
  customOfferAmount: number | null;
  adminNote: string | null;
  handledById: string | null;
  createdAt: string;
  updatedAt: string;
  conversionDate: string | null;
}

export interface SubmitEnterpriseRequestResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    enterpriseRequest: EnterpriseRequest;
    ticket: any; 
  };
}
