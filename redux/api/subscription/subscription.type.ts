export type SubscriptionPayload = {
  email: string;
  amount: number;
  transactionId: string;
  planName: string;
  billingCycle: "MONTHLY" | "YEARLY" | string;
  deviceLimit: number;
  storageGB: number;
  uploadFileLimit: number;
  durationDays: number;
  subscription: boolean;
  userId: string; // UUID
};