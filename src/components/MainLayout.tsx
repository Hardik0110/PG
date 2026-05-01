import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

function MainLayout({ children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('pg_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('pg_sidebar_collapsed', String(sidebarCollapsed));
    } catch {}
  }, [sidebarCollapsed]);

  const sidebarWidth = sidebarCollapsed ? 64 : 240;

  return (
    <div className="h-screen flex overflow-hidden bg-[#F8F5F0]">
      {/* Sidebar — full height */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(c => !c)}
      />

      {/* Content — offset from sidebar */}
      <main
        className="flex-1 overflow-y-auto p-6 md:p-10"
        style={{ marginLeft: `${sidebarWidth}px`, transition: 'margin-left 0.3s ease' }}
      >
        <div className="max-w-[1280px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

export default MainLayout;
