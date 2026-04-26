import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import TrustTimelineChart from './TrustTimelineChart';

export default function HospitalCard({ hospital, onSpeak }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="brand-font text-xl font-bold text-medicalBlue">{hospital.name}</h3>
        <p className="rounded-full bg-medicalBlue/10 px-3 py-1 text-sm font-semibold text-medicalBlue">
          Trust {hospital.trust_score}/100 ({hospital.confidence})
        </p>
      </div>
      <p className="mt-2 text-sm text-slate-700">
        {hospital.city} | Estimated cost: Rs {hospital.estimated_cost || 'N/A'}
      </p>
      <p className="mt-2 text-sm text-slate-700">{hospital.explanation}</p>

      {hospital.warnings?.length > 0 && (
        <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Warning: {hospital.warnings.join('; ')}
        </div>
      )}
      {hospital.confidence === 'low' && (
        <div className="mt-3 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          Alert: Low confidence data. Verify details independently.
        </div>
      )}

      <div className="mt-3">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Truth Confidence Timeline</p>
        <TrustTimelineChart timeline={hospital.truth_confidence_timeline} />
      </div>

      <div className="mt-3">
        <p className="text-sm font-semibold text-medicalGreen">Hidden capabilities:</p>
        <p className="text-sm text-slate-700">
          {hospital.hidden_capabilities?.length ? hospital.hidden_capabilities.join(', ') : 'No inferred capabilities'}
        </p>
      </div>

      {hospital.external_validation && (
        <div className="mt-3 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <p className="font-semibold">External validation ({hospital.external_validation.provider})</p>
          <p>{hospital.external_validation.summary}</p>
          {hospital.external_validation.signals?.length > 0 && (
            <p className="mt-1 text-xs">Sources: {hospital.external_validation.signals.slice(0, 2).join(' | ')}</p>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Link className="rounded-lg bg-medicalBlue px-3 py-2 text-sm font-semibold text-white" to={`/hospital/${hospital.id}`}>
          View details
        </Link>
        <button className="rounded-lg bg-medicalGreen px-3 py-2 text-sm font-semibold text-white" onClick={() => onSpeak(hospital.explanation)}>
          Read explanation
        </button>
        <a className="rounded-lg border border-medicalBlue/30 px-3 py-2 text-sm font-semibold text-medicalBlue" href={`tel:${hospital.phone || '+911080000000'}`}>
          Call hospital
        </a>
      </div>
    </motion.article>
  );
}
