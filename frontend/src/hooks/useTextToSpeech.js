import { useCallback } from 'react';

export function useTextToSpeech() {
  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    const savedLang = localStorage.getItem('imai_lang') || 'en-IN';
    utterance.lang = savedLang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, []);

  return { speak, supported: Boolean(window.speechSynthesis) };
}
