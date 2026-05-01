import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertCircle, AlertTriangle } from 'lucide-react';
import { toastVariants } from '../../lib/animations';

const ToastContext = createContext(null);

const toastConfig = {
  success: {
    icon: Check,
    borderColor: 'border-l-green-500',
    bg: 'bg-[#ECFDF3]',
    iconColor: 'text-green-600',
  },
  error: {
    icon: AlertCircle,
    borderColor: 'border-l-red-500',
    bg: 'bg-[#FEF3F2]',
    iconColor: 'text-red-600',
  },
  warning: {
    icon: AlertTriangle,
    borderColor: 'border-l-amber-500',
    bg: 'bg-[#FFFAEB]',
    iconColor: 'text-amber-600',
  },
};

let toastIdCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    clearTimeout(timersRef.current[id]);
    delete timersRef.current[id];
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(({ type = 'success', message }) => {
    const id = ++toastIdCounter;

    setToasts((prev) => [...prev, { id, type, message }]);

    timersRef.current[id] = setTimeout(() => {
      removeToast(id);
    }, 4000);

    return id;
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[400] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => {
            const config = toastConfig[t.type] || toastConfig.success;
            const Icon = config.icon;

            return (
              <motion.div
                key={t.id}
                layout
                variants={toastVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className={`flex items-center gap-3 min-w-[320px] rounded-lg shadow-lg p-4 border-l-[3px] ${config.borderColor} ${config.bg}`}
              >
                <Icon size={18} className={`${config.iconColor} shrink-0`} />
                <span className="flex-1 text-sm text-gray-800">{t.message}</span>
                <button
                  onClick={() => removeToast(t.id)}
                  className="p-0.5 rounded text-gray-400 hover:text-gray-600 transition-colors cursor-pointer shrink-0"
                  aria-label="Dismiss toast"
                >
                  <X size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
