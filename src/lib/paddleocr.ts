import { parseOCROutput } from './ocrParser';
import type { OCRExtraction, OCRError } from '../types';

let paddleOCR: any = null;

export async function initializePaddleOCR(): Promise<void> {
  if (paddleOCR) return;

  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore — paddleocr types not available; installed at runtime
    const { PaddleOCR } = await import('paddleocr');
    paddleOCR = new PaddleOCR({
      ocr_version: 'pp-ocr-server',
      enable_mkldnn: true,
      use_angle_cls: true,
      lang: 'en',
    });
  } catch (error) {
    console.error('Failed to initialize PaddleOCR:', error);
    throw new Error('OCR initialization failed');
  }
}

export async function runClientSideOCR(image: File): Promise<OCRExtraction> {
  if (!paddleOCR) {
    throw {
      code: 'ocr-failed',
      message: 'OCR not initialized. Please reload the app.',
    } as OCRError;
  }

  try {
    const maxSize = 10 * 1024 * 1024;
    if (image.size > maxSize) {
      throw {
        code: 'file-too-large',
        message: 'Image is too large. Please use a smaller file.',
      } as OCRError;
    }

    const validFormats = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validFormats.includes(image.type)) {
      throw {
        code: 'format-unsupported',
        message: 'Please upload JPG, PNG, or PDF.',
      } as OCRError;
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
    } as OCRError;
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

function flattenOCRResult(result: any[][]): string {
  return result
    .map((item: any[]) => item[0] as string)
    .join('\n');
}
