import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, DoorOpen, Wrench, MessageSquare, X } from 'lucide-react';
import { commandPaletteVariants, backdropVariants } from '../../lib/animations';
import { MOCK_TENANTS, MOCK_ROOMS, MOCK_TICKETS, MOCK_NOTICES, MOCK_PGS } from '../../lib/mockData';

const CATEGORY_CONFIG = {
  TENANTS: { label: 'Tenants', icon: Users, route: '/tenants' },
  ROOMS: { label: 'Rooms', icon: DoorOpen, route: '/rooms' },
  MAINTENANCE: { label: 'Maintenance', icon: Wrench, route: '/maintenance' },
  INQUIRIES: { label: 'Inquiries', icon: MessageSquare, route: '/inquiries' },
};

function getPgName(pgId) {
  const pg = MOCK_PGS.find(p => p.id === pgId);
  return pg ? pg.name : '';
}

function buildSearchItems() {
  const items = [];

  MOCK_TENANTS.forEach(t => {
    items.push({
      id: t.id,
      category: 'TENANTS',
      primary: t.name,
      secondary: `Room ${t.room_number} - ${getPgName(t.pg_id)}`,
      route: '/tenants',
    });
  });

  MOCK_ROOMS.forEach(r => {
    items.push({
      id: r.id,
      category: 'ROOMS',
      primary: `Room ${r.room_number}`,
      secondary: `${r.type} - ${r.status} - ${getPgName(r.pg_id)}`,
      route: '/rooms',
    });
  });

  MOCK_TICKETS.forEach(tk => {
    items.push({
      id: tk.id,
      category: 'MAINTENANCE',
      primary: tk.title,
      secondary: `${tk.priority} priority - ${tk.status}`,
      route: '/maintenance',
    });
  });

  MOCK_NOTICES.forEach(n => {
    items.push({
      id: n.id,
      category: 'INQUIRIES',
      primary: n.title,
      secondary: `${n.created_by_name} - ${n.status}`,
      route: '/inquiries',
    });
  });

  return items;
}

const ALL_ITEMS = buildSearchItems();

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();

  // Filter results based on query
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return ALL_ITEMS.filter(
      item =>
        item.primary.toLowerCase().includes(q) ||
        item.secondary.toLowerCase().includes(q)
    );
  }, [query]);

  // Group results by category
  const grouped = useMemo(() => {
    const groups = {};
    results.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [results]);

  // Flat list for keyboard navigation
  const flatResults = useMemo(() => {
    const flat = [];
    Object.keys(CATEGORY_CONFIG).forEach(cat => {
      if (grouped[cat]) {
        grouped[cat].forEach(item => flat.push(item));
      }
    });
    return flat;
  }, [grouped]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [flatResults.length]);

  // Open on Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Open on custom event
  useEffect(() => {
    function handleCustomOpen() {
      setOpen(true);
    }
    window.addEventListener('open-command-palette', handleCustomOpen);
    return () => window.removeEventListener('open-command-palette', handleCustomOpen);
  }, []);

  // Focus input when opened, reset state when closed
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('[data-result-item]');
    if (items[selectedIndex]) {
      items[selectedIndex].scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const handleSelect = useCallback(
    (item) => {
      setOpen(false);
      navigate(item.route);
    },
    [navigate]
  );

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < flatResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : flatResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatResults[selectedIndex]) {
        handleSelect(flatResults[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  let flatIndex = -1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
          variants={backdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Palette */}
          <motion.div
            className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
            variants={commandPaletteVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onKeyDown={handleKeyDown}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search tenants, rooms, tickets..."
                className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
              />
              <button
                onClick={() => setOpen(false)}
                className="shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results area */}
            <div ref={listRef} className="max-h-[400px] overflow-y-auto">
              {/* Empty query */}
              {!query.trim() && (
                <div className="px-4 py-12 text-center">
                  <Search className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">
                    Type to search tenants, rooms, tickets...
                  </p>
                </div>
              )}

              {/* No results */}
              {query.trim() && flatResults.length === 0 && (
                <div className="px-4 py-12 text-center">
                  <p className="text-sm text-gray-500">
                    No results found for "<span className="font-medium text-gray-700">{query}</span>"
                  </p>
                </div>
              )}

              {/* Grouped results */}
              {Object.keys(CATEGORY_CONFIG).map(cat => {
                const items = grouped[cat];
                if (!items || items.length === 0) return null;
                const config = CATEGORY_CONFIG[cat];
                const Icon = config.icon;

                return (
                  <div key={cat} className="py-2">
                    <div className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      {config.label}
                    </div>
                    {items.map(item => {
                      flatIndex++;
                      const idx = flatIndex;
                      const isSelected = idx === selectedIndex;

                      return (
                        <button
                          key={item.id}
                          data-result-item
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#1C6C41]/[0.06] text-[#1C6C41]'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              isSelected ? 'text-[#1C6C41]' : 'text-gray-400'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {item.primary}
                            </p>
                            <p
                              className={`text-xs truncate ${
                                isSelected ? 'text-[#1C6C41]/70' : 'text-gray-400'
                              }`}
                            >
                              {item.secondary}
                            </p>
                          </div>
                          {isSelected && (
                            <span className="shrink-0 text-[10px] text-[#1C6C41] font-medium bg-[#1C6C41]/10 px-1.5 py-0.5 rounded">
                              Enter
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Footer hint */}
            {query.trim() && flatResults.length > 0 && (
              <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 bg-gray-50/80">
                <div className="flex items-center gap-3 text-[11px] text-gray-400">
                  <span>
                    <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-medium">
                      &uarr;&darr;
                    </kbd>{' '}
                    navigate
                  </span>
                  <span>
                    <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-medium">
                      Enter
                    </kbd>{' '}
                    open
                  </span>
                  <span>
                    <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-medium">
                      Esc
                    </kbd>{' '}
                    close
                  </span>
                </div>
                <span className="text-[11px] text-gray-400">
                  {flatResults.length} result{flatResults.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
