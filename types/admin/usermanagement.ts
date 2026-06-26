export interface UserPayment {
  id: string;
  amount: number;
  transactionId: string;
  cardNumber: string | null;
  durationDays: number | null;
  email: string;
  subscription: boolean;
  userId: string;
  planName: string;
  billingCycle: string;
  deviceLimit: number;
  storageGB: number;
  uploadFileLimit: number | null;
  createdAt: string;
  updatedAt: string;
  imageLimit: number;
  imageMaxSizeMb: number;
  imageAllowedFormats: string[];
  videoLimit: number;
  videoMaxSizeMb: number;
  videoAllowedFormats: string[];
  audioLimit: number;
  audioMaxSizeMb: number;
  audioAllowedFormats: string[];
  enableCustomBranding: boolean;
  status: string;
}

export interface UserAccount {
  email: string;
  is_verified: boolean;
  created_at: string;
}

export interface User {
  id: string;
  username: string;
  full_name: string | null;
  company_name: string | null;
  image_url: string | null;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
  designation: string | null;
  location: string | null;
  phoneCountry: string | null;
  phoneNumber: string | null;
  officialName: string | null;
  industryType: string | null;
  totalEmployees: string | null;
  website: string | null;
  cityCountry: string | null;
  companyLogoUrl: string | null;
  advanceCustomizationEnabled: boolean;
  account: UserAccount;
  payments: UserPayment[];
  issues: string[];
}
