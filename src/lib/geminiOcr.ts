import { parseOCROutput } from './ocrParser';
import type { OCRExtraction, OCRError } from '../types';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const PROMPT = `Transcribe all text from this handwritten journal page.
Output format — one entry per line:
  HH:MM - text content
If there is a date header at the top, put it on the first line before the entries.
Output only the transcribed text. No commentary, no markdown, no extra formatting.`;

export async function runGeminiOCR(image: File, apiKey: string): Promise<OCRExtraction> {
  if (!apiKey.trim()) {
    throw {
      code: 'ocr-failed',
      message: 'Gemini API key not set. Add it in Settings.',
    } satisfies OCRError;
  }

  const base64 = await fileToBase64(image);

  let response: Response;
  try {
    response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: PROMPT }, { inline_data: { mime_type: image.type, data: base64 } }] }],
        generationConfig: { temperature: 0.1 },
      }),
    });
  } catch {
    throw {
      code: 'backend-unreachable',
      message: 'Could not reach Gemini API. Check your internet connection.',
    } satisfies OCRError;
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const msg: string = body?.error?.message ?? '';
    if (response.status === 400 || response.status === 403) {
      throw {
        code: 'ocr-failed',
        message: `Invalid Gemini API key. Check your Settings.`,
      } satisfies OCRError;
    }
    throw {
      code: 'ocr-failed',
      message: `Gemini error ${response.status}${msg ? ': ' + msg : ''}`,
    } satisfies OCRError;
  }

  const data = await response.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text?.trim()) {
    throw {
      code: 'ocr-failed',
      message: 'Gemini returned no text. Try a clearer image.',
    } satisfies OCRError;
  }

  return parseOCROutput(text);
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
