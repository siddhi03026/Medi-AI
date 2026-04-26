import { motion } from 'framer-motion';

export default function EmergencyPanel({ onTrigger }) {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card border border-red-300 p-5"
    >
      <h2 className="brand-font text-xl font-bold text-red-600">Emergency Reality Mode</h2>
      <p className="mt-2 text-sm text-slate-700">
        Prioritizes nearest viable hospital for immediate action.
      </p>
      <button
        onClick={onTrigger}
        className="mt-4 animate-heartbeat rounded-xl bg-red-600 px-5 py-3 font-bold text-white"
      >
        Activate Emergency
      </button>
      <div className="mt-4 heartbeat-line" />
    </motion.section>
  );
}
