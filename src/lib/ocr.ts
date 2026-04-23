import { createWorker } from 'tesseract.js';
import { parseOCROutput } from './ocrParser';
import type { OCRExtraction, OCRError } from '../types';

export async function runClientSideOCR(image: File): Promise<OCRExtraction> {
  const worker = await createWorker('eng');
  try {
    const { data: { text } } = await worker.recognize(image);
    return parseOCROutput(text);
  } catch (error) {
    if ((error as OCRError).code) throw error;
    throw {
      code: 'ocr-failed',
      message: 'Could not extract text. Try another image.',
    } satisfies OCRError;
  } finally {
    await worker.terminate();
  }
}
