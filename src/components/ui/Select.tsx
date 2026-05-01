import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export default function Select({ value, onChange, options, className = '', minWidth = 140 }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const escHandler = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', escHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', escHandler);
    };
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative ${className}`} style={{ minWidth }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
          open
            ? 'border-[#1C6C41] bg-[#F8F5F0] text-[#2B1D14]'
            : 'border-[#E0D3BD] bg-white hover:bg-[#FAF7F2] text-[#2B1D14]'
        }`}
      >
        <span className="truncate">{selected?.label ?? '—'}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-[#8B7355] transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute z-20 mt-1.5 left-0 right-0 min-w-full rounded-lg border border-[#E0D3BD] bg-white shadow-[0_8px_24px_-12px_rgba(60,30,15,0.25)] overflow-hidden py-1"
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-2 px-3.5 py-2 text-sm text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#EFE7DA] text-[#1C6C41] font-semibold'
                        : 'text-[#2B1D14] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && (
                      <Check size={14} strokeWidth={2.5} className="shrink-0 text-[#1C6C41]" />
                    )}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
