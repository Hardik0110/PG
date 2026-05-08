import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../data/hooks';
import {
  ArrowLeft, ArrowRight, Check, Plus, Pencil, Trash2,
  Home, MapPin, Wind, Users, FileText,
} from 'lucide-react';
import { apiRequest } from '../lib/api';
import { pageVariants, fadeUp } from '../lib/animations';
import { BUILDING_AMENITY_NAMES, filterAmenitiesByNames, syncAmenities } from '../lib/amenities';
import { formatCurrency } from '../lib/format';
import { filterPincode } from '../lib/validation';
import { useFeedback } from '../components/FeedbackProvider';
import RoomFormModal from '../components/RoomFormModal';

const INPUT_CLASS =
  'w-full h-11 px-3.5 py-2.5 border border-[#D1D5DB] rounded-lg text-sm bg-white ' +
  'focus:outline-none focus:border-[#1C6C41] focus:ring-2 focus:ring-[#1C6C41]/12 transition-all';
const LABEL_CLASS = 'block text-[13px] font-medium text-[#6B7280] mb-1.5';

const STEPS = [
  { num: 1, title: 'Basics' },
  { num: 2, title: 'Building Amenities' },
  { num: 3, title: 'Rooms' },
];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {STEPS.map((s, idx) => {
        const done = current > s.num;
        const active = current === s.num;
        return (
          <div key={s.num} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${done
                    ? 'bg-[#1C6C41] text-white'
                    : active
                      ? 'bg-[#1C6C41] text-white ring-4 ring-[#1C6C41]/15'
                      : 'bg-white border border-[#D1D5DB] text-[#9CA3AF]'
                  }`}
              >
                {done ? <Check size={16} /> : s.num}
              </div>
              <span
                className={`text-[11px] font-semibold tracking-wide uppercase ${active ? 'text-[#1C6C41]' : 'text-[#9CA3AF]'
                  }`}
              >
                {s.title}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`w-12 sm:w-20 h-[2px] mx-2 mb-5 transition-colors ${current > s.num ? 'bg-[#1C6C41]' : 'bg-[#E5E7EB]'
                  }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function StepBasics({ value, onChange, onNext, submitting, error }) {
  const setField = (field) => (e) => onChange({ ...value, [field]: e.target.value });

  const valid =
    value.name.trim() &&
    value.address.trim() &&
    value.city.trim() &&
    value.state.trim() &&
    value.pincode.trim();

  return (
    <motion.div variants={fadeUp} initial="initial" animate="animate" className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6">
      <div className="flex items-center gap-2 mb-5">
        <Home size={18} className="text-[#1C6C41]" />
        <h2 className="text-base font-semibold text-[#111827]">Basic Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="md:col-span-2 lg:col-span-4">
          <label className={LABEL_CLASS}>PG Name *</label>
          <input type="text" value={value.name} onChange={setField('name')} placeholder="e.g. Sunrise PG" className={INPUT_CLASS} />
        </div>

        <div className="md:col-span-2 lg:col-span-4">
          <label className={LABEL_CLASS}>Address *</label>
          <input type="text" value={value.address} onChange={setField('address')} placeholder="Full street address" className={INPUT_CLASS} />
        </div>

        <div>
          <label className={LABEL_CLASS}>City *</label>
          <input type="text" value={value.city} onChange={setField('city')} placeholder="City" className={INPUT_CLASS} />
        </div>
        <div>
          <label className={LABEL_CLASS}>State *</label>
          <input type="text" value={value.state} onChange={setField('state')} placeholder="State" className={INPUT_CLASS} />
        </div>
        <div>
          <label className={LABEL_CLASS}>Pincode *</label>
          <input
            type="text"
            inputMode="numeric"
            value={value.pincode}
            onChange={(e) => onChange({ ...value, pincode: filterPincode(e.target.value) })}
            placeholder="6-digit pincode"
            maxLength={6}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>PG Type *</label>
          <select value={value.type} onChange={setField('type')} className={`${INPUT_CLASS} cursor-pointer`}>
            <option value="gents">Gents</option>
            <option value="ladies">Ladies</option>
            <option value="coed">Co-ed</option>
          </select>
        </div>

        <div className="md:col-span-2 lg:col-span-4">
          <label className={LABEL_CLASS}>
            <span className="inline-flex items-center gap-1.5">
              <FileText size={13} />
              Description (optional)
            </span>
          </label>
          <textarea
            value={value.description}
            onChange={setField('description')}
            placeholder="Tell tenants what makes this PG special..."
            rows={3}
            className={`${INPUT_CLASS} h-auto py-2.5 resize-none`}
          />
        </div>
      </div>

      {error && (
        <p className="mt-4 text-sm text-[#F04438] bg-[#FEF3F2] border border-[#FECDCA] rounded px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-2 pt-5 mt-5 border-t border-[#E5E7EB]">
        <button
          type="button"
          onClick={onNext}
          disabled={!valid || submitting}
          className="h-11 px-6 bg-[#1C6C41] hover:bg-[#155331] text-white text-sm font-semibold rounded-lg
                     inline-flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Creating PG...' : 'Continue'}
          {!submitting && <ArrowRight size={16} />}
        </button>
      </div>
    </motion.div>
  );
}

function StepBuildingAmenities({ amenities, selectedIds, onToggle, onNext, onBack, submitting, error }) {
  return (
    <motion.div variants={fadeUp} initial="initial" animate="animate" className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6">
      <div className="flex items-center gap-2 mb-2">
        <MapPin size={18} className="text-[#1C6C41]" />
        <h2 className="text-base font-semibold text-[#111827]">Building Amenities</h2>
      </div>
      <p className="text-sm text-[#6B7280] mb-5">
        Pick the things shared by the whole building. Per-room features (AC, attached bath, TV) come up in the next step.
      </p>

      {amenities.length === 0 ? (
        <p className="text-sm text-[#9CA3AF] py-6 text-center">No amenities found. You can skip this step.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {amenities.map((a) => {
            const checked = selectedIds.has(a.id);
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => onToggle(a.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${checked
                    ? 'bg-[#1C6C41]/8 border-[#1C6C41] text-[#1C6C41]'
                    : 'bg-white border-[#E5E7EB] text-[#374151] hover:border-[#D1D5DB] hover:bg-[#F9FAFB]'
                  }`}
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${checked ? 'bg-[#1C6C41] border-[#1C6C41]' : 'border-[#D1D5DB] bg-white'
                    }`}
                >
                  {checked && <Check size={10} className="text-white" />}
                </div>
                <span className="capitalize truncate">{a.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {error && (
        <p className="mt-4 text-sm text-[#F04438] bg-[#FEF3F2] border border-[#FECDCA] rounded px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-2 pt-5 mt-5 border-t border-[#E5E7EB]">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="h-11 px-5 border border-[#D1D5DB] rounded-lg text-sm font-medium text-[#374151]
                     bg-white hover:bg-[#F9FAFB] transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={submitting}
          className="h-11 px-6 bg-[#1C6C41] hover:bg-[#155331] text-white text-sm font-semibold rounded-lg
                     inline-flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
        >
          {submitting ? 'Saving...' : selectedIds.size > 0 ? 'Continue' : 'Skip & Continue'}
          {!submitting && <ArrowRight size={16} />}
        </button>
      </div>
    </motion.div>
  );
}

function StepRooms({ rooms, onAdd, onEdit, onDelete, onFinish, onBack, deletingRoomId }) {
  return (
    <motion.div variants={fadeUp} initial="initial" animate="animate" className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-[#1C6C41]" />
          <h2 className="text-base font-semibold text-[#111827]">Rooms</h2>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="h-9 px-3.5 bg-[#1C6C41] hover:bg-[#155331] text-white text-sm font-semibold rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={14} />
          Add Room
        </button>
      </div>
      <p className="text-sm text-[#6B7280] mb-5">
        Add the rooms in this PG. You can always add more later from the Manage Rooms page.
      </p>

      {rooms.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-[#E5E7EB] rounded-xl text-[#9CA3AF]">
          <Users size={28} className="mx-auto mb-2 text-[#D1D5DB]" />
          <p className="text-sm">No rooms added yet — click "Add Room" or skip and finish.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {rooms.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-[#FAF7F2] border border-[#E8DFD2]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-white border border-[#E8DFD2] flex items-center justify-center text-sm font-bold text-[#5C4632]">
                  {r.room_number}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#2B1D14] truncate">
                    Room {r.room_number}
                    {r.is_ac && <Wind size={12} className="inline ml-1.5 text-[#6B5847]" />}
                  </p>
                  <p className="text-xs text-[#6B5847] capitalize">
                    {r.room_sharing} · cap {r.capacity}
                    {r.floor != null ? ` · floor ${r.floor}` : ''} · {formatCurrency(r.monthly_rent_per_head || 0)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => onEdit(r)}
                  className="p-1.5 text-[#6B5847] hover:text-[#1C6C41] hover:bg-white rounded-md transition-colors cursor-pointer"
                  aria-label="Edit room"
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(r)}
                  disabled={deletingRoomId === r.id}
                  className="p-1.5 text-[#A89580] hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                  aria-label="Delete room"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 pt-5 mt-5 border-t border-[#E5E7EB]">
        <button
          type="button"
          onClick={onBack}
          className="h-11 px-5 border border-[#D1D5DB] rounded-lg text-sm font-medium text-[#374151]
                     bg-white hover:bg-[#F9FAFB] transition-colors cursor-pointer inline-flex items-center gap-1.5"
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <button
          type="button"
          onClick={onFinish}
          className="h-11 px-6 bg-[#1C6C41] hover:bg-[#155331] text-white text-sm font-semibold rounded-lg
                     inline-flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Check size={16} />
          Finish
        </button>
      </div>
    </motion.div>
  );
}

function AddPG() {
  const navigate = useNavigate();
  const fb = useFeedback();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [pgId, setPgId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [stepError, setStepError] = useState('');

  const [basics, setBasics] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    description: '',
    type: 'gents',
  });

  const [allAmenities, setAllAmenities] = useState([]);
  const [selectedBuildingIds, setSelectedBuildingIds] = useState<Set<string>>(new Set());

  const [rooms, setRooms] = useState([]);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [savingRoom, setSavingRoom] = useState(false);
  const [deletingRoomId, setDeletingRoomId] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await apiRequest('/api/v1/amenities/');
        if (mounted) setAllAmenities(Array.isArray(list) ? list : []);
      } catch {
        if (mounted) setAllAmenities([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const buildingAmenities = useMemo(
    () => filterAmenitiesByNames(allAmenities, BUILDING_AMENITY_NAMES),
    [allAmenities],
  );

  const handleStep1Submit = async () => {
    setSubmitting(true);
    setStepError('');
    try {
      const created = await apiRequest('/api/v1/pg/', {
        method: 'POST',
        body: {
          name: basics.name.trim(),
          address: basics.address.trim(),
          city: basics.city.trim(),
          state: basics.state.trim(),
          pincode: basics.pincode.trim(),
          description: basics.description.trim() || null,
          type: basics.type,
          is_active: true,
        },
      });
      setPgId(created?.id);
      // Tell TanStack the pgs list is stale so OnboardingGuard sees count > 0
      // immediately and stops redirecting back here on subsequent navigations.
      queryClient.invalidateQueries({ queryKey: queryKeys.resource('pgs') });
      setStep(2);
    } catch (err) {
      setStepError(err?.message || 'Could not create PG');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStep2Submit = async () => {
    if (!pgId) {
      setStepError('PG not yet created. Go back to step 1.');
      return;
    }
    setSubmitting(true);
    setStepError('');
    try {
      const result = await syncAmenities('pg', pgId, { add: [...selectedBuildingIds] });
      if (result.failures.length > 0) {
        fb.toast.warning(`${result.failures.length} amenity link(s) failed`);
      }
      setStep(3);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleBuildingAmenity = (id) => {
    setSelectedBuildingIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openAddRoom = () => {
    setEditingRoom(null);
    setRoomModalOpen(true);
  };

  const openEditRoom = (room) => {
    setEditingRoom(room);
    setRoomModalOpen(true);
  };

  const closeRoomModal = () => {
    if (savingRoom) return;
    setRoomModalOpen(false);
    setEditingRoom(null);
  };

  const handleRoomSubmit = async (payload, amenityChanges) => {
    if (!pgId) return;
    setSavingRoom(true);
    try {
      let roomId = editingRoom?.id;
      if (editingRoom) {
        await apiRequest(`/api/v1/rooms/${editingRoom.id}`, { method: 'PATCH', body: payload });
        await syncAmenities('room', editingRoom.id, amenityChanges ?? {});
      } else {
        const created = await apiRequest('/api/v1/rooms/', {
          method: 'POST',
          body: { ...payload, pg_id: pgId, current_occupancy: 0, is_active: true },
        });
        roomId = created?.id;
        if (roomId && amenityChanges?.selected?.length) {
          await syncAmenities('room', roomId, { add: amenityChanges.selected });
        }
      }
      const refreshed = await apiRequest(`/api/v1/rooms/?pg_id=${pgId}`);
      setRooms(Array.isArray(refreshed) ? refreshed : []);
      setRoomModalOpen(false);
      setEditingRoom(null);
    } finally {
      setSavingRoom(false);
    }
  };

  const handleRoomDelete = async (room) => {
    const ok = await fb.confirm({
      title: `Delete Room ${room.room_number}?`,
      message: 'This cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    setDeletingRoomId(room.id);
    const result = await fb.error(
      apiRequest(`/api/v1/rooms/${room.id}`, { method: 'DELETE' }),
      'Could not delete room',
      'Room deleted',
    );
    if (result !== undefined) {
      setRooms((prev) => prev.filter((r) => r.id !== room.id));
    }
    setDeletingRoomId(null);
  };

  const finish = () => {
    navigate('/dashboard');
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="max-w-5xl mx-auto"
    >
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/pgs')}
          className="w-9 h-9 flex items-center justify-center bg-white border border-[#E5E7EB] rounded-lg
                     hover:bg-[#F9FAFB] transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} className="text-[#374151]" />
        </button>
        <div className="flex-1 min-w-0">
          <button
            onClick={() => navigate('/pgs')}
            className="text-sm text-[#6B7280] hover:text-[#1C6C41] transition-colors cursor-pointer bg-transparent border-none p-0"
          >
            Back to My PGs
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111827] leading-tight">
            Add New PG
            {pgId && basics.name && (
              <span className="text-[#6B7280] font-normal text-base sm:text-lg ml-1">
                / {basics.name}
              </span>
            )}
          </h1>
        </div>
      </div>

      <StepIndicator current={step} />

      {step === 1 && (
        <StepBasics
          value={basics}
          onChange={setBasics}
          onNext={handleStep1Submit}
          submitting={submitting}
          error={stepError}
        />
      )}

      {step === 2 && (
        <StepBuildingAmenities
          amenities={buildingAmenities}
          selectedIds={selectedBuildingIds}
          onToggle={toggleBuildingAmenity}
          onNext={handleStep2Submit}
          onBack={() => setStep(1)}
          submitting={submitting}
          error={stepError}
        />
      )}

      {step === 3 && (
        <StepRooms
          rooms={rooms}
          onAdd={openAddRoom}
          onEdit={openEditRoom}
          onDelete={handleRoomDelete}
          onFinish={finish}
          onBack={() => setStep(2)}
          deletingRoomId={deletingRoomId}
        />
      )}

      <RoomFormModal
        open={roomModalOpen}
        onClose={closeRoomModal}
        onSubmit={handleRoomSubmit}
        initial={editingRoom}
        saving={savingRoom}
      />
    </motion.div>
  );
}

export default AddPG;
