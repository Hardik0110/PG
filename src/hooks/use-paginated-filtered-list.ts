import { useEffect, useMemo, useState, RefObject } from 'react';
import { useTablePageSize } from './use-table-page-size';

type Tier = 'mobile' | 'tablet' | 'desktop';
type TieredOrFixed = number | Partial<Record<Tier, number>>;

export interface PaginatedFilteredListOptions<T> {
  data: T[];
  filter?: (item: T) => boolean;
  search?: { query: string; fields: (keyof T | ((item: T) => string))[] };
  deps?: ReadonlyArray<unknown>;
  rowHeight?: TieredOrFixed;
  reservedSpace?: TieredOrFixed;
  pageSize?: number;
}

export interface PaginatedFilteredList<T> {
  items: T[];
  filtered: T[];
  page: number;
  totalPages: number;
  pageSize: number;
  total: number;
  setPage: (p: number) => void;
  containerRef: RefObject<HTMLDivElement | null>;
  paginationProps: {
    page: number;
    totalPages: number;
    total: number;
    pageSize: number;
    onPageChange: (p: number) => void;
  };
}

export function usePaginatedFilteredList<T>(
  opts: PaginatedFilteredListOptions<T>,
): PaginatedFilteredList<T> {
  const { data, filter, search, deps = [], rowHeight, reservedSpace, pageSize: fixed } = opts;
  const [containerRef, autoSize] = useTablePageSize(rowHeight, reservedSpace);
  const pageSize = fixed ?? autoSize;
  const [page, setPage] = useState(1);

  const depsKey = JSON.stringify(deps);
  const filtered = useMemo(() => {
    let out = filter ? data.filter(filter) : data;
    if (search?.query) {
      const q = search.query.toLowerCase();
      out = out.filter((it) =>
        search.fields.some((f) => {
          const v = typeof f === 'function' ? f(it) : (it[f] as unknown);
          return String(v ?? '').toLowerCase().includes(q);
        }),
      );
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- depsKey serializes the deps array
  }, [data, search?.query, depsKey]);

  useEffect(() => {
    setPage(1);
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  return {
    items,
    filtered,
    page: safePage,
    totalPages,
    pageSize,
    total: filtered.length,
    setPage,
    containerRef,
    paginationProps: {
      page: safePage,
      totalPages,
      total: filtered.length,
      pageSize,
      onPageChange: setPage,
    },
  };
}
