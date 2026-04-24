export type TicketStatus = 'Opened' | 'Resolved' | 'In Progress';
export type TicketPriority = 'High' | 'Medium' | 'Low' | 'Normal';

export interface Company {
  name: string;
  iconBg: string;
  iconText: string;
}

export interface Assignee {
  name: string;
  initials: string;
  role?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  initials: string;
  status: 'Available' | 'Busy';
  activeTickets: number;
  ticketTags: string[];
}

export interface Ticket {
  id: string;
  ticketId: string;
  company: Company;
  subject: string;
  status: TicketStatus;
  lastUpdated: string;
  priority: TicketPriority;
  assignedTo: Assignee | null;
  description: string;
  createdAt: string;
  updatedAt: string;
  adminNote?: string;
}
