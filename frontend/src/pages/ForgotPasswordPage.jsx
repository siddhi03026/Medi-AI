import { useState } from 'react';
import { authService } from '../services/authService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      const response = await authService.forgotPassword({ email });
      setMessage(response.data.reset_link || response.data.message);
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Failed to generate reset link');
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="brand-font text-2xl font-bold text-medicalBlue">Forgot Password</h1>
      <form className="glass-card space-y-3 p-5" onSubmit={submit}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border px-3 py-2" required />
        <button className="rounded-lg bg-medicalBlue px-4 py-2 font-semibold text-white">Send reset link</button>
      </form>
      {message && <p className="rounded-lg bg-slate-100 p-3 text-sm text-slate-700 break-all">{message}</p>}
    </div>
  );
}
