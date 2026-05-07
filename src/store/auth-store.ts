import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const STORAGE_KEY = 'pg_manager_auth';
const LEGACY_TOKEN_KEY = 'pg_manager_token';

function readLegacyToken(): string | null {
  try {
    const raw = localStorage.getItem(LEGACY_TOKEN_KEY);
    if (!raw) return null;
    if (raw.startsWith('{')) return null; // already migrated to a JSON shape
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    return raw;
  } catch {
    return null;
  }
}

interface AuthState {
  token: string | null;
  setToken: (token: string | null) => void;
  clearToken: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: readLegacyToken(),
      setToken: (token) => set({ token }),
      clearToken: () => set({ token: null }),
      isAuthenticated: () => !!get().token,
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token }),
    },
  ),
);

export function getAuthToken(): string | null {
  return useAuthStore.getState().token;
}

export function setAuthToken(token: string | null): void {
  useAuthStore.getState().setToken(token);
}

export function clearAuthToken(): void {
  useAuthStore.getState().clearToken();
}
