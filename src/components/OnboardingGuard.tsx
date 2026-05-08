import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useResource } from '../data';
import { useAuthStore } from '../store';

/**
 * Forces brand-new owners through the AddPG wizard before they can reach
 * any other protected page. If the user is authenticated but has zero PGs,
 * any navigation that isn't already to `/pg/add` is redirected there.
 *
 * Wrap protected route elements with this. Skip for `/auth` and `/pg/add`
 * themselves.
 */
function OnboardingGuard({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => !!s.token);

  const { data: pgs, loading } = useResource('pgs', { joinPg: false, enabled: isAuthenticated });

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Don't redirect mid-fetch — let the children render their loading state.
  if (loading) return <>{children}</>;

  const hasNoPGs = (pgs?.length ?? 0) === 0;
  const onAddPG = location.pathname === '/pg/add';

  if (hasNoPGs && !onAddPG) {
    return <Navigate to="/pg/add" replace />;
  }

  return <>{children}</>;
}

export default OnboardingGuard;
