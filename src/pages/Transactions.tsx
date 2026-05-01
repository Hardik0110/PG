import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Clock, CalendarDays, Download, Plus,
  ChevronDown,
} from 'lucide-react';
import { apiRequest, unwrapData } from '../lib/api';
import Badge, { BADGE_MAP } from '../components/ui/Badge';
import { pageVariants, staggerContainer, fadeUp } from '../lib/animations';

const MOCK_TRANSACTIONS = [
  { id: "tx-001", tenantName: "Rahul Sharma", room: "101", pgName: "Sunrise PG", amount: 8000, type: "rent", date: "2026-04-25T10:00:00Z", status: "paid", method: "UPI" },
  { id: "tx-002", tenantName: "Priya Singh", room: "102", pgName: "Sunrise PG", amount: 8500, type: "rent", date: "2026-04-25T11:30:00Z", status: "paid", method: "Bank Transfer" },
  { id: "tx-003", tenantName: "Amit Kumar", room: "103", pgName: "Sunrise PG", amount: 7500, type: "rent", date: "2026-04-26T09:15:00Z", status: "paid", method: "UPI" },
  { id: "tx-004", tenantName: "Sneha Patel", room: "201", pgName: "Cozy Living PG", amount: 9000, type: "rent", date: "2026-04-26T14:00:00Z", status: "pending", method: "Cash" },
  { id: "tx-005", tenantName: "Vikram Rao", room: "202", pgName: "Cozy Living PG", amount: 9500, type: "rent", date: "2026-04-27T08:00:00Z", status: "paid", method: "UPI" },
  { id: "tx-006", tenantName: "Neha Gupta", room: "203", pgName: "Cozy Living PG", amount: 8000, type: "rent", date: "2026-04-27T10:00:00Z", status: "pending", method: "Bank Transfer" },
  { id: "tx-007", tenantName: "Rahul Sharma", room: "101", pgName: "Sunrise PG", amount: 2000, type: "deposit", date: "2026-04-10T10:00:00Z", status: "paid", method: "UPI" },
  { id: "tx-008", tenantName: "Arjun Mehta", room: "104", pgName: "Sunrise PG", amount: 8000, type: "rent", date: "2026-04-28T09:00:00Z", status: "paid", method: "Cash" },
  { id: "tx-009", tenantName: "Kavya Reddy", room: "105", pgName: "Sunrise PG", amount: 8500, type: "rent", date: "2026-04-28T11:00:00Z", status: "paid", method: "UPI" },
  { id: "tx-010", tenantName: "Sneha Patel", room: "201", pgName: "Cozy Living PG", amount: 3000, type: "deposit", date: "2026-01-20T10:00:00Z", status: "paid", method: "Cash" },
];

const PG_CHIP_COLORS = {
  'Sunrise PG': 'bg-teal-50 text-teal-700',
  'Cozy Living PG': 'bg-indigo-50 text-indigo-700',
};

const TYPE_CHIP_COLORS = {
  rent: 'bg-blue-50 text-blue-700',
  deposit: 'bg-purple-50 text-purple-700',
  maintenance: 'bg-amber-50 text-amber-700',
};

