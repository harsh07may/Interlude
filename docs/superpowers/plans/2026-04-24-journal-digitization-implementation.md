# Journal Digitization App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Phase 1 MVP of Journal Digitization App — a PWA that captures journal pages, extracts timestamps/text via OCR, and displays results in journal-style layout.

**Architecture:** Modal-based workflow with configurable OCR (client-side PaddleOCR default, custom backend API optional). Responsive design from day one. Production-ready code with error handling and type safety.

**Tech Stack:** React 19, TypeScript 6.0, Vite, PaddleOCR.js (client-side OCR), plain CSS

---

## File Structure

```
src/
├── App.tsx                          # Main app entry
├── App.css                          # Global styling
├── types/
│   └── index.ts                     # TypeScript interfaces
├── lib/
│   ├── ocrParser.ts                 # Parse OCR output → structured format
│   ├── paddleocr.ts                 # PaddleOCR client wrapper
│   ├── backendOcr.ts                # Backend API client
│   └── utils.ts                     # Helpers (validation, formatting)
├── hooks/
│   ├── useOCRConfig.ts              # OCR settings management (localStorage)
│   └── useImageUpload.ts            # Image capture/upload handling
└── components/
    ├── Dashboard.tsx                # Main dashboard screen
    ├── DigitizeModal.tsx            # Modal container & orchestration
    ├── UploadArea.tsx               # Drag-drop + camera/file input
    ├── ResultsDisplay.tsx           # Journal-style results layout
    └── SettingsModal.tsx            # OCR configuration modal
```

---

## Task 1: TypeScript Types & Interfaces

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Create types file with all interfaces**

Create `src/types/index.ts`:
```typescript
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
```

- [ ] **Step 2: Verify file was created**

Run: `ls -la src/types/index.ts`
Expected: File exists with correct content

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add TypeScript interfaces for OCR, config, and types"
```

---

## Task 2: OCR Parser Utility + Tests

**Files:**
- Create: `src/lib/ocrParser.ts`
- Create: `src/lib/ocrParser.test.ts`

- [ ] **Step 1: Write failing tests for OCR parser**

Create `src/lib/ocrParser.test.ts`:
```typescript
import { parseOCROutput } from './ocrParser';

