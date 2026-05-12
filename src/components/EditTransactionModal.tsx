import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { apiRequest } from '../lib/api';

interface Props {
  open: boolean;
  onClose: () => void;
  transactionId: string | null;
  onSaved?: () => void;
}

const TX_TYPES = ['rent', 'deposit', 'refund', 'other'] as const;
const PAYMENT_METHODS = ['cash', 'upi', 'bank_transfer', 'cheque', 'card'] as const;
const STATUSES = ['pending', 'paid', 'failed', 'cancelled'] as const;

export default function EditTransactionModal({ open, onClose, transactionId, onSaved }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    amount: '',
    transaction_type: 'rent' as (typeof TX_TYPES)[number],
    payment_method: 'upi' as (typeof PAYMENT_METHODS)[number],
    status: 'paid' as (typeof STATUSES)[number],
    transaction_date: '',
    description: '',
  });

  useEffect(() => {
    if (!open || !transactionId) return;
    let mounted = true;
    setLoading(true);
    setError('');
    (async () => {
      try {
        const t = await apiRequest(`/api/v1/transactions/${transactionId}`);
        if (!mounted) return;
        setForm({
          amount: String(t.amount ?? ''),
          transaction_type: (t.transaction_type || 'rent') as any,
          payment_method: (t.payment_method || 'upi') as any,
          status: (t.status || 'paid') as any,
          transaction_date: t.transaction_date ? String(t.transaction_date).slice(0, 10) : '',
          description: t.description || '',
        });
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load transaction');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [open, transactionId]);

  if (!open) return null;

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value as any }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId) return;
    setSaving(true);
    setError('');
    try {
      const payload: Record<string, any> = {
        amount: parseFloat(form.amount || '0'),
        transaction_type: form.transaction_type,
        payment_method: form.payment_method,
        status: form.status,
        transaction_date: form.transaction_date || null,
        description: form.description || null,
      };
      await apiRequest(`/api/v1/transactions/${transactionId}`, { method: 'PATCH', body: payload });
      onSaved?.();
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Failed to update transaction');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB] sticky top-0 bg-white z-10">
          <h3 className="text-base font-semibold text-[#111827]">Edit Transaction</h3>
          <button type="button" onClick={onClose} className="text-[#9CA3AF] hover:text-[#374151]">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="px-5 py-10 text-sm text-[#6B7280] text-center">Loading…</div>
        ) : (
          <form onSubmit={handleSubmit} className="px-5 py-4 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-[#6B7280] mb-1">Amount (₹) *</label>
                <input required type="number" min={0} step="0.01" value={form.amount} onChange={update('amount')} className="w-full h-10 px-3 border border-[#D1D5DB] rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#6B7280] mb-1">Date</label>
                <input type="date" value={form.transaction_date} onChange={update('transaction_date')} className="w-full h-10 px-3 border border-[#D1D5DB] rounded-lg text-sm bg-white" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-[#6B7280] mb-1">Type</label>
                <select value={form.transaction_type} onChange={update('transaction_type')} className="w-full h-10 px-3 border border-[#D1D5DB] rounded-lg text-sm bg-white capitalize">
                  {TX_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#6B7280] mb-1">Method</label>
                <select value={form.payment_method} onChange={update('payment_method')} className="w-full h-10 px-3 border border-[#D1D5DB] rounded-lg text-sm bg-white capitalize">
                  {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#6B7280] mb-1">Status</label>
              <select value={form.status} onChange={update('status')} className="w-full h-10 px-3 border border-[#D1D5DB] rounded-lg text-sm bg-white capitalize">
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#6B7280] mb-1">Description</label>
              <textarea rows={2} maxLength={500} value={form.description} onChange={update('description')} className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm resize-none" />
            </div>

            {error && (
              <p className="text-xs text-[#F04438] bg-[#FEF3F2] border border-[#FECDCA] rounded px-3 py-2">{error}</p>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E7EB] mt-2">
              <button type="button" onClick={onClose} disabled={saving} className="h-10 px-4 border border-[#D1D5DB] rounded-lg text-sm font-medium text-[#374151] bg-white hover:bg-[#F9FAFB] disabled:opacity-50">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="h-10 px-5 bg-[#1C6C41] hover:bg-[#155331] text-white text-sm font-semibold rounded-lg disabled:opacity-50">
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
