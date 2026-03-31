export type FieldType = 'number' | 'text' | 'option' | 'date' | 'time';

export interface ReportColumn {
    id: string;
    label: string;
    type: FieldType;
    options?: string[];
}

export const DATA_SOURCES: Record<string, ReportColumn[]> = {
    'Device Data': [
        { id: 'dev_id', label: 'Device ID', type: 'number' },
        { id: 'name', label: 'Device Name', type: 'text' },
        { id: 'status', label: 'Status', type: 'option', options: ['Active', 'Inactive', 'Offline'] },
        { id: 'location', label: 'Location', type: 'text' },
        { id: 'last_sync', label: 'Last Sync', type: 'time' },
    ],
    'Financial Data': [
        { id: 'txn_id', label: 'Transaction ID', type: 'number' },
        { id: 'amount', label: 'Amount', type: 'number' },
        { id: 'plan', label: 'Plan Type', type: 'option', options: ['Starter', 'Pro', 'Enterprise'] },
        { id: 'method', label: 'Payment Method', type: 'option', options: ['Card', 'PayPal', 'Bank Transfer'] },
        { id: 'date', label: 'Date', type: 'date' },
    ],
    'User Activity': [
        { id: 'user_id', label: 'User ID', type: 'number' },
        { id: 'action', label: 'Action', type: 'text' },
        { id: 'page', label: 'Page', type: 'text' },
        { id: 'ip', label: 'IP Address', type: 'text' },
        { id: 'timestamp', label: 'Timestamp', type: 'time' },
    ],
    'Subscription & Billing': [
        { id: 'sub_id', label: 'Subscription ID', type: 'text' },
        { id: 'customer', label: 'Customer Name', type: 'text' },
        { id: 'plan', label: 'Plan', type: 'option', options: ['Basic', 'Premium', 'Elite'] },
        { id: 'billing_cycle', label: 'Cycle', type: 'option', options: ['Monthly', 'Annually'] },
        { id: 'next_invoice', label: 'Next Invoice', type: 'date' },
    ],
    'Customer Service & Support': [
        { id: 'ticket_id', label: 'Ticket ID', type: 'number' },
        { id: 'subject', label: 'Subject', type: 'text' },
        { id: 'priority', label: 'Priority', type: 'option', options: ['Low', 'Medium', 'High', 'Urgent'] },
        { id: 'status', label: 'Ticket Status', type: 'option', options: ['Open', 'In Progress', 'Resolved', 'Closed'] },
        { id: 'assigned_to', label: 'Agent', type: 'text' },
    ],
    'Content & Program': [
        { id: 'content_id', label: 'Content ID', type: 'text' },
        { id: 'title', label: 'Program Title', type: 'text' },
        { id: 'type', label: 'Content Type', type: 'option', options: ['Video', 'Article', 'Quiz', 'Interactive'] },
        { id: 'category', label: 'Category', type: 'text' },
        { id: 'views', label: 'Total Views', type: 'number' },
    ],
};

export const OPERATORS_BY_TYPE: Record<FieldType, { label: string; value: string }[]> = {
    number: [
        { label: 'Equals', value: 'eq' },
        { label: 'Greater Than', value: 'gt' },
        { label: 'Less Than', value: 'lt' },
    ],
    text: [
        { label: 'Contains', value: 'contains' },
        { label: 'Is Exactly', value: 'eq' },
        { label: 'Starts With', value: 'starts' },
    ],
    option: [
        { label: 'Is', value: 'is' },
        { label: 'Is Not', value: 'not' },
    ],
    date: [
        { label: 'Before', value: 'before' },
        { label: 'After', value: 'after' },
        { label: 'Between', value: 'between' },
    ],
    time: [
        { label: 'Start Time', value: 'start' },
        { label: 'End Time', value: 'end' },
    ],
};
