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
import { BUILDING_AMENITY_NAMES, filterAmenitiesByNames, syncAmenities, createAmenity, getAmenityIcon } from '../lib/amenities';
import { formatCurrency } from '../lib/format';
import { filterPincode, isValidPincode, describeTextField } from '../lib/validation';
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
    <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
      {STEPS.map((s, idx) => {
        const done = current > s.num;
        const active = current === s.num;
        return (
          <div key={s.num} className="flex items-center gap-1.5 sm:gap-2.5">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors shrink-0 ${
                  done
                    ? 'bg-[#1C6C41] text-white'
                    : active
                      ? 'bg-[#1C6C41] text-white ring-4 ring-[#1C6C41]/15'
                      : 'bg-white border border-[#D1D5DB] text-[#9CA3AF]'
                }`}
              >
                {done ? <Check size={14} /> : s.num}
              </div>
              <span
                className={`hidden sm:inline text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap ${
                  active ? 'text-[#1C6C41]' : done ? 'text-[#374151]' : 'text-[#9CA3AF]'
                }`}
              >
                {s.title}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`w-6 sm:w-10 h-[2px] transition-colors ${
                  current > s.num ? 'bg-[#1C6C41]' : 'bg-[#E5E7EB]'
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

  const nameError = value.name.length > 0 ? describeTextField(value.name, { minLen: 3, label: 'PG Name' }) : null;
  const addressError = value.address.length > 0 ? describeTextField(value.address, { minLen: 8, label: 'Address' }) : null;
  const cityError = value.city.length > 0 ? describeTextField(value.city, { minLen: 2, label: 'City' }) : null;
  const stateError = value.state.length > 0 ? describeTextField(value.state, { minLen: 2, label: 'State' }) : null;
  const pincodeTouched = value.pincode.length > 0;
  const pincodeError = pincodeTouched && !isValidPincode(value.pincode);

  const valid =
    !describeTextField(value.name, { minLen: 3, label: 'PG Name' }) &&
    !describeTextField(value.address, { minLen: 8, label: 'Address' }) &&
    !describeTextField(value.city, { minLen: 2, label: 'City' }) &&
    !describeTextField(value.state, { minLen: 2, label: 'State' }) &&
    isValidPincode(value.pincode);

  return (
    <motion.div variants={fadeUp} initial="initial" animate="animate" className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
      <img
        src="/illustrations/F1-step-basics_001.jpg"
        alt=""
        className="block w-full h-28 sm:h-32 object-contain bg-[#F8F5F0]"
        loading="lazy"
      />
      <div className="p-6">
        <div className="flex items-center gap-2 mb-1">
          <Home size={18} className="text-[#1C6C41]" />
          <h2 className="text-base font-semibold text-[#111827]">Basic Information</h2>
        </div>
        <p className="text-sm text-[#6B7280] mb-5">
          Tell us about your property — name, location, and a short description.
        </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="md:col-span-2 lg:col-span-4">
          <label className={LABEL_CLASS}>PG Name *</label>
          <input type="text" value={value.name} onChange={setField('name')} placeholder="e.g. Sunrise PG" className={`${INPUT_CLASS} ${nameError ? 'border-red-400' : ''}`} maxLength={100} />
          {nameError && <p className="mt-1 text-[12px] text-red-500">{nameError}</p>}
        </div>

        <div className="md:col-span-2 lg:col-span-4">
          <label className={LABEL_CLASS}>Address *</label>
          <input type="text" value={value.address} onChange={setField('address')} placeholder="Full street address" className={`${INPUT_CLASS} ${addressError ? 'border-red-400' : ''}`} maxLength={200} />
          {addressError && <p className="mt-1 text-[12px] text-red-500">{addressError}</p>}
        </div>

        <div>
          <label className={LABEL_CLASS}>City *</label>
          <input type="text" value={value.city} onChange={setField('city')} placeholder="City" className={`${INPUT_CLASS} ${cityError ? 'border-red-400' : ''}`} maxLength={60} />
          {cityError && <p className="mt-1 text-[12px] text-red-500">{cityError}</p>}
        </div>
        <div>
          <label className={LABEL_CLASS}>State *</label>
          <input type="text" value={value.state} onChange={setField('state')} placeholder="State" className={`${INPUT_CLASS} ${stateError ? 'border-red-400' : ''}`} maxLength={60} />
          {stateError && <p className="mt-1 text-[12px] text-red-500">{stateError}</p>}
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
            aria-invalid={pincodeError || undefined}
            className={`${INPUT_CLASS} ${pincodeError ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
          />
          {pincodeError && (
            <p className="mt-1 text-[12px] text-red-500">Pincode must be exactly 6 digits</p>
          )}
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
          Continue
          <ArrowRight size={16} />
        </button>
      </div>
      </div>
    </motion.div>
  );
}

function StepBuildingAmenities({
  amenities,
  selectedIds,
  onToggle,
  onCreate,
  onNext,
  onBack,
  submitting,
  error,
}) {
  const [customName, setCustomName] = useState('');
  const [creatingName, setCreatingName] = useState('');
  const existingLowerNames = useMemo(
    () => new Set(amenities.map((a) => String(a.name).trim().toLowerCase())),
    [amenities],
  );
  const missingPresets = BUILDING_AMENITY_NAMES.filter((n) => !existingLowerNames.has(n));

  const submitCustom = async () => {
    const name = customName.trim();
    if (!name || creatingName) return;
    setCreatingName(name);
    try {
      await onCreate(name);
      setCustomName('');
    } finally {
      setCreatingName('');
    }
  };

  return (
    <motion.div variants={fadeUp} initial="initial" animate="animate" className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
      <img
        src="/illustrations/F2-step-amenities_001.jpg"
        alt=""
        className="block w-full h-28 sm:h-32 object-contain bg-[#F8F5F0]"
        loading="lazy"
      />
      <div className="p-6">
      <div className="flex items-center gap-2 mb-2">
        <MapPin size={18} className="text-[#1C6C41]" />
        <h2 className="text-base font-semibold text-[#111827]">Building Amenities</h2>
      </div>
      <p className="text-sm text-[#6B7280] mb-5">
        Pick the things shared by the whole building. Per-room features (AC, attached bath, TV) come up in the next step.
      </p>

      {amenities.length === 0 ? (
        <p className="text-sm text-[#9CA3AF] py-4 text-center">
          No amenities yet — type one below or pick from the suggestions to get started.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {amenities.map((a) => {
            const checked = selectedIds.has(a.id);
            const Icon = getAmenityIcon(a.name);
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
                <Icon size={15} className="shrink-0 opacity-80" />
                <span className="capitalize truncate">{a.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {missingPresets.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-medium text-[#6B7280] mb-2 uppercase tracking-wide">
            Quick-add common amenities
          </p>
          <div className="flex flex-wrap gap-2">
            {missingPresets.map((preset) => {
              const Icon = getAmenityIcon(preset);
              return (
                <button
                  key={preset}
                  type="button"
                  disabled={creatingName === preset}
                  onClick={() => {
                    setCreatingName(preset);
                    Promise.resolve(onCreate(preset)).finally(() => setCreatingName(''));
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-[#E5E7EB] bg-white text-[#374151] hover:border-[#1C6C41] hover:text-[#1C6C41] transition-colors cursor-pointer disabled:opacity-60 capitalize"
                >
                  <Icon size={13} className="opacity-70" />
                  <Plus size={12} />
                  {creatingName === preset ? 'Adding…' : preset}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-5 pt-5 border-t border-[#E5E7EB]">
        <p className="text-xs font-medium text-[#6B7280] mb-2 uppercase tracking-wide">
          Add a custom amenity
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                submitCustom();
              }
            }}
            placeholder="e.g. Rooftop garden"
            maxLength={100}
            className="flex-1 h-11 px-3.5 py-2.5 border border-[#D1D5DB] rounded-lg text-sm bg-white focus:outline-none focus:border-[#1C6C41] focus:ring-2 focus:ring-[#1C6C41]/12 transition-all"
          />
          <button
            type="button"
            onClick={submitCustom}
            disabled={!customName.trim() || !!creatingName}
            className="h-11 px-4 bg-[#1C6C41] hover:bg-[#155331] text-white text-sm font-semibold rounded-lg
                       inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={14} />
            Add
          </button>
        </div>
      </div>

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
          {selectedIds.size > 0 ? 'Continue' : 'Skip & Continue'}
          <ArrowRight size={16} />
        </button>
      </div>
      </div>
    </motion.div>
  );
}

function StepRooms({ rooms, onAdd, onEdit, onDelete, onFinish, onBack, submitting }) {
  return (
    <motion.div variants={fadeUp} initial="initial" animate="animate" className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
      <img
        src="/illustrations/F3-step-rooms_001.jpg"
        alt=""
        className="block w-full h-28 sm:h-32 object-contain bg-[#F8F5F0]"
        loading="lazy"
      />
      <div className="p-6">
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
              key={r.tempId}
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
          disabled={submitting}
          className="h-11 px-5 border border-[#D1D5DB] rounded-lg text-sm font-medium text-[#374151]
                     bg-white hover:bg-[#F9FAFB] transition-colors cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <button
          type="button"
          onClick={onFinish}
          disabled={submitting}
          className="h-11 px-6 bg-[#1C6C41] hover:bg-[#155331] text-white text-sm font-semibold rounded-lg
                     inline-flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {submitting ? 'Creating your PG…' : (<><Check size={16} /> Finish</>)}
        </button>
      </div>
      </div>
    </motion.div>
  );
}

function AddPG() {
  const navigate = useNavigate();
  const fb = useFeedback();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [stepError, setStepError] = useState('');

  // -----------------------------------------------------------------
  // TRANSACTIONAL DESIGN
  // -----------------------------------------------------------------
  // Everything the user enters lives in local state. No backend writes
  // happen until they hit "Finish" on step 3. That way they can navigate
  // back and forth between steps, edit anything, and bail out without
  // leaving a half-created PG on the server.
  //
  // The one exception is the master /amenities/ catalog (read-only here):
  // custom amenities the user adds go into `pendingCustomAmenities` and
  // are created in the master catalog inside finish() before being linked.
  // -----------------------------------------------------------------

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

  // Names typed via the inline custom-amenity input — created in the
  // master catalog at finish() time, then linked to this new PG.
  const [pendingCustomAmenities, setPendingCustomAmenities] = useState<string[]>([]);

  // Rooms held in local state with a temp string id (`temp-1`, `temp-2`,
  // ...). Persisted to the API only at finish() time.
  type LocalRoom = {
    tempId: string;
    room_number: string;
    room_sharing: string;
    is_ac: boolean;
    floor: number | null;
    capacity: number;
    monthly_rent_per_head: number;
    status: string;
    notes: string | null;
    // Either master-amenity uuids OR `pending:<index>` placeholders that
    // resolve to the new amenity ids created at finish() time.
    amenityRefs: string[];
  };
  const [rooms, setRooms] = useState<LocalRoom[]>([]);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<LocalRoom | null>(null);

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

  // Pseudo-amenity records for the pending custom ones so they look the
  // same as real master amenities in the UI (chip, room picker, etc.).
  const pendingAsAmenityRecords = useMemo(
    () =>
      pendingCustomAmenities.map((name, idx) => ({
        id: `pending:${idx}`,
        name,
        category: 'building',
        _pending: true as const,
      })),
    [pendingCustomAmenities],
  );

  const allBuildingChoices = useMemo(
    () => [...buildingAmenities, ...pendingAsAmenityRecords],
    [buildingAmenities, pendingAsAmenityRecords],
  );

  // Only what the user picked at step 2 is eligible as room amenities.
  const selectedBuildingAmenities = useMemo(
    () => allBuildingChoices.filter((a) => selectedBuildingIds.has(a.id)),
    [allBuildingChoices, selectedBuildingIds],
  );

  const handleStep1Submit = () => {
    setStepError('');
    setStep(2);
  };

  const handleStep2Submit = () => {
    setStepError('');
    setStep(3);
  };

  const toggleBuildingAmenity = (id) => {
    setSelectedBuildingIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /**
   * Inline custom-amenity creation in step 2. Held locally; not POSTed
   * to /amenities/ until finish() so a bail-out doesn't pollute the
   * master catalog with orphans.
   */
  const handleCreateAmenity = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    // Reject duplicates by name (case-insensitive) against master + pending.
    const lower = trimmed.toLowerCase();
    const isDup =
      buildingAmenities.some((a) => String(a.name).toLowerCase() === lower) ||
      pendingCustomAmenities.some((n) => n.toLowerCase() === lower);
    if (isDup) {
      fb.toast.warning(`'${trimmed}' is already in the list`);
      return;
    }
    setPendingCustomAmenities((prev) => {
      const next = [...prev, trimmed];
      // Auto-select the new pending amenity.
      const pendingId = `pending:${next.length - 1}`;
      setSelectedBuildingIds((sel) => {
        const ns = new Set(sel);
        ns.add(pendingId);
        return ns;
      });
      return next;
    });
  };

  const openAddRoom = () => {
    setEditingRoom(null);
    setRoomModalOpen(true);
  };

  const openEditRoom = (room: LocalRoom) => {
    setEditingRoom(room);
    setRoomModalOpen(true);
  };

  // RoomFormModal expects an `amenities` array of {id} records. Map our
  // flat amenityRefs to that shape for editing.
  const editingRoomForModal = useMemo(
    () => (editingRoom ? { ...editingRoom, amenities: editingRoom.amenityRefs.map((id) => ({ id })) } : null),
    [editingRoom],
  );

  const closeRoomModal = () => {
    setRoomModalOpen(false);
    setEditingRoom(null);
  };

  const handleRoomSubmit = (payload, amenityChanges) => {
    const selected: string[] = amenityChanges?.selected ?? amenityChanges?.add ?? [];
    const draft: LocalRoom = {
      tempId: editingRoom?.tempId ?? `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      room_number: String(payload.room_number),
      room_sharing: payload.room_sharing,
      is_ac: !!payload.is_ac,
      floor: payload.floor ?? null,
      capacity: Number(payload.capacity || 1),
      monthly_rent_per_head: Number(payload.monthly_rent_per_head || 0),
      status: payload.status || 'available',
      notes: payload.notes ?? null,
      amenityRefs: selected,
    };
    setRooms((prev) => {
      if (editingRoom) {
        return prev.map((r) => (r.tempId === editingRoom.tempId ? draft : r));
      }
      return [...prev, draft];
    });
    setRoomModalOpen(false);
    setEditingRoom(null);
  };

  const handleRoomDelete = async (room: LocalRoom) => {
    const ok = await fb.confirm({
      title: `Remove Room ${room.room_number}?`,
      message: 'It hasn\'t been saved to the server yet — you can re-add it before finishing.',
      confirmLabel: 'Remove',
      variant: 'danger',
    });
    if (!ok) return;
    setRooms((prev) => prev.filter((r) => r.tempId !== room.tempId));
  };

  /**
   * Single transactional submit. Order matters:
   *   1. Create any pending custom amenities in master catalog → real ids
   *   2. Create the PG → pgId
   *   3. Link each selected building amenity to the new PG
   *   4. For each room: POST /rooms/ with pg_id, then link its amenities
   *
   * Errors after the PG is created surface as warnings but we still
   * navigate forward — the PG exists, the user can fix the rest in-page.
   */
  const finish = async () => {
    setSubmitting(true);
    setStepError('');
    try {
      // --- 1. Create pending custom amenities first ---------------------
      const pendingIdMap: Record<string, string> = {};
      for (let i = 0; i < pendingCustomAmenities.length; i++) {
        const name = pendingCustomAmenities[i];
        try {
          const created = await createAmenity(name, 'building');
          if (created?.id) pendingIdMap[`pending:${i}`] = created.id;
        } catch (err: any) {
          fb.toast.warning(`Couldn't create amenity '${name}': ${err?.message || 'unknown error'}`);
        }
      }

      // Resolve every selected building amenity ref to a real master id.
      const resolvedBuildingAmenityIds = [...selectedBuildingIds]
        .map((ref) => (ref.startsWith('pending:') ? pendingIdMap[ref] : ref))
        .filter(Boolean) as string[];

      // --- 2. Create the PG --------------------------------------------
      const createdPg = await apiRequest('/api/v1/pg/', {
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
      const pgId = createdPg?.id;
      if (!pgId) throw new Error('PG was created but no id returned.');
      queryClient.invalidateQueries({ queryKey: queryKeys.resource('pgs') });

      // --- 3. Link building amenities ----------------------------------
      if (resolvedBuildingAmenityIds.length > 0) {
        const linkResult = await syncAmenities('pg', pgId, { add: resolvedBuildingAmenityIds });
        if (linkResult.failures.length > 0) {
          fb.toast.warning(`${linkResult.failures.length} amenity link(s) failed`);
        }
      }

      // --- 4. Create each room + its amenity links ---------------------
      for (const r of rooms) {
        let createdRoom;
        try {
          createdRoom = await apiRequest('/api/v1/rooms/', {
            method: 'POST',
            body: {
              room_number: r.room_number,
              room_sharing: r.room_sharing,
              is_ac: r.is_ac,
              floor: r.floor,
              capacity: r.capacity,
              monthly_rent_per_head: r.monthly_rent_per_head,
              status: r.status,
              notes: r.notes,
              pg_id: pgId,
              current_occupancy: 0,
              is_active: true,
            },
          });
        } catch (err: any) {
          fb.toast.warning(`Couldn't create Room ${r.room_number}: ${err?.message || 'unknown'}`);
          continue;
        }
        const newRoomId = createdRoom?.id;
        const roomAmenityIds = r.amenityRefs
          .map((ref) => (ref.startsWith('pending:') ? pendingIdMap[ref] : ref))
          .filter(Boolean) as string[];
        if (newRoomId && roomAmenityIds.length > 0) {
          await syncAmenities('room', newRoomId, { add: roomAmenityIds });
        }
      }

      navigate(`/pg/${pgId}/rooms`);
    } catch (err: any) {
      setStepError(err?.message || 'Could not create PG');
      setSubmitting(false);
    }
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
                     hover:bg-[#F9FAFB] transition-colors cursor-pointer shrink-0"
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
            {basics.name && step > 1 && (
              <span className="text-[#6B7280] font-normal text-base sm:text-lg ml-1">
                / {basics.name}
              </span>
            )}
          </h1>
        </div>
        <StepIndicator current={step} />
      </div>

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
          onCreate={handleCreateAmenity}
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
          submitting={submitting}
        />
      )}

      <RoomFormModal
        open={roomModalOpen}
        onClose={closeRoomModal}
        onSubmit={handleRoomSubmit}
        initial={editingRoomForModal}
        saving={false}
        availableAmenities={selectedBuildingAmenities}
      />
    </motion.div>
  );
}

export default AddPG;
