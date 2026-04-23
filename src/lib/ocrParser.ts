import type { JournalEntry, OCRExtraction } from '../types';
import { DEFAULT_OCR_CONFIDENCE } from '../constants';

const ENTRY_LINE_RE = /^(\d{1,2}:\d{2})\s*(?:[|]\s*)?[-–]\s*(.+)$/;
const TIMESTAMP_ONLY_RE = /^(\d{1,2}:\d{2})\s*[|]?$/;
const STARTS_WITH_TIMESTAMP = /^\d{1,2}:\d{2}/;
const DATE_HEADER_RE = /^\d{1,2}(?:st|nd|rd|th)?\s+\w+|\w+,?\s+\d{1,2}(?:st|nd|rd|th)?/i;

export function parseOCROutput(rawText: string): OCRExtraction {
  const lines = rawText.split('\n').map(line => line.trim()).filter(Boolean);

  let date = '';
  const entries: JournalEntry[] = [];

  if (lines.length > 0 && DATE_HEADER_RE.test(lines[0]) && !STARTS_WITH_TIMESTAMP.test(lines[0])) {
    date = lines.shift()!;
  }

  for (const line of lines) {
    const entryMatch = line.match(ENTRY_LINE_RE);
    const timestampMatch = line.match(TIMESTAMP_ONLY_RE);

    if (entryMatch) {
      entries.push({ timestamp: entryMatch[1], text: entryMatch[2].trim() });
    } else if (timestampMatch) {
      entries.push({ timestamp: timestampMatch[1], text: '' });
    } else if (entries.length > 0 && !STARTS_WITH_TIMESTAMP.test(line)) {
      entries[entries.length - 1].text = `${entries[entries.length - 1].text} ${line}`.trim();
    }
  }

  return { date, entries, rawText, confidence: DEFAULT_OCR_CONFIDENCE };
}

export function formatExtractionAsText(extraction: OCRExtraction): string {
  let text = '';
  if (extraction.date) text += `${extraction.date}\n\n`;
  text += extraction.entries.map(e => `${e.timestamp} - ${e.text}`).join('\n');
  return text;
}
