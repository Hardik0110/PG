import type { Timestamps, UUID } from './common';
import type { User } from './user';

export interface Tenant extends Timestamps {
  id: UUID;
  user_id: UUID;
  pg_id: UUID;
  room_id?: UUID | null;
  monthly_rent: number;
  deposit_amount: number;
  move_in_date: string;
  aadhar_no?: string | null;
  pan_no?: string | null;
  id_proof_url?: string | null;
  guardian_name?: string | null;
  guardian_phone?: string | null;
  guardian_relation?: string | null;
  workplace?: string | null;
  occupation?: string | null;
  is_active: boolean;
  is_deleted?: boolean;
  user?: User;
}
