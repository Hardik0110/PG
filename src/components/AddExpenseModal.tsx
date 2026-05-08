import { useState } from 'react';
import { X, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Select from './ui/Select';

const CATEGORIES = [
  { value: 'electricity', label: 'Electricity' },
  { value: 'water', label: 'Water' },
  { value: 'internet', label: 'Internet / WiFi' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'staff', label: 'Staff Salary' },
  { value: 'supplies', label: 'Supplies' },
  { value: 'repair', label: 'Repair' },
  { value: 'other', label: 'Other' },
];

type ExpenseFormState = {
  category: string;
  amount: string;
  pg: string;
  method: string;
  date: string;
  vendor: string;
  description: string;
  _init?: boolean;
};

export default function AddExpenseModal({ open, onClose, onSubmit, pgs = [] }) {
  const [formData, setFormData] = useState<ExpenseFormState>({
    category: 'electricity',
    amount: '',
    pg: '',
    method: 'upi',
    date: new Date().toISOString().split('T')[0],
    vendor: '',
    description: '',
  });

  // Default to first PG when list arrives
  if (open && !formData.pg && pgs.length > 0 && !formData._init) {
    // mutate-on-render guard via flag (form state is local; safe enough)
    setTimeout(() => setFormData(prev => prev.pg ? prev : { ...prev, pg: pgs[0].id, _init: true }), 0);
  }

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
            className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl z-[60]"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-[#FCF1DC] rounded-t-xl">
              <h2 className="text-base sm:text-lg font-bold text-[#7A3D33] flex items-center gap-2">
                <TrendingDown size={20} className="text-[#B45309]" />
                Add Expense
              </h2>
              <button
                onClick={onClose}
                className="p-1 text-[#A89580] hover:text-[#5C4632] rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Category</label>
                <Select
                  value={formData.category}
                  onChange={(v) => setFormData({ ...formData, category: v })}
                  options={CATEGORIES}
                  className="w-full"
                  minWidth={0}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1">PG / Property</label>
                  <Select
                    value={formData.pg}
                    onChange={(v) => setFormData({ ...formData, pg: v })}
                    options={pgs.map(p => ({ value: p.id, label: p.name }))}
                    className="w-full"
                    minWidth={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g., 5000"
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C6C41]/20 focus:border-[#1C6C41] text-sm"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1">Payment Method</label>
                  <Select
                    value={formData.method}
                    onChange={(v) => setFormData({ ...formData, method: v })}
                    options={[
                      { value: 'upi', label: 'UPI' },
                      { value: 'cash', label: 'Cash' },
                      { value: 'bank', label: 'Bank Transfer' },
                      { value: 'card', label: 'Card' },
                    ]}
                    className="w-full"
                    minWidth={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1">Date</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C6C41]/20 focus:border-[#1C6C41] text-sm"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">
                  Vendor / Paid To <span className="text-[#9CA3AF] font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  maxLength={100}
                  placeholder="e.g., BESCOM, Airtel, Ravi (cleaner)"
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C6C41]/20 focus:border-[#1C6C41] text-sm"
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">
                  Description <span className="text-[#9CA3AF] font-normal">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  maxLength={500}
                  placeholder="Brief note about this expense"
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C6C41]/20 focus:border-[#1C6C41] text-sm resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-[#5C4632] bg-white border border-[#E0D3BD] rounded-lg hover:bg-[#FAF7F2] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#B45309] rounded-lg hover:bg-[#92400E] cursor-pointer"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
