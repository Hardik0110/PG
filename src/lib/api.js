import {
  MOCK_USER, MOCK_PGS, MOCK_TENANTS, MOCK_NOTICES,
  MOCK_TICKETS, MOCK_ROOMS, MOCK_AMENITIES, getMockData
} from './mockData';

const DEFAULT_API_BASE_URL = "https://pg-maintenance.onrender.com";
const TOKEN_KEY = "pg_manager_token";
const USE_MOCK = true; // Set to false when real backend works

// Use relative /api path in dev (Vite proxy), full URL in prod
const baseUrl = import.meta.env.DEV
  ? "" // Vite proxy handles /api prefix, paths should NOT include /api
  : ((import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, ""));

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (!token) {
    localStorage.removeItem(TOKEN_KEY);
    return;
  }
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
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
  if (path.includes('/pg-facilities/') && !path.match(/\/pg-facilities\/[^\/]+/)) return MOCK_PGS;
  if (path.match(/\/pg-facilities\/[^\/]+/)) {
    const id = path.split('/pg-facilities/')[1];
    return MOCK_PGS.find(p => p.id === id) || MOCK_PGS[0];
  }
  if (path.includes('/tenants')) return MOCK_TENANTS;
  if (path.includes('/notices')) return MOCK_NOTICES;
  if (path.includes('/tickets')) return MOCK_TICKETS;
  if (path.includes('/rooms')) return MOCK_ROOMS;
  if (path.includes('/amenities')) return MOCK_AMENITIES;
  return [];
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
      console.warn('[apiRequest] 401 - using mock data for:', path);
      return getMockFallback(path);
    }
    let payload;
    try { payload = await response.json(); } catch { payload = null; }
    if (!response.ok) {
      throw new Error(payload?.message || payload?.error || `Request failed with status ${response.status}`);
    }
    return payload;
  } catch (err) {
    if (USE_MOCK) {
      console.warn('[apiRequest] Network error - using mock data for:', path, err.message);
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
    const detail = Array.isArray(payload?.detail) ? payload.detail.map(e => e.msg || JSON.stringify(e)).join(', ') : null;
    throw new Error(detail || payload?.message || payload?.error || `Request failed with status ${response.status}`);
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