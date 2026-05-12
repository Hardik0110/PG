import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, ChevronDown, MoreHorizontal, Wrench, Calendar } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { pageVariants, staggerContainer, fadeUp } from '../lib/animations';
import Badge from '../components/ui/Badge';
import Drawer from '../components/ui/Drawer';
import NewTicketModal from '../components/NewTicketModal';
import Loader from '../components/ui/Loader';
import Pagination from '../components/ui/Pagination';
import { useTablePageSize } from '../hooks/use-table-page-size';

const CATEGORIES = ['plumbing', 'electrical', 'furniture', 'cleaning', 'other'];
const PRIORITIES = ['high', 'medium', 'low'];
const STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

const CATEGORY_COLORS = {
  plumbing: { bg: '#EFF8FF', text: '#2E90FA' },
  electrical: { bg: '#FFFAEB', text: '#F79009' },
  furniture: { bg: '#F5F3FF', text: '#7C3AED' },
  cleaning: { bg: '#ECFDF3', text: '#12B76A' },
  other: { bg: '#F3F4F6', text: '#6B7280' },
};

const PRIORITY_DOTS = {
  high: '#F04438',
  medium: '#F79009',
  low: '#2E90FA',
};

const STATUS_BADGE = {
  open: { variant: 'danger', label: 'Open' },
  in_progress: { variant: 'warning', label: 'In Progress' },
  resolved: { variant: 'success', label: 'Resolved' },
  closed: { variant: 'neutral', label: 'Closed' },
};

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

