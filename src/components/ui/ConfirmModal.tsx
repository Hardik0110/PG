import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { modalVariants, backdropVariants } from '../../lib/animations';

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  variant = 'danger',
}) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (open && cancelRef.current) {
      cancelRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const confirmStyles = {
    danger: 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500',
    warning: 'bg-amber-500 hover:bg-amber-600 focus-visible:ring-amber-400',
  };

  const iconStyles = {
    danger: 'bg-red-100 text-red-600',
    warning: 'bg-amber-100 text-amber-600',
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative z-10 bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6"
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {/* Icon */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${iconStyles[variant] || iconStyles.danger}`}>
              <AlertTriangle size={20} />
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

            {/* Message */}
            <p className="text-sm text-gray-600 mb-6">{message}</p>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <button
                ref={cancelRef}
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer ${confirmStyles[variant] || confirmStyles.danger}`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
