import { useState } from 'react';
import type { OCRConfig } from '../types';
import { GEMINI_DEFAULT_MODEL, QUOTA_BLOCKED_MODELS, STORAGE_KEY_OCR_CONFIG } from '../constants';

const DEFAULT_CONFIG: OCRConfig = {
  method: 'gemini',
  geminiModel: GEMINI_DEFAULT_MODEL,
};

function loadStoredConfig(): OCRConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_OCR_CONFIG);
    if (stored) return normalizeConfig(JSON.parse(stored) as OCRConfig);
  } catch {
    // Corrupted storage — fall back to default.
  }
  return DEFAULT_CONFIG;
}

function normalizeConfig(config: OCRConfig): OCRConfig {
  if (config.method !== 'gemini') return config;

  const geminiModel = config.geminiModel?.trim();
  if (!geminiModel || QUOTA_BLOCKED_MODELS.has(geminiModel)) {
    return { ...config, geminiModel: GEMINI_DEFAULT_MODEL };
  }

  return config;
}

export function useOCRConfig() {
  const [config, setConfigState] = useState<OCRConfig>(loadStoredConfig);

  const setConfig = (newConfig: OCRConfig) => {
    setConfigState(newConfig);
    try {
      localStorage.setItem(STORAGE_KEY_OCR_CONFIG, JSON.stringify(newConfig));
    } catch (error) {
      console.error('Failed to save OCR config to localStorage:', error);
    }
  };

  return { config, setConfig };
}
