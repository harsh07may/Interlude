import { useState } from 'react';
import type { OCRConfig } from '../types';

const STORAGE_KEY = 'journal-digitizer-ocr-config';

const DEFAULT_CONFIG: OCRConfig = {
  method: 'gemini',
};

function loadStoredConfig(): OCRConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as OCRConfig;
  } catch {
    // corrupted storage — fall back to default
  }
  return DEFAULT_CONFIG;
}

export function useOCRConfig() {
  // Lazy initializer: reads localStorage once on mount, no re-render needed
  const [config, setConfigState] = useState<OCRConfig>(loadStoredConfig);

  const setConfig = (newConfig: OCRConfig) => {
    setConfigState(newConfig);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    } catch (error) {
      console.error('Failed to save OCR config to localStorage:', error);
    }
  };

  const resetConfig = () => setConfig(DEFAULT_CONFIG);

  return { config, setConfig, resetConfig };
}
