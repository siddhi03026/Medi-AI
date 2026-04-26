import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaPhone, FaSlidersH } from 'react-icons/fa';
import AccessibilityAssistant from './AccessibilityAssistant';
import Footer from './Footer';
import Navbar from './Navbar';
import { useAccessibilityMode } from '../hooks/useAccessibilityMode';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, setMode } = useAccessibilityMode();

  useEffect(() => {
    if (mode !== 'blind' || !window.speechSynthesis) return;
    const pathNames = {
      '/': 'Home page',
      '/search': 'Search page',
      '/map': 'Map page',
      '/emergency': 'Emergency page',
      '/settings': 'Settings page',
      '/login': 'Login page',
      '/signup': 'Signup page',
    };

    const msg = new SpeechSynthesisUtterance(`${pathNames[location.pathname] || 'Page loaded'}`);
    msg.lang = 'en-IN';
    msg.rate = 1.0;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(msg);
  }, [location.pathname, mode]);

  useEffect(() => {
    if (mode !== 'blind') return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    recognition.onresult = (event) => {
      const text = event.results[event.results.length - 1][0].transcript.toLowerCase();
      if (text.includes('home')) navigate('/');
      if (text.includes('search')) navigate('/search');
      if (text.includes('map')) navigate('/map');
      if (text.includes('emergency')) navigate('/emergency');
      if (text.includes('settings')) navigate('/settings');
      if (text.includes('login') || text.includes('log in')) navigate('/login');
      if (text.includes('scroll down')) window.scrollBy({ top: 350, behavior: 'smooth' });
      if (text.includes('scroll up')) window.scrollBy({ top: -350, behavior: 'smooth' });
    };

    recognition.onerror = () => {
      try { recognition.stop(); } catch (error) { /* no-op */ }
    };

    recognition.onend = () => {
      try { recognition.start(); } catch (error) { /* no-op */ }
    };

    try { recognition.start(); } catch (error) { /* no-op */ }

    return () => {
      try { recognition.stop(); } catch (error) { /* no-op */ }
    };
  }, [mode, navigate]);

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
        onClick={() => navigate('/emergency')}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-xl"
        aria-label="Emergency"
      >
        <FaPhone /> Emergency
      </button>
    </div>
  );
}
