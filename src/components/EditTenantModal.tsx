import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { apiRequest } from '../lib/api';

interface Props {
  open: boolean;
  onClose: () => void;
  tenantId: string | null;
  rooms?: Array<{ id: string; pg_id: string; room_number: string; capacity?: number; current_occupancy?: number }>;
  pgId?: string;
  onSaved?: () => void;
}

/**
 * Minimal edit modal for an existing tenant. Allows changing the room,
 * rent, deposit, move-in date, workplace, occupation, and guardian info.
 * User-level fields (name / email / phone / password) live on /profile and
 * are intentionally NOT editable here.
 */
export default function EditTenantModal({ open, onClose, tenantId, rooms = [], pgId, onSaved }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    room_id: '',
    monthly_rent: '',
    security_deposit: '',
    move_in_date: '',
    workplace: '',
    occupation: '',
    guardian_name: '',
    guardian_phone: '',
    guardian_relation: '',
  });

  useEffect(() => {
    if (!open || !tenantId) return;
    let mounted = true;
    setLoading(true);
    setError('');
    (async () => {
      try {
        const t = await apiRequest(`/api/v1/tenants/${tenantId}`);
        if (!mounted) return;
        setForm({
          room_id: t.room_id || '',
          monthly_rent: String(t.monthly_rent ?? ''),
          security_deposit: String(t.security_deposit ?? ''),
          move_in_date: t.move_in_date ? String(t.move_in_date).slice(0, 10) : '',
          workplace: t.workplace || '',
          occupation: t.occupation || '',
          guardian_name: t.guardian_name || '',
          guardian_phone: t.guardian_phone || '',
          guardian_relation: t.guardian_relation || '',
        });
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load tenant');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [open, tenantId]);

  if (!open) return null;

  const availableRooms = rooms.filter((r) =>
    !pgId ? true : r.pg_id === pgId,
  );

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;
    setSaving(true);
    setError('');
    try {
      const payload: Record<string, any> = {
        room_id: form.room_id || null,
        monthly_rent: parseFloat(form.monthly_rent || '0'),
        security_deposit: parseFloat(form.security_deposit || '0'),
        move_in_date: form.move_in_date || null,
        workplace: form.workplace || null,
        occupation: form.occupation || null,
        guardian_name: form.guardian_name || null,
        guardian_phone: form.guardian_phone || null,
        guardian_relation: form.guardian_relation || null,
      };
      await apiRequest(`/api/v1/tenants/${tenantId}`, { method: 'PATCH', body: payload });
      onSaved?.();
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Failed to update tenant');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB] sticky top-0 bg-white z-10">
          <h3 className="text-base font-semibold text-[#111827]">Edit Tenant</h3>
          <button type="button" onClick={onClose} className="text-[#9CA3AF] hover:text-[#374151] transition-colors">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="px-5 py-10 text-sm text-[#6B7280] text-center">Loading…</div>
        ) : (
          <form onSubmit={handleSubmit} className="px-5 py-4 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-[#6B7280] mb-1">Room</label>
                <select value={form.room_id} onChange={update('room_id')} className="w-full h-10 px-3 border border-[#D1D5DB] rounded-lg text-sm bg-white">
                  <option value="">— Unassigned —</option>
                  {availableRooms.map((r) => (
                    <option key={r.id} value={r.id}>Room {r.room_number}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#6B7280] mb-1">Move-in Date</label>
                <input type="date" value={form.move_in_date} onChange={update('move_in_date')} className="w-full h-10 px-3 border border-[#D1D5DB] rounded-lg text-sm bg-white" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-[#6B7280] mb-1">Monthly Rent (₹)</label>
                <input type="number" min={0} max={500000} step={100} value={form.monthly_rent} onChange={update('monthly_rent')} className="w-full h-10 px-3 border border-[#D1D5DB] rounded-lg text-sm bg-white" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#6B7280] mb-1">Security Deposit (₹)</label>
                <input type="number" min={0} max={2000000} step={100} value={form.security_deposit} onChange={update('security_deposit')} className="w-full h-10 px-3 border border-[#D1D5DB] rounded-lg text-sm bg-white" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-[#6B7280] mb-1">Occupation</label>
                <input type="text" value={form.occupation} onChange={update('occupation')} className="w-full h-10 px-3 border border-[#D1D5DB] rounded-lg text-sm bg-white" maxLength={80} />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#6B7280] mb-1">Workplace</label>
                <input type="text" value={form.workplace} onChange={update('workplace')} className="w-full h-10 px-3 border border-[#D1D5DB] rounded-lg text-sm bg-white" maxLength={120} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-[#6B7280] mb-1">Guardian Name</label>
                <input type="text" value={form.guardian_name} onChange={update('guardian_name')} className="w-full h-10 px-3 border border-[#D1D5DB] rounded-lg text-sm bg-white" maxLength={80} />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#6B7280] mb-1">Guardian Phone</label>
                <input type="tel" inputMode="numeric" maxLength={10} value={form.guardian_phone} onChange={update('guardian_phone')} className="w-full h-10 px-3 border border-[#D1D5DB] rounded-lg text-sm bg-white" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#6B7280] mb-1">Relation</label>
                <select value={form.guardian_relation} onChange={update('guardian_relation')} className="w-full h-10 px-3 border border-[#D1D5DB] rounded-lg text-sm bg-white">
                  <option value="">—</option>
                  <option value="father">Father</option>
                  <option value="mother">Mother</option>
                  <option value="spouse">Spouse</option>
                  <option value="sibling">Sibling</option>
                  <option value="other">Other</option>
                </select>
              </div>
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
