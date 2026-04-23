import type { OCRExtraction } from '../types';
import { formatExtractionAsText } from './ocrParser';

export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}

export async function copyExtractionToClipboard(extraction: OCRExtraction): Promise<void> {
  const text = formatExtractionAsText(extraction);
  await copyToClipboard(text);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validFormats = ['image/jpeg', 'image/png', 'application/pdf'];
  if (!validFormats.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload JPG, PNG, or PDF.',
    };
  }

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Image is too large. Please use a smaller file.',
    };
  }

  return { valid: true };
}
