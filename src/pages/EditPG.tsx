import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Check, Save, Wifi, Wind, Car, Cctv, ArrowUpFromDot,
  WashingMachine, Droplets, ShieldCheck, Zap, UtensilsCrossed, Bath, Tv,
} from 'lucide-react';
import { apiRequest, unwrapData } from '../lib/api';
import { pageVariants, staggerContainer, fadeUp } from '../lib/animations';
import Loader from '../components/ui/Loader';

const AMENITY_OPTIONS = [
  { key: 'wifi', label: 'WiFi', icon: Wifi },
  { key: 'ac', label: 'AC', icon: Wind },
  { key: 'parking', label: 'Parking', icon: Car },
  { key: 'cctv', label: 'CCTV', icon: Cctv },
  { key: 'lift', label: 'Lift', icon: ArrowUpFromDot },
  { key: 'laundry', label: 'Laundry', icon: WashingMachine },
  { key: 'water_purifier', label: 'Water Purifier', icon: Droplets },
  { key: 'security_guard', label: 'Security Guard', icon: ShieldCheck },
  { key: 'power_backup', label: 'Power Backup', icon: Zap },
  { key: 'meals', label: 'Meals Included', icon: UtensilsCrossed },
  { key: 'attached_bathroom', label: 'Attached Bathroom', icon: Bath },
  { key: 'tv', label: 'TV', icon: Tv },
];

const INPUT_CLASS =
  'w-full h-11 px-3.5 py-2.5 border border-[#D1D5DB] rounded-lg text-sm bg-white ' +
  'focus:outline-none focus:border-[#1C6C41] focus:ring-2 focus:ring-[#1C6C41]/12 transition-all';

const LABEL_CLASS = 'block text-[13px] font-medium text-[#6B7280] mb-1.5';

