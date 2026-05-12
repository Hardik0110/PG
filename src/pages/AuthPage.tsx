import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Loader2, MailCheck, ArrowLeft } from 'lucide-react';
import Loader from '../components/ui/Loader';
import { motion } from 'framer-motion';
import { setToken, clearToken, apiRequest, apiFormRequest } from '../lib/api';
import { isStrongPassword, PASSWORD_RULES, isValidEmail } from '../lib/validation';

type Mode = 'login' | 'signup' | 'forgot' | 'verifySent' | 'forgotSent';

function AuthPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Mode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validateLogin = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!isValidEmail(formData.email)) newErrors.email = 'Please enter a valid email';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignup = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Name is required';
    else if (formData.fullName.trim().length < 2) newErrors.fullName = 'Name must be at least 2 characters';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!isValidEmail(formData.email)) newErrors.email = 'Please enter a valid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (!isStrongPassword(formData.password)) newErrors.password = `Use ${PASSWORD_RULES}`;
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForgot = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!isValidEmail(formData.email)) newErrors.email = 'Please enter a valid email';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;
    setSubmitting(true);
    clearToken();
    try {
      const email = formData.email.trim().toLowerCase();
      const body = new URLSearchParams({
        username: email,
        password: formData.password,
      }).toString();
      const data = await apiFormRequest('/api/v1/auth/login', { body });
      setToken(data.access_token);
      navigate('/dashboard');
    } catch (err) {
      setErrors({ password: err.message || 'Login failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateSignup()) return;
    setSubmitting(true);
    clearToken();
    try {
      const email = formData.email.trim().toLowerCase();
      // Register the owner. The backend now sends a verification email;
      // login is gated on is_verified, so we DON'T auto-login. Show the
      // 'check your email' screen instead.
      await apiRequest('/api/v1/auth/register', {
        method: 'POST',
        body: {
          email,
          password: formData.password,
          full_name: formData.fullName.trim(),
          phone_number: formData.phone || null,
          role: 'owner',
        },
      });
      setActiveTab('verifySent');
    } catch (err) {
      setErrors({ email: err.message || 'Sign-up failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    if (!validateForgot()) return;
    setSubmitting(true);
    try {
      await apiRequest('/api/v1/auth/forgot-password', {
        method: 'POST',
        body: { email: formData.email.trim().toLowerCase() },
      });
      // Backend intentionally returns a generic success regardless of
      // whether the account exists, to prevent email enumeration.
      setActiveTab('forgotSent');
    } catch (err) {
      setErrors({ email: err.message || 'Could not send reset email' });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (fieldName) =>
    `w-full h-12 md:h-[42px] pl-11 pr-4 rounded-[10px] bg-white border text-base md:text-[14px] outline-none transition-colors font-sans ${errors[fieldName] ? 'border-red-400 focus:border-red-500' : 'border-[#D1D5DB] focus:border-[#1C6C41]'
    }`;

  return (
    <div className="min-h-screen min-h-svh flex items-center justify-center bg-white md:p-6 md:bg-[linear-gradient(135deg,#1C6C41_0%,#F8F5F0_60%)]">
      <div className="w-full max-w-[920px] bg-white md:shadow-md md:p-4 md:rounded-[40px] md:border md:border-gray-200">
        <div className="w-full flex flex-col md:flex-row">

          <div className="hidden md:flex md:items-center md:justify-center md:max-w-[420px]">
            <div className="relative w-full h-full rounded-[30px] overflow-hidden">
              <img
                src="/illustrations/D1-auth-hero_001.jpg"
                alt="PG Management illustration"
                width="420"
                height="600"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="flex-1 px-5 py-6 md:p-10 flex flex-col justify-start items-start">

            <img src="/logo.png" alt="TrustCircle Logo" width="134" height="26" className="h-[26px] w-[134px]" />

            <h1 className="text-[26px] md:text-[30px] mt-4 font-bold text-gray-900">
              {activeTab === 'login' && 'Welcome Back!'}
              {activeTab === 'signup' && 'Join TrustCircle!'}
              {activeTab === 'forgot' && 'Reset Password'}
              {activeTab === 'verifySent' && 'Check Your Email'}
              {activeTab === 'forgotSent' && 'Check Your Email'}
            </h1>
            <p className="text-[13px] md:text-[14px] text-gray-500 mb-5">
              {activeTab === 'login' && 'Please enter your email and password to log in.'}
              {activeTab === 'signup' && 'Create an account to start managing your properties.'}
              {activeTab === 'forgot' && 'Enter the email you registered with and we\'ll send a reset link.'}
              {activeTab === 'verifySent' && `We sent a verification link to ${formData.email || 'your email'}. Click it to activate your account.`}
              {activeTab === 'forgotSent' && 'If an account exists for that email, a reset link is on its way.'}
            </p>

            {(activeTab === 'login' || activeTab === 'signup') && (
            <div className="relative flex w-full bg-[#F3F4F6] rounded-full p-1 mb-5">
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setErrors({}); }}
                className={`relative z-10 flex-1 min-h-[44px] md:min-h-0 py-2 rounded-full text-[13px] font-semibold transition-colors duration-300 ${activeTab === 'login'
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('signup'); setErrors({}); }}
                className={`relative z-10 flex-1 min-h-[44px] md:min-h-0 py-2 rounded-full text-[13px] font-semibold transition-colors duration-300 ${activeTab === 'signup'
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Sign Up
              </button>

              <motion.div
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#1C6C41] rounded-full shadow-sm z-0"
                initial={false}
                animate={{
                  x: activeTab === 'login' ? 0 : '100%'
                }}
                transition={{
                  type: 'tween',
                  duration: 0.4,
                  ease: 'easeInOut'
                }}
              />
            </div>
            )}

            {activeTab === 'forgot' ? (
              <form onSubmit={handleForgot} className="w-full flex flex-col gap-3 flex-1">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] text-gray-700 font-medium" htmlFor="forgot-email">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      id="forgot-email"
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={inputClass('email')}
                      disabled={submitting}
                    />
                  </div>
                  {errors.email && <span className="text-[11px] text-red-500">{errors.email}</span>}
                </div>

                <div className="flex flex-col gap-3 mt-auto pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#1C6C41] rounded-full w-full h-12 md:h-[42px] text-white hover:bg-[#155331] transition-colors flex justify-center items-center font-semibold text-[14px] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {submitting ? <Loader size={20} color="white" /> : 'Send Reset Link'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('login'); setErrors({}); }}
                    className="inline-flex items-center justify-center gap-1.5 text-[13px] text-gray-500 hover:text-[#1C6C41] transition-colors"
                  >
                    <ArrowLeft size={14} />
                    Back to login
                  </button>
                </div>
              </form>
            ) : activeTab === 'verifySent' || activeTab === 'forgotSent' ? (
              <div className="w-full flex flex-col items-center justify-center flex-1 gap-4 py-6">
                <div className="w-16 h-16 rounded-full bg-[#1C6C41]/10 flex items-center justify-center">
                  <MailCheck size={32} className="text-[#1C6C41]" />
                </div>
                <div className="text-center">
                  <p className="text-[14px] text-gray-600 leading-relaxed">
                    {activeTab === 'verifySent'
                      ? 'Once you click the link, come back here and log in.'
                      : 'Open the link in the email to set a new password.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setActiveTab('login'); setErrors({}); }}
                  className="mt-2 inline-flex items-center gap-1.5 text-[13px] text-[#1C6C41] hover:underline"
                >
                  <ArrowLeft size={14} />
                  Back to login
                </button>
              </div>
            ) : activeTab === 'login' ? (
              <form onSubmit={handleLogin} className="w-full flex flex-col gap-3 flex-1">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] text-gray-700 font-medium" htmlFor="login-email">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      id="login-email"
                      type="email"
                      name="email"
                      placeholder="admin@trustcircle.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={inputClass('email')}
                      disabled={submitting}
                    />
                  </div>
                  {errors.email && <span className="text-[11px] text-red-500">{errors.email}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] text-gray-700 font-medium" htmlFor="login-password">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="password123"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`${inputClass('password')} pr-10`}
                      disabled={submitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <span className="text-[11px] text-red-500">{errors.password}</span>}
                </div>

                <div className="flex justify-end w-full">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('forgot'); setErrors({}); }}
                    className="-mr-2 px-2 py-2 text-[12px] text-gray-500 hover:text-[#1C6C41] transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="flex flex-col gap-3 mt-auto pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#1C6C41] rounded-full w-full h-12 md:h-[42px] text-white hover:bg-[#155331] transition-colors flex justify-center items-center font-semibold text-[14px] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {submitting ? <Loader size={20} color="white" /> : 'Log In'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="w-full flex flex-col gap-3 flex-1">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] text-gray-700 font-medium" htmlFor="signup-name">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      id="signup-name"
                      type="text"
                      name="fullName"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={inputClass('fullName')}
                      disabled={submitting}
                    />
                  </div>
                  {errors.fullName && <span className="text-[11px] text-red-500">{errors.fullName}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] text-gray-700 font-medium" htmlFor="signup-email">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      id="signup-email"
                      type="email"
                      name="email"
                      placeholder="johns@gmail.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={inputClass('email')}
                      disabled={submitting}
                    />
                  </div>
                  {errors.email && <span className="text-[11px] text-red-500">{errors.email}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] text-gray-700 font-medium" htmlFor="signup-password">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`${inputClass('password')} pr-10`}
                      disabled={submitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <span className="text-[11px] text-red-500">{errors.password}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] text-gray-700 font-medium" htmlFor="signup-confirm">Confirm Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      id="signup-confirm"
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`${inputClass('confirmPassword')} pr-10`}
                      disabled={submitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <span className="text-[11px] text-red-500">{errors.confirmPassword}</span>}
                </div>

                <div className="flex flex-col gap-3 mt-auto pt-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#1C6C41] rounded-full w-full h-12 md:h-[42px] text-white hover:bg-[#155331] transition-colors flex justify-center items-center font-semibold text-[14px] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {submitting ? <Loader size={20} color="white" /> : 'Sign Up'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
