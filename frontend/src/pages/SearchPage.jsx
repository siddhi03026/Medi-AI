import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaMicrophone, FaFaceSmile, FaMagnifyingGlass, FaStethoscope, FaWaveSquare } from 'react-icons/fa6';
import { useVoiceInput } from '../hooks/useVoiceInput';

const quickSuggestions = ['Chest pain near me', 'Cheap dialysis', 'Children fever clinic', 'Free eye check-up'];
const careTypes = [
  { id: 'general', label: 'General', icon: <FaStethoscope /> },
  { id: 'heart', label: 'Heart', icon: <FaHeart /> },
  { id: 'children', label: 'Children', icon: <FaFaceSmile /> },
  { id: 'neuro', label: 'Neuro', icon: <span>🧠</span> },
  { id: 'ortho', label: 'Ortho', icon: <FaWaveSquare /> },
];

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState(localStorage.getItem('imai_last_query') || '');
  const [budget, setBudget] = useState(5000);
  const [careType, setCareType] = useState('general');
  const [error, setError] = useState('');
  const { listening, supported, startListening } = useVoiceInput((text) => setQuery(text));

  const onSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setError('Search query cannot be empty.');
      return;
    }
    const composed = `${query} under Rs ${budget} for ${careType} care`;
    localStorage.setItem('imai_last_query', composed);
    navigate(`/results?q=${encodeURIComponent(composed)}`);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5 py-4">
      <section>
        <h1 className="brand-font text-2xl font-bold text-slate-900">Find care that fits you</h1>
        <p className="mt-1 text-sm text-slate-600">Tell us what you need — keep it simple.</p>
      </section>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="flex items-center rounded-full border border-slate-300 bg-white p-1.5 shadow-sm">
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
          <button type="button" onClick={startListening} disabled={!supported} className="rounded-full bg-sky-100 p-2.5 text-blue-800 disabled:opacity-40" aria-label="Voice input">
            <FaMicrophone className={listening ? 'animate-pulse' : ''} />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-slate-500">Suggestions:</span>
          {quickSuggestions.map((item) => (
            <button key={item} type="button" onClick={() => setQuery(item)} className="chip text-xs">
              {item}
            </button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <section className="glass-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">₹ Budget</p>
              <p className="text-sm font-semibold text-slate-700">≤ ₹{budget.toLocaleString('en-IN')}</p>
            </div>
            <input type="range" min="500" max="50000" step="500" value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="w-full" />
            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span>₹500</span>
              <span>₹50,000</span>
            </div>
          </section>

          <section className="glass-card p-5">
            <p className="mb-3 text-sm font-semibold text-slate-800">Type of care</p>
            <div className="flex flex-wrap gap-2">
              {careTypes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCareType(item.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs ${careType === item.id ? 'border-blue-800 bg-sky-100 text-blue-800' : 'border-slate-300 text-slate-700'}`}
                >
                  <span className="mr-1.5 inline-block">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </section>
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}
        <button type="submit" className="w-full rounded-2xl bg-blue-900 py-3 text-sm font-semibold text-white">
          See results
        </button>
      </form>
    </div>
  );
}
