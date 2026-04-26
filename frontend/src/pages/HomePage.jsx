import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLocationArrow, FaMicrophone, FaIndianRupeeSign, FaMagnifyingGlass, FaShieldHalved, FaStethoscope } from 'react-icons/fa6';
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
    <div className="space-y-10 pb-6">
      <section className="grid items-center gap-8 pt-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-300/80 bg-white/70 px-4 py-2 text-xs font-semibold text-slate-600">
            <FaShieldHalved className="text-cyan-700" /> Trusted by families across India
          </p>

          <h1 className="brand-font text-4xl font-bold leading-none tracking-tight text-cyan-800 sm:text-5xl md:text-6xl">
            IndiaMedicare <span className="text-emerald-950">AI</span>
          </h1>
          <p className="mt-4 text-2xl text-slate-500 sm:text-3xl md:text-[2.1rem]">Smart Healthcare, Trusted Decisions</p>

          <div className="mt-5 h-8 max-w-md opacity-75">
            <svg viewBox="0 0 460 40" className="h-full w-full" role="img" aria-label="Heartbeat line">
              <path className="heartbeat-path" d="M0 22 H95 L108 22 L120 8 L133 35 L146 14 L160 26 L176 19 L220 19 L236 2 L250 37 L265 20 L460 20" fill="none" stroke="#2ba7c8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <form onSubmit={onSubmit} className="mt-6 rounded-[2rem] border border-slate-300 bg-white/85 p-2 shadow-md shadow-cyan-100/70">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center rounded-[1.1rem] border border-slate-300 bg-slate-50 px-4 py-3">
                <FaMagnifyingGlass className="text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setError('');
                  }}
                  placeholder="Find hospitals near you or describe your need"
                  className="w-full bg-transparent px-3 text-base text-slate-700 outline-none placeholder:text-slate-400 sm:text-lg"
                />
              </div>
              <button
                type="button"
                onClick={startListening}
                disabled={!supported}
                className="rounded-2xl bg-emerald-100 px-6 py-3.5 text-base font-semibold text-emerald-900 transition hover:bg-emerald-200 disabled:opacity-40"
                aria-label="Voice input"
              >
                <FaMicrophone className={`mr-2 inline ${listening ? 'animate-pulse' : ''}`} /> Speak
              </button>
              <button type="submit" className="rounded-2xl bg-cyan-700 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-cyan-800">
                Search
              </button>
            </div>
          </form>

          {error && <p className="mt-2 text-sm font-medium text-red-700">{error}</p>}

          <button
            onClick={() => navigate('/emergency')}
            className="emergency-blink mt-5 w-full max-w-md rounded-[2rem] border-[10px] border-red-200 bg-red-500 px-8 py-4 text-lg font-extrabold tracking-wide text-white shadow-lg shadow-red-300/70 transition hover:bg-red-600 sm:text-xl"
          >
            EMERGENCY HELP
          </button>
          <p className="mt-2 text-sm text-slate-500">In life-threatening situations, also dial 112.</p>
        </div>

        <div className="mx-auto hidden w-full max-w-md lg:block">
          <div className="hospital-float relative mx-auto h-[310px] w-full">
            <span className="absolute left-10 top-6 h-3 w-3 rounded-full bg-amber-400/80" />
            <span className="absolute right-8 top-8 h-3 w-3 rounded-full bg-emerald-400/80" />
            <div className="absolute bottom-6 left-1/2 h-6 w-72 -translate-x-1/2 rounded-full bg-cyan-900/15" />

            <div className="absolute left-5 top-[116px] h-24 w-12 rounded-xl border border-emerald-200 bg-emerald-200/75" />
            <div className="absolute right-5 top-[116px] h-24 w-12 rounded-xl border border-emerald-200 bg-emerald-200/75" />

            <div className="hospital-flip absolute left-1/2 top-[40px] h-[180px] w-[260px] -translate-x-1/2 rounded-2xl border border-slate-300 bg-slate-100 shadow-lg">
              <div className="h-7 rounded-t-2xl bg-cyan-700" />
              <div className="mx-auto mt-1 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-200 text-6xl font-black leading-none text-red-500">+</div>
              <div className="mx-auto mt-3 grid w-44 grid-cols-4 gap-3">
                {Array.from({ length: 12 }).map((_, idx) => (
                  <div key={idx} className="h-3 rounded bg-cyan-200" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-800 md:text-4xl">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <button onClick={() => navigate('/emergency')} className="glass-card flex items-center gap-4 p-6 text-left">
            <span className="rounded-full bg-red-100 p-3 text-red-500">
              <FaStethoscope className="text-lg" />
            </span>
            <div>
              <p className="text-xl font-bold text-slate-800 md:text-2xl">Emergency Care</p>
              <p className="mt-1 text-base text-slate-500 md:text-lg">Fastest hospital + ambulance</p>
            </div>
          </button>

          <button onClick={() => navigate('/search')} className="glass-card flex items-center gap-4 p-6 text-left">
            <span className="rounded-full bg-emerald-100 p-3 text-emerald-600">
              <FaIndianRupeeSign className="text-lg" />
            </span>
            <div>
              <p className="text-xl font-bold text-slate-800 md:text-2xl">Low Cost Hospitals</p>
              <p className="mt-1 text-base text-slate-500 md:text-lg">Subsidized and govt hospitals</p>
            </div>
          </button>

          <button onClick={() => navigate('/map')} className="glass-card flex items-center gap-4 p-6 text-left">
            <span className="rounded-full bg-sky-100 p-3 text-cyan-700">
              <FaLocationArrow className="text-lg" />
            </span>
            <div>
              <p className="text-xl font-bold text-slate-800 md:text-2xl">Nearby Hospitals</p>
              <p className="mt-1 text-base text-slate-500 md:text-lg">View on interactive map</p>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
}
