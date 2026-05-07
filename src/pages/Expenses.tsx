import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingDown, Wallet, CalendarDays, Download, Plus, Calendar,
} from 'lucide-react';
import { apiRequest } from '../lib/api';
import { pageVariants, staggerContainer, fadeUp } from '../lib/animations';
import AddExpenseModal from '../components/AddExpenseModal';
import Select from '../components/ui/Select';
import Loader from '../components/ui/Loader';
import Pagination from '../components/ui/Pagination';
import { useTablePageSize } from '../hooks/use-table-page-size';

const CATEGORY_CHIP_COLORS = {
  electricity: 'bg-[#FCF1DC] text-[#B45309]',
  water: 'bg-[#DCEEDF] text-[#1C6C41]',
  internet: 'bg-[#E8E1F5] text-[#6D28D9]',
  maintenance: 'bg-[#FBE5E0] text-[#A04D3A]',
  staff: 'bg-[#FBE5F0] text-[#BE185D]',
  supplies: 'bg-[#EFE7DA] text-[#5C4632]',
  repair: 'bg-[#FCF1DC] text-[#B45309]',
  other: 'bg-[#EFE7DA] text-[#5C4632]',
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

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [pgs, setPgs] = useState([]);
  const [filterPg, setFilterPg] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [page, setPage] = useState(1);

  const [tableRef, pageSize] = useTablePageSize({ mobile: 40, tablet: 44, desktop: 48 });

  const monthOptions = useMemo(() => getMonthOptions(), []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const pgList = (await apiRequest('/api/v1/pg/')) || [];
        if (!mounted) return;
        setPgs(Array.isArray(pgList) ? pgList : []);

        // Fetch expenses for each PG, then merge.
        const allExp = [];
        for (const pg of pgList) {
          try {
            const list = await apiRequest(`/api/v1/expenses/?pg_id=${pg.id}`);
            if (Array.isArray(list)) {
              for (const e of list) {
                allExp.push({ ...e, pg_name: pg.name });
              }
            }
          } catch { /* skip this PG */ }
        }
        if (mounted) setExpenses(allExp);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filteredExp = useMemo(() => {
    return expenses.filter(e => {
      if (filterPg !== 'all' && e.pg_id !== filterPg) return false;
      if (filterCategory !== 'all' && e.category !== filterCategory) return false;
      if (filterMonth !== 'all' && e.expense_date) {
        const d = new Date(e.expense_date);
        const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (m !== filterMonth) return false;
      }
      return true;
    });
  }, [expenses, filterPg, filterCategory, filterMonth]);

  useEffect(() => { setPage(1); }, [filterPg, filterCategory, filterMonth]);

  const totalPages = Math.max(1, Math.ceil(filteredExp.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pagedExp = filteredExp.slice(pageStart, pageStart + pageSize);

  const totalSpent = useMemo(
    () => filteredExp.reduce((sum, e) => sum + (e.amount || 0), 0),
    [filteredExp]
  );

  const now = new Date();
  const thisMonthTotal = useMemo(() => {
    return filteredExp
      .filter(e => {
        if (!e.expense_date) return false;
        const d = new Date(e.expense_date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, e) => sum + (e.amount || 0), 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredExp]);

  const topCategoryEntry = useMemo(() => {
    const sums = {};
    for (const e of filteredExp) {
      sums[e.category] = (sums[e.category] || 0) + e.amount;
    }
    const entries = Object.entries(sums).sort((a, b) => b[1] - a[1]);
    return entries[0] || ['—', 0];
  }, [filteredExp]);

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt || 0);
  };

  const formatCompact = (amt) => {
    if (!amt) return '₹0';
    if (amt >= 100000) return `₹${(amt / 100000).toFixed(1)}L`;
    if (amt >= 1000) return `₹${Math.round(amt / 1000)}K`;
    return `₹${amt}`;
  };

  const formatDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';

  const handleExportCSV = () => {
    const headers = ['Vendor', 'PG', 'Category', 'Amount', 'Date', 'Method', 'Description'];
    const rows = filteredExp.map(e => [
      e.vendor || '', e.pg_name || '', e.category, e.amount,
      formatDate(e.expense_date), e.payment_method || '', e.description || '',
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expenses.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddExpense = async (data) => {
    try {
      const created = await apiRequest('/api/v1/expenses/', {
        method: 'POST',
        body: {
          pg_id: data.pg,
          category: data.category,
          amount: parseFloat(data.amount),
          expense_date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
          payment_method: data.method,
          vendor: data.vendor || null,
          description: data.description || null,
        },
      });
      const pg = pgs.find(p => p.id === created.pg_id);
      setExpenses(prev => [{ ...created, pg_name: pg?.name || '—' }, ...prev]);
    } catch (e) {
      console.error('Failed to add expense', e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-[#6B7280]">
        <div className="flex flex-col items-center gap-3">
          <Loader size={32} />
          <span className="text-sm">Loading expenses...</span>
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">Expenses</h1>
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
            className="h-10 px-3 sm:px-4 bg-[#B45309] hover:bg-[#92400E] text-white text-sm font-semibold rounded-lg
                       inline-flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer"
          >
            <Plus size={16} />
            Add Expense
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
            ...pgs.map(p => ({ value: p.id, label: p.name })),
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
          value={filterCategory}
          onChange={setFilterCategory}
          minWidth={140}
          options={[
            { value: 'all', label: 'All Categories' },
            { value: 'electricity', label: 'Electricity' },
            { value: 'water', label: 'Water' },
            { value: 'internet', label: 'Internet' },
            { value: 'maintenance', label: 'Maintenance' },
            { value: 'staff', label: 'Staff' },
            { value: 'supplies', label: 'Supplies' },
            { value: 'repair', label: 'Repair' },
            { value: 'other', label: 'Other' },
          ]}
        />
      </div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="bg-white rounded-xl shadow-[0_8px_24px_-12px_rgba(60,30,15,0.15)] border border-[#E8DFD2] grid grid-cols-3 divide-x divide-[#F3EEE5] mb-6 overflow-hidden"
      >
        <motion.div variants={fadeUp} className="flex items-center gap-1.5 sm:gap-fluid-2 p-2 sm:p-fluid-2">
          <div className="flex size-7 sm:size-9 shrink-0 items-center justify-center rounded-md bg-[#F3F4F6] text-[#6B7280]">
            <TrendingDown className="size-3 sm:size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] sm:text-fluid-xs font-semibold uppercase tracking-wider text-[#8B7355] truncate">Total Spent</p>
            <p className="text-[11px] sm:text-fluid-base font-bold tabular-nums text-[#B45309] font-mono leading-tight">
              <span className="sm:hidden">{formatCompact(totalSpent)}</span>
              <span className="hidden sm:inline">{formatCurrency(totalSpent)}</span>
            </p>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="flex items-center gap-1.5 sm:gap-fluid-2 p-2 sm:p-fluid-2">
          <div className="flex size-7 sm:size-9 shrink-0 items-center justify-center rounded-md bg-[#F3F4F6] text-[#6B7280]">
            <Wallet className="size-3 sm:size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] sm:text-fluid-xs font-semibold uppercase tracking-wider text-[#8B7355] truncate">
              Top: <span className="capitalize">{topCategoryEntry[0]}</span>
            </p>
            <p className="text-[11px] sm:text-fluid-base font-bold tabular-nums text-[#2B1D14] font-mono leading-tight">
              <span className="sm:hidden">{formatCompact(topCategoryEntry[1])}</span>
              <span className="hidden sm:inline">{formatCurrency(topCategoryEntry[1])}</span>
            </p>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="flex items-center gap-1.5 sm:gap-fluid-2 p-2 sm:p-fluid-2">
          <div className="flex size-7 sm:size-9 shrink-0 items-center justify-center rounded-md bg-[#F3F4F6] text-[#6B7280]">
            <CalendarDays className="size-3 sm:size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] sm:text-fluid-xs font-semibold uppercase tracking-wider text-[#8B7355] truncate">This Month</p>
            <p className="text-[11px] sm:text-fluid-base font-bold tabular-nums text-[#2B1D14] font-mono leading-tight">
              <span className="sm:hidden">{formatCompact(thisMonthTotal)}</span>
              <span className="hidden sm:inline">{formatCurrency(thisMonthTotal)}</span>
            </p>
          </div>
        </motion.div>
      </motion.div>

      <div ref={tableRef} className="bg-white rounded-xl shadow-[0_8px_24px_-12px_rgba(60,30,15,0.15)] border border-[#E8DFD2] overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          {filteredExp.length === 0 ? (
            <div className="py-16 text-center text-[#8B7355]">
              <p className="text-base font-medium">No expenses found</p>
              <p className="text-sm mt-1">Try adjusting your filters or add an expense</p>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead className="bg-[#B45309]">
                <tr>
                  {['Vendor', 'PG', 'Category', 'Amount', 'Date', 'Method'].map(h => (
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
                {pagedExp.map((e) => {
                  const catChip = CATEGORY_CHIP_COLORS[e.category] || CATEGORY_CHIP_COLORS.other;
                  return (
                    <motion.tr
                      key={e.id}
                      variants={fadeUp}
                      onMouseEnter={() => setHoveredRow(e.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      className={`border-b border-[#F3EEE5] transition-colors duration-150
                                  ${hoveredRow === e.id ? 'bg-[#FAF7F2]' : 'bg-white'}`}
                    >
                      <td className="px-fluid-2 py-fluid-2">
                        <span className="text-fluid-sm font-semibold text-[#2B1D14] whitespace-nowrap">
                          {e.vendor || '—'}
                        </span>
                      </td>
                      <td className="px-fluid-2 py-fluid-2">
                        <span className="text-fluid-sm text-[#5C4632] whitespace-nowrap">
                          {e.pg_name || '—'}
                        </span>
                      </td>
                      <td className="px-fluid-2 py-fluid-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-fluid-xs font-semibold capitalize whitespace-nowrap ${catChip}`}>
                          {e.category}
                        </span>
                      </td>
                      <td className="px-fluid-2 py-fluid-2">
                        <span className="font-mono font-bold text-fluid-sm text-[#B45309] whitespace-nowrap">
                          {formatCurrency(e.amount)}
                        </span>
                      </td>
                      <td className="px-fluid-2 py-fluid-2">
                        <span className="inline-flex items-center gap-1.5 text-fluid-sm text-[#5C4632] whitespace-nowrap">
                          <Calendar size={13} className="text-[#A89580]" />
                          {formatDate(e.expense_date)}
                        </span>
                      </td>
                      <td className="px-fluid-2 py-fluid-2">
                        <span className="text-fluid-sm text-[#5C4632] capitalize whitespace-nowrap">
                          {e.payment_method || '—'}
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
          total={filteredExp.length}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </div>

      <AddExpenseModal
        open={isExpenseOpen}
        onClose={() => setIsExpenseOpen(false)}
        onSubmit={handleAddExpense}
        pgs={pgs}
      />
    </motion.div>
  );
}

export default Expenses;
