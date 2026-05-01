import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { drawerVariants, backdropVariants } from '../../lib/animations';

export default function Drawer({
  open,
  onClose,
  title,
  children,
  width = 480,
}) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (open && closeButtonRef.current) {
      closeButtonRef.current.focus();
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

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[300]">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed right-0 top-0 bottom-0 bg-white shadow-xl flex flex-col"
            style={{ width: `${width}px`, maxWidth: '100vw' }}
            variants={drawerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-lg text-gray-900">{title}</h2>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Close drawer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
