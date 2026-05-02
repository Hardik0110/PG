import { X, Users, Phone, Mail, Calendar, BedDouble } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BED_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatCurrency(amt) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amt || 0);
}

export default function RoomDetailsModal({ open, onClose, room, tenants = [] }) {
  if (!room && !open) return null;

  return (
    <AnimatePresence>
      {open && room && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
          >

            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-[#F9FAFB]">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#111827] flex items-center gap-2">
                  <Users size={20} className="text-[#1C6C41]" />
                  Room {room.roomNumber}
                </h2>
                <p className="text-xs text-[#6B7280] mt-0.5 ml-7">{room.pgName}</p>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-[#9CA3AF] hover:text-[#374151] rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">

              <div className="grid grid-cols-3 gap-3 px-6 py-4 border-b border-[#E5E7EB] bg-white">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-[#9CA3AF] font-medium">Type</p>
                  <p className="text-sm font-semibold text-[#1F2937] capitalize mt-0.5">{room.type}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-[#9CA3AF] font-medium">Floor</p>
                  <p className="text-sm font-semibold text-[#1F2937] mt-0.5">Floor {room.floor}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-[#9CA3AF] font-medium">Rent</p>
                  <p className="text-sm font-mono font-semibold text-[#1C6C41] mt-0.5">
                    {formatCurrency(room.rent)}
                  </p>
                </div>
              </div>

              <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-[#374151]">
                    Occupants
                    <span className="ml-2 text-xs font-normal text-[#9CA3AF]">
                      ({tenants.length} {tenants.length === 1 ? 'tenant' : 'tenants'})
                    </span>
                  </h3>
                </div>

                {tenants.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Users size={32} className="text-[#D1D5DB] mb-2" />
                    <p className="text-sm text-[#6B7280]">No tenant records found for this room.</p>
                  </div>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {tenants.map((t, idx) => (
                      <li
                        key={t.id}
                        className="flex items-start gap-3 p-3 rounded-lg border border-[#E8E9ED] hover:border-[#1C6C41]/30 hover:bg-[#F9FAFB] transition-colors"
                      >

                        <div className="w-10 h-10 rounded-full bg-[#1C6C41]/10 text-[#1C6C41] font-semibold text-sm flex items-center justify-center shrink-0">
                          {getInitials(t.name)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-sm text-[#1F2937] truncate">{t.name}</p>
                            <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1C6C41]/10 text-[#1C6C41] text-[11px] font-semibold">
                              <BedDouble size={11} />
                              Bed {BED_LABELS[idx] || idx + 1}
                            </span>
                          </div>

                          <div className="flex flex-col gap-0.5 mt-1 text-xs text-[#6B7280]">
                            {t.phone_number && (
                              <span className="inline-flex items-center gap-1.5">
                                <Phone size={11} className="text-[#9CA3AF]" />
                                {t.phone_number}
                              </span>
                            )}
                            {t.email && (
                              <span className="inline-flex items-center gap-1.5 truncate">
                                <Mail size={11} className="text-[#9CA3AF]" />
                                <span className="truncate">{t.email}</span>
                              </span>
                            )}
                            {t.move_in_date && (
                              <span className="inline-flex items-center gap-1.5">
                                <Calendar size={11} className="text-[#9CA3AF]" />
                                Moved in {formatDate(t.move_in_date)}
                              </span>
                            )}
                          </div>

                          {t.rent != null && (
                            <p className="mt-1.5 text-xs font-mono font-semibold text-[#1C6C41]">
                              {formatCurrency(t.rent)}/mo
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="flex justify-end px-6 py-4 border-t border-[#E5E7EB] bg-[#F9FAFB]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-white bg-[#1C6C41] rounded-lg hover:bg-[#155331] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
