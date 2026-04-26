import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export function useVoiceInput(onResult, mode = 'search') {
  const [listening, setListening] = useState(false);
  const navigate = useNavigate();
  const onResultRef = useRef(onResult);

  // Update ref when callback changes to avoid re-initializing recognition
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  const recognition = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;

    const rec = new SR();
    const savedLang = localStorage.getItem('imai_lang') || 'en-IN';
    rec.lang = savedLang === 'hi' ? 'hi-IN' : 'en-IN';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.continuous = mode === 'navigation';

    rec.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      
      if (mode === 'navigation') {
        if (transcript.includes('home') || transcript.includes('घर')) navigate('/');
        else if (transcript.includes('search') || transcript.includes('खोज')) navigate('/search');
        else if (transcript.includes('emergency') || transcript.includes('आपातकालीन')) navigate('/emergency');
        else if (transcript.includes('map') || transcript.includes('नक्शा')) navigate('/map');
        else if (transcript.includes('settings') || transcript.includes('सेटिंग')) navigate('/settings');
        else if (transcript.includes('login') || transcript.includes('लॉगिन')) navigate('/login');
        else onResultRef.current?.(transcript);
      } else {
        onResultRef.current?.(transcript);
        setListening(false);
      }
    };

    rec.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      if (event.error === 'not-allowed') {
        setListening(false);
      }
    };

    rec.onend = () => {
      // If navigation mode is active, we might want to restart listening
      if (mode === 'navigation' && listening) {
        try {
          rec.start();
        } catch (e) {
          // Already started or busy
        }
      } else {
        setListening(false);
      }
    };

    return rec;
  }, [mode, navigate, listening]);

  const startListening = useCallback(() => {
    if (!recognition) return;
    try {
      setListening(true);
      recognition.start();
    } catch (e) {
      console.warn("Recognition already started");
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (!recognition) return;
    setListening(false);
    recognition.stop();
  }, [recognition]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognition) recognition.stop();
    };
  }, [recognition]);

  return { listening, supported: Boolean(recognition), startListening, stopListening };
}
