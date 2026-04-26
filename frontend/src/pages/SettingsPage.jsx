import { useEffect, useState } from 'react';
import { FaUniversalAccess, FaVolumeUp, FaEye, FaUser, FaLanguage } from 'react-icons/fa';

const modeItems = [
  { id: 'simple', title: 'Simple', subtitle: 'Big buttons, fewer distractions', icon: <FaUser /> },
  { id: 'standard', title: 'Standard', subtitle: 'Balanced default', icon: <span>✦</span> },
  { id: 'accessibility', title: 'Accessibility', subtitle: 'High contrast & voice', icon: <FaEye /> },
];

const sizeItems = ['S', 'M', 'L', 'XL'];

export default function SettingsPage() {
  const [experienceMode, setExperienceMode] = useState(localStorage.getItem('imai_experience_mode') || 'simple');
  const [largeText, setLargeText] = useState(localStorage.getItem('imai_large_text') === '1');
  const [highContrast, setHighContrast] = useState(localStorage.getItem('imai_high_contrast') === '1');
  const [reduceAnimation, setReduceAnimation] = useState(localStorage.getItem('imai_reduce_animation') === '1');
  const [voiceNavigation, setVoiceNavigation] = useState(localStorage.getItem('imai_voice_navigation') === '1');
  const [spokenFeedback, setSpokenFeedback] = useState(localStorage.getItem('imai_spoken_feedback') !== '0');
  const [language, setLanguage] = useState(localStorage.getItem('imai_lang') === 'hi' ? 'Hindi' : 'English');
  const [textSize, setTextSize] = useState(localStorage.getItem('imai_text_size') || 'S');

  useEffect(() => {
    localStorage.setItem('imai_experience_mode', experienceMode);
    localStorage.setItem('imai_large_text', largeText ? '1' : '0');
    localStorage.setItem('imai_high_contrast', highContrast ? '1' : '0');
    localStorage.setItem('imai_reduce_animation', reduceAnimation ? '1' : '0');
    localStorage.setItem('imai_voice_navigation', voiceNavigation ? '1' : '0');
    localStorage.setItem('imai_spoken_feedback', spokenFeedback ? '1' : '0');
    localStorage.setItem('imai_lang', language === 'Hindi' ? 'hi' : 'en');
    localStorage.setItem('imai_text_size', textSize);

    document.body.classList.toggle('large-text', largeText);
    document.body.classList.toggle('high-contrast', highContrast);
    document.body.classList.toggle('reduce-motion', reduceAnimation);

    if (spokenFeedback && window.speechSynthesis) {
      const msg = new SpeechSynthesisUtterance(`${experienceMode} mode active. Language set to ${language}.`);
      msg.lang = language === 'Hindi' ? 'hi-IN' : 'en-IN';
      msg.rate = 0.95;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(msg);
    }
  }, [experienceMode, largeText, highContrast, reduceAnimation, voiceNavigation, spokenFeedback, language, textSize]);

  const resetAll = () => {
    setExperienceMode('simple');
    setLargeText(false);
    setHighContrast(false);
    setReduceAnimation(false);
    setVoiceNavigation(false);
    setSpokenFeedback(true);
    setLanguage('English');
    setTextSize('S');
    localStorage.removeItem('imai_access_mode');
    localStorage.removeItem('imai_assistant_done');
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5 py-4">
      <section>
        <h1 className="brand-font text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-600">Make IndiaMedicare AI yours.</p>
      </section>

      <section className="glass-card space-y-3 p-5">
        <h2 className="text-base font-semibold text-slate-900">Experience mode</h2>
        <p className="text-sm text-slate-500">Choose how content is displayed.</p>
        <div className="grid gap-3 md:grid-cols-3">
          {modeItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setExperienceMode(item.id)}
              className={`rounded-2xl border p-4 text-left ${
                experienceMode === item.id ? 'border-blue-800 bg-sky-100 text-blue-900' : 'border-slate-300'
              }`}
            >
              <p className="mb-2 text-lg">{item.icon}</p>
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="text-xs text-slate-500">{item.subtitle}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="glass-card p-5">
        <h2 className="mb-2 text-base font-semibold text-slate-900">Text size</h2>
        <p className="mb-3 text-sm text-slate-500">Pick a comfortable reading size.</p>
        <div className="grid grid-cols-4 gap-3">
          {sizeItems.map((size) => (
            <button
              key={size}
              onClick={() => {
                setTextSize(size);
                setLargeText(size !== 'S');
              }}
              className={`rounded-xl border py-3 text-sm font-semibold ${textSize === size ? 'border-blue-800 bg-sky-100 text-blue-900' : 'border-slate-300'}`}
            >
              {size}
            </button>
          ))}
        </div>
      </section>

      <section className="glass-card p-5">
        <h2 className="mb-2 flex items-center gap-2 text-base font-semibold text-slate-900">
          <FaLanguage /> Language
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {['English', 'Hindi'].map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`rounded-xl border py-3 text-sm font-semibold ${language === lang ? 'border-blue-800 bg-sky-100 text-blue-900' : 'border-slate-300'}`}
            >
              {lang === 'Hindi' ? 'हिंदी' : lang}
            </button>
          ))}
        </div>
      </section>

      <section className="glass-card space-y-3 p-5">
        <h2 className="text-base font-semibold text-slate-900">Visual & motion</h2>
        <button onClick={() => setHighContrast((v) => !v)} className="flex w-full items-center justify-between rounded-xl border border-slate-300 p-3 text-sm">
          <span className="flex items-center gap-2"><FaUniversalAccess /> High contrast</span>
          <span className={`h-6 w-11 rounded-full transition ${highContrast ? 'bg-blue-900' : 'bg-slate-200'}`} />
        </button>
        <button onClick={() => setReduceAnimation((v) => !v)} className="flex w-full items-center justify-between rounded-xl border border-slate-300 p-3 text-sm">
          <span>Reduce animations</span>
          <span className={`h-6 w-11 rounded-full transition ${reduceAnimation ? 'bg-blue-900' : 'bg-slate-200'}`} />
        </button>
      </section>

      <section className="glass-card space-y-3 p-5">
        <h2 className="text-base font-semibold text-slate-900">Voice & screen reader</h2>
        <button onClick={() => setVoiceNavigation((v) => !v)} className="flex w-full items-center justify-between rounded-xl border border-slate-300 p-3 text-sm">
          <span>Voice navigation</span>
          <span className={`h-6 w-11 rounded-full transition ${voiceNavigation ? 'bg-blue-900' : 'bg-slate-200'}`} />
        </button>
        <button onClick={() => setSpokenFeedback((v) => !v)} className="flex w-full items-center justify-between rounded-xl border border-slate-300 p-3 text-sm">
          <span className="flex items-center gap-2"><FaVolumeUp /> Spoken UI feedback</span>
          <span className={`h-6 w-11 rounded-full transition ${spokenFeedback ? 'bg-blue-900' : 'bg-slate-200'}`} />
        </button>
      </section>

      <button onClick={resetAll} className="text-sm text-slate-500 underline">
        Reset all settings
      </button>
      <section className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
        Accessibility note: camera preview is optional and does not diagnose disability. You can choose mode manually.
      </section>
    </div>
  );
}
