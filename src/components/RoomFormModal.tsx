import { useEffect, useState } from 'react';
import { X, Check } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { ROOM_AMENITY_NAMES, filterAmenitiesByNames } from '../lib/amenities';

const INPUT_CLASS =
  'w-full h-10 px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm bg-white ' +
  'focus:outline-none focus:border-[#1C6C41] focus:ring-2 focus:ring-[#1C6C41]/12 transition-all';
const LABEL_CLASS = 'block text-[12px] font-medium text-[#6B7280] mb-1';

const EMPTY = {
  room_number: '',
  room_sharing: 'single',
  is_ac: false,
  floor: '',
  capacity: 1,
  monthly_rent_per_head: '',
  status: 'available',
  notes: '',
};

function RoomFormModal({ open, onClose, onSubmit, initial, saving, availableAmenities }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [amenityOptions, setAmenityOptions] = useState([]);
  const [selectedAmenityIds, setSelectedAmenityIds] = useState(new Set());

  useEffect(() => {
    if (!open) return;

    // If the parent supplied a list of building amenities, use that as the
    // pool — rooms can only have amenities the building itself offers.
    if (Array.isArray(availableAmenities)) {
      setAmenityOptions(availableAmenities);
      return;
    }

    // Fallback: fetch and filter by ROOM_AMENITY_NAMES (legacy behavior).
    let mounted = true;
    (async () => {
      try {
        const all = await apiRequest('/api/v1/amenities/');
        const list = Array.isArray(all) ? all : [];
        if (mounted) setAmenityOptions(filterAmenitiesByNames(list, ROOM_AMENITY_NAMES));
      } catch {
        if (mounted) setAmenityOptions([]);
      }
    })();
    return () => { mounted = false; };
  }, [open, availableAmenities]);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        room_number: initial.room_number || '',
        room_sharing: initial.room_sharing || 'single',
        is_ac: !!initial.is_ac,
        floor: initial.floor ?? '',
        capacity: initial.capacity ?? 1,
        monthly_rent_per_head: initial.monthly_rent_per_head ?? '',
        status: initial.status || 'available',
        notes: initial.notes || '',
      });
      const initialIds = (initial.amenities || []).map((a) => a.id || a);
      setSelectedAmenityIds(new Set(initialIds));
    } else {
      setForm(EMPTY);
      setSelectedAmenityIds(new Set());
    }
    setError('');
  }, [initial, open]);

  if (!open) return null;

  const update = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAmenity = (id) => {
    setSelectedAmenityIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.room_number.trim()) {
      setError('Room number is required');
      return;
    }
    const rentNum = Number(form.monthly_rent_per_head);
    if (form.monthly_rent_per_head === '' || form.monthly_rent_per_head === null || form.monthly_rent_per_head === undefined || Number.isNaN(rentNum)) {
      setError('Monthly rent is required');
      return;
    }
    const payload = {
      room_number: form.room_number.trim(),
      room_sharing: form.room_sharing,
      is_ac: form.is_ac,
      floor: form.floor === '' ? null : Number(form.floor),
      capacity: Number(form.capacity),
      monthly_rent_per_head: Number(form.monthly_rent_per_head),
      status: form.status,
      notes: form.notes ? form.notes.trim() : null,
    };
    const initialIds = new Set(((initial?.amenities) || []).map((a) => a.id || a));
    const amenityChanges = {
      add: [...selectedAmenityIds].filter((id) => !initialIds.has(id)),
      remove: [...initialIds].filter((id) => !selectedAmenityIds.has(id)),
      selected: [...selectedAmenityIds],
    };
    try {
      await onSubmit(payload, amenityChanges);
    } catch (err) {
      setError(err?.message || 'Save failed');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB] sticky top-0 bg-white z-10">
          <h3 className="text-base font-semibold text-[#111827]">
            {initial ? 'Edit Room' : 'Add Room'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[#9CA3AF] hover:text-[#374151] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLASS}>Room Number *</label>
              <input
                type="text"
                value={form.room_number}
                onChange={update('room_number')}
                placeholder="e.g. 101"
                className={INPUT_CLASS}
                maxLength={20}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Floor</label>
              <input
                type="number"
                value={form.floor}
                onChange={update('floor')}
                placeholder="0"
                min={0}
                max={50}
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLASS}>Sharing *</label>
              <select
                value={form.room_sharing}
                onChange={update('room_sharing')}
                className={`${INPUT_CLASS} cursor-pointer`}
              >
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="triple">Triple</option>
                <option value="shared">Shared</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Capacity *</label>
              <input
                type="number"
                value={form.capacity}
                onChange={update('capacity')}
                min={1}
                max={10}
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLASS}>Monthly Rent / Head *</label>
              <input
                type="number"
                value={form.monthly_rent_per_head}
                onChange={update('monthly_rent_per_head')}
                placeholder="6500"
                min={0}
                step="0.01"
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Status</label>
              <select
                value={form.status}
                onChange={update('status')}
                className={`${INPUT_CLASS} cursor-pointer`}
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
                <option value="reserved">Reserved</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none mt-1">
            <input
              type="checkbox"
              checked={form.is_ac}
              onChange={update('is_ac')}
              className="w-4 h-4 accent-[#1C6C41] cursor-pointer"
            />
            <span className="text-sm text-[#374151]">Air Conditioned</span>
          </label>

          {amenityOptions.length > 0 && (
            <div>
              <label className={LABEL_CLASS}>Room Amenities</label>
              <div className="flex flex-wrap gap-2">
                {amenityOptions.map((a) => {
                  const checked = selectedAmenityIds.has(a.id);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => toggleAmenity(a.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
                        checked
                          ? 'bg-[#1C6C41]/10 border-[#1C6C41] text-[#1C6C41]'
                          : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB]'
                      }`}
                    >
                      {checked && <Check size={12} />}
                      {a.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className={LABEL_CLASS}>Notes</label>
            <textarea
              value={form.notes}
              onChange={update('notes')}
              placeholder="Optional notes about the room"
              rows={2}
              className={`${INPUT_CLASS} h-auto py-2 resize-none`}
            />
          </div>

          {error && (
            <p className="text-xs text-[#F04438] bg-[#FEF3F2] border border-[#FECDCA] rounded px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E7EB] mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-10 px-4 border border-[#D1D5DB] rounded-lg text-sm font-medium text-[#374151]
                         bg-white hover:bg-[#F9FAFB] transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-10 px-5 bg-[#1C6C41] hover:bg-[#155331] text-white text-sm font-semibold rounded-lg
                         transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : initial ? 'Save Changes' : 'Add Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RoomFormModal;
