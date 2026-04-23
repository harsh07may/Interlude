import { parseOCROutput } from './ocrParser';
import type { OCRExtraction, OCRError } from '../types';

// PaddleOCR returns an array of detected lines: each line is [text, confidence]
type PaddleOCRLine = [string, number];

interface PaddleOCRInstance {
  ocr(imageDataUrl: string): Promise<PaddleOCRLine[]>;
}

let paddleOCR: PaddleOCRInstance | null = null;

export async function initializePaddleOCR(): Promise<void> {
  if (paddleOCR) return;

  try {
    // paddleocr has no published TS types; the module is resolved at runtime
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { PaddleOCR } = await import('paddleocr');
    paddleOCR = new PaddleOCR({
      ocr_version: 'pp-ocr-server',
      enable_mkldnn: true,
      use_angle_cls: true,
      lang: 'en',
    }) as PaddleOCRInstance;
  } catch (error) {
    console.error('Failed to initialize PaddleOCR:', error);
    throw new Error('OCR initialization failed', { cause: error });
  }
}

export async function runClientSideOCR(image: File): Promise<OCRExtraction> {
  if (!paddleOCR) {
    throw {
      code: 'ocr-failed',
      message: 'OCR not initialized. Please reload the app.',
    } satisfies OCRError;
  }

  try {
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

    const imageDataUrl = await fileToDataUrl(image);
    const result = await paddleOCR.ocr(imageDataUrl);
    const extractedText = flattenOCRResult(result);

    return parseOCROutput(extractedText);
  } catch (error) {
    if ((error as OCRError).code) {
      throw error;
    }
    throw {
      code: 'ocr-failed',
      message: 'Could not extract text. Try another image.',
    } satisfies OCRError;
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function flattenOCRResult(lines: PaddleOCRLine[]): string {
  return lines.map(([text]) => text).join('\n');
}
