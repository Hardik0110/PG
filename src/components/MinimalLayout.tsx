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
            <div className="w-9 h-9 rounded-full bg-[#1C6C41]/15 flex items-center justify-center shrink-0 text-[#1C6C41]">
              {/* Namaste / hands-praying — inline SVG so it inherits currentColor.
                  Based on Phosphor Icons' HandsPraying (MIT-licensed). */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 256"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="16"
                strokeLinecap="round"
                strokeLinejoin="round"
                role="img"
                aria-label="namaste"
              >
                <path d="M120,200V102.45a8,8,0,0,1,1.18-4.18l38-62.39a16,16,0,0,1,29.34,11.74L172.4,99.2a8,8,0,0,0,3.55,9.93l40.2,22.71a16,16,0,0,1,5.94,22.93l-41.74,62.61a16,16,0,0,1-23.45,3.6L120,200Z" />
                <path d="M136,200V102.45a8,8,0,0,0-1.18-4.18l-38-62.39A16,16,0,0,0,67.48,47.62L83.6,99.2a8,8,0,0,1-3.55,9.93l-40.2,22.71a16,16,0,0,0-5.94,22.93l41.74,62.61a16,16,0,0,0,23.45,3.6L136,200Z" />
              </svg>
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
