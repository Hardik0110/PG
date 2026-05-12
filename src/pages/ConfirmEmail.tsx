import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MailCheck, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { apiRequest } from '../lib/api';

type Status = 'loading' | 'success' | 'error';

export default function ConfirmEmail() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [status, setStatus] = useState<Status>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMsg('Verification link is missing the token.');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        await apiRequest(`/api/v1/auth/confirm-email?token=${encodeURIComponent(token)}`, {
          method: 'GET',
        });
        if (!cancelled) setStatus('success');
      } catch (err: any) {
        if (cancelled) return;
        setStatus('error');
        setErrorMsg(err?.message || 'This verification link is invalid or has expired.');
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F5F0] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-gray-200 p-8 flex flex-col items-center text-center">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 rounded-full bg-[#1C6C41]/10 flex items-center justify-center mb-4">
              <Loader2 size={32} className="text-[#1C6C41] animate-spin" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">Verifying your email…</h1>
            <p className="text-sm text-gray-500">Hang tight, this only takes a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-[#1C6C41]/10 flex items-center justify-center mb-4">
              <MailCheck size={32} className="text-[#1C6C41]" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">Email verified!</h1>
            <p className="text-sm text-gray-500 mb-6">Your account is active. You can now log in.</p>
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="inline-flex items-center gap-2 h-11 px-6 bg-[#1C6C41] hover:bg-[#155331] text-white text-sm font-semibold rounded-full transition-colors"
            >
              Go to login
              <ArrowRight size={16} />
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertCircle size={32} className="text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">Verification failed</h1>
            <p className="text-sm text-gray-500 mb-6">{errorMsg}</p>
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="inline-flex items-center gap-2 h-11 px-6 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-full transition-colors"
            >
              Back to login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
