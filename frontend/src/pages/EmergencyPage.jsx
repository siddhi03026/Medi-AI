import { useEffect, useState } from 'react';
import { FaHeart, FaPhone, FaTruckMedical } from 'react-icons/fa6';
import { hospitalService } from '../services/hospitalService';

export default function EmergencyPage() {
  const [status, setStatus] = useState('Take a slow breath. Help is one tap away.');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const mode = localStorage.getItem('imai_access_mode');
    if (mode === 'blind' && window.speechSynthesis) {
      const msg = new SpeechSynthesisUtterance('Emergency page opened. Press call now to contact ambulance one zero eight.');
      msg.lang = 'en-IN';
      msg.rate = 0.95;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(msg);
    }
  }, []);

  // Note: Removed auto-redirect to tel: so user can see results first

  const fetchEmergency = async (lat, lon) => {
    try {
      const response = await hospitalService.emergency({
        lat,
        lon,
        medical_need: 'emergency',
      });
      setResult(response.data);
      setStatus('Emergency mode active. Nearest viable hospital selected.');
    } catch (err) {
      setStatus(err.response?.data?.detail || 'Emergency mode failed.');
    } finally {
      setLoading(false);
    }
  };

  const trigger = async () => {
    setLoading(true);
    setStatus('Detecting your location...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await fetchEmergency(pos.coords.latitude, pos.coords.longitude);
      },
      async () => {
        // Fallback to Delhi coordinates when location is blocked
        setStatus('Location unavailable. Using default location (Delhi)...');
        await fetchEmergency(28.6139, 77.2090);
      },
      { enableHighAccuracy: true, timeout: 4000 }
    );
  };

  // Auto-trigger on page load
  useEffect(() => {
    trigger();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mx-auto max-w-3xl space-y-5 py-4 text-center">
      <p className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-xl text-red-600">
        <FaHeart />
      </p>
      <h1 className="brand-font text-2xl font-bold text-slate-900">You&apos;re not alone.</h1>
      <p className="text-sm text-slate-600">{status}</p>

      <section className="glass-card flex items-center gap-3 p-5 text-left">
        <span className="rounded-full bg-sky-100 p-3 text-lg text-blue-800">📍</span>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Nearest hospital</p>
          <p className="text-base font-semibold text-slate-900">{result?.nearest_hospital?.name || 'Finding nearest hospital...'}</p>
          <p className="text-sm text-slate-600">
            {result?.nearest_hospital?.city || 'Location in progress'} · {result?.nearest_hospital?.distance_km || '--'} km · Open 24/7
          </p>
        </div>
      </section>

      <button onClick={trigger} disabled={loading} className="w-full rounded-2xl bg-red-600 px-6 py-5 text-left text-white shadow-xl">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-red-500/70 p-4 text-xl">
            <FaPhone />
          </span>
          <div>
            <p className="text-2xl font-bold">Call Now</p>
            <p className="text-sm">Direct line to ambulance · 108</p>
          </div>
        </div>
      </button>

      <button
        onClick={() => {
          if (result?.nearest_hospital?.phone) {
            window.location.href = `tel:${result.nearest_hospital.phone}`;
          } else {
            window.location.href = 'tel:108';
          }
        }}
        className="w-full rounded-2xl border-2 border-blue-900 bg-white px-6 py-5 text-left text-blue-900 transition-colors hover:bg-blue-50"
      >
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-sky-100 p-4 text-xl">
            <FaTruckMedical />
          </span>
          <div>
            <p className="text-2xl font-bold">Book Ambulance</p>
            <p className="text-sm">
              Contacting: {result?.nearest_hospital?.name || 'Local 108 Service'}
            </p>
            <p className="text-xs text-slate-500 italic">
              Estimated arrival: {result?.ambulance?.eta_minutes || 6} minutes
            </p>
          </div>
        </div>
      </button>
    </div>
  );
}
