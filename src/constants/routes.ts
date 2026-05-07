export const ROUTES = {
  AUTH: '/auth',
  ROOT: '/',
  DASHBOARD: '/dashboard',
  PGS: '/pgs',
  PG_ADD: '/pg/add',
  PG_EDIT: (id: string) => `/pg/edit/${id}`,
  PG_ROOMS: (id: string) => `/pg/${id}/rooms`,
  TENANTS: '/tenants',
  ROOMS: '/rooms',
  MAINTENANCE: '/maintenance',
  TRANSACTIONS: '/transactions',
  EXPENSES: '/expenses',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  NOTIFICATIONS: '/notifications',
} as const;

export const API_BASE = '/api/v1';

export const API = {
  AUTH_LOGIN: `${API_BASE}/auth/login`,
  AUTH_REGISTER: `${API_BASE}/auth/register`,
  AUTH_ME: `${API_BASE}/auth/me`,
  PG_LIST: `${API_BASE}/pg/`,
  PG_ITEM: (id: string) => `${API_BASE}/pg/${id}`,
  ROOMS: `${API_BASE}/rooms/`,
  ROOM_ITEM: (id: string) => `${API_BASE}/rooms/${id}`,
  TENANTS: `${API_BASE}/tenants/`,
  TENANT_ONBOARD: `${API_BASE}/tenants/onboard`,
  TRANSACTIONS: `${API_BASE}/transactions/`,
  EXPENSES: `${API_BASE}/expenses/`,
  TICKETS: `${API_BASE}/tickets/`,
  TICKETS_BY_PG: (pgId: string) => `${API_BASE}/tickets/pg/${pgId}`,
  NOTIFICATIONS: `${API_BASE}/notifications/`,
  AMENITIES: `${API_BASE}/amenities/`,
  AMENITIES_PG: (pgId: string) => `${API_BASE}/amenities/pg/${pgId}`,
  AMENITIES_PG_ITEM: (pgId: string, amenityId: string) =>
    `${API_BASE}/amenities/pg/${pgId}/${amenityId}`,
  AMENITIES_ROOM: (roomId: string) => `${API_BASE}/amenities/room/${roomId}`,
  AMENITIES_ROOM_ITEM: (roomId: string, amenityId: string) =>
    `${API_BASE}/amenities/room/${roomId}/${amenityId}`,
  USER_ME: `${API_BASE}/users/me`,
} as const;
