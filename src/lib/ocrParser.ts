import { OCRExtraction, JournalEntry } from '../types';

export function parseOCROutput(rawText: string): OCRExtraction {
  const lines = rawText.split('\n').map(line => line.trim()).filter(Boolean);

  let date = '';
  const entries: JournalEntry[] = [];

  const datePattern = /^\d{1,2}(?:st|nd|rd|th)?\s+\w+\s+'?\d{2,4}|^\w+\s+\d{1,2}/i;
  if (lines.length > 0 && datePattern.test(lines[0])) {
    const firstLine = lines[0];
    if (!/^\d{1,2}:\d{2}\s*-/.test(firstLine)) {
      date = firstLine;
      lines.shift();
    }
  }

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
    confidence: 0.85,
  };
}

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
