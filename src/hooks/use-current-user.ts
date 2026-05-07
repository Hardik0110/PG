import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/api';

export interface CurrentUser {
  id?: string;
  full_name?: string;
  name?: string;
  email?: string;
  role?: string;
  phone?: string;
  [key: string]: unknown;
}

export function useCurrentUser() {
  const query = useQuery<CurrentUser>({
    queryKey: ['auth', 'me'],
    queryFn: () => apiRequest('/api/v1/auth/me'),
    staleTime: 5 * 60_000,
    retry: false,
  });

  const user = query.data;
  const displayName = user?.full_name || user?.name || user?.email?.split('@')[0] || 'User';
  const email = user?.email ?? '';
  const initial = (displayName || 'U').trim().charAt(0).toUpperCase() || 'U';

  return {
    user,
    displayName,
    email,
    initial,
    loading: query.isLoading,
    error: query.error as Error | null,
  };
}
