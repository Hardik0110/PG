export function toNumber(v: unknown, fallback = 0): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : fallback;
  if (typeof v === 'string') {
    const t = v.trim();
    if (t === '') return fallback;
    const n = Number(t);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

export function toIsoDate(v: unknown): Date | null {
  if (v == null || v === '') return null;
  const d = new Date(v as string | number | Date);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function toStringSafe(v: unknown, fallback = ''): string {
  if (v == null) return fallback;
  return String(v);
}
