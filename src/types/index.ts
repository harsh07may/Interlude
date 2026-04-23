// OCR result from any processor
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

// OCR configuration
export interface OCRConfig {
  method: 'client-side' | 'backend-api';
  backendUrl?: string;
}

// Image processing
export interface UploadedImage {
  file: File;
  preview: string;
}

// Error types
export interface OCRError {
  code: 'format-unsupported' | 'file-too-large' | 'ocr-failed' | 'backend-unreachable';
  message: string;
}

// Backend API response
export interface BackendOCRResponse {
  success: boolean;
  data?: {
    text: string;
    confidence: number;
  };
  error?: string;
}