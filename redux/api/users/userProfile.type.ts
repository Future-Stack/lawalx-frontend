// user.types.ts

// Optional enums for better type safety
export type UserRole = "USER" | "ADMIN";
export type UserStatus = "ACTIVE" | "INACTIVE";

// Main User type
export interface IUser {
  id: string;
  username: string;
  full_name: string;
  company_name: string | null;
  image_url: string;
  role: UserRole;
  status: UserStatus;
  firstTimeLogin: boolean;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  advanceCustomizationEnabled: boolean;
  cityCountry: string | null;
  companyLogoUrl: string | null;
  designation: string | null;
  industryType: string | null;
  location: string | null;
  officialName: string | null;
  phoneCountry: string | null;
  phoneNumber: string | null;
  totalEmployees: number | null;
  website: string | null;
  roleTemplateId: string | null;
}

// Generic API response wrapper
export interface IApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

// Specific response types
export type IUserResponse = IApiResponse<IUser>;