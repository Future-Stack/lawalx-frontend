// settings user profile type 
export type ProfileResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: UserProfile;
};

export type UserProfile = {
  id: string;
  username: string;
  full_name: string;
  company_name: string | null;
  image_url: string | null;
  role: "USER" | "ADMIN" | string;
  status: "ACTIVE" | "INACTIVE" | string;
  firstTimeLogin: boolean;
  totalStorage: number;
  usedStorage: number;
  created_at: string;
  updated_at: string;
  advanceCustomizationEnabled: boolean;

  cityCountry: string | null;
  companyLogoUrl: string | null;
  designation: string | null;
  organization: string | null;
  industryType: string | null;
  location: string | null;
  officialName: string | null;
  phoneCountry: string | null;
  phoneNumber: string | null;
  totalEmployees: number | null;
  website: string | null;
  roleTemplateId: string | null;

  timeZone: string | null;
  theame: string | null;
  timeFormate: string | null;
  dateformate: string | null;

  isOnline: boolean;
  lastOnlineAt: string | null;

  email: string;

  preferences: Preferences;

  security: Record<string, unknown>;
};

export type Preferences = {
  id?: string;
  userId?: string;

  theme: "LIGHT" | "DARK" | string;
  language: string;

  dateFormat: "MDY" | "DMY" | "YMD" | string;
  timeFormat: "H12" | "H24" | string;

  emailNotification?: boolean;
  pushNotification?: boolean;
};

// password update type 
export type PasswordUpdate = {
  oldPassword: string;
  newPassword: string;
}

// Where you are logged in api type 
export type SessionsResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    notificationEmail: string;
    sessions: Session[];
  };
};

export type Session = {
  id: string;
  deviceName: string;
  location: string;
  ipAddress: string;
  isCurrent: boolean;
  lastActive: string;
};

// get notification type 
export type NotificationPreferencesResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: NotificationPreferences;
};

export type NotificationPreferences = {
  id: string;
  userId: string;

  inApp: boolean;
  email: boolean;
  push: boolean;

  deviceAlerts: boolean;
  videoUpload: boolean;
  scheduleUpdates: boolean;
  systemAlerts: boolean;
  promotions: boolean;

  createdAt: string;
  updatedAt: string;
};

// notification update type 
export type NotificationUpdateType = {
  email?: boolean;
  deviceAlerts?: boolean;
  videoUpload?: boolean;
  scheduleUpdates?: boolean;
  systemAlerts?: boolean;
  promotions?: boolean;

}