import {
  Wifi, Car, ShieldCheck, Camera, ChevronsUp, Zap,
  UtensilsCrossed, Shirt, Droplet, UserCog,
  Wind, Bath, Tv, BookOpen, Trees, Flame, Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { apiRequest } from './api';

const AMENITY_ICON_MAP: Record<string, LucideIcon> = {
  // Building amenities
  'wifi': Wifi,
  'parking': Car,
  'security': ShieldCheck,
  'cctv': Camera,
  'lift': ChevronsUp,
  'elevator': ChevronsUp,
  'power backup': Zap,
  'meals included': UtensilsCrossed,
  'food': UtensilsCrossed,
  'laundry': Shirt,
  'water purifier': Droplet,
  'security guard': UserCog,
  // Room amenities
  'ac': Wind,
  'air conditioning': Wind,
  'attached bathroom': Bath,
  'bathroom': Bath,
  'balcony': Trees,
  'tv': Tv,
  'geyser': Flame,
  'hot water': Flame,
  'wardrobe': Shirt,
  'study table': BookOpen,
};

/** Map an amenity name (any casing) to a lucide-react icon component.
 *  Falls back to a generic sparkle for unknowns. */
export function getAmenityIcon(name: string): LucideIcon {
  return AMENITY_ICON_MAP[String(name).trim().toLowerCase()] || Sparkles;
}

export const BUILDING_AMENITY_NAMES = [
  'wifi',
  'parking',
  'security',
  'cctv',
  'lift',
  'power backup',
  'meals included',
  'laundry',
  'water purifier',
  'security guard',
] as const;

export const ROOM_AMENITY_NAMES = [
  'ac',
  'attached bathroom',
  'balcony',
  'tv',
  'geyser',
  'wardrobe',
  'study table',
] as const;

export type BuildingAmenityName = (typeof BUILDING_AMENITY_NAMES)[number];
export type RoomAmenityName = (typeof ROOM_AMENITY_NAMES)[number];

export interface AmenityRecord {
  id: string;
  name: string;
  category?: string;
}

const norm = (s: unknown) => String(s ?? '').trim().toLowerCase();

export function filterAmenitiesByNames<T extends { name: string }>(
  allAmenities: T[],
  names: readonly string[],
): T[] {
  const wanted = new Set(names.map(norm));
  return (allAmenities ?? []).filter((a) => wanted.has(norm(a.name)));
}

/**
 * Create a new amenity in the master list. Owner-only on the backend.
 * Use to inline-add amenities the user wants but that aren't seeded yet.
 */
export async function createAmenity(
  name: string,
  category: string = 'general',
  iconKey?: string,
): Promise<AmenityRecord> {
  return apiRequest('/api/v1/amenities/', {
    method: 'POST',
    body: { name: name.trim(), category, icon_key: iconKey ?? null },
  });
}

export interface AmenitySyncChanges {
  add?: string[];
  remove?: string[];
  selected?: string[];
}

export interface AmenitySyncResult {
  added: string[];
  removed: string[];
  failures: Array<{ amenityId: string; op: 'add' | 'remove'; error: Error }>;
}

export async function syncAmenities(
  scope: 'pg' | 'room',
  scopeId: string,
  changes: AmenitySyncChanges,
): Promise<AmenitySyncResult> {
  const result: AmenitySyncResult = { added: [], removed: [], failures: [] };
  const adds = changes.add ?? changes.selected ?? [];
  const removes = changes.remove ?? [];

  await Promise.all([
    ...adds.map((id) =>
      apiRequest(`/api/v1/amenities/${scope}/${scopeId}`, {
        method: 'POST',
        body: { amenity_id: id },
      })
        .then(() => result.added.push(id))
        .catch((error: Error) => result.failures.push({ amenityId: id, op: 'add', error })),
    ),
    ...removes.map((id) =>
      apiRequest(`/api/v1/amenities/${scope}/${scopeId}/${id}`, { method: 'DELETE' })
        .then(() => result.removed.push(id))
        .catch((error: Error) => result.failures.push({ amenityId: id, op: 'remove', error })),
    ),
  ]);

  return result;
}
