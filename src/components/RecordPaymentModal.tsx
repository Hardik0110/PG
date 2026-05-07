import { useState, useMemo, useEffect } from 'react';
import { X, Receipt } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RecordPaymentModal({ open, onClose, onSubmit, pgs = [], tenants = [] }) {
  const [formData, setFormData] = useState({
    pg_id: '',
    tenant_id: '',
    amount: '',
    type: 'rent',
    method: 'upi',
    date: new Date().toISOString().split('T')[0],
    reference: '',
    description: '',
  });

  // Default to first PG when list arrives
  useEffect(() => {
    if (open && !formData.pg_id && pgs.length > 0) {
      setFormData(prev => ({ ...prev, pg_id: pgs[0].id }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pgs]);

  const tenantsForPg = useMemo(
    () => tenants.filter(t => !formData.pg_id || t.pg_id === formData.pg_id),
    [tenants, formData.pg_id]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      pg_id: formData.pg_id,
      tenant_id: formData.tenant_id || null,
      amount: formData.amount,
      type: formData.type,
      method: formData.method,
      date: formData.date,
      reference: formData.reference,
      description: formData.description,
    });
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
            className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden z-[60]"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-[#F9FAFB]">
              <h2 className="text-base sm:text-lg font-bold text-[#111827] flex items-center gap-2">
                <Receipt size={20} className="text-[#1C6C41]" />
                Record Payment
              </h2>
              <button onClick={onClose} className="p-1 text-[#9CA3AF] hover:text-[#374151] rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1">PG</label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C6C41]/20 focus:border-[#1C6C41] text-sm bg-white"
                    value={formData.pg_id}
                    onChange={(e) => setFormData({ ...formData, pg_id: e.target.value, tenant_id: '' })}
                  >
                    <option value="" disabled>Select PG</option>
                    {pgs.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1">Tenant (optional)</label>
                  <select
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C6C41]/20 focus:border-[#1C6C41] text-sm bg-white"
                    value={formData.tenant_id}
                    onChange={(e) => setFormData({ ...formData, tenant_id: e.target.value })}
                  >
                    <option value="">— None —</option>
                    {tenantsForPg.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.user?.full_name || 'Tenant'} {t.room_id ? '' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1">Payment Type</label>
                  <select
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C6C41]/20 focus:border-[#1C6C41] text-sm bg-white"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="rent">Rent</option>
                    <option value="deposit">Security Deposit</option>
                    <option value="utility">Utility Bill</option>
                    <option value="fine">Late Fine</option>
                    <option value="food">Food/Mess</option>
                    <option value="refund">Refund</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g., 12000"
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C6C41]/20 focus:border-[#1C6C41] text-sm"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1">Payment Method</label>
                  <select
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C6C41]/20 focus:border-[#1C6C41] text-sm bg-white"
                    value={formData.method}
                    onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                  >
                    <option value="upi">UPI</option>
                    <option value="cash">Cash</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="card">Card</option>
                    <option value="cheque">Cheque</option>
                  </select>
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
                <label className="block text-sm font-medium text-[#374151] mb-1">Reference No (Optional)</label>
                <input
                  type="text"
                  placeholder="Transaction ID / UTR"
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C6C41]/20 focus:border-[#1C6C41] text-sm"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., May 2026 rent"
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C6C41]/20 focus:border-[#1C6C41] text-sm"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
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
                  Save Payment
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
