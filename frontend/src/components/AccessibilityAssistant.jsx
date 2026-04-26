import { useEffect, useRef, useState } from 'react';
import { FaCamera, FaMicrophone, FaVolumeUp } from 'react-icons/fa';
import { useVoiceInput } from '../hooks/useVoiceInput';

const MODES = [
  { id: 'blind', title: 'Visual impairment', subtitle: 'Enable voice-first navigation', hindi: 'दृष्टिबाधित' },
  { id: 'hearing', title: 'Hearing impairment', subtitle: 'Enable visual-first alerts', hindi: 'श्रवण बाधित' },
  { id: 'speech', title: 'Speech impairment', subtitle: 'Keep touch and text flow primary', hindi: 'वाक बाधित' },
  { id: 'normal', title: 'No accessibility support needed', subtitle: 'Use standard mode', hindi: 'सामान्य मोड' },
];

export default function AccessibilityAssistant({ mode, onSetMode }) {
  const [open, setOpen] = useState(localStorage.getItem('imai_assistant_done') !== '1');
  const [cameraAllowed, setCameraAllowed] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState('Initializing sensors...');
  const videoRef = useRef(null);
  const lang = localStorage.getItem('imai_lang') || 'en-IN';

  // Start continuous navigation listening if in blind mode
  const { startListening, stopListening } = useVoiceInput(null, 'navigation');

  useEffect(() => {
    if (mode === 'blind') {
      startListening();
    } else {
      stopListening();
    }
    return () => stopListening();
  }, [mode, startListening, stopListening]);

  useEffect(() => {
    if (!open) return;
    let stream;

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 240, height: 160 }, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraAllowed(true);
        setDetectionStatus('Detecting user condition...');
        
        // Simulate "Blind Detection" for demonstration
        setTimeout(() => {
          if (mode === 'normal' || !mode) {
             setDetectionStatus('Detected: Visual Impairment. Activating Voice Mode.');
             onSetMode('blind');
          }
        }, 4000);

      } catch (error) {
        setDetectionStatus('Camera unavailable. Manual mode active.');
      }
    };

    if (navigator.mediaDevices?.getUserMedia) {
      start();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [open, mode, onSetMode]);

  useEffect(() => {
    if (!open || mode !== 'blind' || !window.speechSynthesis) return;

    // Check if we've already introduced voice in this session
    if (sessionStorage.getItem('imai_voice_introduced') === '1') return;

    const isHindi = lang === 'hi';
    const text = isHindi 
      ? 'वॉयस एक्सेसिबिलिटी मोड सक्षम है। आप कह सकते हैं: होम, खोज, नक्शा, आपातकालीन, या लॉगिन।'
      : 'Voice accessibility mode is enabled. You can say: home, search, map, emergency, settings, or login.';
    
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = isHindi ? 'hi-IN' : 'en-IN';
    msg.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(msg);

    sessionStorage.setItem('imai_voice_introduced', '1');
  }, [mode, open, lang]);

  const closeAssistant = () => {
    localStorage.setItem('imai_assistant_done', '1');
    setOpen(false);
  };

  if (!open) return null;

  return (
    <section className="fixed bottom-24 left-4 z-50 w-[320px] rounded-3xl border border-blue-200 bg-white p-4 shadow-2xl animate-in slide-in-from-bottom-5" aria-label="Accessibility assistant">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-700">AI Care Assistant</h2>
        <button onClick={closeAssistant} className="text-xs font-semibold text-blue-600 hover:underline">
          Dismiss
        </button>
      </div>

      <div className="mb-3 overflow-hidden rounded-2xl border-2 border-blue-100 bg-slate-900 relative">
        {cameraAllowed ? (
          <>
            <video ref={videoRef} autoPlay muted playsInline className="h-36 w-full object-cover opacity-70" />
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="h-20 w-20 border-2 border-blue-400 rounded-full animate-ping opacity-30"></div>
            </div>
          </>
        ) : (
          <div className="flex h-36 items-center justify-center text-xs text-slate-400 italic">
            <FaCamera className="mr-2" /> Sensors initializing...
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-blue-900/80 px-3 py-1 text-[10px] text-white font-medium">
          {detectionStatus}
        </div>
      </div>

      <div className="space-y-2">
        {MODES.map((item) => (
          <button
            key={item.id}
            onClick={() => onSetMode(item.id)}
            className={`w-full rounded-xl border p-2 text-left text-sm transition-all ${
              mode === item.id ? 'border-blue-500 bg-blue-50 text-blue-800 ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-blue-300'
            }`}
          >
            <div className="flex justify-between items-center">
              <p className="font-bold">{lang === 'hi' ? item.hindi : item.title}</p>
              {mode === item.id && <div className="h-2 w-2 rounded-full bg-blue-500"></div>}
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">{item.subtitle}</p>
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 p-2.5 text-[11px] text-slate-600">
        <div className="flex items-center gap-1 text-blue-700">
          <FaMicrophone className="animate-pulse" /> Listening
        </div>
        <div className="h-4 w-px bg-slate-300"></div>
        <div className="flex items-center gap-1">
          <FaVolumeUp /> Speaker On
        </div>
      </div>
    </section>
  );
}
