import React from 'react';
import { motion } from 'framer-motion';

export default function EmptyState({
  icon: Icon,
  imageSrc,
  imageAlt = '',
  title,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={imageAlt}
          className="w-44 h-44 mb-5 object-contain"
          loading="lazy"
        />
      ) : Icon ? (
        <div className="mb-4">
          <Icon size={48} strokeWidth={1.5} className="text-[#9CA3AF]" />
        </div>
      ) : null}

      {title && (
        <h3 className="text-[16px] font-semibold text-[#111827] mb-1">
          {title}
        </h3>
      )}

      {description && (
        <p className="text-[14px] text-[#6B7280] max-w-xs mb-5">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#10B981] hover:bg-[#059669] rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#10B981]/40 focus:ring-offset-2 cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