describe('parseOCROutput', () => {
  it('extracts timestamps and text from raw OCR output', () => {
    const rawText = `10:04 - Going to finish the first draft of the mindful productivity article.
10:46 - I fell into a Twitter blackhole again! Back to work.
11:45 - Made good progress. Need to get ready for meeting with Charlie.`;

    const result = parseOCROutput(rawText);

    expect(result.entries).toHaveLength(3);
    expect(result.entries[0]).toEqual({
      timestamp: '10:04',
      text: 'Going to finish the first draft of the mindful productivity article.',
    });
    expect(result.entries[1]).toEqual({
      timestamp: '10:46',
      text: 'I fell into a Twitter blackhole again! Back to work.',
    });
    expect(result.entries[2]).toEqual({
      timestamp: '11:45',
      text: 'Made good progress. Need to get ready for meeting with Charlie.',
    });
  });

  it('extracts date from raw text if present', () => {
    const rawText = `9th June '26, Monday
10:04 - First entry`;

    const result = parseOCROutput(rawText);

    expect(result.date).toBe(`9th June '26, Monday`);
    expect(result.entries).toHaveLength(1);
  });

  it('handles empty entries gracefully', () => {
    const rawText = '';
    const result = parseOCROutput(rawText);

    expect(result.entries).toHaveLength(0);
    expect(result.date).toBe('');
  });

  it('handles malformed timestamps', () => {
    const rawText = `Some random text without timestamps`;
    const result = parseOCROutput(rawText);

    expect(result.entries).toHaveLength(0);
  });

  it('handles timestamps with/without leading zeros', () => {
    const rawText = `9:30 - Morning entry
10:04 - Later entry`;

    const result = parseOCROutput(rawText);

    expect(result.entries).toHaveLength(2);
    expect(result.entries[0].timestamp).toBe('9:30');
    expect(result.entries[1].timestamp).toBe('10:04');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd src && npm test -- lib/ocrParser.test.ts 2>&1 || true`
Expected: Tests fail with "parseOCROutput is not defined"

- [ ] **Step 3: Implement OCR parser**

Create `src/lib/ocrParser.ts`:
```typescript
import { OCRExtraction, JournalEntry } from '../types';

/**
 * Parse raw OCR text into structured journal entries.
 * Expects format: "HH:MM - text content" per line (or similar timestamp format)
 * Optionally includes date at top of page.
 */
export function parseOCROutput(rawText: string): OCRExtraction {
  const lines = rawText.split('\n').map(line => line.trim()).filter(Boolean);
  
  let date = '';
  const entries: JournalEntry[] = [];

  // Extract date from first line if it doesn't contain a timestamp
  const datePattern = /^\d{1,2}(?:st|nd|rd|th)?\s+\w+\s+'?\d{2,4}|^\w+\s+\d{1,2}/i;
  if (lines.length > 0 && datePattern.test(lines[0])) {
    const firstLine = lines[0];
    // Check if first line is a date (doesn't match timestamp pattern)
    if (!/^\d{1,2}:\d{2}\s*-/.test(firstLine)) {
      date = firstLine;
      lines.shift();
    }
  }

  // Extract timestamp and text from remaining lines
  const timestampPattern = /^(\d{1,2}:\d{2})\s*[-–]\s*(.+)$/;
  
  for (const line of lines) {
    const match = line.match(timestampPattern);
    if (match) {
      entries.push({
        timestamp: match[1],
        text: match[2].trim(),
      });
    }
  }

  return {
    date,
    entries,
    rawText,
    confidence: 0.85, // Default confidence for MVP
  };
}

/**
 * Format OCRExtraction back to readable text (for copying to clipboard)
 */
export function formatExtractionAsText(extraction: OCRExtraction): string {
  let text = '';
  
  if (extraction.date) {
    text += `${extraction.date}\n\n`;
  }
  
  text += extraction.entries
    .map(entry => `${entry.timestamp} - ${entry.text}`)
    .join('\n');
  
  return text;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd src && npm test -- lib/ocrParser.test.ts`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add src/lib/ocrParser.ts src/lib/ocrParser.test.ts
git commit -m "feat: implement OCR parser with timestamp extraction"
```

---

## Task 3: PaddleOCR Client Wrapper

**Files:**
- Create: `src/lib/paddleocr.ts`

- [ ] **Step 1: Create PaddleOCR wrapper**

Create `src/lib/paddleocr.ts`:
```typescript
import { parseOCROutput } from './ocrParser';
import { OCRExtraction, OCRError } from '../types';

// Placeholder for PaddleOCR initialization
// We'll add the actual library import after npm install
let paddleOCR: any = null;

/**
 * Initialize PaddleOCR worker (async)
 * Call once at app startup
 */
export async function initializePaddleOCR(): Promise<void> {
  if (paddleOCR) return; // Already initialized

  try {
    // Dynamic import to avoid bundle bloat if not used
    const { PaddleOCR } = await import('paddleocr');
    paddleOCR = new PaddleOCR({
      ocr_version: 'pp-ocr-server',
      enable_mkldnn: true,
      use_angle_cls: true,
      lang: 'en', // English OCR
    });
  } catch (error) {
    console.error('Failed to initialize PaddleOCR:', error);
    throw new Error('OCR initialization failed');
  }
}

/**
 * Run OCR on an image using PaddleOCR
 * Returns structured extraction or throws OCRError
 */
export async function runClientSideOCR(image: File): Promise<OCRExtraction> {
  if (!paddleOCR) {
    throw {
      code: 'ocr-failed',
      message: 'OCR not initialized. Please reload the app.',
    } as OCRError;
  }

  try {
    // Validate image
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (image.size > maxSize) {
      throw {
        code: 'file-too-large',
        message: 'Image is too large. Please use a smaller file.',
      } as OCRError;
    }

    // Check format
    const validFormats = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validFormats.includes(image.type)) {
      throw {
        code: 'format-unsupported',
        message: 'Please upload JPG, PNG, or PDF.',
      } as OCRError;
    }

    // Convert file to data URL for PaddleOCR
    const imageDataUrl = await fileToDataUrl(image);

    // Run OCR
    const result = await paddleOCR.ocr(imageDataUrl);

    // Extract text from PaddleOCR result format
    const extractedText = flattenOCRResult(result);

    // Parse into journal format
    return parseOCROutput(extractedText);
  } catch (error) {
    if ((error as OCRError).code) {
      throw error; // Already an OCRError
    }
    throw {
      code: 'ocr-failed',
      message: 'Could not extract text. Try another image.',
    } as OCRError;
  }
}

/**
 * Convert File to data URL
 */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Flatten PaddleOCR result structure into plain text
 * PaddleOCR returns: [[text, confidence], ...]
 */
function flattenOCRResult(result: any[][]): string {
  return result
    .map(([text]: [string, number]) => text)
    .join('\n');
}
```

- [ ] **Step 2: Verify file structure**

Run: `ls -la src/lib/paddleocr.ts`
Expected: File exists

- [ ] **Step 3: Commit**

```bash
git add src/lib/paddleocr.ts
git commit -m "feat: create PaddleOCR client wrapper with error handling"
```

---

## Task 4: Backend OCR Client

**Files:**
- Create: `src/lib/backendOcr.ts`

- [ ] **Step 1: Implement backend OCR client**

Create `src/lib/backendOcr.ts`:
```typescript
import { parseOCROutput } from './ocrParser';
import { OCRExtraction, BackendOCRResponse, OCRError } from '../types';

/**
 * Send image to backend API for OCR processing
 * Backend is user-configured, so we don't know its exact format
 * but we expect: POST multipart/form-data with 'image' field
 * Response: { success: true, data: { text: string, confidence: number } }
 */
export async function runBackendOCR(
  image: File,
  backendUrl: string
): Promise<OCRExtraction> {
  try {
    // Validate inputs
    if (!backendUrl || !backendUrl.trim()) {
      throw {
        code: 'backend-unreachable',
        message: 'Backend URL not configured. Check your settings.',
      } as OCRError;
    }

    // Validate image
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (image.size > maxSize) {
      throw {
        code: 'file-too-large',
        message: 'Image is too large. Please use a smaller file.',
      } as OCRError;
    }

    // Check format
    const validFormats = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validFormats.includes(image.type)) {
      throw {
        code: 'format-unsupported',
        message: 'Please upload JPG, PNG, or PDF.',
      } as OCRError;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('image', image);

    // Send to backend
    const response = await fetch(backendUrl, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type; browser will set it with boundary
      },
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const result: BackendOCRResponse = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Unknown backend error');
    }

    // Parse backend response into journal format
    return parseOCROutput(result.data.text);
  } catch (error) {
    if ((error as OCRError).code) {
      throw error; // Already an OCRError
    }
    throw {
      code: 'backend-unreachable',
      message: 'Cannot connect to OCR backend. Check your settings.',
    } as OCRError;
  }
}

/**
 * Test backend connection
 * Used in settings modal to verify URL is valid
 */
export async function testBackendConnection(backendUrl: string): Promise<boolean> {
  try {
    if (!backendUrl || !backendUrl.trim()) {
      return false;
    }

    const response = await fetch(backendUrl, {
      method: 'OPTIONS',
    });

    return response.ok || response.status === 405; // 405 = Method Not Allowed (expected for POST-only)
  } catch {
    return false;
  }
}
```

- [ ] **Step 2: Verify file**

Run: `ls -la src/lib/backendOcr.ts`
Expected: File exists

- [ ] **Step 3: Commit**

```bash
git add src/lib/backendOcr.ts
git commit -m "feat: create backend OCR client with error handling"
```

---

## Task 5: Utility Functions

**Files:**
- Create: `src/lib/utils.ts`

- [ ] **Step 1: Implement utility functions**

Create `src/lib/utils.ts`:
```typescript
import { OCRExtraction } from '../types';
import { formatExtractionAsText } from './ocrParser';

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}

/**
 * Copy OCR extraction to clipboard (formatted)
 */
export async function copyExtractionToClipboard(extraction: OCRExtraction): Promise<void> {
  const text = formatExtractionAsText(extraction);
  await copyToClipboard(text);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check if running on mobile device
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validFormats = ['image/jpeg', 'image/png', 'application/pdf'];
  if (!validFormats.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload JPG, PNG, or PDF.',
    };
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Image is too large. Please use a smaller file.',
    };
  }

  return { valid: true };
}
```

- [ ] **Step 2: Verify file**

Run: `ls -la src/lib/utils.ts`
Expected: File exists

- [ ] **Step 3: Commit**

```bash
git add src/lib/utils.ts
git commit -m "feat: add utility functions (clipboard, formatting, validation)"
```

---

## Task 6: useOCRConfig Hook + Tests

**Files:**
- Create: `src/hooks/useOCRConfig.ts`
- Create: `src/hooks/useOCRConfig.test.ts`

- [ ] **Step 1: Write failing tests for hook**

Create `src/hooks/useOCRConfig.test.ts`:
```typescript
import { renderHook, act } from '@testing-library/react';
import { useOCRConfig } from './useOCRConfig';

describe('useOCRConfig', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns default config (client-side)', () => {
    const { result } = renderHook(() => useOCRConfig());

    expect(result.current.config).toEqual({
      method: 'client-side',
      backendUrl: undefined,
    });
  });

  it('saves and loads backend API configuration', () => {
    const { result } = renderHook(() => useOCRConfig());

    act(() => {
      result.current.setConfig({
        method: 'backend-api',
        backendUrl: 'http://localhost:8000/ocr',
      });
    });

    expect(result.current.config).toEqual({
      method: 'backend-api',
      backendUrl: 'http://localhost:8000/ocr',
    });

    // Verify persistence
    const { result: result2 } = renderHook(() => useOCRConfig());
    expect(result2.current.config).toEqual({
      method: 'backend-api',
      backendUrl: 'http://localhost:8000/ocr',
    });
  });

  it('resets config to defaults', () => {
    const { result } = renderHook(() => useOCRConfig());

    act(() => {
      result.current.setConfig({
        method: 'backend-api',
        backendUrl: 'http://localhost:8000/ocr',
      });
    });

    act(() => {
      result.current.resetConfig();
    });

    expect(result.current.config).toEqual({
      method: 'client-side',
      backendUrl: undefined,
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- hooks/useOCRConfig.test.ts 2>&1 || true`
Expected: Tests fail with "useOCRConfig is not defined"

- [ ] **Step 3: Implement hook**

Create `src/hooks/useOCRConfig.ts`:
```typescript
import { useState, useEffect } from 'react';
import { OCRConfig } from '../types';

const STORAGE_KEY = 'journal-digitizer-ocr-config';

const DEFAULT_CONFIG: OCRConfig = {
  method: 'client-side',
};

/**
 * Hook to manage OCR configuration (stored in localStorage)
 */
export function useOCRConfig() {
  const [config, setConfigState] = useState<OCRConfig>(DEFAULT_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
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

  // Save to localStorage whenever config changes
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- hooks/useOCRConfig.test.ts`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useOCRConfig.ts src/hooks/useOCRConfig.test.ts
git commit -m "feat: implement OCR config hook with localStorage persistence"
```

---

## Task 7: useImageUpload Hook + Tests

**Files:**
- Create: `src/hooks/useImageUpload.ts`
- Create: `src/hooks/useImageUpload.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/hooks/useImageUpload.test.ts`:
```typescript
import { renderHook, act } from '@testing-library/react';
import { useImageUpload } from './useImageUpload';

describe('useImageUpload', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useImageUpload());

    expect(result.current.image).toBeNull();
    expect(result.current.preview).toBe('');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeFalsy();
  });

  it('sets image and preview from file input', async () => {
    const { result } = renderHook(() => useImageUpload());

    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });

    await act(async () => {
      await result.current.handleImageUpload(file);
    });

    expect(result.current.image).toBe(file);
    expect(result.current.preview).toContain('data:');
    expect(result.current.error).toBeFalsy();
  });

  it('rejects invalid file formats', async () => {
    const { result } = renderHook(() => useImageUpload());

    const file = new File([''], 'test.txt', { type: 'text/plain' });

    await act(async () => {
      await result.current.handleImageUpload(file);
    });

    expect(result.current.image).toBeNull();
    expect(result.current.error).toBeTruthy();
  });

  it('rejects files that are too large', async () => {
    const { result } = renderHook(() => useImageUpload());

    // Create a large file mock
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg',
    });

    await act(async () => {
      await result.current.handleImageUpload(largeFile);
    });

    expect(result.current.image).toBeNull();
    expect(result.current.error).toBeTruthy();
  });

  it('clears image and state', () => {
    const { result } = renderHook(() => useImageUpload());

    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });

    act(() => {
      result.current.setImage(file, 'data:image/jpeg;base64,xxx');
    });

    expect(result.current.image).not.toBeNull();

    act(() => {
      result.current.clearImage();
    });

    expect(result.current.image).toBeNull();
    expect(result.current.preview).toBe('');
    expect(result.current.error).toBeFalsy();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- hooks/useImageUpload.test.ts 2>&1 || true`
Expected: Tests fail

- [ ] **Step 3: Implement hook**

Create `src/hooks/useImageUpload.ts`:
```typescript
import { useState } from 'react';
import { UploadedImage, OCRError } from '../types';
import { validateImageFile } from '../lib/utils';

