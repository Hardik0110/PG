import type { Timestamps, UUID } from './common';

export type NotificationKind =
  | 'ticket_created'
  | 'ticket_updated'
  | 'payment_received'
  | 'tenant_onboarded'
  | 'system'
  | 'other';

export interface Notification extends Timestamps {
  id: UUID;
  user_id: UUID;
  title: string;
  body?: string | null;
  kind: NotificationKind;
  related_entity_id?: UUID | null;
  related_entity_type?: string | null;
  is_read: boolean;
  is_deleted?: boolean;
}
