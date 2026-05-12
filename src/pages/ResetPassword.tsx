import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { isStrongPassword, PASSWORD_RULES } from '../lib/validation';
import Loader from '../components/ui/Loader';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';

  const [pwd, setPwd] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F5F0] px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-gray-200 p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Missing reset token</h1>
          <p className="text-sm text-gray-500 mb-6">
            This URL doesn't include a valid reset token. Open the reset link from your email again.
          </p>
          <button
            type="button"
            onClick={() => navigate('/auth')}
            className="h-11 px-6 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-full"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  const validate = () => {
    const next: Record<string, string> = {};
    if (!pwd) next.pwd = 'Password is required';
    else if (!isStrongPassword(pwd)) next.pwd = `Use ${PASSWORD_RULES}`;
    if (pwd !== pwdConfirm) next.pwdConfirm = 'Passwords do not match';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await apiRequest('/api/v1/auth/reset-password', {
        method: 'POST',
        body: { token, new_password: pwd },
      });
      setSuccess(true);
    } catch (err: any) {
      setErrors({ pwd: err?.message || 'Could not reset password. The link may have expired.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F5F0] px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-gray-200 p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-[#1C6C41]/10 flex items-center justify-center mb-4">
            <CheckCircle2 size={32} className="text-[#1C6C41]" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Password updated</h1>
          <p className="text-sm text-gray-500 mb-6">You can now log in with your new password.</p>
          <button
            type="button"
            onClick={() => navigate('/auth')}
            className="h-11 px-6 bg-[#1C6C41] hover:bg-[#155331] text-white text-sm font-semibold rounded-full"
          >
            Go to login
          </button>
        </div>
      </div>
    );
  }

  const inputCls = (k: 'pwd' | 'pwdConfirm') =>
    `w-full h-12 pl-11 pr-11 rounded-[10px] bg-white border text-[14px] outline-none transition-colors ${
      errors[k] ? 'border-red-400 focus:border-red-500' : 'border-[#D1D5DB] focus:border-[#1C6C41]'
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F5F0] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-gray-200 p-8">
        <img src="/logo.png" alt="TrustCircle" className="h-[26px] w-[134px]" />
        <h1 className="text-[26px] mt-4 font-bold text-gray-900">Set a new password</h1>
        <p className="text-[13px] text-gray-500 mb-6">{PASSWORD_RULES}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-[13px] text-gray-700 font-medium" htmlFor="new-pwd">New Password</label>
            <div className="relative mt-1.5">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="new-pwd"
                type={show1 ? 'text' : 'password'}
                value={pwd}
                onChange={(e) => { setPwd(e.target.value); setErrors((p) => ({ ...p, pwd: '' })); }}
                className={inputCls('pwd')}
                disabled={submitting}
              />
              <button
                type="button"
                onClick={() => setShow1(!show1)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {show1 ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.pwd && <p className="mt-1 text-[11px] text-red-500">{errors.pwd}</p>}
          </div>

          <div>
            <label className="text-[13px] text-gray-700 font-medium" htmlFor="new-pwd-confirm">Confirm Password</label>
            <div className="relative mt-1.5">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="new-pwd-confirm"
                type={show2 ? 'text' : 'password'}
                value={pwdConfirm}
                onChange={(e) => { setPwdConfirm(e.target.value); setErrors((p) => ({ ...p, pwdConfirm: '' })); }}
                className={inputCls('pwdConfirm')}
                disabled={submitting}
              />
              <button
                type="button"
                onClick={() => setShow2(!show2)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {show2 ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.pwdConfirm && <p className="mt-1 text-[11px] text-red-500">{errors.pwdConfirm}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-4 bg-[#1C6C41] hover:bg-[#155331] text-white h-12 rounded-full font-semibold text-[14px] disabled:opacity-70 flex items-center justify-center"
          >
            {submitting ? <Loader size={20} color="white" /> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