export function useImageUpload() {
  const [image, setImageState] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<OCRError | null>(null);

  const handleImageUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate file
      const validation = validateImageFile(file);
      if (!validation.valid) {
        throw {
          code: 'format-unsupported',
          message: validation.error || 'Invalid file',
        } as OCRError;
      }

      // Create preview
      const reader = new FileReader();
      const previewPromise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const previewDataUrl = await previewPromise;

      setImageState(file);
      setPreview(previewDataUrl);
    } catch (err) {
      const error = err as OCRError;
      setError(error);
      setImageState(null);
      setPreview('');
    } finally {
      setIsLoading(false);
    }
  };

  const setImage = (file: File, dataUrl: string) => {
    setImageState(file);
    setPreview(dataUrl);
    setError(null);
  };

  const clearImage = () => {
    setImageState(null);
    setPreview('');
    setError(null);
  };

  return {
    image,
    preview,
    isLoading,
    error,
    handleImageUpload,
    setImage,
    clearImage,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- hooks/useImageUpload.test.ts`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useImageUpload.ts src/hooks/useImageUpload.test.ts
git commit -m "feat: implement image upload hook with validation"
```

---

## Task 8: SettingsModal Component

**Files:**
- Create: `src/components/SettingsModal.tsx`

- [ ] **Step 1: Implement Settings modal**

Create `src/components/SettingsModal.tsx`:
```typescript
import React, { useState } from 'react';
import { OCRConfig } from '../types';
import { testBackendConnection } from '../lib/backendOcr';

interface SettingsModalProps {
  config: OCRConfig;
  onSave: (config: OCRConfig) => void;
  onCancel: () => void;
}

export function SettingsModal({ config, onSave, onCancel }: SettingsModalProps) {
  const [method, setMethod] = useState<'client-side' | 'backend-api'>(config.method);
  const [backendUrl, setBackendUrl] = useState(config.backendUrl || '');
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'failed'>('idle');

  const handleSave = () => {
    const newConfig: OCRConfig = {
      method,
      backendUrl: method === 'backend-api' ? backendUrl : undefined,
    };
    onSave(newConfig);
  };

  const handleTestConnection = async () => {
    if (!backendUrl.trim()) {
      setConnectionStatus('failed');
      return;
    }

    setTestingConnection(true);
    const success = await testBackendConnection(backendUrl);
    setConnectionStatus(success ? 'success' : 'failed');
    setTestingConnection(false);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content settings-modal" onClick={e => e.stopPropagation()}>
        <h2>OCR Settings</h2>

        <div className="settings-group">
          <label className="radio-group">
            <input
              type="radio"
              name="ocr-method"
              value="client-side"
              checked={method === 'client-side'}
              onChange={() => {
                setMethod('client-side');
                setConnectionStatus('idle');
              }}
            />
            <span className="radio-label">
              <strong>Client-Side OCR</strong>
              <small>Faster, runs in your browser (no server needed)</small>
            </span>
          </label>

          <label className="radio-group">
            <input
              type="radio"
              name="ocr-method"
              value="backend-api"
              checked={method === 'backend-api'}
              onChange={() => {
                setMethod('backend-api');
                setConnectionStatus('idle');
              }}
            />
            <span className="radio-label">
              <strong>Backend API</strong>
              <small>Custom endpoint (local GPU or cloud service)</small>
            </span>
          </label>
        </div>

        {method === 'backend-api' && (
          <div className="settings-group backend-config">
            <label htmlFor="backend-url">Backend API URL:</label>
            <input
              id="backend-url"
              type="url"
              placeholder="http://localhost:8000/ocr"
              value={backendUrl}
              onChange={e => {
                setBackendUrl(e.target.value);
                setConnectionStatus('idle');
              }}
              className="input-field"
            />

            <button
              onClick={handleTestConnection}
              disabled={testingConnection || !backendUrl.trim()}
              className="btn btn-secondary"
            >
              {testingConnection ? 'Testing...' : 'Verify Connection'}
            </button>

            {connectionStatus === 'success' && (
              <p className="status-success">✓ Connection successful</p>
            )}
            {connectionStatus === 'failed' && (
              <p className="status-error">✗ Cannot connect to backend</p>
            )}
          </div>
        )}

        <div className="modal-actions">
          <button onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} className="btn btn-primary">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify file**

Run: `ls -la src/components/SettingsModal.tsx`
Expected: File exists

- [ ] **Step 3: Commit**

```bash
git add src/components/SettingsModal.tsx
git commit -m "feat: implement Settings modal component"
```

---

## Task 9: UploadArea Component

**Files:**
- Create: `src/components/UploadArea.tsx`

- [ ] **Step 1: Implement Upload area**

Create `src/components/UploadArea.tsx`:
```typescript
import React, { useRef } from 'react';
import { isMobileDevice } from '../lib/utils';

interface UploadAreaProps {
  onImageSelected: (file: File) => Promise<void>;
  isLoading: boolean;
}

export function UploadArea({ onImageSelected, isLoading }: UploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = React.useState(false);

  const handleFileChange = async (file: File | null) => {
    if (file) {
      await onImageSelected(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  return (
    <div className="upload-area-container">
      <div
        className={`upload-area ${isDragActive ? 'drag-active' : ''} ${isLoading ? 'loading' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
      >
        {isLoading ? (
          <>
            <div className="spinner"></div>
            <p>Processing image...</p>
          </>
        ) : (
          <>
            <div className="upload-icon">📷</div>
            <p className="upload-title">Upload Journal Page</p>
            <p className="upload-subtitle">Drag and drop your image here</p>

            <div className="upload-actions">
              {isMobileDevice() && (
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="btn btn-primary"
                >
                  📱 Take Photo
                </button>
              )}

              <button onClick={() => fileInputRef.current?.click()} className="btn btn-primary">
                📁 Choose File
              </button>
            </div>

            <p className="upload-formats">Supports JPG, PNG, PDF (max 10MB)</p>
          </>
        )}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,application/pdf"
        style={{ display: 'none' }}
        onChange={e => handleFileChange(e.target.files?.[0] || null)}
      />

      {isMobileDevice() && (
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={e => handleFileChange(e.target.files?.[0] || null)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify file**

Run: `ls -la src/components/UploadArea.tsx`
Expected: File exists

- [ ] **Step 3: Commit**

```bash
git add src/components/UploadArea.tsx
git commit -m "feat: implement Upload area with drag-drop and camera support"
```

---

## Task 10: ResultsDisplay Component

**Files:**
- Create: `src/components/ResultsDisplay.tsx`

- [ ] **Step 1: Implement Results display**

Create `src/components/ResultsDisplay.tsx`:
```typescript
import React from 'react';
import { OCRExtraction } from '../types';
import { copyExtractionToClipboard } from '../lib/utils';

interface ResultsDisplayProps {
  extraction: OCRExtraction;
  onScanAnother: () => void;
  onDone: () => void;
}

export function ResultsDisplay({ extraction, onScanAnother, onDone }: ResultsDisplayProps) {
  const [copyFeedback, setCopyFeedback] = React.useState(false);

  const handleCopy = async () => {
    try {
      await copyExtractionToClipboard(extraction);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="results-container">
      <div className="results-header">
        {extraction.date && (
          <h3 className="results-date">{extraction.date}</h3>
        )}
      </div>

      <div className="results-entries">
        {extraction.entries.length > 0 ? (
          extraction.entries.map((entry, idx) => (
            <div key={idx} className="journal-entry">
              <div className="entry-timestamp">{entry.timestamp}</div>
              <div className="entry-divider"></div>
              <div className="entry-text">{entry.text}</div>
            </div>
          ))
        ) : (
          <p className="no-entries">No entries found. Please try another image.</p>
        )}
      </div>

      <div className="results-actions">
        <button
          onClick={handleCopy}
          className={`btn btn-primary ${copyFeedback ? 'copied' : ''}`}
        >
          {copyFeedback ? '✓ Copied!' : 'Copy Results'}
        </button>

        <button onClick={onScanAnother} className="btn btn-secondary">
          Scan Another Page
        </button>

        <button onClick={onDone} className="btn btn-secondary">
          Done
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify file**

Run: `ls -la src/components/ResultsDisplay.tsx`
Expected: File exists

- [ ] **Step 3: Commit**

```bash
git add src/components/ResultsDisplay.tsx
git commit -m "feat: implement Results display with journal-style layout"
```

---

## Task 11: DigitizeModal Component

**Files:**
- Create: `src/components/DigitizeModal.tsx`

- [ ] **Step 1: Implement Digitize modal**

Create `src/components/DigitizeModal.tsx`:
```typescript
import React, { useState } from 'react';
import { OCRExtraction, OCRError, OCRConfig } from '../types';
import { useImageUpload } from '../hooks/useImageUpload';
import { runClientSideOCR } from '../lib/paddleocr';
import { runBackendOCR } from '../lib/backendOcr';
import { UploadArea } from './UploadArea';
import { ResultsDisplay } from './ResultsDisplay';

interface DigitizeModalProps {
  isOpen: boolean;
  ocrConfig: OCRConfig;
  onClose: () => void;
}

type ModalStep = 'upload' | 'results' | 'error';

export function DigitizeModal({ isOpen, ocrConfig, onClose }: DigitizeModalProps) {
  const [step, setStep] = useState<ModalStep>('upload');
  const [extraction, setExtraction] = useState<OCRExtraction | null>(null);
  const [error, setError] = useState<OCRError | null>(null);
  const imageUpload = useImageUpload();

  const handleImageSelected = async (file: File) => {
    setError(null);

    try {
      // Upload and validate
      await imageUpload.handleImageUpload(file);

      if (imageUpload.error) {
        setError(imageUpload.error);
        setStep('error');
        return;
      }

      // Run OCR based on config
      let result: OCRExtraction;

      if (ocrConfig.method === 'backend-api' && ocrConfig.backendUrl) {
        result = await runBackendOCR(file, ocrConfig.backendUrl);
      } else {
        result = await runClientSideOCR(file);
      }

      setExtraction(result);
      setStep('results');
    } catch (err) {
      const ocrError = err as OCRError;
      setError(ocrError);
      setStep('error');
    }
  };

  const handleScanAnother = () => {
    imageUpload.clearImage();
    setExtraction(null);
    setError(null);
    setStep('upload');
  };

  const handleDone = () => {
    handleScanAnother();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content digitize-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        {step === 'upload' && (
          <>
            <h2>Digitize Journal Page</h2>
            <UploadArea
              onImageSelected={handleImageSelected}
              isLoading={imageUpload.isLoading}
            />
          </>
        )}

        {step === 'results' && extraction && (
          <ResultsDisplay
            extraction={extraction}
            onScanAnother={handleScanAnother}
            onDone={handleDone}
          />
        )}

        {step === 'error' && error && (
          <div className="error-state">
            <h3>Error</h3>
            <p className="error-message">{error.message}</p>
            <button onClick={handleScanAnother} className="btn btn-primary">
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify file**

Run: `ls -la src/components/DigitizeModal.tsx`
Expected: File exists

- [ ] **Step 3: Commit**

```bash
git add src/components/DigitizeModal.tsx
git commit -m "feat: implement Digitize modal with orchestration logic"
```

---

## Task 12: Dashboard Component

**Files:**
- Create: `src/components/Dashboard.tsx`

- [ ] **Step 1: Implement Dashboard**

Create `src/components/Dashboard.tsx`:
```typescript
import React from 'react';

interface DashboardProps {
  onDigitizeClick: () => void;
  onSettingsClick: () => void;
}

export function Dashboard({ onDigitizeClick, onSettingsClick }: DashboardProps) {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Journal Digitizer</h1>
        <button className="settings-button" onClick={onSettingsClick} title="Settings">
          ⚙️
        </button>
      </header>

      <main className="dashboard-main">
        <button onClick={onDigitizeClick} className="btn btn-large btn-primary">
          Digitize Journal Page
        </button>
      </main>

      <footer className="dashboard-footer">
        <p>Capture your handwritten journal pages and extract text with OCR</p>
      </footer>
    </div>
  );
}
```

- [ ] **Step 2: Verify file**

Run: `ls -la src/components/Dashboard.tsx`
Expected: File exists

- [ ] **Step 3: Commit**

```bash
git add src/components/Dashboard.tsx
git commit -m "feat: implement Dashboard component"
```

---

## Task 13: Wire Up App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Replace App.tsx with full implementation**

Replace contents of `src/App.tsx`:
```typescript
import React, { useEffect, useState } from 'react';
import { useOCRConfig } from './hooks/useOCRConfig';
import { initializePaddleOCR } from './lib/paddleocr';
import { Dashboard } from './components/Dashboard';
import { DigitizeModal } from './components/DigitizeModal';
import { SettingsModal } from './components/SettingsModal';
import { OCRConfig } from './types';
import './App.css';

function App() {
  const ocrConfig = useOCRConfig();
  const [showDigitizeModal, setShowDigitizeModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [paddleInitialized, setPaddleInitialized] = useState(false);

  // Initialize PaddleOCR on app load (client-side OCR only)
  useEffect(() => {
    const init = async () => {
      try {
        await initializePaddleOCR();
        setPaddleInitialized(true);
      } catch (error) {
        console.warn('PaddleOCR initialization failed. Client-side OCR unavailable.', error);
        // Fall back to backend API if configured
      }
    };

    init();
  }, []);

  const handleSettingsSave = (newConfig: OCRConfig) => {
    ocrConfig.setConfig(newConfig);
    setShowSettingsModal(false);
  };

  return (
    <div className="app">
      <Dashboard
        onDigitizeClick={() => setShowDigitizeModal(true)}
        onSettingsClick={() => setShowSettingsModal(true)}
      />

      <DigitizeModal
        isOpen={showDigitizeModal}
        ocrConfig={ocrConfig.config}
        onClose={() => setShowDigitizeModal(false)}
      />

      {showSettingsModal && (
        <SettingsModal
          config={ocrConfig.config}
          onSave={handleSettingsSave}
          onCancel={() => setShowSettingsModal(false)}
        />
      )}
    </div>
  );
}

export default App;
```

- [ ] **Step 2: Verify app still runs**

Run: `npm run dev` (in another terminal)
Expected: App starts at http://localhost:5173 without errors

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire up App.tsx with all components"
```

---

## Task 14: Implement Styling

**Files:**
- Replace: `src/App.css`

- [ ] **Step 1: Add comprehensive styling**

Replace contents of `src/App.css`:
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
    Cantarell, sans-serif;
  background: #fafaf8;
  color: #333;
  line-height: 1.5;
}

/* Layout */
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Dashboard */
.dashboard {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.dashboard-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.dashboard-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
}

.settings-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background 0.2s;
}

.settings-button:hover {
  background: #f0f0f0;
}

.dashboard-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dashboard-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  padding: 1.5rem;
  border-top: 1px solid #e0e0e0;
  background: white;
  color: #666;
  font-size: 0.9rem;
}

/* Buttons */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: none;
}

.btn-primary {
  background: #333;
  color: white;
}

.btn-primary:hover {
  background: #555;
}

.btn-primary:active {
  background: #222;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  background: #e8e8e8;
}

.btn-large {
  padding: 1.25rem 3rem;
  font-size: 1.1rem;
  min-width: 250px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn.copied {
  background: #4caf50;
}

/* Upload Area */
.upload-area-container {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 3rem 2rem;
  text-align: center;
  transition: all 0.3s;
  background: white;
}

.upload-area.drag-active {
  border-color: #333;
  background: #f9f9f9;
}

.upload-area.loading {
  pointer-events: none;
  opacity: 0.7;
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.upload-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.upload-subtitle {
  color: #666;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.upload-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.upload-formats {
  font-size: 0.8rem;
  color: #999;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f0f0;
  border-top-color: #333;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.digitize-modal h2,
.settings-modal h2 {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

/* Results Display */
.results-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.results-header {
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 1rem;
}

.results-date {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.results-entries {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.journal-entry {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.entry-timestamp {
  flex: 0 0 60px;
  text-align: right;
  font-family: 'Courier New', monospace;
  font-weight: 600;
  font-size: 0.95rem;
  color: #333;
  padding-top: 0.25rem;
}

.entry-divider {
  flex: 0 0 2px;
  background: #333;
  min-height: 1.25rem;
  align-self: center;
}

.entry-text {
  flex: 1;
  font-size: 0.95rem;
  color: #555;
  line-height: 1.6;
}

.no-entries {
  text-align: center;
  color: #999;
  padding: 2rem 0;
}

.results-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.results-actions .btn {
  width: 100%;
}

/* Settings Modal */
.settings-group {
  margin-bottom: 1.5rem;
}

.radio-group {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: background 0.2s;
}

.radio-group:hover {
  background: #f9f9f9;
}

.radio-group input[type='radio'] {
  margin-top: 0.25rem;
  cursor: pointer;
  flex-shrink: 0;
}

.radio-label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.radio-label strong {
  font-weight: 600;
}

.radio-label small {
  color: #666;
  font-size: 0.85rem;
}

.backend-config {
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.backend-config label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.input-field {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
  margin-bottom: 0.75rem;
  font-family: inherit;
}

.input-field:focus {
  outline: none;
  border-color: #333;
  box-shadow: 0 0 0 2px rgba(51, 51, 51, 0.1);
}

.status-success {
  color: #4caf50;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.status-error {
  color: #f44336;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

/* Error State */
.error-state {
  text-align: center;
  padding: 2rem 0;
}

.error-state h3 {
  margin-bottom: 1rem;
  color: #f44336;
}

.error-message {
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.error-state .btn {
  margin-top: 1rem;
}

/* Responsive */
@media (max-width: 640px) {
  .dashboard-header {
    padding: 1rem;
  }

  .dashboard-header h1 {
    font-size: 1.25rem;
  }

  .dashboard-footer {
    padding: 1rem;
    font-size: 0.8rem;
  }

  .btn-large {
    min-width: 200px;
    padding: 1rem 2rem;
  }

  .modal-content {
    padding: 1.5rem 1rem;
    max-height: none;
    min-height: 100vh;
    border-radius: 0;
  }

  .modal-overlay {
    align-items: flex-end;
  }

  .journal-entry {
    gap: 0.75rem;
  }

  .entry-timestamp {
    flex: 0 0 50px;
    font-size: 0.85rem;
  }

  .entry-text {
    font-size: 0.9rem;
  }

  .upload-area {
    padding: 2rem 1rem;
  }

  .upload-icon {
    font-size: 2rem;
  }

  .upload-title {
    font-size: 1.1rem;
  }

  .upload-actions {
    flex-direction: column;
  }

  .upload-actions .btn {
    width: 100%;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .modal-actions .btn {
    width: 100%;
  }
}
```

- [ ] **Step 2: Verify styles are applied**

Run: `npm run dev` (if not running)
Expected: App loads with proper styling

- [ ] **Step 3: Commit**

```bash
git add src/App.css
git commit -m "feat: add comprehensive styling for responsive UI"
```

---

## Task 15: Manual Testing & QA

**Files:**
- No files modified
- Testing only

- [ ] **Step 1: Test on Desktop**

Run: `npm run dev` (if not running) and open http://localhost:5173

**Desktop Tests:**
- [ ] Main dashboard loads with "Digitize Journal Page" button
- [ ] Settings button (⚙️) is visible in top-right
- [ ] Click "Digitize Journal Page" → modal opens
- [ ] Can drag-drop image into upload area
- [ ] Can click to select file
- [ ] Loading spinner shows while processing
- [ ] Results display in journal-style layout (timestamps left, text right)
- [ ] Copy button works (verify with Ctrl+V)
- [ ] "Scan Another Page" button clears and returns to upload
- [ ] "Done" button closes modal and returns to dashboard

- [ ] **Step 2: Test Settings Modal**

**Settings Tests:**
- [ ] Click settings button → modal opens
- [ ] "Client-Side" option is selected by default
- [ ] Can switch to "Backend API"
- [ ] When Backend API selected, URL input appears
- [ ] Can enter backend URL
- [ ] "Verify Connection" button works
- [ ] Save/Cancel buttons work
- [ ] Settings persist after reload (use F5)

- [ ] **Step 3: Test Error Handling**

**Error Tests:**
- [ ] Upload non-image file → "Please upload JPG, PNG, or PDF" error
- [ ] Upload text file → proper error message
- [ ] Backend connection fails → "Cannot connect to OCR backend" error
- [ ] Invalid image (corrupted) → "Could not extract text" error

- [ ] **Step 4: Test Mobile Responsiveness**

Run: Open DevTools (F12) → Toggle device toolbar (Ctrl+Shift+M)

**Mobile Tests:**
- [ ] Layout stacks properly on mobile width
- [ ] Buttons are touch-friendly (44px minimum)
- [ ] Modal takes full screen on mobile
- [ ] Camera button appears on mobile
- [ ] Can take photo using camera input
- [ ] Results display properly on small screen

- [ ] **Step 5: Test Accessibility Basics**

**A11y Tests:**
- [ ] Tab through all interactive elements (no traps)
- [ ] All buttons have visible focus state
- [ ] Text has sufficient contrast (WCAG AA)
- [ ] Modal can be closed with Escape key (add if missing)

- [ ] **Step 6: Document Results**

If any issues found, create notes:
- Critical bugs (blocking functionality)
- Minor UX issues (polish)
- Accessibility gaps

For Phase 1, document any issues and decide: fix now or defer to Phase 2.

- [ ] **Step 7: Final Commit**

```bash
git commit --allow-empty -m "test: complete manual testing and QA for Phase 1 MVP

Tested:
- Desktop workflow (upload, OCR, results display)
- Settings configuration (client-side vs backend API)
- Error handling (invalid files, backend failures)
- Mobile responsiveness (layout, touch targets, camera)
- Accessibility (keyboard navigation, contrast, focus states)

All core functionality working as designed."
```

---

## Summary

**What was built:**
- ✅ Complete Journal Digitization App (Phase 1 MVP)
- ✅ Modal-based workflow with upload, OCR, results display
- ✅ Configurable OCR: client-side PaddleOCR + backend API option
- ✅ Journal-style results display (timestamps left, text right)
- ✅ Responsive design (desktop + mobile)
- ✅ Error handling and validation
- ✅ Production-ready code (types, hooks, components)

**Deferred to Phase 2:**
- Dashboard/history of scanned pages
- Persistent storage
- Search & organize
- Export features
- Edit/refine results

See `docs/future-features.md` for detailed Phase 2+ roadmap.

**Next Steps:**
- Start with Task 1 (Types)
- Complete tasks sequentially
- Test after wiring up components (Task 13)
- Manual testing (Task 15)
