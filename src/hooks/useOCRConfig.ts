import { useState, useEffect } from 'react';
import type { OCRConfig } from '../types';

const STORAGE_KEY = 'journal-digitizer-ocr-config';

const DEFAULT_CONFIG: OCRConfig = {
  method: 'client-side',
};

export function useOCRConfig() {
  const [config, setConfigState] = useState<OCRConfig>(DEFAULT_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setConfigState(parsed);
      }
    } catch (error) {
      console.error('Failed to load OCR config from localStorage:', error);
    }
    setIsLoaded(true);
  }, []);

  const setConfig = (newConfig: OCRConfig) => {
    setConfigState(newConfig);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    } catch (error) {
      console.error('Failed to save OCR config to localStorage:', error);
    }
  };

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
  };

  return {
    config,
    setConfig,
    resetConfig,
    isLoaded,
  };
}
