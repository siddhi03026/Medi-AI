export default function AccessibilityPanel({ largeText, highContrast, onToggleLargeText, onToggleContrast }) {
  return (
    <section className="glass-card p-4" aria-label="Accessibility options">
      <h2 className="brand-font text-lg font-bold text-medicalBlue">Accessibility</h2>
      <div className="mt-3 flex flex-wrap gap-3">
        <button
          onClick={onToggleLargeText}
          className="rounded-lg border border-medicalBlue/30 px-4 py-2 font-semibold text-medicalBlue"
        >
          {largeText ? 'Disable large text' : 'Enable large text'}
        </button>
        <button
          onClick={onToggleContrast}
          className="rounded-lg border border-medicalGreen/30 px-4 py-2 font-semibold text-medicalGreen"
        >
          {highContrast ? 'Disable high contrast' : 'Enable high contrast'}
        </button>
      </div>
      <p className="mt-3 text-sm text-slate-600">
        Keyboard tip: Use Tab and Shift+Tab to navigate all controls.
      </p>
    </section>
  );
}
