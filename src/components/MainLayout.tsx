import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

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

  return (
    <div className="h-screen h-svh flex overflow-hidden bg-[#F8F5F0]">

      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(c => !c)}
      />

      <div
        className={`flex-1 flex flex-col overflow-hidden ml-0 ${
          sidebarCollapsed ? 'md:ml-[64px]' : 'md:ml-[240px]'
        } transition-[margin-left] duration-300`}
      >

        <div className="md:hidden">
          <Header onMenuClick={() => setMobileSidebarOpen(true)} />
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="px-4 pt-4 pb-3 md:px-10 md:pt-10 md:pb-3 max-w-[1280px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
