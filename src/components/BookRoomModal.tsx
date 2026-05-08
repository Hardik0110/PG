import { useState } from 'react';
import { X, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BookRoomModal({ open, onClose, roomLabel, onSubmit }) {
  const [formData, setFormData] = useState({
    tenantType: 'existing',
    tenantName: '',
    bedSelect: 'A',
    rentAmount: '8000',
    depositAmount: '16000',
    moveInDate: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden z-10"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-[#F9FAFB]">
              <h2 className="text-base sm:text-lg font-bold text-[#111827] flex items-center gap-2">
                <Key size={20} className="text-[#1C6C41]" />
                Book Room {roomLabel}
              </h2>
              <button onClick={onClose} className="p-1 text-[#9CA3AF] hover:text-[#374151] rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Tenant Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tenantType"
                      value="existing"
                      checked={formData.tenantType === 'existing'}
                      onChange={(e) => setFormData({ ...formData, tenantType: e.target.value })}
                      className="text-[#1C6C41] focus:ring-[#1C6C41]"
                    />
                    <span className="text-sm text-[#374151]">Existing Profile</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tenantType"
                      value="new"
                      checked={formData.tenantType === 'new'}
                      onChange={(e) => setFormData({ ...formData, tenantType: e.target.value })}
                      className="text-[#1C6C41] focus:ring-[#1C6C41]"
                    />
                    <span className="text-sm text-[#374151]">New Tenant</span>
                  </label>
                </div>
              </div>

              {formData.tenantType === 'existing' ? (
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1">Search Tenant</label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C6C41]/20 focus:border-[#1C6C41] text-sm bg-white"
                    value={formData.tenantName}
                    onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                  >
                    <option value="" disabled>Select from Unassigned Tenants</option>
                    <option value="Rohan Das">Rohan Das</option>
                    <option value="Kabir Singh">Kabir Singh</option>
                    <option value="Sanjay Gupta">Sanjay Gupta</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Rohan Das"
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C6C41]/20 focus:border-[#1C6C41] text-sm"
                    value={formData.tenantName}
                    onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1">Select Bed</label>
                  <select
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C6C41]/20 focus:border-[#1C6C41] text-sm bg-white"
                    value={formData.bedSelect}
                    onChange={(e) => setFormData({ ...formData, bedSelect: e.target.value })}
                  >
                    <option value="A">Bed A</option>
                    <option value="B">Bed B</option>
                    <option value="C">Bed C</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1">Move-in Date</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C6C41]/20 focus:border-[#1C6C41] text-sm"
                    value={formData.moveInDate}
                    onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1">Monthly Rent (₹)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    step="0.01"
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C6C41]/20 focus:border-[#1C6C41] text-sm"
                    value={formData.rentAmount}
                    onChange={(e) => setFormData({ ...formData, rentAmount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1">Security Deposit (₹)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    step="0.01"
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C6C41]/20 focus:border-[#1C6C41] text-sm"
                    value={formData.depositAmount}
                    onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-[#374151] bg-white border border-[#D1D5DB] rounded-lg hover:bg-[#F9FAFB]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#1C6C41] rounded-lg hover:bg-[#155331]"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
