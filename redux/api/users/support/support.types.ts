export enum IssueType {
  DEVICE_ISSUE = 'DEVICE_ISSUE',
  PAYMENT_ISSUE = 'PAYMENT_ISSUE',
  TECHNICAL_ISSUE = 'TECHNICAL_ISSUE',
  ACCOUNT_ISSUE = 'ACCOUNT_ISSUE',
  STORAGE_ISSUE = 'STORAGE_ISSUE',
  CONTENT_ISSUE = 'CONTENT_ISSUE',
  OTHER = 'OTHER',
}

export interface Ticket {
  id: string;
  subject: string;
  customId: string;
  description: string;
  file: string[];
  issueType: IssueType[];
  status: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  messages?: any[];
  assignments?: any[];
}

export interface TicketResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: Ticket;
}

export interface TicketsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: Ticket[];
}
