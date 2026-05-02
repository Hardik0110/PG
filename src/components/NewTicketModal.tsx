import { useState } from 'react';
import { X, Wrench, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NewTicketModal({ open, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    subject: '',
    category: 'plumbing',
    room: '',
    priority: 'medium',
    description: ''
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
                <Wrench size={20} className="text-[#1C6C41]" />
                New Maintenance Ticket
              </h2>
              <button onClick={onClose} className="p-1 text-[#9CA3AF] hover:text-[#374151] rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Broken tap in bathroom"
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C6C41]/20 focus:border-[#1C6C41] text-sm"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1">Category</label>
                  <select
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C6C41]/20 focus:border-[#1C6C41] text-sm bg-white"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="internet">Internet/WiFi</option>
                    <option value="carpenter">Carpenter</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1">Priority</label>
                  <select
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C6C41]/20 focus:border-[#1C6C41] text-sm bg-white"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Room / Area</label>
                <select
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C6C41]/20 focus:border-[#1C6C41] text-sm bg-white"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  required
                >
                  <option value="" disabled>Select Room</option>
                  <option value="101">Room 101</option>
                  <option value="102">Room 102</option>
                  <option value="common">Common Area</option>
                  <option value="kitchen">Kitchen</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the issue in detail..."
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C6C41]/20 focus:border-[#1C6C41] text-sm resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Attachment</label>
                <button type="button" className="w-full flex items-center justify-center gap-2 py-8 border-2 border-dashed border-[#E5E7EB] rounded-lg hover:border-[#1C6C41]/50 hover:bg-[#F9FAFB] transition-colors text-sm text-[#6B7280]">
                  <ImageIcon size={20} />
                  Click to upload photo
                </button>
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
                  Create Ticket
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
