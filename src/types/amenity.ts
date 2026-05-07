import type { UUID } from './common';

export interface Amenity {
  id: UUID;
  name: string;
  category?: string;
  icon?: string;
}
