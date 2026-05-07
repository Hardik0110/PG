import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, ChevronRight, Menu, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clearToken, setToken, apiRequest } from '../lib/api';

const BREADCRUMB_MAP = {
  '/dashboard': ['Dashboard'],
  '/tenants': ['Tenants'],
  '/rooms': ['Rooms'],
  '/inquiries': ['Inquiries'],
  '/maintenance': ['Maintenance'],
  '/transactions': ['Transactions'],
  '/pg/edit': ['PG', 'Edit'],
  '/pg/add': ['PG', 'Add'],
  '/profile': ['Profile'],
  '/settings': ['Settings'],
};

function resolveBreadcrumbs(pathname) {
  if (BREADCRUMB_MAP[pathname]) return BREADCRUMB_MAP[pathname];
  if (pathname.startsWith('/pg/edit')) return BREADCRUMB_MAP['/pg/edit'];
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return ['Dashboard'];
  return segments.map(s => s.charAt(0).toUpperCase() + s.slice(1));
}

function relativeTime(iso) {
  if (!iso) return '';
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const dropdownVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease: 'easeOut' } },
  exit: { opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.12, ease: 'easeIn' } },
};

function Header({ onMenuClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  const breadcrumbs = useMemo(() => resolveBreadcrumbs(location.pathname), [location.pathname]);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Poll notifications every 60s
  useEffect(() => {
    let mounted = true;
    const fetchNotifications = async () => {
      try {
        const list = await apiRequest('/api/v1/notifications/');
        if (mounted) setNotifications(Array.isArray(list) ? list.slice(0, 10) : []);
      } catch { /* ignore */ }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60_000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('open-command-palette'));
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  function handleLogout() {
    clearToken();
    setToken(null);
    navigate('/auth');
  }

  return (
    <header className="h-[60px] md:h-[72px] min-h-[60px] md:min-h-[72px] shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-3 md:px-10 relative z-[110]">

      <div className="flex items-center gap-2 md:gap-6 min-w-0">
        <button
          onClick={onMenuClick}
          className="md:hidden flex items-center justify-center p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
        >
          <Menu size={22} />
        </button>

        <span className="md:hidden text-[15px] font-semibold text-gray-800 select-none">TrustCircle</span>

        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-2 text-[15px]" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <span key={idx} className="flex items-center gap-1.5">
                  {idx > 0 && <ChevronRight size={14} className="text-gray-300" />}
                  <span className={isLast ? 'font-semibold text-gray-800' : 'text-gray-400'}>
                    {crumb}
                  </span>
                </span>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="flex items-center gap-3">

        <button
          onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
          className="hidden md:flex items-center gap-2.5 rounded-[10px] border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm text-gray-400 hover:border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer min-w-[240px]"
        >
          <Search size={15} className="shrink-0" />
          <span className="truncate">Search tenants, rooms, tickets...</span>
          <kbd className="ml-auto hidden lg:inline-flex items-center gap-0.5 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[11px] font-medium text-gray-400">
            <span className="text-xs">&#8984;</span>K
          </kbd>
        </button>

        <button
          onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
          className="md:hidden flex items-center justify-center p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
        >
          <Search size={20} />
        </button>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotifications(p => !p); setShowUserMenu(false); }}
            className="relative flex items-center justify-center p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute top-full right-0 mt-2 w-[320px] max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <span className="text-sm font-semibold text-gray-800">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[11px] font-semibold text-white bg-red-500 rounded-full px-1.5 py-0.5 leading-none">{unreadCount}</span>
                  )}
                </div>
                <div className="max-h-[280px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-xs text-gray-400">No notifications</div>
                  ) : notifications.map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => { setShowNotifications(false); navigate('/notifications'); }}
                      className={`px-4 py-3 border-b border-gray-50 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors ${!notif.is_read ? 'bg-[#1C6C41]/[0.03]' : ''}`}
                    >
                      <div className="flex items-start gap-2.5">
                        {!notif.is_read && <span className="mt-1.5 w-1.5 h-1.5 bg-[#1C6C41] rounded-full shrink-0" />}
                        <div>
                          <p className="text-[13px] text-gray-800 leading-snug">{notif.title}</p>
                          {notif.body && <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">{notif.body}</p>}
                          <p className="text-[11px] text-gray-400 mt-0.5">{relativeTime(notif.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative" ref={userRef}>
          <button
            onClick={() => { setShowUserMenu(p => !p); setShowNotifications(false); }}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1C6C41] to-[#3DBF7E] flex items-center justify-center text-white text-sm font-semibold">
              U
            </div>
            <ChevronDown
              size={14}
              className={`hidden md:block text-gray-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}
            />
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute top-full right-0 mt-2 w-[180px] bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50"
              >
                {[
                  { icon: User, label: 'Profile', path: '/profile' },
                  { icon: Settings, label: 'Settings', path: '/settings' },
                ].map(item => (
                  <button
                    key={item.path}
                    onClick={() => { setShowUserMenu(false); navigate(item.path); }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors text-left"
                  >
                    <item.icon size={16} className="text-gray-400" />
                    {item.label}
                  </button>
                ))}
                <div className="border-t border-gray-100" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

export default Header;
