import { useState } from 'react';
import type { OCRConfig } from '../types';
import { GEMINI_DEFAULT_MODEL } from '../lib/geminiOcr';

const STORAGE_KEY = 'journal-digitizer-ocr-config';
const QUOTA_BLOCKED_DEFAULT_MODELS = new Set(['gemini-3.1-pro', 'gemini-3.1-pro-preview']);

const DEFAULT_CONFIG: OCRConfig = {
  method: 'gemini',
  geminiModel: GEMINI_DEFAULT_MODEL,
};

function loadStoredConfig(): OCRConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return normalizeConfig(JSON.parse(stored) as OCRConfig);
  } catch {
    // corrupted storage — fall back to default
  }
  return DEFAULT_CONFIG;
}

function normalizeConfig(config: OCRConfig): OCRConfig {
  if (config.method !== 'gemini') return config;

  const geminiModel = config.geminiModel?.trim();
  if (!geminiModel || QUOTA_BLOCKED_DEFAULT_MODELS.has(geminiModel)) {
    return { ...config, geminiModel: GEMINI_DEFAULT_MODEL };
  }

  return config;
}

export function useOCRConfig() {
  const [config, setConfigState] = useState<OCRConfig>(loadStoredConfig);

  const setConfig = (newConfig: OCRConfig) => {
    setConfigState(newConfig);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    } catch (error) {
      console.error('Failed to save OCR config to localStorage:', error);
    }
  };

  return { config, setConfig };
}
