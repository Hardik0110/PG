import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Home, Plus, Eye, CalendarCheck } from 'lucide-react';
import { apiRequest, unwrapData } from '../lib/api';
import Badge from '../components/ui/Badge';
import {
  pageVariants,
  staggerContainer,
  fadeUp,
  cardHover,
} from '../lib/animations';

function RoomCard({ room, formatCurrency }) {
  const isVacant = room.status === 'vacant';
  const borderColor = isVacant ? 'border-t-[#12B76A]' : 'border-t-[#F04438]';
  const maxAmenities = 3;

  return (
    <motion.div
      variants={fadeUp}
      initial="rest"
      whileHover="hover"
      className={`bg-white rounded-xl border border-[#E8E9ED] shadow-sm border-t-2 ${borderColor} flex flex-col`}
    >
      <motion.div variants={cardHover} className="flex flex-col flex-1 p-6">
        {/* Room number + PG name */}
        <div className="mb-1">
          <h3 className="font-semibold text-lg text-[#1F2937]">
            Room {room.roomNumber}
          </h3>
          <p className="text-sm text-[#6B7280]">{room.pgName}</p>
        </div>

        {/* Type + Floor */}
        <p className="text-sm text-[#9CA3AF] capitalize">
          {room.type} &middot; Floor {room.floor}
        </p>

        {/* Rent */}
        <p className="font-mono font-bold text-lg text-[#1C6C41] mt-2">
          {formatCurrency(room.rent)}/mo
        </p>

        {/* Divider */}
        <div className="border-t border-[#E8E9ED] my-3" />

        {/* Status badge */}
        <div className="mb-3">
          <Badge
            variant={isVacant ? 'success' : 'danger'}
            dot
          >
            {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
          </Badge>
        </div>

        {/* Amenities */}
        {room.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {room.amenities.slice(0, maxAmenities).map((a) => (
              <span
                key={a}
                className="px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[11px] font-medium text-[#6B7280]"
              >
                {a}
              </span>
            ))}
            {room.amenities.length > maxAmenities && (
              <span className="px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[11px] font-medium text-[#9CA3AF]">
                +{room.amenities.length - maxAmenities} more
              </span>
            )}
          </div>
        )}

        {/* Spacer to push button to bottom */}
        <div className="flex-1" />

        {/* Action button */}
        {isVacant ? (
          <button className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#1C6C41] hover:bg-[#155331] text-white text-sm font-semibold transition-colors cursor-pointer">
            <CalendarCheck size={15} />
            Book
          </button>
        ) : (
          <button className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-[#E8E9ED] bg-white hover:bg-[#F9FAFB] text-[#374151] text-sm font-semibold transition-colors cursor-pointer">
            <Eye size={15} />
            View
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}

function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [filterPg, setFilterPg] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadRooms = async () => {
      try {
        const payload = await apiRequest('/api/v1/rooms/');
        const data = unwrapData(payload, []);
        if (mounted && Array.isArray(data)) {
          setRooms(
            data.map((r) => ({
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
      } catch {
        if (mounted) setRooms([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadRooms();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredRooms = useMemo(
    () =>
      rooms.filter((r) => {
        if (filterPg !== 'all' && r.pgId !== filterPg) return false;
        if (filterStatus !== 'all' && r.status !== filterStatus) return false;
        return true;
      }),
    [rooms, filterPg, filterStatus],
  );

  /** Group rooms by PG when no PG filter is active */
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
      className="h-full flex flex-col"
    >
      {/* ── Top toolbar ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        {/* Left: title + count */}
        <div className="flex items-center gap-2">
          <Home size={22} className="text-[#1C6C41] shrink-0" />
          <h1 className="text-2xl font-bold text-[#1F2937]">Rooms</h1>
          <span className="text-sm text-[#9CA3AF] ml-1">
            ({filteredRooms.length} total)
          </span>
        </div>

        {/* Right: filters + add button */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filterPg}
            onChange={(e) => setFilterPg(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#E8E9ED] bg-white text-sm text-[#374151] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1C6C41]/30"
          >
            <option value="all">All PG</option>
            {pgOptions.map((pg) => (
              <option key={pg.id} value={pg.id}>
                {pg.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#E8E9ED] bg-white text-sm text-[#374151] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1C6C41]/30"
          >
            <option value="all">All Status</option>
            <option value="occupied">Occupied</option>
            <option value="vacant">Vacant</option>
          </select>

          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1C6C41] hover:bg-[#155331] text-white text-sm font-semibold transition-colors cursor-pointer">
            <Plus size={16} />
            Add Room
          </button>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────── */}
      {filteredRooms.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-[#9CA3AF] text-sm">
          No rooms found matching the selected filters.
        </div>
      ) : groupedRooms ? (
        /* Grouped by PG */
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
                  />
                ))}
              </motion.div>
            </section>
          ))}
        </div>
      ) : (
        /* Flat grid (PG filter active) */
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
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

export default Rooms;
