import { motion } from 'framer-motion';
import { Building, Plus, MapPin, Users, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { pageVariants, staggerContainer, fadeUp } from '../lib/animations';

function MyPGs() {
  const navigate = useNavigate();
  const pgs = [
    { id: 'pg-001', name: 'Sunrise PG', location: 'Koramangala, Bangalore', tenants: 45, rooms: 20 },
    { id: 'pg-002', name: 'Cozy Living PG', location: 'HSR Layout, Bangalore', tenants: 28, rooms: 15 },
  ];

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Building size={24} className="text-[#1C6C41]" />
          <h1 className="text-2xl font-bold text-[#1F2937]">My PGs</h1>
        </div>
        <button
          onClick={() => navigate('/pg/add')}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#1C6C41] hover:bg-[#155331] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
        >
          <Plus size={16} />
          Add New PG
        </button>
      </div>

      <motion.div 
        variants={staggerContainer}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {pgs.map((pg) => (
          <motion.div
            key={pg.id}
            variants={fadeUp}
            className="bg-white rounded-xl border border-[#E8E9ED] shadow-sm p-5 flex flex-col hover:border-[#1C6C41] transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#1F2937]">{pg.name}</h3>
                <div className="flex items-center gap-1 text-[#6B7280] text-sm mt-1">
                  <MapPin size={14} />
                  <span>{pg.location}</span>
                </div>
              </div>
              <button className="text-[#9CA3AF] hover:text-[#1C6C41] transition-colors cursor-pointer">
                <Settings size={18} />
              </button>
            </div>

            <div className="flex gap-4 mt-auto pt-4 border-t border-[#E8E9ED]">
              <div className="flex flex-col">
                <span className="text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider">Tenants</span>
                <span className="text-[#1F2937] font-bold mt-0.5 flex items-center gap-1">
                  <Users size={14} className="text-[#1C6C41]" />
                  {pg.tenants}
                </span>
              </div>
              <div className="flex flex-col border-l border-[#E8E9ED] pl-4">
                <span className="text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider">Rooms</span>
                <span className="text-[#1F2937] font-bold mt-0.5 flex items-center gap-1">
                  <Building size={14} className="text-[#1C6C41]" />
                  {pg.rooms}
                </span>
              </div>
            </div>
            
            <button className="w-full mt-5 py-2 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#374151] text-sm font-semibold transition-colors cursor-pointer">
              Manage Properties
            </button>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

export default MyPGs;
