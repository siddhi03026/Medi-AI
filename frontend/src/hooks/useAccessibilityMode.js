import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'imai_access_mode';

export function useAccessibilityMode() {
  const [mode, setMode] = useState(localStorage.getItem(STORAGE_KEY) || 'normal');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
    document.body.classList.toggle('blind-mode', mode === 'blind');
    document.body.classList.toggle('hearing-mode', mode === 'hearing');

    const isBlind = mode === 'blind';
    document.body.classList.toggle('large-text', isBlind || localStorage.getItem('imai_large_text') === '1');
    document.body.classList.toggle('high-contrast', isBlind || localStorage.getItem('imai_high_contrast') === '1');
  }, [mode]);

  const labels = useMemo(
    () => ({
      normal: 'Standard mode active',
      blind: 'Voice-first accessibility mode active',
      hearing: 'Visual-first accessibility mode active',
      speech: 'Input-first accessibility mode active',
    }),
    []
  );

  return {
    mode,
    setMode,
    modeLabel: labels[mode] || labels.normal,
  };
}
