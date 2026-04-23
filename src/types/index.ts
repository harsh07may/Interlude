export interface OCRExtraction {
  date: string;
  entries: JournalEntry[];
  rawText: string;
  confidence: number;
}

export interface JournalEntry {
  timestamp: string;
  text: string;
}

export interface OCRConfig {
  method: 'gemini' | 'backend-api';
  geminiApiKey?: string;
  geminiModel?: string;
  backendUrl?: string;
}

export interface UploadedImage {
  file: File;
  preview: string;
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
