// =========================
// ENUMS
// =========================

export enum BannerStatus {
  ACTIVE = "ACTIVE",
  DRAFT = "DRAFT",
  PAUSED = "PAUSED",
  ENDED = "ENDED",
}

export enum BannerType {
  UPLOAD = "UPLOAD",
  ANNOUNCEMENT = "ANNOUNCEMENT",
  PROMOTION = "PROMOTION",
}

export enum TargetUserType {
  ALL_USERS = "ALL_USERS",
  STARTER = "STARTER",
  BUSINESS = "BUSINESS",
  FREE_TRIAL = "FREE_TRIAL",
}

export enum SubscriptionPlanName {
  FREE_TRIAL = "FREE_TRIAL",
  STARTER = "STARTER",
  BUSINESS = "BUSINESS",
  ENTERPRISE = "ENTERPRISE",
}

// =========================
// TYPES
// =========================

export type MediaType = "IMAGE" | "VIDEO";

export interface Banner {
  id: string;

  status?: BannerStatus; // optional (API তে নাই)

  type: BannerType;

  title: string;
  description: string;

  mediaUrl: string;
  mediaType: MediaType;

  primaryButtonLabel: string;
  primaryButtonIcon: string;
  primaryButtonUrl: string | null;

  secondaryButtonEnabled: boolean;
  secondaryButtonLabel: string | null;
  secondaryButtonIcon: string | null;
  secondaryButtonUrl: string | null;

  customCss: string;

  targetUserType: TargetUserType;

  // optional future use
  subscriptionPlanName?: SubscriptionPlanName;

  startDate: string;   // ISO Date
  endDate: string;     // ISO Date
  createdAt: string;   // ISO Date
}

// =========================
// API RESPONSE
// =========================

export interface GetBannersResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: Banner[];
}