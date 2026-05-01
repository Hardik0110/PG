import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ChevronRight, UserPlus, ChevronDown } from 'lucide-react';
import { apiRequest, unwrapData } from '../lib/api';
import { pageVariants, staggerContainer, fadeUp } from '../lib/animations';

const PG_COLORS = {
  default: { bg: 'bg-teal-50', text: 'text-teal-700' },
  0: { bg: 'bg-teal-50', text: 'text-teal-700' },
  1: { bg: 'bg-indigo-50', text: 'text-indigo-700' },
  2: { bg: 'bg-amber-50', text: 'text-amber-700' },
  3: { bg: 'bg-rose-50', text: 'text-rose-700' },
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

  useEffect(() => {
    let mounted = true;
    const loadTenants = async () => {
      try {
        const payload = await apiRequest('/api/v1/tenants/');
        const data = unwrapData(payload, []);
        if (mounted && Array.isArray(data)) {
          setTenants(data.map(t => ({
            id: t.id,
            name: t.name || 'Unknown',
            email: t.email || 'N/A',
            phone: t.phone_number || 'N/A',
            pgId: t.pg_id,
            pgName: t.pg_name || (t.pg_id === 'pg-001' ? 'Sunrise PG' : 'Cozy Living PG'),
            room: t.room_number || 'N/A',
            rent: t.rent || 0,
            moveInRaw: t.move_in_date || null,
            moveIn: t.move_in_date
              ? new Date(t.move_in_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : 'N/A',
          })));
        }
      } catch {
        if (mounted) setTenants([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadTenants();
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

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt).replace('₹', '₹');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-[#6B7280]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#1C6C41] border-t-transparent rounded-full animate-spin" />
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
      {/* Top Toolbar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[#111827]">Tenants</h1>
          <span className="text-sm text-[#6B7280] bg-[#F3F4F6] px-2.5 py-0.5 rounded-full font-medium">
            {filteredTenants.length} total
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-10 pl-9 pr-3.5 border border-[#D1D5DB] rounded-lg text-sm bg-white
                         focus:outline-none focus:border-[#1C6C41] focus:ring-2 focus:ring-[#1C6C41]/12
                         transition-all w-48"
            />
          </div>

          {/* PG Filter */}
          <div className="relative">
            <select
              value={filterPg}
              onChange={e => setFilterPg(e.target.value)}
              className="h-10 pl-3.5 pr-8 border border-[#D1D5DB] rounded-lg text-sm bg-white cursor-pointer
                         appearance-none focus:outline-none focus:border-[#1C6C41] focus:ring-2 focus:ring-[#1C6C41]/12
                         transition-all"
            >
              <option value="all">All PG</option>
              <option value="pg-001">Sunrise PG</option>
              <option value="pg-002">Cozy Living PG</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
          </div>

          {/* Add Tenant */}
          <button
            onClick={() => navigate('/tenants/add')}
            className="h-10 px-4 bg-[#1C6C41] hover:bg-[#155331] text-white text-sm font-semibold rounded-lg
                       inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <UserPlus size={16} />
            Add Tenant
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          {filteredTenants.length === 0 ? (
            <div className="py-16 text-center text-[#6B7280]">
              <p className="text-base font-medium">No tenants found</p>
              <p className="text-sm mt-1">Try adjusting your search or filter</p>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-[#F9FAFB] z-[1]">
                <tr>
                  {['Name', 'Contact', 'PG', 'Room', 'Rent', 'Move In'].map(h => (
                    <th
                      key={h}
                      className="text-left px-6 py-4 text-[12px] font-bold text-[#6B7280] uppercase tracking-wider border-b border-[#E5E7EB]"
                    >
                      {h}
                    </th>
                  ))}
                  <th className="w-10 border-b border-[#E5E7EB]" />
                </tr>
              </thead>
              <motion.tbody variants={staggerContainer} initial="initial" animate="animate">
                {filteredTenants.map((tenant) => {
                  const colors = pgColorMap[tenant.pgName] || PG_COLORS.default;
                  return (
                    <motion.tr
                      key={tenant.id}
                      variants={fadeUp}
                      onClick={() => navigate(`/tenants/${tenant.id}`)}
                      onMouseEnter={() => setHoveredRow(tenant.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      className={`border-b border-[#F3F4F6] cursor-pointer transition-colors duration-150
                                  ${hoveredRow === tenant.id ? 'bg-[#F9FAFB]' : 'bg-white'}`}
                    >
                      {/* Name + Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1C6C41] to-[#155331] flex items-center justify-center text-white text-sm font-semibold shrink-0">
                            {tenant.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-[#111827] truncate">{tenant.name}</div>
                            <div className="text-sm text-[#6B7280] truncate">{tenant.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Contact (phone only) */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#374151]">{tenant.phone}</span>
                      </td>

                      {/* PG badge */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                          {tenant.pgName}
                        </span>
                      </td>

                      {/* Room */}
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-[#374151]">{tenant.room}</span>
                      </td>

                      {/* Rent */}
                      <td className="px-6 py-4">
                        <span className="font-bold text-sm text-[#12B76A]">{formatCurrency(tenant.rent)}</span>
                      </td>

                      {/* Move In */}
                      <td className="px-6 py-4" title={getRelativeTime(tenant.moveInRaw)}>
                        <span className="text-sm text-[#374151]">{tenant.moveIn}</span>
                      </td>

                      {/* Chevron */}
                      <td className="px-4 py-4">
                        <ChevronRight
                          size={16}
                          className={`text-[#D1D5DB] transition-all duration-150
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
      </div>
    </motion.div>
  );
}

export default Tenants;
