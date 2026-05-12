import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { clearToken } from '../lib/api';

interface Props {
  children: ReactNode;
  /** Optional welcome banner — pass null to hide. */
  banner?: ReactNode | null;
}

/**
 * Stripped-down chrome for brand-new owners who haven't created their first
 * PG yet. No sidebar, no header navigation — just logo + logout. Used for
 * the AddPG wizard when pgs.length === 0.
 *
 * Once a PG exists the route uses the full MainLayout instead.
 */
export default function MinimalLayout({ children, banner }: Props) {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearToken();
    navigate('/auth', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0] flex flex-col">
      <header className="shrink-0 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <img src="/logo.png" alt="TrustCircle" className="h-[26px] w-auto" />
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 h-10 px-4 border border-[#D1D5DB] rounded-lg text-sm font-medium text-[#374151] bg-white hover:bg-[#F9FAFB] transition-colors"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {banner !== null && (
        <div className="shrink-0 border-b border-[#E5E7EB] bg-gradient-to-r from-[#1C6C41]/8 via-[#A8E6C3]/12 to-transparent">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-[#1C6C41]/15 flex items-center justify-center shrink-0">
              <span role="img" aria-label="namaste" className="text-xl leading-none">🙏</span>
            </div>
            <div>
              {banner ?? (
                <>
                  <h2 className="text-[15px] font-semibold text-[#111827]">Welcome aboard!</h2>
                  <p className="text-[13px] text-[#6B7280]">
                    Add your first PG to unlock the dashboard, tenants, payments, and the rest of the workspace.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
