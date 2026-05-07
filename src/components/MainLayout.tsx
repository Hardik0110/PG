import Sidebar from './Sidebar';
import Header from './Header';
import { useUIStore } from '../store';

function MainLayout({ children }) {
  const { sidebarCollapsed, toggleSidebar, mobileSidebarOpen, setMobileSidebarOpen } = useUIStore();

  return (
    <div className="h-screen h-svh flex overflow-hidden bg-[#F8F5F0]">

      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
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
          <div className="px-4 pt-4 pb-3 md:px-5 md:pt-5 lg:px-10 lg:pt-10 max-w-[1280px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
