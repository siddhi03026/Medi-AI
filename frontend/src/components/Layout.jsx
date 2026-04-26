import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaMicrophone, FaMicrophoneSlash, FaPhone, FaSlidersH, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import AccessibilityAssistant from './AccessibilityAssistant';
import Footer from './Footer';
import Navbar from './Navbar';
import { useAccessibilityMode } from '../hooks/useAccessibilityMode';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, setMode } = useAccessibilityMode();
  const recognitionRef = useRef(null);
  const speechPrimedRef = useRef(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceToggleSeq, setVoiceToggleSeq] = useState(0);
  const [spokenFeedbackEnabled, setSpokenFeedbackEnabled] = useState(localStorage.getItem('imai_spoken_feedback') !== '0');

  const speakText = (text) => {
    if (!window.speechSynthesis || !text?.trim()) return;
    const savedLang = localStorage.getItem('imai_lang') || 'en';
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = savedLang === 'hi' ? 'hi-IN' : 'en-IN';
    msg.rate = 0.96;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(msg);
  };

  const toggleSpokenFeedback = () => {
    const nextEnabled = !spokenFeedbackEnabled;
    localStorage.setItem('imai_spoken_feedback', nextEnabled ? '1' : '0');
    setSpokenFeedbackEnabled(nextEnabled);

    if (nextEnabled) {
      const savedLang = localStorage.getItem('imai_lang') || 'en';
      speakText(savedLang === 'hi' ? 'वॉयस फ़ीडबैक चालू हो गया है।' : 'Voice feedback is enabled.');
    } else if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const isVoiceNavigationEnabled = () => {
    const stored = localStorage.getItem('imai_voice_navigation');
    if (mode === 'blind') return true;
    if (stored === null) return false;
    return stored === '1';
  };

  const toggleVoiceNavigation = () => {
    const nextEnabled = !isVoiceNavigationEnabled();
    localStorage.setItem('imai_voice_navigation', nextEnabled ? '1' : '0');

    if (!nextEnabled && recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (error) { /* no-op */ }
      setVoiceActive(false);
    }

    const savedLang = localStorage.getItem('imai_lang') || 'en';
    if (window.speechSynthesis) {
      speakText(
        nextEnabled
          ? (savedLang === 'hi' ? 'वॉयस नेविगेशन चालू हो गया है।' : 'Voice navigation enabled.')
          : (savedLang === 'hi' ? 'वॉयस नेविगेशन बंद हो गया है।' : 'Voice navigation disabled.')
      );
    }

    setVoiceToggleSeq((v) => v + 1);
  };

  useEffect(() => {
    if (localStorage.getItem('imai_spoken_feedback') === null) {
      localStorage.setItem('imai_spoken_feedback', '1');
      setSpokenFeedbackEnabled(true);
    }

    const refreshSpokenSetting = () => {
      setSpokenFeedbackEnabled(localStorage.getItem('imai_spoken_feedback') !== '0');
    };

    const primeSpeech = () => {
      if (speechPrimedRef.current || !window.speechSynthesis) return;
      speechPrimedRef.current = true;
      const msg = new SpeechSynthesisUtterance('');
      msg.volume = 0;
      window.speechSynthesis.speak(msg);
    };

    window.addEventListener('storage', refreshSpokenSetting);
    window.addEventListener('pointerdown', primeSpeech, { once: true });
    window.addEventListener('keydown', primeSpeech, { once: true });

    return () => {
      window.removeEventListener('storage', refreshSpokenSetting);
      window.removeEventListener('pointerdown', primeSpeech);
      window.removeEventListener('keydown', primeSpeech);
    };
  }, []);

  useEffect(() => {
    if (!window.speechSynthesis) return;

    if (!spokenFeedbackEnabled && mode !== 'blind') return;

    const savedLang = localStorage.getItem('imai_lang') || 'en';
    const isHindi = savedLang === 'hi';
    const pathNames = {
      '/': isHindi ? 'होम पेज' : 'Home page',
      '/search': isHindi ? 'खोज पेज' : 'Search page',
      '/map': isHindi ? 'मैप पेज' : 'Map page',
      '/emergency': isHindi ? 'इमरजेंसी पेज' : 'Emergency page',
      '/settings': isHindi ? 'सेटिंग्स पेज' : 'Settings page',
      '/login': isHindi ? 'लॉगिन पेज' : 'Login page',
      '/signup': isHindi ? 'साइन अप पेज' : 'Signup page',
      '/forgot-password': isHindi ? 'पासवर्ड रीसेट पेज' : 'Forgot password page',
    };

    const timeoutId = window.setTimeout(() => {
      const main = document.querySelector('main');
      const heading = main?.querySelector('h1, h2')?.textContent?.trim();
      const intro = main?.querySelector('p')?.textContent?.trim();

      const chunks = [pathNames[location.pathname] || (isHindi ? 'पेज खुल गया है' : 'Page loaded')];
      if (heading) chunks.push(heading);
      if (intro) chunks.push(intro);

      speakText(chunks.join('. '));
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [location.pathname, mode, spokenFeedbackEnabled]);

  useEffect(() => {
    const voiceNavigationEnabled = mode === 'blind' || localStorage.getItem('imai_voice_navigation') === '1';
    if (!voiceNavigationEnabled) return;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const savedLang = localStorage.getItem('imai_lang') || 'en';
    const isHindi = savedLang === 'hi';

    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = isHindi ? 'hi-IN' : 'en-IN';

    recognition.onstart = () => {
      setVoiceActive(true);
    };

    recognition.onresult = (event) => {
      const text = event.results[event.results.length - 1][0].transcript.toLowerCase();

      if (text.includes('home') || text.includes('होम') || text.includes('घर')) navigate('/');
      if (text.includes('search') || text.includes('खोज')) navigate('/search');
      if (text.includes('map') || text.includes('मैप') || text.includes('नक्शा')) navigate('/map');
      if (text.includes('emergency') || text.includes('इमरजेंसी') || text.includes('आपातकाल')) navigate('/emergency');
      if (text.includes('settings') || text.includes('सेटिंग')) navigate('/settings');
      if (text.includes('login') || text.includes('log in') || text.includes('लॉगिन')) navigate('/login');
      if (text.includes('scroll down') || text.includes('नीचे')) window.scrollBy({ top: 350, behavior: 'smooth' });
      if (text.includes('scroll up') || text.includes('ऊपर')) window.scrollBy({ top: -350, behavior: 'smooth' });
    };

    recognition.onerror = () => {
      setVoiceActive(false);
      try { recognition.stop(); } catch (error) { /* no-op */ }
    };

    recognition.onend = () => {
      setVoiceActive(false);
      try { recognition.start(); } catch (error) { /* no-op */ }
    };

    try { recognition.start(); } catch (error) { /* no-op */ }

    return () => {
      recognitionRef.current = null;
      try { recognition.stop(); } catch (error) { /* no-op */ }
      setVoiceActive(false);
    };
  }, [mode, navigate, voiceToggleSeq]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      <Footer />

      <AccessibilityAssistant mode={mode} onSetMode={setMode} />

      <button onClick={() => navigate('/settings')} className="floating-action left-6 flex h-12 w-12 items-center justify-center text-base text-blue-800" aria-label="Open accessibility settings">
        <FaSlidersH />
      </button>

      <button
        onClick={toggleSpokenFeedback}
        className={`floating-action left-20 flex h-12 min-w-[48px] items-center justify-center px-3 text-base ${spokenFeedbackEnabled ? 'text-blue-700' : 'text-slate-500'}`}
        aria-label={spokenFeedbackEnabled ? 'Spoken feedback on' : 'Spoken feedback off'}
        title={spokenFeedbackEnabled ? 'Spoken feedback is on' : 'Enable spoken feedback'}
      >
        {spokenFeedbackEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
      </button>

      <button
        onClick={toggleVoiceNavigation}
        className={`floating-action left-[8.5rem] flex h-12 min-w-[48px] items-center justify-center px-3 text-base ${voiceActive ? 'text-emerald-700' : 'text-slate-700'}`}
        aria-label={voiceActive ? 'Voice navigation active' : 'Toggle voice navigation'}
        title={voiceActive ? 'Voice navigation is active' : 'Enable voice navigation'}
      >
        {voiceActive ? <FaMicrophone /> : <FaMicrophoneSlash />}
      </button>

      <button
        onClick={() => navigate('/emergency')}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-xl"
        aria-label="Emergency"
      >
        <FaPhone /> Emergency
      </button>
    </div>
  );
}
