import { motion } from 'framer-motion';
import { Bell, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { pageVariants } from '../lib/animations';

function Notifications() {
  const notifications = [
    {
      id: 1,
      type: 'info',
      title: 'New Feature Available',
      message: 'You can now export tenant data as a CSV file from the Tenants page.',
      time: '2 hours ago',
      read: false
    },
    {
      id: 2,
      type: 'success',
      title: 'Rent Payment Received',
      message: 'Payment of ₹12,000 received from John Doe for Room 101.',
      time: '5 hours ago',
      read: false
    },
    {
      id: 3,
      type: 'warning',
      title: 'Maintenance Alert',
      message: 'New plumbing issue reported in Room 204.',
      time: '1 day ago',
      read: true
    }
  ];

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-[#12B76A]" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-[#F59E0B]" />;
      case 'info':
      default:
        return <Info size={20} className="text-[#3B82F6]" />;
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="max-w-[700px] mx-auto h-full flex flex-col overflow-y-auto pr-1"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-8">
        <Bell size={24} className="text-[#1C6C41]" />
        <h1 className="text-2xl font-bold text-[#1F2937]">Notifications</h1>
      </div>

      {/* Notifications List */}
      <div className="flex flex-col gap-4">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
              notif.read ? 'bg-white border-[#E8E9ED]' : 'bg-[#EEFBF4] border-[#A8E6C3]'
            }`}
          >
            <div className="mt-1 flex-shrink-0">
              {getIcon(notif.type)}
            </div>
            <div className="flex-1">
              <h3 className={`text-sm font-semibold mb-1 ${notif.read ? 'text-[#374151]' : 'text-[#1C6C41]'}`}>
                {notif.title}
              </h3>
              <p className="text-sm text-[#6B7280] mb-2">{notif.message}</p>
              <span className="text-xs text-[#9CA3AF] font-medium">{notif.time}</span>
            </div>
            {!notif.read && (
              <div className="w-2.5 h-2.5 rounded-full bg-[#1C6C41] mt-2 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default Notifications;