function Maintenance() {
  const [tickets, setTickets] = useState([]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const menuRef = useRef(null);
  const [page, setPage] = useState(1);
  const [pgs, setPgs] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [tableRef, pageSize] = useTablePageSize(56);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [pgList, roomList] = await Promise.all([
          apiRequest('/api/v1/pg/'),
          apiRequest('/api/v1/rooms/'),
        ]);
        const pgArr = Array.isArray(pgList) ? pgList : [];
        const roomArr = Array.isArray(roomList) ? roomList : [];
        if (mounted) {
          setPgs(pgArr);
          setRooms(roomArr);
        }
        const all = [];
        for (const pg of pgArr) {
          try {
            const list = await apiRequest(`/api/v1/tickets/pg/${pg.id}`);
            if (Array.isArray(list)) {
              for (const ticket of list) {
                all.push({
                  id: ticket.id,
                  pg_id: ticket.pg_id,
                  pg_name: pg.name,
                  title: ticket.title || 'Untitled ticket',
                  description: ticket.description || '',
                  category: ticket.category || 'other',
                  priority: ticket.priority || 'medium',
                  status: ticket.status || 'open',
                  createdAt: ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : 'N/A',
                  rawCreatedAt: ticket.created_at ? new Date(ticket.created_at).toLocaleString() : 'N/A',
                });
              }
            }
          } catch { /* skip */ }
        }
        if (mounted) setTickets(all);
      } catch {
        if (mounted) setTickets([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!openMenuId) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openMenuId]);

  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      await apiRequest(`/api/v1/tickets/${ticketId}`, {
        method: 'PATCH',
        body: { status: newStatus },
      });
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
      );
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (e) {
      console.error('Failed to update ticket status:', e);
    } finally {
      setOpenMenuId(null);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    if (filterCategory !== 'all' && ticket.category !== filterCategory) return false;
    if (filterPriority !== 'all' && ticket.priority !== filterPriority) return false;
    if (filterStatus !== 'all' && ticket.status !== filterStatus) return false;
    return true;
  });

  useEffect(() => { setPage(1); }, [filterCategory, filterPriority, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pagedTickets = filteredTickets.slice(pageStart, pageStart + pageSize);

  const menuOptions = (ticket) => {
    const options = [];
    if (ticket.status === 'open') options.push({ label: 'Start Progress', status: 'in_progress' });
    if (ticket.status === 'in_progress') options.push({ label: 'Mark Resolved', status: 'resolved' });
    if (ticket.status === 'resolved') options.push({ label: 'Close', status: 'closed' });
    options.push({ label: 'View Details', action: 'view' });
    return options;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-[#6B7280]">
        <div className="flex flex-col items-center gap-3">
          <Loader size={32} />
          <span className="text-sm">Loading tickets...</span>
        </div>
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

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#111827]">Maintenance Tickets</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1C6C41] hover:bg-[#155331] text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
        >
          <Plus size={16} />
          New Ticket
        </button>
      </div>

      <div className="flex items-center gap-3 mb-5 flex-wrap">

        <div className="relative">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 text-sm rounded-lg border border-[#E5E7EB] bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2E90FA]/20 focus:border-[#2E90FA]"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{capitalize(cat)}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 text-sm rounded-lg border border-[#E5E7EB] bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2E90FA]/20 focus:border-[#2E90FA]"
          >
            <option value="all">All Priorities</option>
            {PRIORITIES.map((pri) => (
              <option key={pri} value={pri}>{capitalize(pri)}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 text-sm rounded-lg border border-[#E5E7EB] bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2E90FA]/20 focus:border-[#2E90FA]"
          >
            <option value="all">All Status</option>
            {STATUSES.map((st) => (
              <option key={st} value={st}>{st.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
        </div>

        <span className="ml-auto text-sm text-[#6B7280]">
          {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div ref={tableRef} className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          {filteredTickets.length === 0 ? (
            <div className="flex flex-col">
              <img
                src="/illustrations/B5-empty-maintenance_001.jpg"
                alt=""
                className="w-full h-48 sm:h-56 object-contain bg-[#F8F5F0]"
                loading="lazy"
              />
              <div className="py-8 text-center text-[#6B7280]">
                <p className="text-base font-medium">No tickets found</p>
                <p className="text-sm mt-1">All clear — no open maintenance requests.</p>
              </div>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead className="bg-[#1C6C41]">
                <tr>
                  {['Title', 'Category', 'Priority', 'Status', 'Created', 'Action'].map((header) => (
                    <th
                      key={header}
                      className={`text-left px-fluid-3 py-fluid-2 text-[12px] font-semibold text-white/90 uppercase tracking-[0.08em] whitespace-nowrap ${header === 'Action' ? 'w-16 text-center' : ''}`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <motion.tbody variants={staggerContainer} initial="initial" animate="animate">
                {pagedTickets.map((ticket) => {
                  const catColor = CATEGORY_COLORS[ticket.category] || CATEGORY_COLORS.other;
                  const priorityDot = PRIORITY_DOTS[ticket.priority] || PRIORITY_DOTS.medium;
                  const statusBadge = STATUS_BADGE[ticket.status] || STATUS_BADGE.open;

                  return (
                    <motion.tr
                      key={ticket.id}
                      variants={fadeUp}
                      className="h-14 border-b border-[#F3F4F6] hover:bg-[#F9FAFB] cursor-pointer transition-colors"
                      onClick={() => setSelectedTicket(ticket)}
                    >

                      <td className="px-fluid-3 py-fluid-2">
                        <span className="text-fluid-sm font-medium text-[#111827]">{ticket.title}</span>
                      </td>

                      <td className="px-fluid-3 py-fluid-2">
                        <span
                          className="inline-block px-2 py-0.5 rounded text-fluid-xs font-medium whitespace-nowrap"
                          style={{ backgroundColor: catColor.bg, color: catColor.text }}
                        >
                          {capitalize(ticket.category)}
                        </span>
                      </td>

                      <td className="px-fluid-3 py-fluid-2">
                        <span className="inline-flex items-center gap-1.5 text-fluid-sm text-[#374151] whitespace-nowrap">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: priorityDot }}
                          />
                          {capitalize(ticket.priority)}
                        </span>
                      </td>

                      <td className="px-fluid-3 py-fluid-2">
                        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                      </td>

                      <td className="px-fluid-3 py-fluid-2 text-fluid-sm text-[#6B7280] whitespace-nowrap">{ticket.createdAt}</td>

                      <td className="px-fluid-3 py-fluid-2 text-center relative">
                        <button
                          className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#374151] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === ticket.id ? null : ticket.id);
                          }}
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {openMenuId === ticket.id && (
                          <div
                            ref={menuRef}
                            className="absolute right-4 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-[#E5E7EB] py-1 z-50"
                          >
                            {menuOptions(ticket).map((opt) => (
                              <button
                                key={opt.label}
                                className="w-full text-left px-3 py-2 text-sm text-[#374151] hover:bg-[#F9FAFB] transition-colors cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (opt.action === 'view') {
                                    setSelectedTicket(ticket);
                                    setOpenMenuId(null);
                                  } else {
                                    updateTicketStatus(ticket.id, opt.status);
                                  }
                                }}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </motion.tbody>
            </table>
          )}
        </div>
        <Pagination
          page={safePage}
          totalPages={totalPages}
          total={filteredTickets.length}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </div>

      <Drawer
        open={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title={selectedTicket?.title || 'Ticket'}
      >
        {selectedTicket && (() => {
          const catColor = CATEGORY_COLORS[selectedTicket.category] || CATEGORY_COLORS.other;
          const priorityDot = PRIORITY_DOTS[selectedTicket.priority] || PRIORITY_DOTS.medium;
          const statusBadge = STATUS_BADGE[selectedTicket.status] || STATUS_BADGE.open;

          return (
            <div className="flex flex-col gap-6">

              <div>
                <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">Description</h3>
                <div className="bg-[#F9FAFB] rounded-lg p-4 text-sm text-[#374151] leading-relaxed">
                  {selectedTicket.description || 'No description provided.'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>
                  <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">Category</h3>
                  <span
                    className="inline-block px-2 py-0.5 rounded text-[11px] font-medium"
                    style={{ backgroundColor: catColor.bg, color: catColor.text }}
                  >
                    {capitalize(selectedTicket.category)}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">Priority</h3>
                  <span className="inline-flex items-center gap-1.5 text-sm text-[#374151]">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: priorityDot }}
                    />
                    {capitalize(selectedTicket.priority)}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">Status</h3>
                  <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">Created</h3>
                  <span className="inline-flex items-center gap-1.5 text-sm text-[#374151]">
                    <Calendar size={14} className="text-[#9CA3AF]" />
                    {selectedTicket.rawCreatedAt}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5E7EB]">
                <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">Update Status</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTicket.status === 'open' && (
                    <button
                      className="px-4 py-2 bg-[#FFFAEB] text-[#F79009] text-sm font-medium rounded-lg hover:bg-[#FEF0C7] transition-colors cursor-pointer"
                      onClick={() => updateTicketStatus(selectedTicket.id, 'in_progress')}
                    >
                      Start Progress
                    </button>
                  )}
                  {selectedTicket.status === 'in_progress' && (
                    <button
                      className="px-4 py-2 bg-[#ECFDF3] text-[#12B76A] text-sm font-medium rounded-lg hover:bg-[#D1FADF] transition-colors cursor-pointer"
                      onClick={() => updateTicketStatus(selectedTicket.id, 'resolved')}
                    >
                      Mark Resolved
                    </button>
                  )}
                  {selectedTicket.status === 'resolved' && (
                    <button
                      className="px-4 py-2 bg-[#F3F4F6] text-[#6B7280] text-sm font-medium rounded-lg hover:bg-[#E5E7EB] transition-colors cursor-pointer"
                      onClick={() => updateTicketStatus(selectedTicket.id, 'closed')}
                    >
                      Close Ticket
                    </button>
                  )}
                  {selectedTicket.status === 'closed' && (
                    <span className="text-sm text-[#9CA3AF] italic">This ticket is closed.</span>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </Drawer>

      <NewTicketModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pgs={pgs}
        rooms={rooms}
        onSubmit={async (data) => {
          try {
            const created = await apiRequest('/api/v1/tickets/', {
              method: 'POST',
              body: {
                pg_id: data.pg_id,
                room_id: data.room_id || null,
                title: data.subject,
                description: data.description,
                category: data.category,
                priority: data.priority,
              },
            });
            const pg = pgs.find(p => p.id === created.pg_id);
            setTickets(prev => [{
              id: created.id,
              pg_id: created.pg_id,
              pg_name: pg?.name || '—',
              title: created.title,
              description: created.description || '',
              category: created.category,
              priority: created.priority,
              status: created.status,
              createdAt: created.created_at ? new Date(created.created_at).toLocaleDateString() : 'N/A',
              rawCreatedAt: created.created_at ? new Date(created.created_at).toLocaleString() : 'N/A',
            }, ...prev]);
          } catch (e) {
            console.error('Failed to create ticket:', e);
          }
        }}
      />
    </motion.div>
  );
}

export default Maintenance;
