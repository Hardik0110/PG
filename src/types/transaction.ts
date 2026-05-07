import type { Timestamps, UUID } from './common';

export type TransactionType =
  | 'rent'
  | 'deposit'
  | 'utility'
  | 'fine'
  | 'food'
  | 'refund'
  | 'other';

export type TransactionStatusRaw = 'paid' | 'pending' | 'overdue' | 'failed';

export type PaymentMethod = 'cash' | 'upi' | 'card' | 'bank_transfer' | 'cheque' | 'other';

export interface Transaction extends Timestamps {
  id: UUID;
  pg_id: UUID;
  tenant_id?: UUID | null;
  type: TransactionType;
  amount: number;
  status: TransactionStatusRaw;
  payment_method?: PaymentMethod | null;
  reference_number?: string | null;
  description?: string | null;
  transaction_date: string;
  due_date?: string | null;
}
