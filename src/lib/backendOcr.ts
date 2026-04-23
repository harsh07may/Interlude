import { parseOCROutput } from './ocrParser';
import type { OCRExtraction, BackendOCRResponse, OCRError } from '../types';
import { getUploadError, isValidBackendUrl } from './utils';

export async function runBackendOCR(image: File, backendUrl: string): Promise<OCRExtraction> {
  try {
    if (!isValidBackendUrl(backendUrl)) {
      throw {
        code: 'backend-unreachable',
        message: backendUrl.trim()
          ? 'Invalid backend URL. Must start with http:// or https://'
          : 'Backend URL not configured. Check your settings.',
      } satisfies OCRError;
    }

    const uploadError = getUploadError(image);
    if (uploadError) throw uploadError;

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
  if (!isValidBackendUrl(backendUrl)) return false;
  try {
    const response = await fetch(backendUrl, { method: 'OPTIONS' });
    return response.ok || response.status === 405;
  } catch {
    return false;
  }
}
