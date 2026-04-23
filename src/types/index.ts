export interface OCRExtraction {
  date: string;
  entries: JournalEntry[];
  rawText: string;
  confidence: number;
}

export interface JournalEntry {
  id?: string;
  timestamp: string;
  text: string;
}

export interface ScannedPage {
  id: string;
  title: string;
  tags: string[];
  extraction: OCRExtraction;
  createdAt: string;
  updatedAt: string;
}

export interface OCRConfig {
  method: 'gemini' | 'backend-api';
  geminiApiKey?: string;
  geminiModel?: string;
  backendUrl?: string;
}

export interface OCRError {
  code: 'format-unsupported' | 'file-too-large' | 'ocr-failed' | 'backend-unreachable';
  message: string;
}

export interface BackendOCRResponse {
  success: boolean;
  data?: {
    text: string;
    confidence: number;
  };
  error?: string;
}
