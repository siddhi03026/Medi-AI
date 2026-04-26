import { FaMicrophone, FaSearch } from 'react-icons/fa';

export default function SearchInput({ value, onChange, onSubmit, onVoice, voiceSupported, voiceListening, error }) {
  return (
    <form className="glass-card p-4" onSubmit={onSubmit}>
      <label htmlFor="search" className="mb-2 block text-sm font-semibold text-medicalBlue">
        Describe your need (location, urgency, budget, medical condition)
      </label>
      <div className="flex flex-col gap-3 md:flex-row">
        <input
          id="search"
          value={value}
          onChange={onChange}
          placeholder="e.g. urgent stroke care in Pune, affordable"
          className="w-full rounded-xl border border-medicalBlue/20 px-4 py-3 outline-none focus:border-medicalBlue"
          aria-invalid={Boolean(error)}
        />
        <button
          type="button"
          onClick={onVoice}
          disabled={!voiceSupported}
          className="rounded-xl bg-medicalGreen px-4 py-3 font-semibold text-white disabled:opacity-50"
        >
          <FaMicrophone className="inline" /> {voiceListening ? 'Listening...' : 'Voice'}
        </button>
        <button type="submit" className="rounded-xl bg-medicalBlue px-4 py-3 font-semibold text-white">
          <FaSearch className="inline" /> Search
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </form>
  );
}
