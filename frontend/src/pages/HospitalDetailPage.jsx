import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TrustTimelineChart from '../components/TrustTimelineChart';
import { hospitalService } from '../services/hospitalService';

export default function HospitalDetailPage() {
  const { id } = useParams();
  const [hospital, setHospital] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    hospitalService
      .detail(id)
      .then((response) => setHospital(response.data.hospital))
      .catch((err) => setError(err.response?.data?.detail || 'Hospital details unavailable'));
  }, [id]);

  if (error) return <p className="rounded-lg bg-red-50 p-3 text-red-700">{error}</p>;
  if (!hospital) return <p>Loading hospital details...</p>;

  return (
    <div className="space-y-4">
      <h1 className="brand-font text-2xl font-bold text-medicalBlue">{hospital.name}</h1>
      <section className="glass-card space-y-2 p-5">
        <p>
          {hospital.city}, {hospital.state}
        </p>
        <p>{hospital.description || 'No description available.'}</p>
        <p className="font-semibold text-medicalGreen">Capabilities:</p>
        <p>{hospital.capability || 'No capability listed'}</p>
        <p className="font-semibold text-medicalGreen">Equipment:</p>
        <p>{hospital.equipment || 'No equipment listed'}</p>
        <a href={`tel:${hospital.phone || '+911080000000'}`} className="inline-block rounded-lg bg-medicalBlue px-4 py-2 font-semibold text-white">
          Call {hospital.phone || 'Hospital'}
        </a>
        <div>
          <p className="mb-1 text-sm font-semibold">Truth Confidence Timeline</p>
          <TrustTimelineChart timeline={hospital.truth_confidence_timeline || []} />
        </div>
      </section>
    </div>
  );
}
