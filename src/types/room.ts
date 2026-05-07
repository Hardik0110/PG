import type { Amenity } from './amenity';
import type { Timestamps, UUID } from './common';

export type RoomSharing = 'single' | 'double' | 'triple' | 'shared';
export type RoomStatusRaw = 'available' | 'occupied' | 'maintenance' | 'reserved';

export interface Room extends Timestamps {
  id: UUID;
  pg_id: UUID;
  owner_id?: UUID;
  room_number: string;
  room_sharing: RoomSharing;
  is_ac: boolean;
  floor?: number | null;
  capacity: number;
  current_occupancy: number;
  monthly_rent_per_head: number;
  status: RoomStatusRaw;
  notes?: string | null;
  is_active: boolean;
  is_deleted?: boolean;
  amenities?: Amenity[];
}
