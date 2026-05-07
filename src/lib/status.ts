import { toNumber } from './coerce';

export type RoomStatus = 'available' | 'occupied' | 'maintenance' | 'reserved';
export type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'failed';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface StatusTheme {
  banner: string;
  text: string;
  ring: string;
  kicker: string;
  headline?: string;
}

const ROOM_ALIASES: Record<string, RoomStatus> = {
  vacant: 'available',
  empty: 'available',
  full: 'occupied',
};

export function deriveRoomStatus(
  raw: string | null | undefined,
  tenantCount: unknown,
  capacity: unknown,
): RoomStatus {
  const r = (raw ?? '').toLowerCase();
  const normalized = (ROOM_ALIASES[r] ?? r) as RoomStatus;
  if (normalized === 'maintenance' || normalized === 'reserved') return normalized;
  const t = toNumber(tenantCount);
  const c = toNumber(capacity);
  if (c > 0 && t >= c) return 'occupied';
  if (normalized === 'occupied') return 'occupied';
  return 'available';
}

export const ROOM_THEME: Record<RoomStatus, StatusTheme> = {
  available:   { banner: 'bg-[#DCEEDF]', text: 'text-[#1C6C41]', ring: 'ring-[#1C6C41]/30', kicker: 'Available',   headline: 'VACANT' },
  occupied:    { banner: 'bg-[#FBDED8]', text: 'text-[#B91C1C]', ring: 'ring-[#B91C1C]/30', kicker: 'Fully Booked', headline: 'ROOM FULL' },
  maintenance: { banner: 'bg-[#FCF1DC]', text: 'text-[#B45309]', ring: 'ring-[#B45309]/30', kicker: 'Maintenance',  headline: 'UNAVAILABLE' },
  reserved:    { banner: 'bg-[#FBE5F0]', text: 'text-[#BE185D]', ring: 'ring-[#BE185D]/30', kicker: 'Reserved',     headline: 'RESERVED' },
};

const PAYMENT_ALIASES: Record<string, PaymentStatus> = {
  success: 'paid',
  successful: 'paid',
  unpaid: 'pending',
  late: 'overdue',
};

export function derivePaymentStatus(
  raw: string | null | undefined,
  dueDate?: unknown,
  now = new Date(),
): PaymentStatus {
  const r = (raw ?? 'pending').toLowerCase();
  const normalized = (PAYMENT_ALIASES[r] ?? r) as PaymentStatus;
  if (normalized === 'paid' || normalized === 'failed') return normalized;
  if (normalized === 'pending' && dueDate) {
    const d = new Date(dueDate as string);
    if (!Number.isNaN(d.getTime()) && d.getTime() < now.getTime()) return 'overdue';
  }
  return normalized === 'overdue' ? 'overdue' : 'pending';
}

export const PAYMENT_THEME: Record<PaymentStatus, StatusTheme> = {
  paid:    { banner: 'bg-[#DCEEDF]', text: 'text-[#1C6C41]', ring: 'ring-[#1C6C41]/30', kicker: 'Paid' },
  pending: { banner: 'bg-[#FCF1DC]', text: 'text-[#B45309]', ring: 'ring-[#B45309]/30', kicker: 'Pending' },
  overdue: { banner: 'bg-[#FBDED8]', text: 'text-[#B91C1C]', ring: 'ring-[#B91C1C]/30', kicker: 'Overdue' },
  failed:  { banner: 'bg-[#F3F4F6]', text: 'text-[#6B7280]', ring: 'ring-[#6B7280]/30', kicker: 'Failed' },
};

const TICKET_ALIASES: Record<string, TicketStatus> = {
  new: 'open',
  pending: 'open',
  active: 'in_progress',
  done: 'resolved',
  fixed: 'resolved',
};

export function deriveTicketStatus(raw: string | null | undefined): TicketStatus {
  const r = (raw ?? 'open').toLowerCase().replace(/[\s-]/g, '_');
  const normalized = (TICKET_ALIASES[r] ?? r) as TicketStatus;
  if (['open', 'in_progress', 'resolved', 'closed'].includes(normalized)) return normalized;
  return 'open';
}

export const TICKET_THEME: Record<TicketStatus, StatusTheme> = {
  open:        { banner: 'bg-[#FBDED8]', text: 'text-[#B91C1C]', ring: 'ring-[#B91C1C]/30', kicker: 'Open' },
  in_progress: { banner: 'bg-[#FCF1DC]', text: 'text-[#B45309]', ring: 'ring-[#B45309]/30', kicker: 'In Progress' },
  resolved:    { banner: 'bg-[#DCEEDF]', text: 'text-[#1C6C41]', ring: 'ring-[#1C6C41]/30', kicker: 'Resolved' },
  closed:      { banner: 'bg-[#F3F4F6]', text: 'text-[#6B7280]', ring: 'ring-[#6B7280]/30', kicker: 'Closed' },
};
