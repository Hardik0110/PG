import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building, Plus, MapPin, Users, Settings, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { pageVariants, staggerContainer, fadeUp, cardHover } from '../lib/animations';
import { apiRequest } from '../lib/api';
import Loader from '../components/ui/Loader';

const TYPE_THEME = {
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

function PGCard({ pg, onManage }) {
  const theme = TYPE_THEME[pg.type] || TYPE_THEME.gents;

  return (
    <motion.div
      variants={fadeUp}
      initial="rest"
      whileHover="hover"
      className="relative overflow-hidden rounded-2xl bg-white shadow-[0_8px_24px_-12px_rgba(60,30,15,0.25)] border border-[#E8DFD2] flex flex-col"
    >
      <motion.div variants={cardHover} className="flex flex-col flex-1">

        <div className={`relative h-20 ${theme.banner} px-5 py-3`}>
          <div className={`relative opacity-75 ${theme.accent}`}>
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase">
              {theme.label}
            </span>
          </div>
          <h2
            className={`relative mt-1 text-xl font-black tracking-wide ${theme.accent} truncate pr-20`}
          >
            {pg.name}
          </h2>

          <div
            className={`absolute top-1/2 -translate-y-1/2 right-5 h-14 w-14 rounded-full bg-white ring-4 ${theme.ring} shadow-md flex flex-col items-center justify-center`}
          >
            <Users className={`h-3.5 w-3.5 ${theme.accent}`} strokeWidth={2.5} />
            <span className={`text-sm font-bold leading-none mt-0.5 ${theme.accent}`}>
              {pg.tenants}
            </span>
          </div>
        </div>

        <div className="px-5 py-5 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-1.5 text-sm text-[#6B5847] min-w-0">
              <MapPin size={14} className="text-[#A89580] shrink-0" />
              <span className="truncate">{pg.location}</span>
            </div>
            <button
              className="text-[#A89580] hover:text-[#1C6C41] transition-colors cursor-pointer shrink-0"
              aria-label="PG settings"
            >
              <Settings size={18} />
            </button>
          </div>

          <div className="flex gap-3 mt-4">
            <div className="flex-1 rounded-xl bg-[#FAF7F2] border border-[#E8DFD2] px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#8B7355] font-medium">
                Tenants
              </p>
              <p className="mt-0.5 text-lg font-bold text-[#2B1D14] flex items-center gap-1.5 leading-tight">
                <Users size={16} className="text-[#1C6C41]" />
                {pg.tenants}
              </p>
            </div>
            <div className="flex-1 rounded-xl bg-[#FAF7F2] border border-[#E8DFD2] px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#8B7355] font-medium">
                Rooms
              </p>
              <p className="mt-0.5 text-lg font-bold text-[#2B1D14] flex items-center gap-1.5 leading-tight">
                <Building size={16} className="text-[#1C6C41]" />
                {pg.rooms}
              </p>
            </div>
          </div>

          <div className="flex-1" />

          <button
            onClick={() => onManage(pg)}
            className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all bg-[#1C6C41] hover:bg-[#155232] text-[#F8F5F0] cursor-pointer"
          >
            Manage Properties
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MyPGs() {
  const navigate = useNavigate();
  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [pgList, tenantList, roomList] = await Promise.all([
          apiRequest('/api/v1/pg-facilities/'),
          apiRequest('/api/v1/tenants/'),
          apiRequest('/api/v1/rooms/'),
        ]);
        const tenants = Array.isArray(tenantList) ? tenantList : [];
        const rooms = Array.isArray(roomList) ? roomList : [];
        const pgArr = (Array.isArray(pgList) ? pgList : []).map(pg => ({
          id: pg.id,
          name: pg.name,
          location: [pg.address, pg.city].filter(Boolean).join(', '),
          tenants: tenants.filter(t => t.pg_id === pg.id).length,
          rooms: rooms.filter(r => r.pg_id === pg.id).length,
          type: pg.type,
        }));
        if (mounted) setPgs(pgArr);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="h-full flex flex-col overflow-y-auto pr-1"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Building size={24} className="text-[#1C6C41]" />
          <h1 className="text-xl sm:text-2xl font-bold text-[#1F2937]">My PGs</h1>
        </div>
        <button
          onClick={() => navigate('/pg/add')}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#1C6C41] hover:bg-[#155331] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
        >
          <Plus size={16} />
          Add New PG
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[50vh] text-[#6B7280]">
          <Loader size={32} />
        </div>
      ) : pgs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-[#8B7355]">
          <Building size={32} className="text-[#A89580] mb-2" />
          <p className="text-base font-medium">No PGs yet</p>
          <p className="text-sm mt-1">Click “Add New PG” to create your first property.</p>
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {pgs.map((pg) => (
            <PGCard
              key={pg.id}
              pg={pg}
              onManage={() => navigate(`/pg/edit/${pg.id}`)}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

export default MyPGs;
