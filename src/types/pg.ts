import type { Amenity } from './amenity';
import type { Timestamps, UUID } from './common';

export type PGType = 'gents' | 'ladies' | 'coed';

export interface PGFacility extends Timestamps {
  id: UUID;
  owner_id: UUID;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  description?: string | null;
  type: PGType;
  is_active: boolean;
  is_deleted?: boolean;
  amenities?: Amenity[];
}
