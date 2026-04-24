import { useState } from 'react';
import type { OCRConfig } from '../types';
import {
  GEMINI_DEFAULT_MODEL,
  QUOTA_BLOCKED_MODELS,
  SESSION_KEY_GEMINI_API_KEY,
  STORAGE_KEY_OCR_CONFIG,
} from '../constants';

const DEFAULT_CONFIG: OCRConfig = {
  method: 'gemini',
  geminiModel: GEMINI_DEFAULT_MODEL,
};

function isValidConfig(value: unknown): value is OCRConfig {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  if (v.method !== 'gemini' && v.method !== 'backend-api') return false;
  if (v.geminiModel !== undefined && typeof v.geminiModel !== 'string') return false;
  if (v.backendUrl !== undefined && typeof v.backendUrl !== 'string') return false;
  return true;
}

function loadStoredConfig(): OCRConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_OCR_CONFIG);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (!isValidConfig(parsed)) return DEFAULT_CONFIG;
      const config = normalizeConfig(parsed);
      // API key lives in sessionStorage only — merge it back in on load.
      const sessionKey = sessionStorage.getItem(SESSION_KEY_GEMINI_API_KEY) ?? undefined;
      return { ...config, geminiApiKey: sessionKey };
    }
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
      // Store API key in sessionStorage (cleared on tab close) — never in localStorage.
      if (newConfig.geminiApiKey) {
        sessionStorage.setItem(SESSION_KEY_GEMINI_API_KEY, newConfig.geminiApiKey);
      } else {
        sessionStorage.removeItem(SESSION_KEY_GEMINI_API_KEY);
      }
      const { geminiApiKey: _, ...configWithoutKey } = newConfig;
      localStorage.setItem(STORAGE_KEY_OCR_CONFIG, JSON.stringify(configWithoutKey));
    } catch (error) {
      console.error('Failed to save OCR config:', error);
    }
  };

  return { config, setConfig };
}
