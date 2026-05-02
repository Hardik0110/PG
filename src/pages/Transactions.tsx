import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Clock, CalendarDays, Download, Plus, Calendar, TrendingDown,
} from 'lucide-react';
import { apiRequest, unwrapData } from '../lib/api';
import Badge, { BADGE_MAP } from '../components/ui/Badge';
import { pageVariants, staggerContainer, fadeUp } from '../lib/animations';
import RecordPaymentModal from '../components/RecordPaymentModal';
import AddExpenseModal from '../components/AddExpenseModal';
import Select from '../components/ui/Select';
import Loader from '../components/ui/Loader';
import Pagination from '../components/ui/Pagination';
import { useTablePageSize } from '../hooks/use-table-page-size';

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
  'Sunrise PG': 'bg-[#DCEEDF] text-[#1C6C41]',
  'Cozy Living PG': 'bg-[#FCF1DC] text-[#B45309]',
};

const TYPE_CHIP_COLORS = {
  rent: 'bg-[#DCEEDF] text-[#1C6C41]',
  deposit: 'bg-[#E8E1F5] text-[#6D28D9]',
  maintenance: 'bg-[#FCF1DC] text-[#B45309]',
  expense: 'bg-[#FBE5E0] text-[#A04D3A]',
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [page, setPage] = useState(1);

  const [tableRef, pageSize] = useTablePageSize({ mobile: 40, tablet: 44, desktop: 48 });

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

  useEffect(() => { setPage(1); }, [filterPg, filterType, filterMonth]);

  const totalPages = Math.max(1, Math.ceil(filteredTx.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pagedTx = filteredTx.slice(pageStart, pageStart + pageSize);

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
          <Loader size={32} />
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

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">Transactions</h1>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={handleExportCSV}
            className="h-10 px-3 sm:px-4 border border-[#E0D3BD] rounded-lg text-sm font-medium text-[#5C4632]
                       bg-white hover:bg-[#FAF7F2] inline-flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer"
          >
            <Download size={16} />
            Export CSV
          </button>
          <button
            onClick={() => setIsExpenseOpen(true)}
            className="h-10 px-3 sm:px-4 border border-[#E6CB9A] rounded-lg text-sm font-semibold text-[#B45309]
                       bg-white hover:bg-[#FCF1DC] inline-flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer"
          >
            <TrendingDown size={16} />
            Add Expense
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="h-10 px-3 sm:px-4 bg-[#1C6C41] hover:bg-[#155331] text-white text-sm font-semibold rounded-lg
                       inline-flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer"
          >
            <Plus size={16} />
            Record Payment
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <span className="text-sm font-medium text-[#8B7355]">Filter:</span>

        <Select
          value={filterPg}
          onChange={setFilterPg}
          options={[
            { value: 'all', label: 'All PG' },
            { value: 'Sunrise PG', label: 'Sunrise PG' },
            { value: 'Cozy Living PG', label: 'Cozy Living PG' },
          ]}
        />

        <Select
          value={filterMonth}
          onChange={setFilterMonth}
          minWidth={160}
          options={[
            { value: 'all', label: 'All Months' },
            ...monthOptions.map(m => ({ value: m.value, label: m.label })),
          ]}
        />

        <Select
          value={filterType}
          onChange={setFilterType}
          minWidth={140}
          options={[
            { value: 'all', label: 'All Types' },
            { value: 'rent', label: 'Rent' },
            { value: 'deposit', label: 'Deposit' },
            { value: 'expense', label: 'Expense' },
          ]}
        />
      </div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6"
      >

        <motion.div
          variants={fadeUp}
          className="bg-white rounded-2xl shadow-[0_8px_24px_-12px_rgba(60,30,15,0.15)] border border-[#E8DFD2] p-fluid-3 flex items-center gap-fluid-3"
        >
          <div className="w-12 h-12 rounded-xl bg-[#DCEEDF] flex items-center justify-center shrink-0">
            <TrendingUp size={22} className="text-[#1C6C41]" />
          </div>
          <div className="min-w-0">
            <p className="text-fluid-xs uppercase tracking-[0.15em] text-[#8B7355] font-medium mb-0.5">Total Collected</p>
            <p className="text-fluid-xl font-bold text-[#1C6C41] font-mono leading-tight tabular-nums">{formatCurrency(totalCollected)}</p>
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="bg-white rounded-2xl shadow-[0_8px_24px_-12px_rgba(60,30,15,0.15)] border border-[#E8DFD2] p-fluid-3 flex items-center gap-fluid-3"
        >
          <div className="w-12 h-12 rounded-xl bg-[#FCF1DC] flex items-center justify-center shrink-0">
            <Clock size={22} className="text-[#B45309]" />
          </div>
          <div className="min-w-0">
            <p className="text-fluid-xs uppercase tracking-[0.15em] text-[#8B7355] font-medium mb-0.5">
              Pending Dues <span className="text-[#A89580] normal-case tracking-normal">({pendingTx.length})</span>
            </p>
            <p className="text-fluid-xl font-bold text-[#B45309] font-mono leading-tight tabular-nums">{formatCurrency(totalPending)}</p>
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="bg-white rounded-2xl shadow-[0_8px_24px_-12px_rgba(60,30,15,0.15)] border border-[#E8DFD2] p-fluid-3 flex items-center gap-fluid-3"
        >
          <div className="w-12 h-12 rounded-xl bg-[#EFE7DA] flex items-center justify-center shrink-0">
            <CalendarDays size={22} className="text-[#5C4632]" />
          </div>
          <div className="min-w-0">
            <p className="text-fluid-xs uppercase tracking-[0.15em] text-[#8B7355] font-medium mb-0.5">This Month</p>
            <p className="text-fluid-xl font-bold text-[#2B1D14] font-mono leading-tight tabular-nums">{formatCurrency(thisMonthTotal)}</p>
          </div>
        </motion.div>
      </motion.div>

      <div ref={tableRef} className="bg-white rounded-xl shadow-[0_8px_24px_-12px_rgba(60,30,15,0.15)] border border-[#E8DFD2] overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          {filteredTx.length === 0 ? (
            <div className="py-16 text-center text-[#8B7355]">
              <p className="text-base font-medium">No transactions found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead className="bg-[#1C6C41]">
                <tr>
                  {['Tenant', 'PG', 'Room', 'Amount', 'Date', 'Status', 'Type'].map(h => (
                    <th
                      key={h}
                      className="text-left px-fluid-2 py-fluid-2 text-[12px] font-semibold text-white/90 uppercase tracking-[0.08em] whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <motion.tbody variants={staggerContainer} initial="initial" animate="animate">
                {pagedTx.map((tx) => {
                  const pgChip = PG_CHIP_COLORS[tx.pgName] || 'bg-[#EFE7DA] text-[#5C4632]';
                  const typeChip = TYPE_CHIP_COLORS[tx.type] || 'bg-[#EFE7DA] text-[#5C4632]';
                  const statusLabel = tx.status.charAt(0).toUpperCase() + tx.status.slice(1);
                  const badgeVariant = BADGE_MAP[statusLabel] || 'neutral';

                  return (
                    <motion.tr
                      key={tx.id}
                      variants={fadeUp}
                      onMouseEnter={() => setHoveredRow(tx.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      className={`border-b border-[#F3EEE5] transition-colors duration-150
                                  ${hoveredRow === tx.id ? 'bg-[#FAF7F2]' : 'bg-white'}`}
                    >

                      <td className="px-fluid-2 py-fluid-2">
                        <span className="text-fluid-sm font-semibold text-[#2B1D14] whitespace-nowrap">{tx.tenantName}</span>
                      </td>

                      <td className="px-fluid-2 py-fluid-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-fluid-xs font-semibold whitespace-nowrap ${pgChip}`}>
                          {tx.pgName}
                        </span>
                      </td>

                      <td className="px-fluid-2 py-fluid-2">
                        <span className="font-mono text-fluid-sm font-semibold text-[#2B1D14]">{tx.room}</span>
                      </td>

                      <td className="px-fluid-2 py-fluid-2">
                        <span className="font-mono font-bold text-fluid-sm text-[#1C6C41] whitespace-nowrap">{formatCurrency(tx.amount)}</span>
                      </td>

                      <td className="px-fluid-2 py-fluid-2">
                        <span className="inline-flex items-center gap-1.5 text-fluid-sm text-[#5C4632] whitespace-nowrap">
                          <Calendar size={13} className="text-[#A89580]" />
                          {tx.date}
                        </span>
                      </td>

                      <td className="px-fluid-2 py-fluid-2">
                        <Badge variant={badgeVariant} dot size="md">
                          {statusLabel}
                        </Badge>
                      </td>

                      <td className="px-fluid-2 py-fluid-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-fluid-xs font-semibold capitalize whitespace-nowrap ${typeChip}`}>
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
        <Pagination
          page={safePage}
          totalPages={totalPages}
          total={filteredTx.length}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </div>

      <RecordPaymentModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(data) => {

          setTransactions([{
            id: 'tx-' + Math.random().toString(36).substr(2, 9),
            tenantName: data.tenant.split(' (')[0],
            room: data.tenant.match(/\d+/) ? data.tenant.match(/\d+/)[0] : 'N/A',
            pgName: 'Sunrise PG',
            amount: parseInt(data.amount, 10),
            type: data.type,
            dateRaw: data.date,
            date: new Date(data.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            status: 'paid',
            method: data.method.toUpperCase(),
          }, ...transactions]);
        }}
      />

      <AddExpenseModal
        open={isExpenseOpen}
        onClose={() => setIsExpenseOpen(false)}
        onSubmit={(data) => {

          setTransactions([{
            id: 'ex-' + Math.random().toString(36).substr(2, 9),
            tenantName: data.vendor || `Expense (${data.category})`,
            room: '—',
            pgName: data.pg === 'pg-001' ? 'Sunrise PG' : 'Cozy Living PG',
            amount: parseInt(data.amount, 10),
            type: 'expense',
            dateRaw: data.date,
            date: new Date(data.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            status: 'paid',
            method: data.method.toUpperCase(),
          }, ...transactions]);
        }}
      />
    </motion.div>
  );
}

export default Transactions;
