export type Resource =
  | 'pgs'
  | 'rooms'
  | 'tenants'
  | 'transactions'
  | 'expenses'
  | 'tickets'
  | 'amenities'
  | 'notifications';

export interface ListParams {
  pgId?: string;
  [key: string]: unknown;
}

export interface DataPort {
  list<T = any>(resource: Resource, params?: ListParams): Promise<T[]>;
  get<T = any>(resource: Resource, id: string): Promise<T>;
  create<T = any>(resource: Resource, body: unknown): Promise<T>;
  update<T = any>(resource: Resource, id: string, patch: unknown): Promise<T>;
  remove(resource: Resource, id: string): Promise<void>;
}
