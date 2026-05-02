import { useEffect, useRef, useState, RefObject } from 'react';
import { useResponsive } from './use-responsive';

type Tier = 'mobile' | 'tablet' | 'desktop';
type TieredOrFixed = number | Partial<Record<Tier, number>>;

function resolveTiered(value: TieredOrFixed | undefined, tier: Tier, fallback: number): number {
  if (value === undefined) return fallback;
  if (typeof value === 'number') return value;
  return value[tier] ?? fallback;
}

export function useTablePageSize(
  rowHeight?: TieredOrFixed,
  reservedSpace?: TieredOrFixed,
  headerHeight: number = 48,
  minSize?: TieredOrFixed,
): [RefObject<HTMLDivElement | null>, number] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [pageSize, setPageSize] = useState(8);
  const { isMobile, isTablet } = useResponsive();

  const tier: Tier = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

  const defaultRow      = isMobile ? 48  : 56;
  const defaultReserved = isMobile ? 160 : 110;
  const defaultMin      = isMobile ? 4   : isTablet ? 5 : 6;

  const rh = resolveTiered(rowHeight, tier, defaultRow);
  const rs = resolveTiered(reservedSpace, tier, defaultReserved);
  const ms = resolveTiered(minSize, tier, defaultMin);

  useEffect(() => {
    const measure = () => {
      const el = ref.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      const available = window.innerHeight - top - rs;
      const computed = Math.floor((available - headerHeight) / rh);
      setPageSize(Math.max(ms, computed));
    };

    const id = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('resize', measure);
    };
  }, [rh, rs, headerHeight, ms]);

  return [ref, pageSize];
}
