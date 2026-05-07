import type {
  ExpenseCategory,
  PGType,
  TicketPriority,
  TicketStatusRaw,
  TransactionType,
} from '../types';

/** Tailwind class strings for resource-specific chip backgrounds + text. */
export type ChipClass = string;

export const TRANSACTION_TYPE_CHIP: Record<TransactionType, ChipClass> = {
  rent: 'bg-[#DCEEDF] text-[#1C6C41]',
  deposit: 'bg-[#E8E1F5] text-[#6D28D9]',
  utility: 'bg-[#FCF1DC] text-[#B45309]',
  fine: 'bg-[#FBE5E0] text-[#A04D3A]',
  food: 'bg-[#FBE5F0] text-[#BE185D]',
  refund: 'bg-[#EFE7DA] text-[#5C4632]',
  other: 'bg-[#EFE7DA] text-[#5C4632]',
};

export const EXPENSE_CATEGORY_CHIP: Record<ExpenseCategory, ChipClass> = {
  electricity: 'bg-[#FCF1DC] text-[#B45309]',
  water: 'bg-[#DCEEFF] text-[#1E40AF]',
  internet: 'bg-[#E8E1F5] text-[#6D28D9]',
  gas: 'bg-[#FBE5E0] text-[#A04D3A]',
  maintenance: 'bg-[#FBE5F0] text-[#BE185D]',
  repair: 'bg-[#FFE4E1] text-[#B91C1C]',
  cleaning: 'bg-[#DCEEDF] text-[#1C6C41]',
  staff_salary: 'bg-[#E0F2FE] text-[#0369A1]',
  food_supplies: 'bg-[#FEF3C7] text-[#92400E]',
  other: 'bg-[#EFE7DA] text-[#5C4632]',
};

export const PG_TYPE_BANNER: Record<PGType, { banner: string; accent: string; ring: string; label: string }> = {
  gents: {
    banner: 'bg-[#DCEEDF]',
    accent: 'text-[#1C6C41]',
    ring: 'ring-[#1C6C41]/30',
    label: 'Gents PG',
  },
  coed: {
    banner: 'bg-[#FCF1DC]',
    accent: 'text-[#B45309]',
    ring: 'ring-[#B45309]/30',
    label: 'Co-ed PG',
  },
  ladies: {
    banner: 'bg-[#FBE5F0]',
    accent: 'text-[#BE185D]',
    ring: 'ring-[#BE185D]/30',
    label: 'Ladies PG',
  },
};

export const TICKET_PRIORITY_CHIP: Record<TicketPriority, ChipClass> = {
  low: 'bg-[#DCEEDF] text-[#1C6C41]',
  medium: 'bg-[#FCF1DC] text-[#B45309]',
  high: 'bg-[#FBE5E0] text-[#A04D3A]',
  urgent: 'bg-[#FBDED8] text-[#B91C1C]',
};

export const TICKET_STATUS_CHIP: Record<TicketStatusRaw, ChipClass> = {
  open: 'bg-[#FBDED8] text-[#B91C1C]',
  in_progress: 'bg-[#FCF1DC] text-[#B45309]',
  resolved: 'bg-[#DCEEDF] text-[#1C6C41]',
  closed: 'bg-[#F3F4F6] text-[#6B7280]',
};
