import type {
  ExpenseCategory,
  PGType,
  PaymentMethod,
  RoomSharing,
  RoomStatusRaw,
  TicketCategory,
  TicketPriority,
  TicketStatusRaw,
  TransactionType,
  UserRole,
} from '../types';

export interface Option<T extends string = string> {
  value: T;
  label: string;
}

export const PG_TYPE_OPTIONS: Option<PGType>[] = [
  { value: 'gents', label: 'Gents' },
  { value: 'ladies', label: 'Ladies' },
  { value: 'coed', label: 'Co-ed' },
];

export const ROOM_SHARING_OPTIONS: Option<RoomSharing>[] = [
  { value: 'single', label: 'Single' },
  { value: 'double', label: 'Double' },
  { value: 'triple', label: 'Triple' },
  { value: 'shared', label: 'Shared' },
];

export const ROOM_STATUS_OPTIONS: Option<RoomStatusRaw>[] = [
  { value: 'available', label: 'Available' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'reserved', label: 'Reserved' },
];

export const TRANSACTION_TYPE_OPTIONS: Option<TransactionType>[] = [
  { value: 'rent', label: 'Rent' },
  { value: 'deposit', label: 'Deposit' },
  { value: 'utility', label: 'Utility' },
  { value: 'fine', label: 'Fine' },
  { value: 'food', label: 'Food' },
  { value: 'refund', label: 'Refund' },
  { value: 'other', label: 'Other' },
];

export const PAYMENT_METHOD_OPTIONS: Option<PaymentMethod>[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'other', label: 'Other' },
];

export const EXPENSE_CATEGORY_OPTIONS: Option<ExpenseCategory>[] = [
  { value: 'electricity', label: 'Electricity' },
  { value: 'water', label: 'Water' },
  { value: 'internet', label: 'Internet' },
  { value: 'gas', label: 'Gas' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'repair', label: 'Repair' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'staff_salary', label: 'Staff Salary' },
  { value: 'food_supplies', label: 'Food Supplies' },
  { value: 'other', label: 'Other' },
];

export const TICKET_CATEGORY_OPTIONS: Option<TicketCategory>[] = [
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'internet', label: 'Internet' },
  { value: 'carpentry', label: 'Carpentry' },
  { value: 'appliance', label: 'Appliance' },
  { value: 'other', label: 'Other' },
];

export const TICKET_PRIORITY_OPTIONS: Option<TicketPriority>[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export const TICKET_STATUS_OPTIONS: Option<TicketStatusRaw>[] = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

export const ROLE_OPTIONS: Option<UserRole>[] = [
  { value: 'owner', label: 'Owner' },
  { value: 'tenant', label: 'Tenant' },
  { value: 'admin', label: 'Admin' },
];
