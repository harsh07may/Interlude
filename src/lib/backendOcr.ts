import { parseOCROutput } from './ocrParser';
import type { OCRExtraction, BackendOCRResponse, OCRError } from '../types';

export async function runBackendOCR(
  image: File,
  backendUrl: string
): Promise<OCRExtraction> {
  try {
    if (!backendUrl || !backendUrl.trim()) {
      throw {
        code: 'backend-unreachable',
        message: 'Backend URL not configured. Check your settings.',
      } satisfies OCRError;
    }

    // Reject non-http(s) URLs before they reach fetch
    try {
      const parsed = new URL(backendUrl);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error('invalid protocol');
      }
    } catch {
      throw {
        code: 'backend-unreachable',
        message: 'Invalid backend URL. Must start with http:// or https://',
      } satisfies OCRError;
    }

    const maxSize = 10 * 1024 * 1024;
    if (image.size > maxSize) {
      throw {
        code: 'file-too-large',
        message: 'Image is too large. Please use a smaller file.',
      } satisfies OCRError;
    }

    const validFormats = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validFormats.includes(image.type)) {
      throw {
        code: 'format-unsupported',
        message: 'Please upload JPG, PNG, or PDF.',
      } satisfies OCRError;
    }

    const formData = new FormData();
    formData.append('image', image);

    const response = await fetch(backendUrl, { method: 'POST', body: formData });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const result: BackendOCRResponse = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error ?? 'Unknown backend error');
    }

    return parseOCROutput(result.data.text);
  } catch (error) {
    if ((error as OCRError).code) throw error;
    throw {
      code: 'backend-unreachable',
      message: 'Cannot connect to OCR backend. Check your settings.',
    } satisfies OCRError;
  }
}

export async function testBackendConnection(backendUrl: string): Promise<boolean> {
  try {
    if (!backendUrl || !backendUrl.trim()) return false;

    const parsed = new URL(backendUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;

    const response = await fetch(backendUrl, { method: 'OPTIONS' });
    return response.ok || response.status === 405;
  } catch {
    return false;
  }
}
