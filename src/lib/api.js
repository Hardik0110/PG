import {
  MOCK_USER, MOCK_PGS, MOCK_TENANTS, MOCK_NOTICES,
  MOCK_TICKETS, MOCK_ROOMS, MOCK_AMENITIES,
} from './mockData';
import { getAuthToken, setAuthToken, clearAuthToken } from '../store/auth-store';

const DEFAULT_API_BASE_URL = "https://pg-maintenance.onrender.com";

const baseUrl = import.meta.env.DEV
  ? ""
  : ((import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, ""));

const USE_MOCK = String(import.meta.env.VITE_USE_MOCK ?? "false").toLowerCase() === "true";

function getToken() {
  return getAuthToken();
}

export function setToken(token) {
  setAuthToken(token || null);
}

export function clearToken() {
  clearAuthToken();
}

function buildHeaders(customHeaders = {}) {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders,
  };
}

function buildFormHeaders(customHeaders = {}) {
  const token = getToken();
  return {
    "Content-Type": "application/x-www-form-urlencoded",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders,
  };
}

function getMockFallback(path) {
  if (path.includes('/auth/me')) return MOCK_USER;
  if (path.match(/\/pg-facilities\/[^/]+/)) {
    const id = path.split('/pg-facilities/')[1];
    return MOCK_PGS.find(p => p.id === id) || MOCK_PGS[0];
  }
  if (path.includes('/pg-facilities')) return MOCK_PGS;
  if (path.includes('/tenants')) return MOCK_TENANTS;
  if (path.includes('/notices')) return MOCK_NOTICES;
  if (path.includes('/tickets')) return MOCK_TICKETS;
  if (path.includes('/rooms')) return MOCK_ROOMS;
  if (path.includes('/amenities')) return MOCK_AMENITIES;
  return [];
}

function redirectToAuth() {
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
    clearToken();
    window.location.href = '/auth';
  }
}

export async function apiRequest(path, options = {}) {
  const url = `${baseUrl}${path}`;
  try {
    const headers = buildHeaders(options.headers);
    const response = await fetch(url, {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    if (response.status === 401) {
      if (USE_MOCK) {
        console.warn('[apiRequest] 401 — falling back to mock for:', path);
        return getMockFallback(path);
      }
      redirectToAuth();
      throw new Error('Unauthorized — redirecting to login');
    }
    if (response.status === 204) return null;
    let payload;
    try { payload = await response.json(); } catch { payload = null; }
    if (!response.ok) {
      const detail = Array.isArray(payload?.detail)
        ? payload.detail.map(e => e.msg || JSON.stringify(e)).join(', ')
        : null;
      throw new Error(detail || payload?.message || payload?.detail || payload?.error || `Request failed with status ${response.status}`);
    }
    return payload;
  } catch (err) {
    if (USE_MOCK) {
      console.warn('[apiRequest] Network error — using mock for:', path, err.message);
      return getMockFallback(path);
    }
    throw err;
  }
}

export async function apiFormRequest(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method || "POST",
    headers: buildFormHeaders(options.headers),
    body: options.body,
  });
  let payload;
  try { payload = await response.json(); } catch { payload = null; }
  if (!response.ok) {
    const detail = Array.isArray(payload?.detail)
      ? payload.detail.map(e => e.msg || JSON.stringify(e)).join(', ')
      : null;
    throw new Error(detail || payload?.message || payload?.detail || payload?.error || `Request failed with status ${response.status}`);
  }
  return payload;
}

export async function apiRequestWithFallback(paths, options = {}) {
  let lastError = null;
  for (const path of paths) {
    try { return await apiRequest(path, options); } catch (error) { lastError = error; }
  }
  throw lastError || new Error("All backend routes failed");
}

export function unwrapData(payload, fallbackValue) {
  if (!payload) return fallbackValue;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (payload?.data && typeof payload.data === "object") return payload.data;
  return payload;
}
