export type FieldType = 'number' | 'text' | 'option' | 'date' | 'time';

export interface ReportColumn {
    id: string;
    label: string;
    type: FieldType;
    options?: string[];
}

/**
 * DATA_SOURCES keys and column ids/labels must match the backend enums exactly:
 * - DataSourceEnum string values  →  the keys below
 * - ReportColumnEnum string values →  the id/label values below
 *
 * Backend reference (ValidColumnsMap):
 *   DEVICE_DATA        → Device ID, Device Name, Status, Location, Last Sync
 *   FINANCIAL_DATA     → Transaction ID, Amount, Plan Type, Payment Method, Date
 *   USER_ACTIVITY      → Activity ID, User, Action, Description, Date
 *   SUBSCRIPTION_BILLING → Subscription ID, User, Plan, Status, Start Date, End Date
 *   CUSTOMER_SUPPORT   → Ticket ID, User, Subject, Status, Priority, Date Created
 *   CONTENT_PROGRAM    → Program ID, Name, Status, Date Created
 */
export const DATA_SOURCES: Record<string, ReportColumn[]> = {
    'Device Data': [
        { id: 'Device ID',   label: 'Device ID',   type: 'text' },
        { id: 'Device Name', label: 'Device Name', type: 'text' },
        { id: 'Status',      label: 'Status',      type: 'option', options: ['Active', 'Inactive', 'Offline'] },
        { id: 'Location',    label: 'Location',    type: 'text' },
        { id: 'Last Sync',   label: 'Last Sync',   type: 'time' },
    ],
    'Financial Data': [
        { id: 'Transaction ID',  label: 'Transaction ID',  type: 'text' },
        { id: 'Amount',          label: 'Amount',          type: 'number' },
        { id: 'Plan Type',       label: 'Plan Type',       type: 'option', options: ['Starter', 'Pro', 'Enterprise'] },
        { id: 'Payment Method',  label: 'Payment Method',  type: 'option', options: ['Card', 'PayPal', 'Bank Transfer'] },
        { id: 'Date',            label: 'Date',            type: 'date' },
    ],
    'User Activity': [
        { id: 'Activity ID', label: 'Activity ID', type: 'text' },
        { id: 'User',        label: 'User',        type: 'text' },
        { id: 'Action',      label: 'Action',      type: 'text' },
        { id: 'Description', label: 'Description', type: 'text' },
        { id: 'Date',        label: 'Date',        type: 'date' },
    ],
    'Subscription & Billing': [
        { id: 'Subscription ID', label: 'Subscription ID', type: 'text' },
        { id: 'User',            label: 'User',            type: 'text' },
        { id: 'Plan',            label: 'Plan',            type: 'option', options: ['Basic', 'Premium', 'Elite'] },
        { id: 'Status',          label: 'Status',          type: 'option', options: ['Active', 'Inactive', 'Cancelled'] },
        { id: 'Start Date',      label: 'Start Date',      type: 'date' },
        { id: 'End Date',        label: 'End Date',        type: 'date' },
    ],
    'Customer Service & Support': [
        { id: 'Ticket ID',    label: 'Ticket ID',    type: 'text' },
        { id: 'User',         label: 'User',         type: 'text' },
        { id: 'Subject',      label: 'Subject',      type: 'text' },
        { id: 'Status',       label: 'Status',       type: 'option', options: ['Open', 'In Progress', 'Resolved', 'Closed'] },
        { id: 'Priority',     label: 'Priority',     type: 'option', options: ['Low', 'Medium', 'High', 'Urgent'] },
        { id: 'Date Created', label: 'Date Created', type: 'date' },
    ],
    'Content & Program': [
        { id: 'Program ID',   label: 'Program ID',   type: 'text' },
        { id: 'Name',         label: 'Name',         type: 'text' },
        { id: 'Status',       label: 'Status',       type: 'option', options: ['Active', 'Inactive', 'Draft'] },
        { id: 'Date Created', label: 'Date Created', type: 'date' },
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
