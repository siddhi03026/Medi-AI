import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight, FaLocationArrow, FaMicrophone, FaIndianRupeeSign, FaMagnifyingGlass, FaShieldHalved, FaTruckMedical } from 'react-icons/fa6';
import { useVoiceInput } from '../hooks/useVoiceInput';

export default function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  const { listening, supported, startListening } = useVoiceInput((text) => setQuery(text));

  const onSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setError('Please enter a medical query to continue.');
      return;
    }
    localStorage.setItem('imai_last_query', query);
    navigate(`/results?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="space-y-6">
      <section className="py-6 text-center">
        <p className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800">
          <FaShieldHalved /> Trusted · Calm · Accessible
        </p>
        <h1 className="brand-font mx-auto max-w-3xl text-3xl font-bold leading-tight text-slate-900">
          A calm assistant <br /> for the moments that <span className="text-blue-800">matter.</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base text-slate-600">
          Find hospitals, ambulances and affordable care across India. Designed to feel safe for everyone, at any age.
        </p>

        <form onSubmit={onSubmit} className="mx-auto mt-6 flex max-w-3xl items-center rounded-full border border-slate-300 bg-white p-1.5 shadow-sm">
          <FaMagnifyingGlass className="ml-3 text-base text-slate-400" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setError('');
            }}
            placeholder="Find a hospital or describe your need"
            className="w-full bg-transparent px-3 py-2 text-sm outline-none"
          />
          <button
            type="button"
            onClick={startListening}
            disabled={!supported}
            className="mr-1.5 rounded-full bg-sky-100 p-2.5 text-blue-800 disabled:opacity-40"
            aria-label="Voice input"
          >
            <FaMicrophone className={listening ? 'animate-pulse' : ''} />
          </button>
          <button type="submit" className="rounded-full bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white">
            Search <FaArrowRight className="ml-1.5 inline" />
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
        <p className="mt-2 text-xs text-slate-500">Try: "chest pain near me", "cheap dialysis in Delhi", "children fever clinic"</p>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <button onClick={() => navigate('/emergency')} className="glass-card flex items-center justify-between p-4 text-left">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-red-100 p-3 text-red-600">
              <FaTruckMedical />
            </span>
            <div>
              <p className="text-base font-semibold text-slate-900">Emergency</p>
              <p className="text-sm text-slate-600">Fastest help, one tap</p>
            </div>
          </div>
          <FaArrowRight className="text-sm" />
        </button>

        <button onClick={() => navigate('/map')} className="glass-card flex items-center justify-between p-4 text-left">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-sky-100 p-3 text-blue-900">
              <FaLocationArrow />
            </span>
            <div>
              <p className="text-base font-semibold text-slate-900">Nearby Hospitals</p>
              <p className="text-sm text-slate-600">See trusted care around you</p>
            </div>
          </div>
          <FaArrowRight className="text-sm" />
        </button>

        <button onClick={() => navigate('/search')} className="glass-card flex items-center justify-between p-4 text-left">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-emerald-100 p-3 text-emerald-700">
              <FaIndianRupeeSign />
            </span>
            <div>
              <p className="text-base font-semibold text-slate-900">Low-cost Care</p>
              <p className="text-sm text-slate-600">Affordable treatment options</p>
            </div>
          </div>
          <FaArrowRight className="text-sm" />
        </button>
      </section>

      <section className="glass-card flex flex-col justify-between gap-4 p-6 md:flex-row">
        <div>
          <h2 className="brand-font text-2xl font-bold text-slate-900">Care that listens</h2>
          <p className="mt-2 max-w-xl text-sm text-slate-600">
            Speak in your language. Tap one button. Receive clear, simple guidance — no medical jargon, no panic.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="chip">Hindi</span>
            <span className="chip">English</span>
            <span className="chip">Voice-first</span>
            <span className="chip">Elder-friendly</span>
            <span className="chip">Screen-reader ready</span>
          </div>
        </div>
        <div className="mx-auto my-auto h-1 w-32 rounded-full bg-blue-800" />
      </section>
    </div>
  );
}
