import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Loader2 } from 'lucide-react';
import { setToken } from '../lib/api';

function AuthPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validateLogin = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignup = () => {
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setToken('mock-token');
    setSubmitting(false);
    navigate('/dashboard');
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateSignup()) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setToken('mock-token');
    setSubmitting(false);
    navigate('/dashboard');
  };

  const inputClass = (fieldName) =>
    `w-full h-[42px] pl-11 pr-4 rounded-[10px] bg-white border text-[14px] outline-none transition-colors font-sans ${
      errors[fieldName] ? 'border-red-400 focus:border-red-500' : 'border-[#D1D5DB] focus:border-[#1C6C41]'
    }`;

  return (
    <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-[920px] bg-white shadow-md p-5 rounded-[40px] border border-gray-200">
        <div className="w-full flex flex-col-reverse md:flex-row">

          {/* Left Column — Decorative image panel */}
          <div className="w-full flex items-center justify-center md:max-w-[420px] mt-6 md:mt-0">
            <div className="relative w-full rounded-[30px] overflow-hidden bg-gradient-to-br from-[#d4f5e0] to-[#a8e6c3] flex items-center justify-center min-h-[380px] md:min-h-[460px]">
              {/* Sunburst decorative background */}
              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <div className="w-[300px] h-[300px] rounded-full" style={{
                  background: 'repeating-conic-gradient(#1C6C41 0deg 15deg, transparent 15deg 30deg)',
                }} />
              </div>
              {/* Content */}
              <div className="relative z-10 text-center px-6">
                <h2 className="text-[18px] md:text-[20px] font-bold text-gray-800 mb-3">
                  Reliable Pros, Trusted by Your Circle
                </h2>
                <p className="text-[13px] text-gray-600">
                  Manage your properties with confidence
                </p>
              </div>
              {/* Floating card */}
              <div className="absolute bottom-6 left-6 bg-white rounded-xl shadow-lg px-4 py-3 max-w-[200px]">
                <p className="text-[13px] font-semibold text-gray-800">PG Manager</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Crafted to last, built with care</p>
                <div className="flex items-center gap-1 mt-2">
                  <div className="flex -space-x-1.5">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-5 h-5 rounded-full bg-gradient-to-br from-[#1C6C41] to-[#3DBF7E] border-2 border-white text-[8px] text-white flex items-center justify-center font-bold">
                        {String.fromCharCode(65 + i)}
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-400 ml-1">+3 more recommend this</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column — Form */}
          <div className="flex-1 p-6 md:p-10 flex flex-col justify-start items-start">
            {/* Logo */}
            <img src="/logo.png" alt="TrustCircle Logo" className="h-[26px] w-[134px]" />

            <h1 className="text-[26px] md:text-[30px] mt-4 font-bold text-gray-900">
              {activeTab === 'login' ? 'Welcome Back!' : 'Join TrustCircle!'}
            </h1>
            <p className="text-[13px] md:text-[14px] text-gray-500 mb-5">
              {activeTab === 'login'
                ? 'Please enter your email and password to log in.'
                : 'Create an account to start managing your properties.'}
            </p>

            {/* Toggle Tabs */}
            <div className="flex w-full bg-[#F3F4F6] rounded-full p-1 mb-5">
              <button
                onClick={() => { setActiveTab('login'); setErrors({}); }}
                className={`flex-1 py-2 rounded-full text-[13px] font-semibold transition-all ${
                  activeTab === 'login'
                    ? 'bg-[#1C6C41] text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => { setActiveTab('signup'); setErrors({}); }}
                className={`flex-1 py-2 rounded-full text-[13px] font-semibold transition-all ${
                  activeTab === 'signup'
                    ? 'bg-[#1C6C41] text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Forms */}
            {activeTab === 'login' ? (
              <form onSubmit={handleLogin} className="w-full flex flex-col gap-3 flex-1">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] text-gray-700 font-medium" htmlFor="login-email">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      id="login-email"
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
                  <label className="text-[13px] text-gray-700 font-medium" htmlFor="login-password">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      id="login-password"
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <span className="text-[11px] text-red-500">{errors.password}</span>}
                </div>

                <div className="flex justify-end w-full">
                  <button type="button" className="text-[12px] text-gray-500 hover:text-[#1C6C41] transition-colors">
                    Forgot password?
                  </button>
                </div>

                <div className="flex flex-col gap-3 mt-auto pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#1C6C41] rounded-full w-full h-[42px] text-white hover:bg-[#155331] transition-colors flex justify-center items-center font-semibold text-[14px] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In'}
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                    className="bg-[#1C6C41] rounded-full w-full h-[42px] text-white hover:bg-[#155331] transition-colors flex justify-center items-center font-semibold text-[14px] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign Up'}
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