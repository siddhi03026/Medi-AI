import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaEnvelope, FaLock, FaPhoneAlt, FaHeart } from 'react-icons/fa';
import { authService } from '../services/authService';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const [form, setForm] = useState({ email: '', password: '' });
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const onChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const login = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await authService.login(form);
      setSuccess(true);
      localStorage.setItem('imai_token', response.data.access_token);
      localStorage.setItem('imai_user', JSON.stringify(response.data.user));
      window.dispatchEvent(new Event('imai_auth_change'));
      setTimeout(() => navigate(from, { replace: true }), 1000);
    } catch (err) {
      setMessage(err.response?.data?.detail || err.message || 'Login failed. Please try again.');
    }
  };

  const googleMock = async () => {
    try {
      const response = await authService.google({ email: form.email || 'google.user@example.com', name: 'Google User', google_id: 'mock-google-id' });
      localStorage.setItem('imai_token', response.data.access_token);
      localStorage.setItem('imai_user', JSON.stringify(response.data.user));
      window.dispatchEvent(new Event('imai_auth_change'));
      navigate(from, { replace: true });
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Google login failed');
    }
  };

  const requestOtp = async () => {
    try {
      const response = await authService.requestOtp({ mobile_number: mobile });
      setMessage(`Mock OTP: ${response.data.mock_otp}`);
      setIsOtpSent(true);
    } catch (err) {
      setMessage(err.response?.data?.detail || 'OTP request failed');
    }
  };

  const verifyOtp = async () => {
    try {
      const response = await authService.verifyOtp({ mobile_number: mobile, otp });
      localStorage.setItem('imai_token', response.data.access_token);
      localStorage.setItem('imai_user', JSON.stringify(response.data.user));
      window.dispatchEvent(new Event('imai_auth_change'));
      navigate(from, { replace: true });
    } catch (err) {
      setMessage(err.response?.data?.detail || 'OTP verification failed');
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-4 py-6">
      <div className="text-center">
        <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-lg text-blue-800">
          <FaHeart />
        </span>
        <h1 className="brand-font text-2xl font-bold text-slate-900">Welcome back</h1>
        <p className="text-sm text-slate-600">We&apos;re glad you&apos;re here.</p>
      </div>

      <form className="glass-card space-y-3 p-5" onSubmit={login}>
        <label className="text-sm font-semibold text-slate-700">Email</label>
        <div className="flex items-center rounded-xl border border-slate-300 px-3 py-2">
          <FaEnvelope className="text-sm text-slate-400" />
          <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={onChange} className="ml-2 w-full bg-transparent text-sm outline-none" required />
        </div>

        <label className="text-sm font-semibold text-slate-700">Password</label>
        <div className="flex items-center rounded-xl border border-slate-300 px-3 py-2">
          <FaLock className="text-sm text-slate-400" />
          <input name="password" type="password" placeholder="Your password" value={form.password} onChange={onChange} className="ml-2 w-full bg-transparent text-sm outline-none" required />
        </div>
        <p className="text-right text-xs text-blue-800"><Link to="/forgot-password">Forgot password?</Link></p>

        <button className="w-full rounded-xl bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white">Log in</button>
      </form>

      <div className="text-center text-xs text-slate-500 font-medium">— OR LOGIN WITH MOBILE —</div>

      <div className="glass-card space-y-4 p-5 border-t-4 border-t-blue-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-800">
            <FaPhoneAlt />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Mobile OTP Login</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Fast & Secure Access</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="10-digit mobile number"
              className="w-full rounded-xl border border-slate-300 bg-white/50 px-4 py-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            />
            {mobile.length === 10 && !isOtpSent && (
              <button
                onClick={requestOtp}
                className="absolute right-2 top-1.5 rounded-lg bg-blue-100 px-3 py-1.5 text-[11px] font-bold text-blue-800 hover:bg-blue-200 transition"
              >
                SEND OTP
              </button>
            )}
          </div>

          {isOtpSent && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  className="w-full rounded-xl border border-blue-200 bg-blue-50/30 px-4 py-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
                <div className="absolute right-3 top-3.5 h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
              </div>
              <button
                onClick={verifyOtp}
                className="w-full rounded-xl bg-blue-900 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/20 hover:bg-blue-800 transition"
              >
                VERIFY & PROCEED
              </button>
              <button onClick={() => setIsOtpSent(false)} className="w-full text-center text-[11px] font-medium text-slate-500 hover:text-blue-800">
                Change number?
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="text-center text-xs text-slate-500">or continue with</div>

      <div className="grid grid-cols-1 gap-3">
        <button onClick={googleMock} className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign in with Google
        </button>
      </div>

      {success && <div className="rounded-xl bg-emerald-50 p-4 text-xs font-medium text-emerald-800 border border-emerald-100">Login successful! Redirecting...</div>}
      {message && (
        <div className={`rounded-xl p-4 text-xs font-medium animate-in zoom-in-95 duration-200 ${message.includes('Mock OTP') ? 'bg-blue-50 text-blue-800 border border-blue-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
          {message}
        </div>
      )}
      <p className="text-center text-sm text-slate-600">
        New user? <Link to="/signup" className="text-blue-800 font-bold hover:underline">Create account</Link>
      </p>
    </div>
  );
}
