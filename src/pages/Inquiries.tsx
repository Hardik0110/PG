import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronDown, Phone, Mail, ArrowLeft, Send } from 'lucide-react';
import { apiRequest, unwrapData } from '../lib/api';
import { pageVariants, staggerContainer, fadeUp } from '../lib/animations';
import Badge, { BADGE_MAP } from '../components/ui/Badge';
import Drawer from '../components/ui/Drawer';

const AVATAR_COLORS = [
  '#2E90FA', '#7C3AED', '#F79009', '#12B76A', '#F04438',
  '#06AED4', '#E04F5F', '#667085', '#D444F1', '#15803D',
];

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function statusToBadge(status) {
  const s = status?.toLowerCase();
  if (s === 'new') return { variant: 'info', label: 'New' };
  if (s === 'responded') return { variant: 'success', label: 'Responded' };
  if (s === 'closed') return { variant: 'neutral', label: 'Closed' };
  return { variant: 'info', label: status || 'New' };
}

const PG_CHIP_COLORS = [
  { bg: '#EFF8FF', text: '#2E90FA' },
  { bg: '#F5F3FF', text: '#7C3AED' },
  { bg: '#ECFDF3', text: '#12B76A' },
  { bg: '#FFFAEB', text: '#F79009' },
  { bg: '#FEF3F2', text: '#F04438' },
];

function getPgChipColor(pgName) {
  let hash = 0;
  for (let i = 0; i < pgName.length; i++) hash = pgName.charCodeAt(i) + ((hash << 5) - hash);
  return PG_CHIP_COLORS[Math.abs(hash) % PG_CHIP_COLORS.length];
}

function Inquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    let mounted = true;
    const loadInquiries = async () => {
      try {
        const payload = await apiRequest('/api/v1/notices/');
        const data = unwrapData(payload, []);
        if (mounted && Array.isArray(data)) {
          setInquiries(data.map((item, index) => ({
            id: item.id || index + 1,
            name: item.created_by_name || item.author || 'Interested Tenant',
            phone: item.phone || null,
            email: item.email || null,
            pgName: item.pg_name || (item.pg_id === 'pg-001' ? 'Sunrise PG' : item.pg_id === 'pg-002' ? 'Cozy Living PG' : item.pg_id || 'Unknown'),
            date: item.created_at ? new Date(item.created_at).toLocaleDateString() : null,
            time: item.created_at ? new Date(item.created_at).toLocaleTimeString() : null,
            rawDate: item.created_at ? new Date(item.created_at) : null,
            status: item.status || 'new',
            message: item.message || item.title || 'No message',
          })));
        }
      } catch {
        if (mounted) setInquiries([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadInquiries();
    return () => { mounted = false; };
  }, []);

  const filtered = inquiries.filter((inq) => {
    if (statusFilter !== 'all' && inq.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !inq.name.toLowerCase().includes(q) &&
        !inq.pgName.toLowerCase().includes(q) &&
        !inq.message.toLowerCase().includes(q)
      ) return false;
    }
    if (dateFilter === '7d' && inq.rawDate) {
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
      if (inq.rawDate < weekAgo) return false;
    }
    if (dateFilter === '30d' && inq.rawDate) {
      const monthAgo = new Date(); monthAgo.setDate(monthAgo.getDate() - 30);
      if (inq.rawDate < monthAgo) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-[#6B7280]">
        Loading inquiries...
      </div>
    );
  }

  return (
    <motion.div
      className="h-full flex flex-col"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >

      <div className="flex items-center gap-4 mb-5 flex-wrap">
        <h1 className="text-2xl font-bold text-[#111827] mr-auto">Inquiries</h1>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search inquiries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm rounded-lg border border-[#E5E7EB] bg-white focus:outline-none focus:ring-2 focus:ring-[#2E90FA]/20 focus:border-[#2E90FA] w-56 placeholder:text-[#9CA3AF]"
          />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 text-sm rounded-lg border border-[#E5E7EB] bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2E90FA]/20 focus:border-[#2E90FA]"
          >
            <option value="all">Status</option>
            <option value="new">New</option>
            <option value="responded">Responded</option>
            <option value="closed">Closed</option>
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 text-sm rounded-lg border border-[#E5E7EB] bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2E90FA]/20 focus:border-[#2E90FA]"
          >
            <option value="all">Date</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-[#6B7280]">No inquiries found</div>
          ) : (
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-[#F9FAFB] z-10">
                <tr>
                  {['Name', 'Contact', 'PG', 'Date', 'Message', 'Status'].map((header) => (
                    <th
                      key={header}
                      className="text-left px-6 py-4 text-[12px] font-bold text-[#6B7280] uppercase tracking-wide border-b border-[#E5E7EB]"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <motion.tbody variants={staggerContainer} initial="initial" animate="animate">
                {filtered.map((inquiry) => {
                  const badge = statusToBadge(inquiry.status);
                  const avatarColor = getAvatarColor(inquiry.name);
                  const pgChip = getPgChipColor(inquiry.pgName);
                  return (
                    <motion.tr
                      key={inquiry.id}
                      variants={fadeUp}
                      className="h-14 border-b border-[#F3F4F6] hover:bg-[#F9FAFB] cursor-pointer transition-colors"
                      onClick={() => setSelectedInquiry(inquiry)}
                    >

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                            style={{ backgroundColor: avatarColor }}
                          >
                            {getInitials(inquiry.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-[#111827] truncate">{inquiry.name}</div>
                            <div className="text-xs text-[#6B7280]">New inquiry</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                            <Phone size={11} className="shrink-0" />
                            {inquiry.phone ? inquiry.phone : <span className="text-[#9CA3AF]">&mdash;</span>}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                            <Mail size={11} className="shrink-0" />
                            {inquiry.email ? inquiry.email : <span className="text-[#9CA3AF]">&mdash;</span>}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className="inline-block px-2 py-0.5 rounded text-[11px] font-medium"
                          style={{ backgroundColor: pgChip.bg, color: pgChip.text }}
                        >
                          {inquiry.pgName}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-[#111827]">{inquiry.date || <span className="text-[#9CA3AF]">&mdash;</span>}</div>
                        {inquiry.time && <div className="text-xs text-[#9CA3AF]">{inquiry.time}</div>}
                      </td>

                      <td className="px-6 py-4 max-w-[280px]">
                        <span className="text-sm text-[#6B7280] line-clamp-1">{inquiry.message}</span>
                      </td>

                      <td className="px-6 py-4">
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </td>
                    </motion.tr>
                  );
                })}
              </motion.tbody>
            </table>
          )}
        </div>
      </div>

      <Drawer
        open={!!selectedInquiry}
        onClose={() => { setSelectedInquiry(null); setReplyText(''); }}
        title={selectedInquiry?.name || 'Inquiry'}
      >
        {selectedInquiry && (
          <div className="flex flex-col gap-6">

            <div className="flex items-center justify-between">
              <button
                onClick={() => { setSelectedInquiry(null); setReplyText(''); }}
                className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#111827] transition-colors cursor-pointer"
              >
                <ArrowLeft size={16} />
                Back
              </button>
              <Badge variant={statusToBadge(selectedInquiry.status).variant}>
                {statusToBadge(selectedInquiry.status).label}
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              {(() => {
                const pgChip = getPgChipColor(selectedInquiry.pgName);
                return (
                  <span
                    className="inline-block px-2 py-0.5 rounded text-[11px] font-medium"
                    style={{ backgroundColor: pgChip.bg, color: pgChip.text }}
                  >
                    {selectedInquiry.pgName}
                  </span>
                );
              })()}
              <span className="text-xs text-[#9CA3AF]">
                {selectedInquiry.date}{selectedInquiry.time ? ` at ${selectedInquiry.time}` : ''}
              </span>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">Message</h3>
              <div className="bg-[#F9FAFB] rounded-lg p-4 text-sm text-[#374151] leading-relaxed">
                {selectedInquiry.message}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">Contact</h3>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-[#374151]">
                  <Phone size={14} className="text-[#9CA3AF]" />
                  {selectedInquiry.phone || <span className="text-[#9CA3AF]">&mdash;</span>}
                </div>
                <div className="flex items-center gap-2 text-sm text-[#374151]">
                  <Mail size={14} className="text-[#9CA3AF]" />
                  {selectedInquiry.email || <span className="text-[#9CA3AF]">&mdash;</span>}
                </div>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-[#E5E7EB]">
              <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">Reply</h3>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your response..."
                rows={4}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-[#E5E7EB] bg-white resize-none focus:outline-none focus:ring-2 focus:ring-[#2E90FA]/20 focus:border-[#2E90FA] placeholder:text-[#9CA3AF]"
              />
              <button
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-[#2E90FA] hover:bg-[#1C7ED6] text-white text-sm font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!replyText.trim()}
              >
                <Send size={14} />
                Send Response
              </button>
            </div>
          </div>
        )}
      </Drawer>
    </motion.div>
  );
}

export default Inquiries;
