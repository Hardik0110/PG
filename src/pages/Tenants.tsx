import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ChevronRight, UserPlus, Calendar } from 'lucide-react';
import { apiRequest, unwrapData } from '../lib/api';
import { pageVariants, staggerContainer, fadeUp } from '../lib/animations';
import AddTenantDrawer from '../components/AddTenantDrawer';
import Select from '../components/ui/Select';
import Loader from '../components/ui/Loader';
import Pagination from '../components/ui/Pagination';
import { useTablePageSize } from '../hooks/use-table-page-size';

const PG_COLORS = {
  default: { bg: 'bg-[#DCEEDF]', text: 'text-[#1C6C41]' },
  0: { bg: 'bg-[#DCEEDF]', text: 'text-[#1C6C41]' },
  1: { bg: 'bg-[#FCF1DC]', text: 'text-[#B45309]' },
  2: { bg: 'bg-[#FBE5F0]', text: 'text-[#BE185D]' },
  3: { bg: 'bg-[#E8E1F5]', text: 'text-[#6D28D9]' },
};

function getRelativeTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 1) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 30) return `${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return '1 month ago';
  if (diffMonths < 12) return `${diffMonths} months ago`;
  const diffYears = Math.floor(diffMonths / 12);
  return diffYears === 1 ? '1 year ago' : `${diffYears} years ago`;
}

function Tenants() {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [filterPg, setFilterPg] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);

  const [tableRef, pageSize] = useTablePageSize({ mobile: 60, tablet: 64, desktop: 68 });

  const [pgs, setPgs] = useState([]);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [pgList, tenantPayload, roomList] = await Promise.all([
          apiRequest('/api/v1/pg-facilities/'),
          apiRequest('/api/v1/tenants/'),
          apiRequest('/api/v1/rooms/'),
        ]);
        const pgArr = Array.isArray(pgList) ? pgList : [];
        const roomArr = Array.isArray(roomList) ? roomList : [];
        const tenantArr = unwrapData(tenantPayload, []) || [];
        const pgById = Object.fromEntries(pgArr.map(p => [p.id, p]));
        const roomById = Object.fromEntries(roomArr.map(r => [r.id, r]));

        if (mounted) {
          setPgs(pgArr);
          setRooms(roomArr);
          setTenants(
            (Array.isArray(tenantArr) ? tenantArr : []).map(t => ({
              id: t.id,
              name: t.user?.full_name || 'Unknown',
              email: t.user?.email || 'N/A',
              phone: t.user?.phone_number || 'N/A',
              pgId: t.pg_id,
              pgName: pgById[t.pg_id]?.name || '—',
              roomId: t.room_id,
              room: roomById[t.room_id]?.room_number || 'N/A',
              rent: t.monthly_rent || 0,
              moveInRaw: t.move_in_date || null,
              moveIn: t.move_in_date
                ? new Date(t.move_in_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                : 'N/A',
            }))
          );
        }
      } catch {
        if (mounted) setTenants([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const pgNames = useMemo(() => {
    const unique = [...new Set(tenants.map(t => t.pgName))];
    return unique;
  }, [tenants]);

  const pgColorMap = useMemo(() => {
    const map = {};
    pgNames.forEach((name, i) => {
      map[name] = PG_COLORS[i] || PG_COLORS.default;
    });
    return map;
  }, [pgNames]);

  const filteredTenants = useMemo(() => {
    return tenants.filter(t => {
      if (filterPg !== 'all' && t.pgId !== filterPg) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          t.name.toLowerCase().includes(q) ||
          t.email.toLowerCase().includes(q) ||
          t.phone.toLowerCase().includes(q) ||
          t.room.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tenants, filterPg, search]);

  useEffect(() => { setPage(1); }, [filterPg, search]);

  const totalPages = Math.max(1, Math.ceil(filteredTenants.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pagedTenants = filteredTenants.slice(pageStart, pageStart + pageSize);

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt).replace('₹', '₹');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-[#6B7280]">
        <div className="flex flex-col items-center gap-3">
          <Loader size={32} />
          <span className="text-sm">Loading tenants...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="h-full flex flex-col"
    >

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">Tenants</h1>
          <span className="text-sm text-[#8B7355] bg-[#EFE7DA] px-2.5 py-0.5 rounded-full font-medium">
            {filteredTenants.length} total
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">

          <div className="relative flex-1 min-w-[140px] sm:flex-none">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A89580]" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-10 w-full sm:w-48 pl-9 pr-3.5 border border-[#E0D3BD] rounded-lg text-base sm:text-sm bg-white text-[#2B1D14] placeholder-[#A89580]
                         focus:outline-none focus:border-[#1C6C41] focus:ring-2 focus:ring-[#1C6C41]/15
                         transition-all"
            />
          </div>

          <Select
            value={filterPg}
            onChange={setFilterPg}
            options={[
              { value: 'all', label: 'All PG' },
              ...pgs.map(p => ({ value: p.id, label: p.name })),
            ]}
          />

          <button
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Add Tenant"
            className="h-10 px-3 sm:px-4 bg-[#1C6C41] hover:bg-[#155331] text-white text-sm font-semibold rounded-lg
                       inline-flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer"
          >
            <UserPlus size={16} />
            <span className="hidden sm:inline">Add Tenant</span>
          </button>
        </div>
      </div>

      <div ref={tableRef} className="bg-white rounded-xl shadow-[0_8px_24px_-12px_rgba(60,30,15,0.15)] border border-[#E8DFD2] overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          {filteredTenants.length === 0 ? (
            <div className="py-16 text-center text-[#8B7355]">
              <p className="text-base font-medium">No tenants found</p>
              <p className="text-sm mt-1">Try adjusting your search or filter</p>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead className="bg-[#1C6C41]">
                <tr>
                  {['Name', 'Contact', 'PG', 'Room', 'Rent', 'Move In'].map(h => (
                    <th
                      key={h}
                      className="text-left px-fluid-3 py-fluid-2 text-[12px] font-semibold text-white/90 uppercase tracking-[0.08em] whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                  <th className="w-10" />
                </tr>
              </thead>
              <motion.tbody variants={staggerContainer} initial="initial" animate="animate">
                {pagedTenants.map((tenant) => {
                  const colors = pgColorMap[tenant.pgName] || PG_COLORS.default;
                  return (
                    <motion.tr
                      key={tenant.id}
                      variants={fadeUp}
                      onClick={() => navigate(`/tenants/${tenant.id}`)}
                      onMouseEnter={() => setHoveredRow(tenant.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      className={`border-b border-[#F3EEE5] cursor-pointer transition-colors duration-150
                                  ${hoveredRow === tenant.id ? 'bg-[#FAF7F2]' : 'bg-white'}`}
                    >

                      <td className="px-fluid-3 py-fluid-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#1C6C41] flex items-center justify-center text-white text-fluid-sm font-semibold shrink-0">
                            {tenant.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-fluid-sm font-semibold text-[#2B1D14] truncate">{tenant.name}</div>
                            <div className="text-fluid-xs text-[#8B7355] truncate">{tenant.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-fluid-3 py-fluid-2">
                        <span className="text-fluid-sm text-[#5C4632] font-mono whitespace-nowrap">{tenant.phone}</span>
                      </td>

                      <td className="px-fluid-3 py-fluid-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-fluid-xs font-semibold whitespace-nowrap ${colors.bg} ${colors.text}`}>
                          {tenant.pgName}
                        </span>
                      </td>

                      <td className="px-fluid-3 py-fluid-2">
                        <span className="font-mono text-fluid-sm font-semibold text-[#2B1D14]">{tenant.room}</span>
                      </td>

                      <td className="px-fluid-3 py-fluid-2">
                        <span className="font-mono font-bold text-fluid-sm text-[#1C6C41] whitespace-nowrap">{formatCurrency(tenant.rent)}</span>
                      </td>

                      <td className="px-6 py-4" title={getRelativeTime(tenant.moveInRaw)}>
                        <span className="inline-flex items-center gap-1.5 text-fluid-sm text-[#5C4632] whitespace-nowrap">
                          <Calendar size={13} className="text-[#A89580]" />
                          {tenant.moveIn}
                        </span>
                      </td>

                      <td className="px-fluid-2 py-fluid-2">
                        <ChevronRight
                          size={16}
                          className={`text-[#1C6C41] transition-all duration-150
                                      ${hoveredRow === tenant.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1'}`}
                        />
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
          total={filteredTenants.length}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </div>

      <AddTenantDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        pgs={pgs}
        rooms={rooms}
        onSubmit={(created) => {
          if (!created) return;
          const pg = pgs.find(p => p.id === created.pg_id);
          const room = rooms.find(r => r.id === created.room_id);
          setTenants(prev => [{
            id: created.id,
            name: created.user?.full_name || 'Unknown',
            email: created.user?.email || 'N/A',
            phone: created.user?.phone_number || 'N/A',
            pgId: created.pg_id,
            pgName: pg?.name || '—',
            roomId: created.room_id,
            room: room?.room_number || 'Unassigned',
            rent: created.monthly_rent || 0,
            moveInRaw: created.move_in_date,
            moveIn: created.move_in_date
              ? new Date(created.move_in_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : 'N/A',
          }, ...prev]);
        }}
      />
    </motion.div>
  );
}

export default Tenants;
