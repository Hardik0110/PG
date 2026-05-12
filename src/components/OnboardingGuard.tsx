import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
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

  // While the pgs query is still resolving, render a neutral splash. We
  // can't render <children/> yet because that lets pages like /dashboard
  // mount and fetch their own data, briefly flash, then get yanked by the
  // redirect below — the exact race the user reported.
  //
  // Exception: on /pg/add we DO want to show the page immediately. The
  // wizard is the destination of the no-PG redirect; there's no risk of
  // bouncing somewhere unwelcome.
  if (loading && location.pathname !== '/pg/add') {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center text-[#6B7280]">
        <Loader2 size={28} className="animate-spin text-[#1C6C41]" />
      </div>
    );
  }

  const hasNoPGs = (pgs?.length ?? 0) === 0;
  const onAddPG = location.pathname === '/pg/add';

  if (hasNoPGs && !onAddPG) {
    return <Navigate to="/pg/add" replace />;
  }

  return <>{children}</>;
}

export default OnboardingGuard;
