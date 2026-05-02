import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Home, Plus, Eye, CalendarCheck, Users } from 'lucide-react';
import { apiRequest, unwrapData } from '../lib/api';
import {
  pageVariants,
  staggerContainer,
  fadeUp,
  cardHover,
} from '../lib/animations';
import BookRoomModal from '../components/BookRoomModal';
import RoomDetailsModal from '../components/RoomDetailsModal';
import Select from '../components/ui/Select';

function RoomCard({ room, formatCurrency, onBook, onView, tenantCount }) {
  const isVacant = room.status === 'vacant';
  const maxAmenities = 3;
  const baseCapacity = room.type === 'single' ? 1 : room.type === 'double' ? 2 : 3;
  const capacity = Math.max(baseCapacity, tenantCount);

  const bannerColor = isVacant ? 'bg-[#DCEEDF]' : 'bg-[#FBDED8]';
  const accentText = isVacant ? 'text-[#1C6C41]' : 'text-[#B91C1C]';
  const badgeRing = isVacant ? 'ring-[#1C6C41]/30' : 'ring-[#B91C1C]/30';
  const badgeText = accentText;

  return (
    <motion.div
      variants={fadeUp}
      initial="rest"
      whileHover="hover"
      className="relative overflow-hidden rounded-2xl bg-white shadow-[0_8px_24px_-12px_rgba(60,30,15,0.25)] border border-[#E8DFD2] flex flex-col"
    >
      <motion.div variants={cardHover} className="flex flex-col flex-1">

        <div className={`relative h-20 ${bannerColor} px-5 py-3`}>
          <div className={`relative opacity-75 ${accentText}`}>
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase">
              {isVacant ? 'Available' : 'Fully Booked'}
            </span>
          </div>
          <h2 className={`relative mt-1 text-xl font-black tracking-wide ${accentText}`}>
            {isVacant ? 'VACANT' : 'ROOM FULL'}
          </h2>

          <div
            className={`absolute top-1/2 -translate-y-1/2 right-5 h-14 w-14 rounded-full bg-white ring-4 ${badgeRing} shadow-md flex flex-col items-center justify-center`}
          >
            <Users className={`h-3.5 w-3.5 ${badgeText}`} strokeWidth={2.5} />
            <span className={`text-sm font-bold leading-none mt-0.5 ${badgeText}`}>
              {tenantCount}/{capacity}
            </span>
          </div>
        </div>

        <div className="px-5 py-5 flex flex-col flex-1">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <span className="text-xl font-bold text-[#2B1D14] leading-tight">
                Room {room.roomNumber}
              </span>
              <p className="mt-1 text-sm text-[#6B5847] leading-tight capitalize">
                {room.type} · Floor {room.floor}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#8B7355] font-medium">
                Monthly
              </p>
              <p className="mt-1 text-lg font-bold text-[#1C6C41] font-mono leading-tight">
                {formatCurrency(room.rent)}
              </p>
            </div>
          </div>

          {room.amenities.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {room.amenities.slice(0, maxAmenities).map((a) => (
                <span
                  key={a}
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#EFE7DA] text-[#5C4632] border border-[#E0D3BD]"
                >
                  {a}
                </span>
              ))}
              {room.amenities.length > maxAmenities && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#EFE7DA] text-[#8B7355] border border-[#E0D3BD]">
                  +{room.amenities.length - maxAmenities} more
                </span>
              )}
            </div>
          )}

          <div className="flex-1" />

          {isVacant ? (
            <button
              onClick={() => onBook(room)}
              className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all bg-[#1C6C41] hover:bg-[#155232] text-[#F8F5F0] cursor-pointer"
            >
              <CalendarCheck className="h-4 w-4" />
              Book This Room
            </button>
          ) : (
            <button
              onClick={() => onView(room)}
              className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all bg-transparent hover:bg-[#EFE7DA] text-[#5C4632] border border-[#E0D3BD] cursor-pointer"
            >
              <Eye className="h-4 w-4" />
              View Room Details
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [filterPg, setFilterPg] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedRoomToBook, setSelectedRoomToBook] = useState(null);
  const [selectedRoomToView, setSelectedRoomToView] = useState(null);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const [roomsPayload, tenantsPayload] = await Promise.all([
          apiRequest('/api/v1/rooms/'),
          apiRequest('/api/v1/tenants/'),
        ]);
        const roomsData = unwrapData(roomsPayload, []);
        const tenantsData = unwrapData(tenantsPayload, []);

        if (mounted && Array.isArray(roomsData)) {
          setRooms(
            roomsData.map((r) => ({
              id: r.id,
              pgId: r.pg_id,
              pgName:
                r.pg_id === 'pg-001' ? 'Sunrise PG' : 'Cozy Living PG',
              roomNumber: r.room_number || 'N/A',
              floor: r.floor || 1,
              type: r.type || 'single',
              rent: r.rent || 0,
              status: r.status || 'vacant',
              amenities: r.amenities || [],
            })),
          );
        }
        if (mounted && Array.isArray(tenantsData)) {
          setTenants(tenantsData);
        }
      } catch {
        if (mounted) {
          setRooms([]);
          setTenants([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const tenantsForSelectedRoom = useMemo(() => {
    if (!selectedRoomToView) return [];
    return tenants.filter(
      (t) =>
        t.pg_id === selectedRoomToView.pgId &&
        String(t.room_number) === String(selectedRoomToView.roomNumber),
    );
  }, [tenants, selectedRoomToView]);

  const tenantCountByRoom = useMemo(() => {
    const map = new Map();
    tenants.forEach((t) => {
      const key = `${t.pg_id}:${t.room_number}`;
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [tenants]);

  const getTenantCount = (room) =>
    tenantCountByRoom.get(`${room.pgId}:${room.roomNumber}`) || 0;

  const filteredRooms = useMemo(
    () =>
      rooms.filter((r) => {
        if (filterPg !== 'all' && r.pgId !== filterPg) return false;
        if (filterStatus !== 'all' && r.status !== filterStatus) return false;
        return true;
      }),
    [rooms, filterPg, filterStatus],
  );

  const groupedRooms = useMemo(() => {
    if (filterPg !== 'all') return null;

    const groups = {};
    filteredRooms.forEach((r) => {
      if (!groups[r.pgId]) {
        groups[r.pgId] = { pgName: r.pgName, rooms: [] };
      }
      groups[r.pgId].rooms.push(r);
    });
    return Object.values(groups);
  }, [filteredRooms, filterPg]);

  const formatCurrency = (amt) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amt);

  const pgOptions = useMemo(() => {
    const unique = [...new Set(rooms.map((r) => r.pgId))];
    return unique.map((id) => ({
      id,
      name: rooms.find((r) => r.pgId === id)?.pgName || id,
    }));
  }, [rooms]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-[#6B7280]">
        Loading rooms...
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="h-full flex flex-col overflow-y-auto pr-1"
    >

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">

        <div className="flex items-center gap-2">
          <Home size={22} className="text-[#1C6C41] shrink-0" />
          <h1 className="text-xl sm:text-2xl font-bold text-[#1F2937]">Rooms</h1>
          <span className="text-sm text-[#9CA3AF] ml-1">
            ({filteredRooms.length} total)
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={filterPg}
            onChange={setFilterPg}
            options={[
              { value: 'all', label: 'All PG' },
              ...pgOptions.map((pg) => ({ value: pg.id, label: pg.name })),
            ]}
          />

          <Select
            value={filterStatus}
            onChange={setFilterStatus}
            minWidth={150}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'occupied', label: 'Occupied' },
              { value: 'vacant', label: 'Vacant' },
            ]}
          />

          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1C6C41] hover:bg-[#155331] text-white text-sm font-semibold transition-colors cursor-pointer">
            <Plus size={16} />
            Add Room
          </button>
        </div>
      </div>

      {filteredRooms.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-[#9CA3AF] text-sm">
          No rooms found matching the selected filters.
        </div>
      ) : groupedRooms ? (

        <div className="flex flex-col gap-8">
          {groupedRooms.map((group) => (
            <section key={group.pgName}>
              <h2 className="text-base font-semibold text-[#374151] mb-3">
                {group.pgName}{' '}
                <span className="font-normal text-sm text-[#9CA3AF]">
                  ({group.rooms.length}{' '}
                  {group.rooms.length === 1 ? 'room' : 'rooms'})
                </span>
              </h2>

              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {group.rooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    formatCurrency={formatCurrency}
                    onBook={setSelectedRoomToBook}
                    onView={setSelectedRoomToView}
                    tenantCount={getTenantCount(room)}
                  />
                ))}
              </motion.div>
            </section>
          ))}
        </div>
      ) : (

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              formatCurrency={formatCurrency}
              onBook={setSelectedRoomToBook}
              onView={setSelectedRoomToView}
              tenantCount={getTenantCount(room)}
            />
          ))}
        </motion.div>
      )}

      <BookRoomModal
        open={!!selectedRoomToBook}
        onClose={() => setSelectedRoomToBook(null)}
        roomLabel={selectedRoomToBook ? `${selectedRoomToBook.roomNumber} (${selectedRoomToBook.pgName})` : ''}
        onSubmit={(data) => {
          if (!selectedRoomToBook) return;

          setRooms((prev) =>
            prev.map(r => r.id === selectedRoomToBook.id ? { ...r, status: 'occupied' } : r)
          );
        }}
      />

      <RoomDetailsModal
        open={!!selectedRoomToView}
        onClose={() => setSelectedRoomToView(null)}
        room={selectedRoomToView}
        tenants={tenantsForSelectedRoom}
      />
    </motion.div>
  );
}

export default Rooms;