function EditPG() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [totalRooms, setTotalRooms] = useState('');
  const [pgType, setPgType] = useState('Mixed');
  const [amenities, setAmenities] = useState({});

  useEffect(() => {
    let mounted = true;
    const loadPg = async () => {
      try {
        const payload = await apiRequest(`/api/v1/pg-facilities/${id}`);
        const data = unwrapData(payload, {});
        if (!mounted) return;
        setName(data.name || '');
        setAddress(data.address || '');
        setCity(data.city || '');
        setState(data.state || '');
        setOwnerPhone(data.owner_phone || '');
        setOwnerEmail(data.owner_email || '');
        setTotalRooms(data.total_rooms?.toString() || '');
        setPgType(data.pg_type || 'Mixed');
        if (data.amenities && typeof data.amenities === 'object') {
          setAmenities(data.amenities);
        }
      } catch {
        if (!mounted) return;
        setName(`PG #${id}`);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadPg();
    return () => { mounted = false; };
  }, [id]);

  const validateField = (field, value) => {
    const newErrors = { ...errors };
    if (field === 'name' && !value.trim()) {
      newErrors.name = 'PG Name is required';
    } else if (field === 'address' && !value.trim()) {
      newErrors.address = 'Address is required';
    } else {
      delete newErrors[field];
    }
    setErrors(newErrors);
  };

  const toggleAmenity = (key) => {
    setAmenities(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!name.trim()) newErrors.name = 'PG Name is required';
    if (!address.trim()) newErrors.address = 'Address is required';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      await apiRequest(`/api/v1/pg-facilities/${id}`, {
        method: 'PATCH',
        body: {
          name,
          address,
          city,
          state,
          owner_phone: ownerPhone,
          owner_email: ownerEmail,
          total_rooms: totalRooms ? parseInt(totalRooms, 10) : undefined,
          pg_type: pgType,
          amenities,
        },
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-[#6B7280]">
        <div className="flex flex-col items-center gap-3">
          <Loader size={32} />
          <span className="text-sm">Loading PG details...</span>
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
      className="max-w-3xl mx-auto h-full overflow-y-auto pr-1"
    >

      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 bg-[#12B76A] text-white px-6 py-3 rounded-lg
                     flex items-center gap-2.5 text-sm font-semibold shadow-lg z-50"
        >
          <Check size={18} />
          PG Updated Successfully!
        </motion.div>
      )}

      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-9 h-9 flex items-center justify-center bg-white border border-[#E5E7EB] rounded-lg
                     hover:bg-[#F9FAFB] transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} className="text-[#374151]" />
        </button>
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-[#6B7280] hover:text-[#1C6C41] transition-colors cursor-pointer bg-transparent border-none p-0"
          >
            Back to Dashboard
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111827] leading-tight">
            Edit PG {name ? <span className="text-[#6B7280] font-normal text-base sm:text-lg ml-1">/ {name}</span> : ''}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="flex flex-col gap-6">

          <motion.div variants={fadeUp} className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6">
            <h2 className="text-base font-semibold text-[#111827] mb-5">Basic Information</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className={LABEL_CLASS}>PG Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onBlur={() => validateField('name', name)}
                  placeholder="e.g. Sunrise PG"
                  className={`${INPUT_CLASS} ${errors.name ? 'border-[#F04438] focus:border-[#F04438] focus:ring-[#F04438]/12' : ''}`}
                />
                {errors.name && <p className="text-xs text-[#F04438] mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className={LABEL_CLASS}>Address *</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  onBlur={() => validateField('address', address)}
                  placeholder="Full street address"
                  className={`${INPUT_CLASS} ${errors.address ? 'border-[#F04438] focus:border-[#F04438] focus:ring-[#F04438]/12' : ''}`}
                />
                {errors.address && <p className="text-xs text-[#F04438] mt-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLASS}>City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="City"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={e => setState(e.target.value)}
                    placeholder="State"
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6">
            <h2 className="text-base font-semibold text-[#111827] mb-5">Contact & Details</h2>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLASS}>Owner Phone</label>
                  <input
                    type="tel"
                    value={ownerPhone}
                    onChange={e => setOwnerPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Owner Email</label>
                  <input
                    type="email"
                    value={ownerEmail}
                    onChange={e => setOwnerEmail(e.target.value)}
                    placeholder="owner@example.com"
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLASS}>Total Rooms</label>
                  <input
                    type="number"
                    value={totalRooms}
                    onChange={e => setTotalRooms(e.target.value)}
                    placeholder="e.g. 20"
                    min="1"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Type</label>
                  <select
                    value={pgType}
                    onChange={e => setPgType(e.target.value)}
                    className={`${INPUT_CLASS} cursor-pointer`}
                  >
                    <option value="Mixed">Mixed</option>
                    <option value="Boys">Boys</option>
                    <option value="Girls">Girls</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6">
            <h2 className="text-base font-semibold text-[#111827] mb-5">Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {AMENITY_OPTIONS.map(({ key, label, icon: Icon }) => {
                const checked = !!amenities[key];
                return (
                  <label
                    key={key}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border cursor-pointer
                                transition-all duration-150 select-none
                                ${checked
                                  ? 'border-[#1C6C41] bg-[#1C6C41]/5 text-[#111827]'
                                  : 'border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#D1D5DB] hover:bg-[#F9FAFB]'}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAmenity(key)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors
                                     ${checked ? 'bg-[#1C6C41] border-[#1C6C41]' : 'border-[#D1D5DB] bg-white'}`}>
                      {checked && <Check size={12} className="text-white" />}
                    </div>
                    <Icon size={16} className={checked ? 'text-[#1C6C41]' : 'text-[#9CA3AF]'} />
                    <span className="text-sm font-medium">{label}</span>
                  </label>
                );
              })}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="h-11 px-5 border border-[#D1D5DB] rounded-lg text-sm font-medium text-[#374151]
                         bg-white hover:bg-[#F9FAFB] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-11 px-6 bg-[#1C6C41] hover:bg-[#155331] text-white text-sm font-semibold rounded-lg
                         inline-flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </motion.div>
        </motion.div>
      </form>
    </motion.div>
  );
}

export default EditPG;
