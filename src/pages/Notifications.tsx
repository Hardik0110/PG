import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCircle, Info, AlertTriangle, Check, Trash2, Wrench, IndianRupee, UserPlus } from 'lucide-react';
import { pageVariants } from '../lib/animations';
import { apiRequest } from '../lib/api';
import Loader from '../components/ui/Loader';

function relativeTime(iso) {
  if (!iso) return '';
  const now = new Date();
  const then = new Date(iso);
  const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return then.toLocaleDateString();
}

function getIcon(kind) {
  switch (kind) {
    case 'ticket':
      return <Wrench size={20} className="text-[#F59E0B]" />;
    case 'payment':
      return <IndianRupee size={20} className="text-[#12B76A]" />;
    case 'tenant':
      return <UserPlus size={20} className="text-[#1C6C41]" />;
    case 'system':
    default:
      return <Info size={20} className="text-[#3B82F6]" />;
  }
}

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await apiRequest('/api/v1/notifications/');
        if (mounted) setNotifications(Array.isArray(list) ? list : []);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const markRead = async (id) => {
    try {
      const updated = await apiRequest(`/api/v1/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n.id === id ? updated : n));
    } catch (e) {
      console.error('Failed to mark read:', e);
    }
  };

  const markAllRead = async () => {
    try {
      await apiRequest('/api/v1/notifications/read-all', { method: 'PATCH' });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (e) {
      console.error('Failed to mark all read:', e);
    }
  };

  const remove = async (id) => {
    try {
      await apiRequest(`/api/v1/notifications/${id}`, { method: 'DELETE' });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (e) {
      console.error('Failed to delete:', e);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="max-w-[700px] mx-auto h-full flex flex-col overflow-y-auto pr-1"
    >
      <div className="flex items-center justify-between gap-2 mb-8 flex-wrap">
        <div className="flex items-center gap-2">
          <Bell size={24} className="text-[#1C6C41]" />
          <h1 className="text-xl sm:text-2xl font-bold text-[#1F2937]">Notifications</h1>
          {unreadCount > 0 && (
            <span className="text-[11px] font-semibold text-white bg-[#1C6C41] rounded-full px-2 py-0.5">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-sm font-medium text-[#1C6C41] hover:underline inline-flex items-center gap-1.5"
          >
            <Check size={14} />
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[40vh] text-[#6B7280]">
          <Loader size={32} />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-[#8B7355]">
          <Bell size={32} className="text-[#A89580] mb-2" />
          <p className="text-base font-medium">No notifications yet</p>
          <p className="text-sm mt-1">You'll see updates here when tickets, payments, or tenants change.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.is_read && markRead(notif.id)}
              className={`group flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer ${
                notif.is_read ? 'bg-white border-[#E8E9ED]' : 'bg-[#EEFBF4] border-[#A8E6C3]'
              }`}
            >
              <div className="mt-1 flex-shrink-0">
                {getIcon(notif.kind)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-semibold mb-1 ${notif.is_read ? 'text-[#374151]' : 'text-[#1C6C41]'}`}>
                  {notif.title}
                </h3>
                {notif.body && <p className="text-sm text-[#6B7280] mb-2">{notif.body}</p>}
                <span className="text-xs text-[#9CA3AF] font-medium">{relativeTime(notif.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                {!notif.is_read && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1C6C41] mt-2 flex-shrink-0" />
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); remove(notif.id); }}
                  className="p-1.5 text-[#9CA3AF] hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Delete notification"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default Notifications;
