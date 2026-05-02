import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, total, pageSize, onPageChange }: PaginationProps) {
  if (total === 0) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-3 border-t border-[#F3EEE5] bg-white">
      <span className="text-xs sm:text-sm text-[#6B7280] tabular-nums">
        {start}–{end} of {total}
      </span>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          aria-label="Previous page"
          className="p-1.5 rounded hover:bg-[#F3F4F6] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} className="text-[#6B7280]" />
        </button>
        <span className="px-2 text-xs sm:text-sm font-medium text-[#374151] min-w-[56px] sm:min-w-[64px] text-center tabular-nums">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="p-1.5 rounded hover:bg-[#F3F4F6] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={16} className="text-[#6B7280]" />
        </button>
      </div>
    </div>
  );
}
