import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaEnvelope, FaEye, FaLock, FaPhoneAlt, FaUser, FaHeart } from 'react-icons/fa';
import { authService } from '../services/authService';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const [form, setForm] = useState({ name: '', email: '', password: '', mobile_number: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');

  const onChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const signup = async (e) => {
    e.preventDefault();
    if (!emailRegex.test(form.email)) return setMessage('Invalid email format');
    if (!passwordRegex.test(form.password)) return setMessage('Password must be 8+ chars, 1 uppercase, 1 number');
    if (!phoneRegex.test(form.mobile_number)) return setMessage('Phone must be 10 digits');

    try {
      const response = await authService.signup(form);
      localStorage.setItem('imai_token', response.data.access_token);
      localStorage.setItem('imai_user', JSON.stringify(response.data.user));
      window.dispatchEvent(new Event('imai_auth_change'));
      navigate(from, { replace: true });
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Signup failed');
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-4 py-6">
      <div className="text-center">
        <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-lg text-blue-800">
          <FaHeart />
        </span>
        <h1 className="brand-font text-2xl font-bold text-slate-900">Create your account</h1>
        <p className="text-sm text-slate-600">It&apos;s quick, calm, and free.</p>
      </div>

      <form className="glass-card space-y-3 p-5" onSubmit={signup}>
        <label className="text-sm font-semibold text-slate-700">Full name</label>
        <div className="flex items-center rounded-xl border border-slate-300 px-3 py-2">
          <FaUser className="text-sm text-slate-400" />
          <input name="name" placeholder="Aarav Sharma" value={form.name} onChange={onChange} className="ml-2 w-full bg-transparent text-sm outline-none" required />
        </div>

        <label className="text-sm font-semibold text-slate-700">Email</label>
        <div className="flex items-center rounded-xl border border-slate-300 px-3 py-2">
          <FaEnvelope className="text-sm text-slate-400" />
          <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={onChange} className="ml-2 w-full bg-transparent text-sm outline-none" required />
        </div>

        <label className="text-sm font-semibold text-slate-700">Phone</label>
        <div className="flex items-center rounded-xl border border-slate-300 px-3 py-2">
          <FaPhoneAlt className="text-sm text-slate-400" />
          <input name="mobile_number" placeholder="98XXXXXXXX" value={form.mobile_number} onChange={onChange} className="ml-2 w-full bg-transparent text-sm outline-none" required />
        </div>

        <label className="text-sm font-semibold text-slate-700">Password</label>
        <div className="flex items-center rounded-xl border border-slate-300 px-3 py-2">
          <FaLock className="text-sm text-slate-400" />
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="At least 8 characters"
            value={form.password}
            onChange={onChange}
            className="ml-2 w-full bg-transparent text-sm outline-none"
            required
          />
          <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-sm text-slate-400" aria-label="Toggle password">
            <FaEye />
          </button>
        </div>

        <button className="w-full rounded-xl bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white">Create account</button>
        <p className="text-center text-xs text-slate-500">By continuing you agree to our gentle terms and privacy notice.</p>
      </form>

      {message && <p className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{message}</p>}
      <p className="text-center text-sm text-slate-600">
        Already have an account? <Link to="/login" className="text-blue-800 font-medium">Log in</Link>
      </p>
    </div>
  );
}
