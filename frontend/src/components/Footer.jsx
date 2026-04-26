import DisclaimerBar from './DisclaimerBar';
import { FaHeart, FaShieldAlt } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="mt-8 border-t border-slate-200 bg-white/60 pb-14">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5">
        <DisclaimerBar />
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="mb-1 flex items-center gap-2 text-sm font-bold text-slate-800">
              <FaHeart className="text-blue-800" /> IndiaMedicare AI
            </p>
            <p className="text-xs text-slate-600">A calm, accessible assistant to help you find the right care quickly and without panic.</p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-900">
            <p className="flex items-start gap-2">
              <FaShieldAlt className="mt-0.5" /> We respect your privacy. Your data is not stored unnecessarily.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Helpline</p>
            <p className="mt-1 text-xs text-slate-600">Emergency: 112</p>
            <p className="text-xs text-slate-600">Ambulance: 102 / 108</p>
            <p className="text-xs text-slate-600">Health Helpline: 104</p>
          </div>
        </div>
        <p className="text-center text-xs text-slate-400">© 2026 IndiaMedicare AI · Calm care for everyone</p>
      </div>
    </footer>
  );
}
