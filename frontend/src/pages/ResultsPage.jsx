import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import HospitalCard from '../components/HospitalCard';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { hospitalService } from '../services/hospitalService';

export default function ResultsPage() {
  const [searchParams] = useSearchParams();
  const q = useMemo(() => searchParams.get('q') || localStorage.getItem('imai_last_query') || '', [searchParams]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payload, setPayload] = useState({ understanding: {}, hospitals: [], explainability: {} });
  const { speak } = useTextToSpeech();

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!q) {
        setError('Empty search. Please enter a query from Home or Search page.');
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const position = await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
            () => resolve(null),
            { enableHighAccuracy: true, timeout: 3000 }
          );
        });

        const response = await hospitalService.search({ query: q, user_location: position });
        if (!mounted) return;
        setPayload(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to fetch hospital results.');
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [q]);

  return (
    <div className="space-y-4">
      <h1 className="brand-font text-2xl font-bold text-slate-900">Hospital recommendations</h1>
      <div className="glass-card p-4 text-sm text-slate-600">
        <p>
          Query understanding: location: {payload.understanding?.location || 'not specified'} | urgency:{' '}
          {payload.understanding?.urgency || 'normal'} | need: {payload.understanding?.medical_need || 'general'} | budget:{' '}
          {payload.understanding?.budget || 'moderate'}
        </p>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading recommendations...</p>}
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {!loading && !error && payload.hospitals.length === 0 && (
        <div className="glass-card p-4">
          <p className="text-sm text-slate-600">No results found. Try broadening your location or medical condition keywords.</p>
        </div>
      )}

      <div className="grid gap-4">
        {payload.hospitals.map((hospital) => (
          <HospitalCard key={hospital.id} hospital={hospital} onSpeak={speak} />
        ))}
      </div>
    </div>
  );
}
