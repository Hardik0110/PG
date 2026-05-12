import { useCallback } from 'react';
import { useUIStore } from '../store';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Bell,
  Users,
  Home,
  Wrench,
  CreditCard,
  Wallet,
  User,
  Settings,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
  Building,
} from 'lucide-react';
import { clearToken, setToken, apiRequest } from '../lib/api';
import { sidebarVariants, backdropVariants } from '../lib/animations';
import { useCurrentUser } from '../hooks/use-current-user';
import { useQuery } from '@tanstack/react-query';

const LS_KEY = 'pg_sidebar_collapsed';

const NAV_SECTIONS = [
  {
    label: 'OVERVIEW',
    items: [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/notifications', icon: Bell, label: 'Notifications', badgeKey: 'notifications' },
    ],
  },
  {
    label: 'MANAGE',
    items: [
      { path: '/pgs', icon: Building, label: 'My PGs' },
      { path: '/tenants', icon: Users, label: 'Tenants' },
      { path: '/rooms', icon: Home, label: 'Rooms' },

      { path: '/maintenance', icon: Wrench, label: 'Maintenance', badgeKey: 'maintenance' },
      { path: '/transactions', icon: CreditCard, label: 'Transactions' },
      { path: '/expenses', icon: Wallet, label: 'Expenses' },
    ],
  },
  {
    label: 'SETTINGS',
    items: [
      { path: '/profile', icon: User, label: 'Profile' },
      { path: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
];

function Tooltip({ children, label, show }) {
  if (!show) return children;
  return (
    <div className="relative group/tip">
      {children}
      <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 opacity-0 transition-opacity duration-150 group-hover/tip:opacity-100 group-focus-within/tip:opacity-100">
        <div className="whitespace-nowrap rounded-md bg-gray-800 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg">
          {label}
        </div>
      </div>
    </div>
  );
}

function Badge({ count }) {
  if (!count || count <= 0) return null;
  return (
    <span className="ml-auto flex h-5 min-w-[18px] items-center justify-center rounded-full bg-[#1C6C41] px-1.5 text-[11px] font-semibold leading-none text-white">
      {count > 99 ? '99+' : count}
    </span>
  );
}

function Sidebar({ mobileOpen, onMobileClose, collapsed: controlledCollapsed, onToggleCollapse }) {
  const navigate = useNavigate();
  const { displayName, email, initial } = useCurrentUser();

  const storeCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const storeToggle = useUIStore((s) => s.toggleSidebar);

  const collapsed = controlledCollapsed !== undefined ? controlledCollapsed : storeCollapsed;

  // Live counts. Notifications: any unread (best-effort — backend may not
  // return read state, so we count items returned by /notifications/).
  // Maintenance: any open ticket from /tickets/my.
  const { data: notifications } = useQuery<any[]>({
    queryKey: ['notifications', 'unread'],
    queryFn: async () => {
      const res = await apiRequest('/api/v1/notifications/');
      return Array.isArray(res) ? res : res?.data ?? [];
    },
    staleTime: 60_000,
    retry: false,
  });
  const { data: tickets } = useQuery<any[]>({
    queryKey: ['tickets', 'open'],
    queryFn: async () => {
      const res = await apiRequest('/api/v1/tickets/my');
      return Array.isArray(res) ? res : res?.data ?? [];
    },
    staleTime: 60_000,
    retry: false,
  });
  const badges = {
    notifications: (notifications ?? []).filter(
      (n: any) => n?.is_read === false || n?.read === false || n?.status === 'unread',
    ).length || (notifications ?? []).length,
    maintenance: (tickets ?? []).filter(
      (t: any) => t?.status === 'open' || t?.status === 'in_progress',
    ).length,
  };

  const toggleCollapsed = useCallback(() => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      storeToggle();
    }
  }, [onToggleCollapse, storeToggle]);

  const handleLogout = useCallback(() => {
    if (!window.confirm('Log out of your account?')) return;
    clearToken();
    setToken(null);
    navigate('/auth');
  }, [navigate]);

  const renderNavItem = (item) => {
    const Icon = item.icon;
    const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0;

    return (
      <Tooltip key={item.path} label={item.label} show={collapsed}>
        <NavLink
          to={item.path}
          onClick={onMobileClose}
          className={({ isActive }) =>
            [
              'group relative flex items-center gap-3 rounded-xl text-[14px] font-medium transition-all duration-150',
              collapsed ? 'justify-center mx-auto w-10 h-10' : 'px-3 py-2.5',
              isActive
                ? collapsed
                  ? 'bg-[#1C6C41]/10 text-[#1C6C41]'
                  : 'bg-[#1C6C41]/[0.06] text-[#1C6C41]'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800',
            ].join(' ')
          }
        >
          {({ isActive }) => (
            <>

              {isActive && !collapsed && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  className="absolute -left-3 top-1/2 -translate-y-1/2 h-7 w-[3px] rounded-r-full bg-[#1C6C41]"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon size={20} className="shrink-0" />
              {!collapsed && (
                <>
                  <span className="truncate">{item.label}</span>
                  <Badge count={badgeCount} />
                </>
              )}

              {collapsed && badgeCount > 0 && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#1C6C41] ring-2 ring-white" />
              )}
            </>
          )}
        </NavLink>
      </Tooltip>
    );
  };

  const renderSection = (section, idx) => (
    <div key={section.label} className={idx > 0 ? 'mt-6' : ''}>
      {!collapsed && idx > 0 && (
        <div className="mx-2 mb-4 border-t border-gray-200" />
      )}
      {collapsed && idx > 0 && (
        <div className="mx-2 mb-3 border-t border-gray-200" />
      )}
      {!collapsed && (
        <p className="mb-2 px-3 text-[10.5px] font-bold uppercase tracking-[0.1em] text-gray-400">
          {section.label}
        </p>
      )}
      <div className="flex flex-col gap-1">
        {section.items.map(renderNavItem)}
      </div>
    </div>
  );

  const sidebarContent = (
    <>

      <div className={`shrink-0 flex items-center ${collapsed ? 'px-2 py-4 justify-center' : 'px-4 py-4 justify-between'}`}>
        {collapsed ? (
          <button
            onClick={toggleCollapsed}
            className="w-9 h-9 rounded-full bg-[#1C6C41] text-white flex items-center justify-center transition-all hover:bg-[#155331]"
            aria-label="Expand sidebar"
          >
            <ChevronRight size={16} />
          </button>
        ) : (
          <>
            <img src="/logo.png" alt="TrustCircle" className="h-[24px]" />
            <button
              onClick={toggleCollapsed}
              className="w-7 h-7 rounded-full bg-[#1C6C41] text-white flex items-center justify-center transition-all hover:bg-[#155331] hover:scale-105"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={14} />
            </button>
          </>
        )}
      </div>

      <div className="mx-3 border-t border-gray-200" />

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
        {NAV_SECTIONS.map(renderSection)}
      </nav>

      <div className="mx-3 border-t border-gray-200" />

      <div className={`shrink-0 ${collapsed ? 'px-2 py-3' : 'px-3 py-3'}`}>

        <div
          className={`flex items-center rounded-xl ${
            collapsed ? 'flex-col gap-2 px-1 py-2' : 'gap-3 px-3 py-2 transition-colors hover:bg-gray-50'
          }`}
        >
          <Tooltip label={displayName} show={collapsed}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1C6C41] to-[#3DBF7E] text-sm font-bold text-white">
              {initial}
            </div>
          </Tooltip>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-medium text-gray-800">{displayName}</p>
              {email && <p className="truncate text-[11.5px] text-gray-400 mt-0.5">{email}</p>}
            </div>
          )}

          <Tooltip label="Logout" show={collapsed}>
            <button
              onClick={handleLogout}
              className="shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
              aria-label="Logout"
            >
              <LogOut size={16} />
            </button>
          </Tooltip>
        </div>
      </div>
    </>
  );

  const desktopSidebar = (
    <motion.nav
      className="fixed left-0 top-0 bottom-0 z-[100] hidden flex-col bg-white border-r border-gray-200 md:flex"
      variants={sidebarVariants}
      initial={false}
      animate={collapsed ? 'collapsed' : 'expanded'}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {sidebarContent}

    </motion.nav>
  );

  const mobileDrawer = (
    <AnimatePresence>
      {mobileOpen && (
        <>

          <motion.div
            key="sidebar-backdrop"
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onMobileClose}
            className="fixed inset-0 z-[115] bg-black/30 backdrop-blur-sm md:hidden"
          />

          <motion.nav
            key="sidebar-mobile"
            initial={{ x: '-100%' }}
            animate={{ x: 0, transition: { type: 'spring', damping: 30, stiffness: 300 } }}
            exit={{ x: '-100%', transition: { duration: 0.2 } }}
            className="fixed left-0 top-0 bottom-0 z-[120] flex w-[280px] max-w-[85vw] flex-col bg-white md:hidden"
          >

            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <img src="/logo.png" alt="TrustCircle" className="h-[22px]" />
              <button
                onClick={onMobileClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mx-3 border-t border-gray-200" />

            <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3">
              {NAV_SECTIONS.map((section, idx) => (
                <div key={section.label} className={idx > 0 ? 'mt-5' : ''}>
                  <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.05em] text-gray-400">
                    {section.label}
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0;
                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={onMobileClose}
                          className={({ isActive }) =>
                            [
                              'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                              isActive
                                ? 'bg-[#1C6C41]/[0.06] text-[#1C6C41]'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800',
                            ].join(' ')
                          }
                        >
                          {({ isActive }) => (
                            <>
                              {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-[#1C6C41]" />
                              )}
                              <Icon size={20} className="shrink-0" />
                              <span className="truncate">{item.label}</span>
                              <Badge count={badgeCount} />
                            </>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            <div className="mx-3 border-t border-gray-200" />

            <div className="shrink-0 px-3 py-3">
              <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-gray-50">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1C6C41] to-[#3DBF7E] text-xs font-bold text-white">
                  U
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-800">User</p>
                  <p className="truncate text-[11px] text-gray-400">user@trustcircle.com</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="shrink-0 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  aria-label="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {desktopSidebar}
      {mobileDrawer}
    </>
  );
}

export default Sidebar;
