import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Pencil, Trash2, Home, Wind, Users } from 'lucide-react';
import { apiRequest, unwrapData } from '../lib/api';
import { pageVariants, staggerContainer, fadeUp } from '../lib/animations';
import Loader from '../components/ui/Loader';
import RoomFormModal from '../components/RoomFormModal';
import { ROOM_THEME, deriveRoomStatus } from '../lib/status';
import { formatCurrency } from '../lib/format';
import { syncAmenities } from '../lib/amenities';
import { useFeedback } from '../components/FeedbackProvider';

const SHARING_LABEL = {
  single: 'Single',
  double: 'Double',
  triple: 'Triple',
  shared: 'Shared',
};

function PGRooms() {
  const navigate = useNavigate();
  const fb = useFeedback();
  const { id: pgId } = useParams();
  const [pg, setPg] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadRooms = async () => {
    const roomsPayload = await apiRequest(`/api/v1/rooms/?pg_id=${pgId}`);
    const list = Array.isArray(roomsPayload) ? roomsPayload : unwrapData(roomsPayload, []);
    setRooms(list);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [pgData] = await Promise.all([
          apiRequest(`/api/v1/pg/${pgId}`),
          loadRooms(),
        ]);
        if (mounted) setPg(pgData);
      } catch (err) {
        console.error('Failed to load PG rooms:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [pgId]);

  const openAdd = () => {
    setEditingRoom(null);
    setModalOpen(true);
  };

  const openEdit = (room) => {
    setEditingRoom(room);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingRoom(null);
  };

  const handleSubmit = async (payload, amenityChanges) => {
    setSaving(true);
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
      await loadRooms();
      setModalOpen(false);
      setEditingRoom(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (room) => {
    const ok = await fb.confirm({
      title: `Delete Room ${room.room_number}?`,
      message: 'This cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    setDeletingId(room.id);
    const result = await fb.error(
      apiRequest(`/api/v1/rooms/${room.id}`, { method: 'DELETE' }),
      'Could not delete room',
      'Room deleted',
    );
    if (result !== undefined) {
      setRooms((prev) => prev.filter((r) => r.id !== room.id));
    }
    setDeletingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-[#6B7280]">
        <div className="flex flex-col items-center gap-3">
          <Loader size={32} />
          <span className="text-sm">Loading rooms...</span>
        </div>
      </div>
    );
  }

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
          onClick={() => navigate(`/pg/edit/${pgId}`)}
          className="w-9 h-9 flex items-center justify-center bg-white border border-[#E5E7EB] rounded-lg
                     hover:bg-[#F9FAFB] transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} className="text-[#374151]" />
        </button>
        <div className="flex-1 min-w-0">
          <button
            onClick={() => navigate(`/pg/edit/${pgId}`)}
            className="text-sm text-[#6B7280] hover:text-[#1C6C41] transition-colors cursor-pointer bg-transparent border-none p-0"
          >
            Back to Edit PG
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111827] leading-tight truncate">
            Rooms{' '}
            {pg?.name && (
              <span className="text-[#6B7280] font-normal text-base sm:text-lg ml-1">
                / {pg.name}
              </span>
            )}
          </h1>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#1C6C41] hover:bg-[#155331] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <Plus size={16} />
          Add Room
        </button>
      </div>

      {rooms.length === 0 ? (
        <div className="flex flex-col overflow-hidden bg-white rounded-2xl border border-[#E8DFD2]">
          <img
            src="/illustrations/B3-empty-rooms_001.jpg"
            alt=""
            className="w-full h-64 sm:h-80 object-contain bg-[#F8F5F0]"
            loading="lazy"
          />
          <div className="py-8 text-center text-[#8B7355]">
            <p className="text-base font-medium">No rooms yet</p>
            <p className="text-sm mt-1">Click "Add Room" to create your first room.</p>
          </div>
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {rooms.map((room) => {
            const effectiveStatus = deriveRoomStatus(
              room.status,
              room.current_occupancy,
              room.capacity,
            );
            const status = ROOM_THEME[effectiveStatus];
            return (
              <motion.div
                key={room.id}
                variants={fadeUp}
                className="bg-white rounded-2xl border border-[#E8DFD2] shadow-[0_4px_16px_-8px_rgba(60,30,15,0.2)] overflow-hidden flex flex-col"
              >
                <div className={`px-5 py-3 ${status.banner} flex items-center justify-between`}>
                  <span className={`text-[10px] font-semibold tracking-[0.2em] uppercase ${status.text}`}>
                    {status.kicker}
                  </span>
                  {room.is_ac && (
                    <span className={`flex items-center gap-1 text-[11px] font-semibold ${status.text}`}>
                      <Wind size={12} />
                      AC
                    </span>
                  )}
                </div>

                <div className="px-5 py-4 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-[#2B1D14] leading-tight">
                        Room {room.room_number}
                      </h3>
                      <p className="text-xs text-[#6B5847] mt-0.5">
                        {SHARING_LABEL[room.room_sharing] || room.room_sharing}
                        {room.floor != null && ` · Floor ${room.floor}`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-[#8B7355] font-medium">
                        Rent
                      </p>
                      <p className="text-base font-bold text-[#1C6C41] font-mono leading-tight">
                        {formatCurrency(room.monthly_rent_per_head || 0)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 mt-3 text-sm text-[#6B5847]">
                    <Users size={14} className="text-[#A89580]" />
                    <span>
                      {room.current_occupancy ?? 0} / {room.capacity} occupied
                    </span>
                  </div>

                  {room.notes && (
                    <p className="mt-2 text-xs text-[#8B7355] line-clamp-2">{room.notes}</p>
                  )}

                  <div className="flex-1" />

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#F0E9DD]">
                    <button
                      onClick={() => openEdit(room)}
                      className="flex-1 h-9 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors bg-[#FAF7F2] hover:bg-[#F0E9DD] text-[#5C4632] border border-[#E8DFD2] cursor-pointer"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(room)}
                      disabled={deletingId === room.id}
                      className="h-9 px-3 rounded-lg text-sm font-semibold flex items-center justify-center transition-colors bg-white hover:bg-red-50 text-[#A89580] hover:text-red-600 border border-[#E8DFD2] cursor-pointer disabled:opacity-50"
                      aria-label="Delete room"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <RoomFormModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initial={editingRoom}
        saving={saving}
        availableAmenities={pg?.amenities || []}
      />
    </motion.div>
  );
}

export default PGRooms;