function getMonthOptions() {
  const months = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
    });
  }
  return months;
}

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [filterPg, setFilterPg] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [hoveredRow, setHoveredRow] = useState(null);

  const monthOptions = useMemo(() => getMonthOptions(), []);

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      setTransactions(MOCK_TRANSACTIONS.map(tx => ({
        id: tx.id,
        tenantName: tx.tenantName,
        room: tx.room,
        pgName: tx.pgName,
        amount: tx.amount,
        type: tx.type,
        dateRaw: tx.date,
        date: tx.date
          ? new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
          : 'N/A',
        status: tx.status,
        method: tx.method,
      })));
    }
    if (mounted) setLoading(false);
    return () => { mounted = false; };
  }, []);

  const filteredTx = useMemo(() => {
    return transactions.filter(tx => {
      if (filterPg !== 'all' && tx.pgName !== filterPg) return false;
      if (filterType !== 'all' && tx.type !== filterType) return false;
      if (filterMonth !== 'all' && tx.dateRaw) {
        const d = new Date(tx.dateRaw);
        const txMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (txMonth !== filterMonth) return false;
      }
      return true;
    });
  }, [transactions, filterPg, filterType, filterMonth]);

  const totalCollected = useMemo(
    () => filteredTx.filter(t => t.status === 'paid').reduce((sum, t) => sum + t.amount, 0),
    [filteredTx]
  );
  const pendingTx = useMemo(() => filteredTx.filter(t => t.status === 'pending'), [filteredTx]);
  const totalPending = useMemo(() => pendingTx.reduce((sum, t) => sum + t.amount, 0), [pendingTx]);

  const now = new Date();
  const thisMonthTotal = useMemo(() => {
    return filteredTx
      .filter(t => {
        if (!t.dateRaw) return false;
        const d = new Date(t.dateRaw);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTx]);

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt);
  };

  const handleExportCSV = () => {
    const headers = ['Tenant', 'PG', 'Room', 'Amount', 'Type', 'Date', 'Status'];
    const rows = filteredTx.map(tx => [tx.tenantName, tx.pgName, tx.room, tx.amount, tx.type, tx.date, tx.status]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-[#6B7280]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#1C6C41] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading transactions...</span>
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
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-[#111827]">Transactions</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="h-10 px-4 border border-[#D1D5DB] rounded-lg text-sm font-medium text-[#374151]
                       bg-white hover:bg-[#F9FAFB] inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download size={16} />
            Export CSV
          </button>
          <button
            className="h-10 px-4 bg-[#1C6C41] hover:bg-[#155331] text-white text-sm font-semibold rounded-lg
                       inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Plus size={16} />
            Record Payment
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <span className="text-sm font-medium text-[#6B7280]">Filter:</span>

        <div className="relative">
          <select
            value={filterPg}
            onChange={e => setFilterPg(e.target.value)}
            className="h-9 pl-3 pr-7 border border-[#D1D5DB] rounded-lg text-sm bg-white cursor-pointer
                       appearance-none focus:outline-none focus:border-[#1C6C41] focus:ring-2 focus:ring-[#1C6C41]/12 transition-all"
          >
            <option value="all">All PG</option>
            <option value="Sunrise PG">Sunrise PG</option>
            <option value="Cozy Living PG">Cozy Living PG</option>
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            className="h-9 pl-3 pr-7 border border-[#D1D5DB] rounded-lg text-sm bg-white cursor-pointer
                       appearance-none focus:outline-none focus:border-[#1C6C41] focus:ring-2 focus:ring-[#1C6C41]/12 transition-all"
          >
            <option value="all">All Months</option>
            {monthOptions.map(m => (
              <option key={m.value} value={m.value}>Month: {m.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="h-9 pl-3 pr-7 border border-[#D1D5DB] rounded-lg text-sm bg-white cursor-pointer
                       appearance-none focus:outline-none focus:border-[#1C6C41] focus:ring-2 focus:ring-[#1C6C41]/12 transition-all"
          >
            <option value="all">All Types</option>
            <option value="rent">Rent</option>
            <option value="deposit">Deposit</option>
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
        </div>
      </div>

      {/* Summary Cards */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-3 gap-4 mb-6"
      >
        {/* Total Collected */}
        <motion.div
          variants={fadeUp}
          className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-5 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-lg bg-[#ECFDF3] flex items-center justify-center shrink-0">
            <TrendingUp size={22} className="text-[#12B76A]" />
          </div>
          <div>
            <p className="text-[13px] text-[#6B7280] mb-0.5">Total Collected</p>
            <p className="text-xl font-bold text-[#111827] font-mono">{formatCurrency(totalCollected)}</p>
          </div>
        </motion.div>

        {/* Pending Dues */}
        <motion.div
          variants={fadeUp}
          className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-5 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-lg bg-[#FFFAEB] flex items-center justify-center shrink-0">
            <Clock size={22} className="text-[#F79009]" />
          </div>
          <div>
            <p className="text-[13px] text-[#6B7280] mb-0.5">
              Pending Dues <span className="text-[#9CA3AF]">({pendingTx.length})</span>
            </p>
            <p className="text-xl font-bold text-[#111827] font-mono">{formatCurrency(totalPending)}</p>
          </div>
        </motion.div>

        {/* This Month */}
        <motion.div
          variants={fadeUp}
          className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-5 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-lg bg-[#EFF8FF] flex items-center justify-center shrink-0">
            <CalendarDays size={22} className="text-[#2E90FA]" />
          </div>
          <div>
            <p className="text-[13px] text-[#6B7280] mb-0.5">This Month</p>
            <p className="text-xl font-bold text-[#111827] font-mono">{formatCurrency(thisMonthTotal)}</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Table */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          {filteredTx.length === 0 ? (
            <div className="py-16 text-center text-[#6B7280]">
              <p className="text-base font-medium">No transactions found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-[#F9FAFB] z-[1]">
                <tr>
                  {['Tenant', 'PG', 'Room', 'Amount', 'Date', 'Status', 'Type'].map(h => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider border-b border-[#E5E7EB]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <motion.tbody variants={staggerContainer} initial="initial" animate="animate">
                {filteredTx.map((tx) => {
                  const pgChip = PG_CHIP_COLORS[tx.pgName] || 'bg-gray-50 text-gray-700';
                  const typeChip = TYPE_CHIP_COLORS[tx.type] || 'bg-gray-50 text-gray-700';
                  const statusLabel = tx.status.charAt(0).toUpperCase() + tx.status.slice(1);
                  const badgeVariant = BADGE_MAP[statusLabel] || 'neutral';

                  return (
                    <motion.tr
                      key={tx.id}
                      variants={fadeUp}
                      onMouseEnter={() => setHoveredRow(tx.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      className={`border-b border-[#F3F4F6] transition-colors duration-150
                                  ${hoveredRow === tx.id ? 'bg-[#F9FAFB]' : 'bg-white'}`}
                    >
                      {/* Tenant */}
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-[#111827]">{tx.tenantName}</span>
                      </td>

                      {/* PG chip */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${pgChip}`}>
                          {tx.pgName}
                        </span>
                      </td>

                      {/* Room */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm text-[#374151]">{tx.room}</span>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3">
                        <span className="font-bold text-sm text-[#12B76A]">{formatCurrency(tx.amount)}</span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3">
                        <span className="text-sm text-[#374151]">{tx.date}</span>
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3">
                        <Badge variant={badgeVariant} dot size="md">
                          {statusLabel}
                        </Badge>
                      </td>

                      {/* Type chip */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${typeChip}`}>
                          {tx.type}
                        </span>
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

export default Transactions;
