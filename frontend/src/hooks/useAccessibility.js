import { useEffect, useState } from 'react';

export function useAccessibility() {
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    const root = document.body;
    root.classList.toggle('large-text', largeText);
    root.classList.toggle('high-contrast', highContrast);
  }, [largeText, highContrast]);

  return {
    largeText,
    highContrast,
    setLargeText,
    setHighContrast,
  };
}
