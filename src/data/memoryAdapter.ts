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
    async list<T>(resource: Resource, params?: ListParams): Promise<T[]> {
      return filterByPg(store[resource] ?? [], params) as any;
    },
    async get<T>(resource: Resource, id: string): Promise<T> {
      const found = (store[resource] ?? []).find((r) => r.id === id);
      if (!found) throw new Error(`${resource}/${id} not found`);
      return found as any;
    },
    async create<T>(resource: Resource, body: unknown): Promise<T> {
      const row = { id: crypto.randomUUID(), ...(body as Row) };
      store[resource] = [...(store[resource] ?? []), row];
      return row as any;
    },
    async update<T>(resource: Resource, id: string, patch: unknown): Promise<T> {
      const list = store[resource] ?? [];
      const idx = list.findIndex((r) => r.id === id);
      if (idx < 0) throw new Error(`${resource}/${id} not found`);
      list[idx] = { ...list[idx], ...(patch as Row) };
      return list[idx] as any;
    },
    async remove(resource, id) {
      store[resource] = (store[resource] ?? []).filter((r) => r.id !== id);
    },
  };
}
