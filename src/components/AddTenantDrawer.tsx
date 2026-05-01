import { useState } from 'react';
import { X, UserPlus, UploadCloud, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AddTenantDrawer({ open, onClose, onSubmit }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    bloodGroup: '',
    aadharNo: '',
    panNo: '',
    guardianName: '',
    guardianPhone: '',
    relation: '',
    workplace: '',
  });

  if (!open) return null;

  const handleNext = () => setStep((s) => Math.min(4, s + 1));
  const handlePrev = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step < 4) {
      handleNext();
      return;
    }
    onSubmit(formData);
    onClose();
    setTimeout(() => setStep(1), 300); // Reset after close
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1">Profile Photo</label>
              <button type="button" className="w-full flex flex-col items-center justify-center gap-2 py-6 border-2 border-dashed border-[#E5E7EB] rounded-lg hover:border-[#1C6C41]/50 hover:bg-[#F9FAFB] transition-colors text-sm text-[#6B7280]">
                <UploadCloud size={24} className="text-[#9CA3AF]" />
                Click to upload
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">First Name</label>
                <input required type="text" className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C6C41]/20 focus:border-[#1C6C41] text-sm" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Last Name</label>
                <input required type="text" className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C6C41]/20 focus:border-[#1C6C41] text-sm" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1">Phone Number</label>
              <input required type="tel" className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C6C41]/20 focus:border-[#1C6C41] text-sm" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Email</label>
                <input type="email" className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C6C41]/20 focus:border-[#1C6C41] text-sm" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Blood Group</label>
                <select className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C6C41]/20 focus:border-[#1C6C41] text-sm bg-white" value={formData.bloodGroup} onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}>
                  <option value="">Select</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1">Aadhar Number</label>
              <input required type="text" placeholder="12-digit Aadhar" className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C6C41]/20 focus:border-[#1C6C41] text-sm" value={formData.aadharNo} onChange={(e) => setFormData({ ...formData, aadharNo: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1">PAN Number</label>
              <input type="text" placeholder="10-digit PAN (Optional)" className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C6C41]/20 focus:border-[#1C6C41] text-sm uppercase" value={formData.panNo} onChange={(e) => setFormData({ ...formData, panNo: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1">Upload ID Proof (Front & Back)</label>
              <button type="button" className="w-full flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed border-[#E5E7EB] rounded-lg hover:border-[#1C6C41]/50 hover:bg-[#F9FAFB] transition-colors text-sm text-[#6B7280]">
                <UploadCloud size={24} className="text-[#9CA3AF]" />
                Select PDF or Image
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1">Guardian Name</label>
              <input required type="text" className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C6C41]/20 focus:border-[#1C6C41] text-sm" value={formData.guardianName} onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Relation</label>
                <select className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C6C41]/20 focus:border-[#1C6C41] text-sm bg-white" value={formData.relation} onChange={(e) => setFormData({ ...formData, relation: e.target.value })}>
                  <option value="father">Father</option>
                  <option value="mother">Mother</option>
                  <option value="spouse">Spouse</option>
                  <option value="sibling">Sibling</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Guardian Phone</label>
                <input required type="tel" className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C6C41]/20 focus:border-[#1C6C41] text-sm" value={formData.guardianPhone} onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })} />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1">College / Company Name</label>
              <input required type="text" placeholder="e.g., Christ University or TCS" className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C6C41]/20 focus:border-[#1C6C41] text-sm" value={formData.workplace} onChange={(e) => setFormData({ ...formData, workplace: e.target.value })} />
            </div>
            
            <div className="p-4 bg-[#ECFDF3] border border-[#A8E6C3] rounded-lg mt-4">
              <h4 className="text-sm font-semibold text-[#1C6C41] mb-2">Ready to submit!</h4>
              <p className="text-xs text-[#064E3B]">The tenant profile will be created. You can book a room for them from the Rooms page next.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
          className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col z-10"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-white shrink-0">
            <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
              <UserPlus size={20} className="text-[#1C6C41]" />
              Add Tenant Profile
            </h2>
            <button onClick={onClose} className="p-1 text-[#9CA3AF] hover:text-[#374151] rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Stepper */}
          <div className="px-6 py-4 border-b border-[#E5E7EB] bg-[#F9FAFB] shrink-0">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step === i ? 'bg-[#1C6C41] text-white ring-4 ring-[#1C6C41]/20' :
                    step > i ? 'bg-[#1C6C41] text-white' : 'bg-white border-2 border-[#E5E7EB] text-[#9CA3AF]'
                  }`}>
                    {i}
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold mt-2 text-[#6B7280]">
                    {i === 1 ? 'Personal' : i === 2 ? 'KYC' : i === 3 ? 'Guardian' : 'Work'}
                  </span>
                </div>
              ))}
              {/* Lines */}
              <div className="absolute left-10 right-10 top-8 h-[2px] bg-[#E5E7EB] -z-10" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6">
              {renderStep()}
            </div>

            <div className="px-6 py-4 border-t border-[#E5E7EB] bg-white flex justify-between shrink-0">
              <button
                type="button"
                onClick={step === 1 ? onClose : handlePrev}
                className="px-4 py-2 text-sm font-medium text-[#374151] bg-white border border-[#D1D5DB] rounded-lg hover:bg-[#F9FAFB] flex items-center gap-2"
              >
                {step === 1 ? 'Cancel' : <><ChevronLeft size={16}/> Back</>}
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-[#1C6C41] rounded-lg hover:bg-[#155331] flex items-center gap-2"
              >
                {step === 4 ? 'Create Tenant' : <>Next <ChevronRight size={16}/></>}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
