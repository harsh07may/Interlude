import { parseOCROutput } from './ocrParser';
import type { OCRExtraction, OCRError } from '../types';
import { GEMINI_API_BASE_URL, GEMINI_DEFAULT_MODEL } from '../constants';

export { GEMINI_DEFAULT_MODEL };

const PROMPT = `Transcribe all text from this handwritten journal page.
Output format — one entry per line:
  HH:MM - text content
If there is a date header at the top, put it on the first line before the entries.
Output only the transcribed text. No commentary, no markdown, no extra formatting.`;

export async function runGeminiOCR(
  image: File,
  apiKey: string,
  model = GEMINI_DEFAULT_MODEL
): Promise<OCRExtraction> {
  const trimmedApiKey = apiKey.trim();
  const trimmedModel = model.trim();

  if (!trimmedApiKey) {
    throw {
      code: 'ocr-failed',
      message: 'Gemini API key not set. Add it in Settings.',
    } satisfies OCRError;
  }

  if (!trimmedModel) {
    throw {
      code: 'ocr-failed',
      message: 'Gemini model not set. Add a model name in Settings.',
    } satisfies OCRError;
  }

  const base64 = await fileToBase64(image);
  const url = `${GEMINI_API_BASE_URL}/${encodeURIComponent(trimmedModel)}:generateContent`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': trimmedApiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: PROMPT },
              { inline_data: { mime_type: image.type || 'image/jpeg', data: base64 } },
            ],
          },
        ],
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
    const msg = await readGeminiError(response);
    if (response.status === 401 || response.status === 403) {
      throw {
        code: 'ocr-failed',
        message: 'Invalid Gemini API key. Check your Settings.',
      } satisfies OCRError;
    }
    if (response.status === 400 || response.status === 404) {
      throw {
        code: 'ocr-failed',
        message: msg
          ? `Gemini rejected the request: ${msg}`
          : 'Gemini rejected the request. Check the model name in Settings.',
      } satisfies OCRError;
    }
    if (response.status === 429) {
      const retryDelay = await readGeminiRetryDelay(response, msg);
      throw {
        code: 'ocr-failed',
        message: `Gemini quota hit for ${trimmedModel}.${retryDelay ? ` Retry in about ${retryDelay}.` : ' Try a Flash/Flash-Lite model or check billing/quota in AI Studio.'}`,
      } satisfies OCRError;
    }
    throw {
      code: 'ocr-failed',
      message: `Gemini error ${response.status}${msg ? ': ' + msg : ''}`,
    } satisfies OCRError;
  }

  const data = await response.json();
  const text = extractGeminiText(data);

  if (!text?.trim()) {
    throw {
      code: 'ocr-failed',
      message: 'Gemini returned no text. Try a clearer image.',
    } satisfies OCRError;
  }

  return parseOCROutput(text);
}

async function readGeminiError(response: Response): Promise<string> {
  const body = await response.json().catch(() => null);
  return body?.error?.message ?? '';
}

async function readGeminiRetryDelay(response: Response, fallbackMessage: string): Promise<string> {
  const retryAfter = response.headers.get('retry-after');
  if (retryAfter) return `${retryAfter}s`;

  const match = fallbackMessage.match(/retry in ([\d.]+)s/i);
  if (!match) return '';

  const seconds = Math.ceil(Number(match[1]));
  return Number.isFinite(seconds) ? `${seconds}s` : '';
}

function extractGeminiText(data: unknown): string {
  if (!isGeminiResponse(data)) return '';
  return data.candidates
    .flatMap(candidate => candidate.content?.parts ?? [])
    .map(part => part.text ?? '')
    .join('\n')
    .trim();
}

function isGeminiResponse(data: unknown): data is {
  candidates: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
} {
  return (
    typeof data === 'object' &&
    data !== null &&
    Array.isArray((data as { candidates?: unknown }).candidates)
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
