import type { Timestamps, UUID } from './common';

export type TicketStatusRaw = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketCategory =
  | 'plumbing'
  | 'electrical'
  | 'cleaning'
  | 'internet'
  | 'carpentry'
  | 'appliance'
  | 'other';

export interface Ticket extends Timestamps {
  id: UUID;
  pg_id: UUID;
  room_id?: UUID | null;
  tenant_id?: UUID | null;
  created_by_user_id?: UUID;
  title: string;
  description?: string | null;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatusRaw;
}
