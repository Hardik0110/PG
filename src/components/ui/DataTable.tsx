import React, { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DataTable({
  columns = [],
  data = [],
  onRowClick,
  loading = false,
  emptyState,
  pageSize: initialPageSize = 10,
  searchable = false,
}) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Filter data by search term across all string/number fields
  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const val = row[col.key];
        return val != null && String(val).toLowerCase().includes(q);
      })
    );
  }, [data, search, columns]);

  // Sort filtered data
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortable) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey] ?? '';
      const bVal = b[sortKey] ?? '';
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir, columns]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const pageData = sorted.slice(startIdx, startIdx + pageSize);
  const showingFrom = sorted.length === 0 ? 0 : startIdx + 1;
  const showingTo = Math.min(startIdx + pageSize, sorted.length);

  // Reset page when search changes
  React.useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

  function handleSort(key) {
    const col = columns.find((c) => c.key === key);
    if (!col?.sortable) return;
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  // -- Loading skeleton --
  if (loading) {
    return (
      <div className="w-full overflow-hidden rounded-lg border border-[#E5E7EB]">
        <table className="w-full table-fixed border-collapse">
          <thead className="bg-[#F9FAFB] border-b-2 border-[#E5E7EB]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.05em] font-semibold text-[#9CA3AF]"
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }).map((_, rowIdx) => (
              <tr key={rowIdx} className="h-14 border-b border-[#F3F4F6]">
                {columns.map((col) => (
                  <td key={col.key} className="px-4">
                    <div
                      className="h-3.5 rounded bg-[#E5E7EB] animate-pulse"
                      style={{ width: col.width || '75%' }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // -- Empty state --
  if (!data.length || !sorted.length) {
    return (
      <div className="w-full overflow-hidden rounded-lg border border-[#E5E7EB]">
        {searchable && (
          <div className="px-4 py-3 border-b border-[#E5E7EB]">
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={16} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-[#E5E7EB] bg-white placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#10B981]/30 focus:border-[#10B981] transition-colors"
              />
            </div>
          </div>
        )}
        <table className="w-full table-fixed border-collapse">
          <thead className="bg-[#F9FAFB] border-b-2 border-[#E5E7EB]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.05em] font-semibold text-[#9CA3AF]"
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
        </table>
        <div className="py-16 flex items-center justify-center">
          {emptyState || (
            <p className="text-sm text-[#6B7280]">
              {search.trim() ? 'No results match your search.' : 'No data available.'}
            </p>
          )}
        </div>
      </div>
    );
  }

  // -- Main table --
  return (
    <div className="w-full overflow-hidden rounded-lg border border-[#E5E7EB]">
      {searchable && (
        <div className="px-4 py-3 border-b border-[#E5E7EB] bg-white">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-[#E5E7EB] bg-white placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#10B981]/30 focus:border-[#10B981] transition-colors"
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-collapse">
          <thead className="bg-[#F9FAFB] border-b-2 border-[#E5E7EB]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-[11px] uppercase tracking-[0.05em] font-semibold text-[#9CA3AF] select-none ${
                    col.sortable ? 'cursor-pointer hover:text-[#6B7280]' : ''
                  }`}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      sortDir === 'asc'
                        ? <ChevronUp size={12} className="text-[#6B7280]" />
                        : <ChevronDown size={12} className="text-[#6B7280]" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, rowIdx) => (
              <tr
                key={row.id ?? rowIdx}
                className={`h-14 border-b border-[#F3F4F6] hover:bg-[#FAFAFA] transition-colors duration-100 active:bg-[#F0FDF9] ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 text-sm text-[#374151]"
                    style={col.width ? { width: col.width } : undefined}
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination bar */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-[#E5E7EB] bg-white text-sm">
        <div className="flex items-center gap-2 text-[#6B7280]">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="border border-[#E5E7EB] rounded px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#10B981]/30"
          >
            {[5, 10, 20].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <span className="text-[#6B7280]">
          Showing {showingFrom}–{showingTo} of {sorted.length}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="p-1.5 rounded hover:bg-[#F3F4F6] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} className="text-[#6B7280]" />
          </button>
          <span className="px-2 text-[#374151] font-medium min-w-[60px] text-center">
            {safePage} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="p-1.5 rounded hover:bg-[#F3F4F6] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} className="text-[#6B7280]" />
          </button>
        </div>
      </div>
    </div>
  );
}
