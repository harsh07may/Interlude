import type { OCRExtraction, JournalEntry } from '../types';

// Matches timestamps like "10:04", "9:30" optionally followed by a vertical bar
// and/or a dash/em-dash separator, e.g.:
//   "10:04 - text"      standard
//   "10:04 |- text"     vertical bar from journal ruling (common in Tesseract output)
//   "10:04 | - text"    with spaces around bar
//   "10:04- text"       no space before dash
const TIMESTAMP_RE = /^(\d{1,2}:\d{2})\s*[|]?\s*[-–]\s*(.+)$/;

// A line that starts with a timestamp (used to detect entry boundaries)
const STARTS_WITH_TIMESTAMP = /^\d{1,2}:\d{2}/;

// Date header: "9th June '26, Monday" / "Monday, 9 June" etc.
const DATE_HEADER_RE = /^\d{1,2}(?:st|nd|rd|th)?\s+\w+|\w+,?\s+\d{1,2}(?:st|nd|rd|th)?/i;

export function parseOCROutput(rawText: string): OCRExtraction {
  const lines = rawText.split('\n').map(line => line.trim()).filter(Boolean);

  let date = '';
  const entries: JournalEntry[] = [];

  // Extract date from first line if it looks like a header and not a timestamp entry
  if (lines.length > 0 && DATE_HEADER_RE.test(lines[0]) && !STARTS_WITH_TIMESTAMP.test(lines[0])) {
    date = lines.shift()!;
  }

  for (const line of lines) {
    const match = line.match(TIMESTAMP_RE);
    if (match) {
      entries.push({ timestamp: match[1], text: match[2].trim() });
    } else if (entries.length > 0 && !STARTS_WITH_TIMESTAMP.test(line)) {
      // Continuation line — Tesseract wraps long entries across multiple lines
      entries[entries.length - 1].text += ' ' + line;
    }
  }

  return { date, entries, rawText, confidence: 0.85 };
}

export function formatExtractionAsText(extraction: OCRExtraction): string {
  let text = '';
  if (extraction.date) text += `${extraction.date}\n\n`;
  text += extraction.entries.map(e => `${e.timestamp} - ${e.text}`).join('\n');
  return text;
}
