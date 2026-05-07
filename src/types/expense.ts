import type { Timestamps, UUID } from './common';
import type { PaymentMethod } from './transaction';

export type ExpenseCategory =
  | 'electricity'
  | 'water'
  | 'internet'
  | 'gas'
  | 'maintenance'
  | 'repair'
  | 'cleaning'
  | 'staff_salary'
  | 'food_supplies'
  | 'other';

export interface Expense extends Timestamps {
  id: UUID;
  pg_id: UUID;
  category: ExpenseCategory;
  amount: number;
  vendor?: string | null;
  payment_method?: PaymentMethod | null;
  description?: string | null;
  expense_date: string;
}
