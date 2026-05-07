import { useResource } from '../data';
import type { Resource } from '../data';

interface LookupBundle {
  pgs?: any[];
  rooms?: any[];
  tenants?: any[];
  loading: boolean;
}

export function useLookups(
  resources: Resource[],
  options: { enabled?: boolean } = {},
): LookupBundle {
  const enabled = options.enabled !== false;
  const wantPgs = resources.includes('pgs');
  const wantRooms = resources.includes('rooms');
  const wantTenants = resources.includes('tenants');

  const pgs = useResource('pgs', { enabled: enabled && wantPgs, joinPg: false });
  const rooms = useResource('rooms', { enabled: enabled && wantRooms, joinPg: false });
  const tenants = useResource('tenants', { enabled: enabled && wantTenants, joinPg: false });

  return {
    pgs: wantPgs ? pgs.data : undefined,
    rooms: wantRooms ? rooms.data : undefined,
    tenants: wantTenants ? tenants.data : undefined,
    loading:
      (wantPgs && pgs.loading) ||
      (wantRooms && rooms.loading) ||
      (wantTenants && tenants.loading),
  };
}
