import type { Timestamps, UUID } from './common';

export type UserRole = 'owner' | 'tenant' | 'admin';

export interface User extends Timestamps {
  id: UUID;
  email: string;
  full_name: string;
  role: UserRole;
  auth_provider?: 'local' | 'google';
  is_active?: boolean;
  is_verified?: boolean;
  phone_number?: string | null;
  profile_picture_url?: string | null;
}
