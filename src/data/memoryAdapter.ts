import type { DataPort, ListParams, Resource } from './port';

type Row = Record<string, any>;

export function memoryAdapter(seed: Partial<Record<Resource, Row[]>> = {}): DataPort {
  const store: Record<Resource, Row[]> = {
    pgs: [], rooms: [], tenants: [], transactions: [],
    expenses: [], tickets: [], amenities: [], notifications: [],
    ...seed,
  } as Record<Resource, Row[]>;

  const filterByPg = (rows: Row[], params?: ListParams) =>
    params?.pgId ? rows.filter((r) => r.pg_id === params.pgId) : rows;

  return {
    async list(resource, params) {
      return filterByPg(store[resource] ?? [], params);
    },
    async get(resource, id) {
      const found = (store[resource] ?? []).find((r) => r.id === id);
      if (!found) throw new Error(`${resource}/${id} not found`);
      return found;
    },
    async create(resource, body) {
      const row = { id: crypto.randomUUID(), ...(body as Row) };
      store[resource] = [...(store[resource] ?? []), row];
      return row;
    },
    async update(resource, id, patch) {
      const list = store[resource] ?? [];
      const idx = list.findIndex((r) => r.id === id);
      if (idx < 0) throw new Error(`${resource}/${id} not found`);
      list[idx] = { ...list[idx], ...(patch as Row) };
      return list[idx];
    },
    async remove(resource, id) {
      store[resource] = (store[resource] ?? []).filter((r) => r.id !== id);
    },
  };
}
