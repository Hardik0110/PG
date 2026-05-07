import { toNumber, toIsoDate } from './coerce';

export interface FormatOpts {
  locale?: string;
  currency?: string;
}

const DEFAULTS = { locale: 'en-IN', currency: 'INR' } as const;

const currencyFormatters = new Map<string, Intl.NumberFormat>();
const numberFormatters = new Map<string, Intl.NumberFormat>();

function getCurrencyFormatter(locale: string, currency: string): Intl.NumberFormat {
  const key = `${locale}|${currency}`;
  let f = currencyFormatters.get(key);
  if (!f) {
    f = new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 });
    currencyFormatters.set(key, f);
  }
  return f;
}

function getNumberFormatter(locale: string): Intl.NumberFormat {
  let f = numberFormatters.get(locale);
  if (!f) {
    f = new Intl.NumberFormat(locale);
    numberFormatters.set(locale, f);
  }
  return f;
}

export function formatCurrency(amt: unknown, opts: FormatOpts = {}): string {
  const { locale, currency } = { ...DEFAULTS, ...opts };
  return getCurrencyFormatter(locale, currency).format(toNumber(amt));
}

export function formatCompact(amt: unknown): string {
  const n = toNumber(amt);
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  if (abs >= 1e7) return `${sign}₹${(abs / 1e7).toFixed(1)}Cr`;
  if (abs >= 1e5) return `${sign}₹${(abs / 1e5).toFixed(1)}L`;
  if (abs >= 1e3) return `${sign}₹${Math.round(abs / 1e3)}K`;
  return `${sign}₹${abs}`;
}

export function formatNumber(n: unknown, opts: FormatOpts = {}): string {
  const { locale } = { ...DEFAULTS, ...opts };
  return getNumberFormatter(locale).format(toNumber(n));
}

export type DateStyle = 'short' | 'long' | 'numeric';

export function formatDate(
  v: unknown,
  style: DateStyle = 'short',
  fallback = 'N/A',
): string {
  const d = toIsoDate(v);
  if (!d) return fallback;
  const opts: Intl.DateTimeFormatOptions =
    style === 'short'
      ? { day: 'numeric', month: 'short', year: 'numeric' }
      : style === 'long'
      ? { day: 'numeric', month: 'long', year: 'numeric', weekday: 'short' }
      : { day: '2-digit', month: '2-digit', year: 'numeric' };
  return d.toLocaleDateString('en-IN', opts);
}

export function formatRelative(v: unknown, now = new Date()): string {
  const d = toIsoDate(v);
  if (!d) return 'N/A';
  const diffMs = now.getTime() - d.getTime();
  const sec = Math.round(diffMs / 1000);
  if (Math.abs(sec) < 60) return 'just now';
  const min = Math.round(sec / 60);
  if (Math.abs(min) < 60) {
    const abs = Math.abs(min);
    return `${min < 0 ? 'in ' : ''}${abs} min${abs === 1 ? '' : 's'}${min > 0 ? ' ago' : ''}`;
  }
  const hr = Math.round(min / 60);
  if (Math.abs(hr) < 24) {
    const abs = Math.abs(hr);
    return `${hr < 0 ? 'in ' : ''}${abs} hour${abs === 1 ? '' : 's'}${hr > 0 ? ' ago' : ''}`;
  }
  const day = Math.round(hr / 24);
  if (Math.abs(day) < 30) {
    const abs = Math.abs(day);
    return `${day < 0 ? 'in ' : ''}${abs} day${abs === 1 ? '' : 's'}${day > 0 ? ' ago' : ''}`;
  }
  return formatDate(v, 'short');
}
