import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Clock, CalendarDays, Download, Plus, Calendar,
} from 'lucide-react';
import { apiRequest } from '../lib/api';
import Badge, { BADGE_MAP } from '../components/ui/Badge';
import { pageVariants, staggerContainer, fadeUp } from '../lib/animations';
import RecordPaymentModal from '../components/RecordPaymentModal';
import Select from '../components/ui/Select';
import Loader from '../components/ui/Loader';
import Pagination from '../components/ui/Pagination';
import { useTablePageSize } from '../hooks/use-table-page-size';
import { formatCurrency, formatCompact, formatDate } from '../lib/format';
import { TRANSACTION_TYPE_CHIP } from '../constants';
import type { TransactionType } from '../types';

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
  const [pgs, setPgs] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [filterPg, setFilterPg] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);

  const [tableRef, pageSize] = useTablePageSize({ mobile: 40, tablet: 44, desktop: 48 });

  const monthOptions = useMemo(() => getMonthOptions(), []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const pgList = (await apiRequest('/api/v1/pg/')) || [];
        const tenantList = (await apiRequest('/api/v1/tenants/')) || [];
        if (!mounted) return;
        setPgs(Array.isArray(pgList) ? pgList : []);
        setTenants(Array.isArray(tenantList) ? tenantList : []);

        const all = [];
        for (const pg of pgList) {
          try {
            const list = await apiRequest(`/api/v1/transactions/?pg_id=${pg.id}`);
            if (Array.isArray(list)) {
              for (const tx of list) {
                all.push({ ...tx, pg_name: pg.name });
              }
            }
          } catch { /* skip */ }
        }
        if (mounted) setTransactions(all);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const tenantById = useMemo(() => {
    const m = {};
    for (const t of tenants) m[t.id] = t;
    return m;
  }, [tenants]);

  const filteredTx = useMemo(() => {
    return transactions.filter(tx => {
      if (filterPg !== 'all' && tx.pg_id !== filterPg) return false;
      if (filterType !== 'all' && tx.type !== filterType) return false;
      if (filterMonth !== 'all' && tx.transaction_date) {
        const d = new Date(tx.transaction_date);
        const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (m !== filterMonth) return false;
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
    () => filteredTx.filter(t => t.status === 'paid').reduce((sum, t) => sum + (t.amount || 0), 0),
    [filteredTx]
  );
  const pendingTx = useMemo(() => filteredTx.filter(t => t.status === 'pending'), [filteredTx]);
  const totalPending = useMemo(() => pendingTx.reduce((sum, t) => sum + (t.amount || 0), 0), [pendingTx]);

  const now = new Date();
  const thisMonthTotal = useMemo(() => {
    return filteredTx
      .filter(t => {
        if (!t.transaction_date) return false;
        const d = new Date(t.transaction_date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredTx]);

  const tenantName = (id) => tenantById[id]?.user?.full_name || '—';

  const handleExportCSV = () => {
    const headers = ['Tenant', 'PG', 'Amount', 'Type', 'Date', 'Status', 'Method', 'Reference'];
    const rows = filteredTx.map(tx => [
      tenantName(tx.tenant_id), tx.pg_name || '', tx.amount, tx.type,
      formatDate(tx.transaction_date), tx.status, tx.payment_method || '', tx.reference_number || '',
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRecordPayment = async (data) => {
    try {
      const created = await apiRequest('/api/v1/transactions/', {
        method: 'POST',
        body: {
          pg_id: data.pg_id,
          tenant_id: data.tenant_id || null,
          type: data.type,
          amount: parseFloat(data.amount),
          transaction_date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
          status: 'paid',
          payment_method: data.method,
          reference_number: data.reference || null,
          description: data.description || null,
        },
      });
      const pg = pgs.find(p => p.id === created.pg_id);
      setTransactions(prev => [{ ...created, pg_name: pg?.name || '—' }, ...prev]);
    } catch (e) {
      console.error('Failed to record payment', e);
    }
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-3">
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
          value={filterType}
          onChange={setFilterType}
          minWidth={140}
          options={[
            { value: 'all', label: 'All Types' },
            { value: 'rent', label: 'Rent' },
            { value: 'deposit', label: 'Deposit' },
            { value: 'utility', label: 'Utility' },
            { value: 'fine', label: 'Fine' },
            { value: 'food', label: 'Food' },
            { value: 'refund', label: 'Refund' },
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
            <TrendingUp className="size-3 sm:size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] sm:text-fluid-xs font-semibold uppercase tracking-wider text-[#8B7355] truncate">Total Collected</p>
            <p className="text-[11px] sm:text-fluid-base font-bold tabular-nums text-[#1C6C41] font-mono leading-tight">
              <span className="sm:hidden">{formatCompact(totalCollected)}</span>
              <span className="hidden sm:inline">{formatCurrency(totalCollected)}</span>
            </p>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="flex items-center gap-1.5 sm:gap-fluid-2 p-2 sm:p-fluid-2">
          <div className="flex size-7 sm:size-9 shrink-0 items-center justify-center rounded-md bg-[#F3F4F6] text-[#6B7280]">
            <Clock className="size-3 sm:size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] sm:text-fluid-xs font-semibold uppercase tracking-wider text-[#8B7355] truncate">
              Pending <span className="normal-case tracking-normal text-[#A89580]">({pendingTx.length})</span>
            </p>
            <p className="text-[11px] sm:text-fluid-base font-bold tabular-nums text-[#B45309] font-mono leading-tight">
              <span className="sm:hidden">{formatCompact(totalPending)}</span>
              <span className="hidden sm:inline">{formatCurrency(totalPending)}</span>
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
          {filteredTx.length === 0 ? (
            <div className="py-16 text-center text-[#8B7355]">
              <p className="text-base font-medium">No transactions found</p>
              <p className="text-sm mt-1">Try adjusting your filters or record a payment</p>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead className="bg-[#1C6C41]">
                <tr>
                  {['Tenant', 'PG', 'Amount', 'Date', 'Status', 'Type'].map(h => (
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
                  const typeChip = TRANSACTION_TYPE_CHIP[tx.type as TransactionType] || TRANSACTION_TYPE_CHIP.other;
                  const statusLabel = (tx.status || '').charAt(0).toUpperCase() + (tx.status || '').slice(1);
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
                        <span className="text-fluid-sm font-semibold text-[#2B1D14] whitespace-nowrap">
                          {tenantName(tx.tenant_id)}
                        </span>
                      </td>
                      <td className="px-fluid-2 py-fluid-2">
                        <span className="text-fluid-sm text-[#5C4632] whitespace-nowrap">
                          {tx.pg_name || '—'}
                        </span>
                      </td>
                      <td className="px-fluid-2 py-fluid-2">
                        <span className="font-mono font-bold text-fluid-sm text-[#1C6C41] whitespace-nowrap">
                          {formatCurrency(tx.amount)}
                        </span>
                      </td>
                      <td className="px-fluid-2 py-fluid-2">
                        <span className="inline-flex items-center gap-1.5 text-fluid-sm text-[#5C4632] whitespace-nowrap">
                          <Calendar size={13} className="text-[#A89580]" />
                          {formatDate(tx.transaction_date)}
                        </span>
                      </td>
                      <td className="px-fluid-2 py-fluid-2">
                        <Badge variant={badgeVariant} dot>
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
        onSubmit={handleRecordPayment}
        pgs={pgs}
        tenants={tenants}
      />
    </motion.div>
  );
}

export default Transactions;
