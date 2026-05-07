import { apiRequest, unwrapData } from '../lib/api';
import type { DataPort, ListParams, Resource } from './port';

const RESOURCE_BASE: Record<Resource, string> = {
  pgs: '/api/v1/pg/',
  rooms: '/api/v1/rooms/',
  tenants: '/api/v1/tenants/',
  transactions: '/api/v1/transactions/',
  expenses: '/api/v1/expenses/',
  tickets: '/api/v1/tickets/',
  amenities: '/api/v1/amenities/',
  notifications: '/api/v1/notifications/',
};

function listUrl(resource: Resource, params?: ListParams): string {
  if (resource === 'tickets' && params?.pgId) return `/api/v1/tickets/pg/${params.pgId}`;
  const base = RESOURCE_BASE[resource];
  if (!params) return base;
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k === 'pgId' ? 'pg_id' : k}=${encodeURIComponent(String(v))}`)
    .join('&');
  return qs ? `${base}?${qs}` : base;
}

function itemUrl(resource: Resource, id: string): string {
  return `${RESOURCE_BASE[resource]}${id}`;
}

function normalizeArray<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  const data = unwrapData(raw, []);
  return Array.isArray(data) ? (data as T[]) : [];
}

export const httpAdapter: DataPort = {
  async list(resource, params) {
    const raw = await apiRequest(listUrl(resource, params));
    return normalizeArray(raw);
  },
  async get(resource, id) {
    return await apiRequest(itemUrl(resource, id));
  },
  async create(resource, body) {
    return await apiRequest(RESOURCE_BASE[resource], { method: 'POST', body });
  },
  async update(resource, id, patch) {
    return await apiRequest(itemUrl(resource, id), { method: 'PATCH', body: patch });
  },
  async remove(resource, id) {
    await apiRequest(itemUrl(resource, id), { method: 'DELETE' });
  },
};
