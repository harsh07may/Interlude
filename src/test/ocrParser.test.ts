import { describe, it, expect } from 'vitest';
import { parseOCROutput, formatExtractionAsText } from '../lib/ocrParser';
import { DEFAULT_OCR_CONFIDENCE } from '../constants';

// ─── parseOCROutput ────────────────────────────────────────────────────────────

describe('parseOCROutput', () => {
  it('returns empty extraction for blank input', () => {
    const result = parseOCROutput('');
    expect(result.date).toBe('');
    expect(result.entries).toEqual([]);
    expect(result.rawText).toBe('');
    expect(result.confidence).toBe(DEFAULT_OCR_CONFIDENCE);
  });

  it('parses a basic HH:MM - text entry', () => {
    const result = parseOCROutput('10:04 - Going to write the article.');
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0]).toMatchObject({ timestamp: '10:04', text: 'Going to write the article.' });
  });

  it('parses multiple entries in order', () => {
    const raw = `10:04 - First entry\n11:30 - Second entry\n14:00 - Third entry`;
    const { entries } = parseOCROutput(raw);
    expect(entries).toHaveLength(3);
    expect(entries[0].timestamp).toBe('10:04');
    expect(entries[1].timestamp).toBe('11:30');
    expect(entries[2].timestamp).toBe('14:00');
  });

  it('detects a date header on the first line', () => {
    const raw = `9th June\n10:04 - Morning entry`;
    const result = parseOCROutput(raw);
    expect(result.date).toBe('9th June');
    expect(result.entries).toHaveLength(1);
  });

  it('does not treat a timestamp line as a date header', () => {
    const raw = `10:04 - Only entry`;
    const result = parseOCROutput(raw);
    expect(result.date).toBe('');
    expect(result.entries).toHaveLength(1);
  });

  it('appends continuation lines to the previous entry', () => {
    const raw = `10:04 - Started the report\nGot sidetracked after a while.`;
    const { entries } = parseOCROutput(raw);
    expect(entries).toHaveLength(1);
    expect(entries[0].text).toBe('Started the report Got sidetracked after a while.');
  });

  it('ignores continuation lines when there is no preceding entry', () => {
    // A stray non-timestamp line before any entry should not create an entry.
    const raw = `Some orphan text\n10:04 - Actual entry`;
    const { entries } = parseOCROutput(raw);
    expect(entries).toHaveLength(1);
    expect(entries[0].timestamp).toBe('10:04');
  });

  it('handles a timestamp-only line (no dash or text)', () => {
    const raw = `10:04`;
    const { entries } = parseOCROutput(raw);
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ timestamp: '10:04', text: '' });
  });

  it('accepts the pipe-separator variant  (HH:MM | - text)', () => {
    const raw = `10:04 | - Meeting notes`;
    const { entries } = parseOCROutput(raw);
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ timestamp: '10:04', text: 'Meeting notes' });
  });

  it('accepts an em-dash separator (HH:MM – text)', () => {
    const raw = `10:04 – Em dash entry`;
    const { entries } = parseOCROutput(raw);
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ timestamp: '10:04', text: 'Em dash entry' });
  });

  it('handles single-digit hour timestamps (H:MM)', () => {
    const raw = `9:05 - Early morning`;
    const { entries } = parseOCROutput(raw);
    expect(entries).toHaveLength(1);
    expect(entries[0].timestamp).toBe('9:05');
  });

  it('preserves rawText exactly', () => {
    const raw = `10:04 - Some text`;
    expect(parseOCROutput(raw).rawText).toBe(raw);
  });

  it('strips leading/trailing blank lines from input', () => {
    const raw = `\n\n10:04 - Entry\n\n`;
    const { entries } = parseOCROutput(raw);
    expect(entries).toHaveLength(1);
  });
});

// ─── formatExtractionAsText ────────────────────────────────────────────────────

describe('formatExtractionAsText', () => {
  it('formats entries as "HH:MM - text" lines', () => {
    const extraction = parseOCROutput('10:04 - First\n11:00 - Second');
    expect(formatExtractionAsText(extraction)).toBe('10:04 - First\n11:00 - Second');
  });

  it('prepends the date header followed by two newlines', () => {
    const extraction = parseOCROutput('9th June\n10:04 - Entry');
    const text = formatExtractionAsText(extraction);
    expect(text.startsWith('9th June\n\n')).toBe(true);
  });

  it('omits the date header when there is none', () => {
    const extraction = parseOCROutput('10:04 - Entry');
    expect(formatExtractionAsText(extraction).startsWith('10:')).toBe(true);
  });

  it('round-trips through parse then format without mutation', () => {
    const original = '9th June\n\n10:04 - Morning task\n11:30 - Review notes';
    const extraction = parseOCROutput(original);
    // The formatted text should be semantically equivalent to the original
    // (extra blank lines are collapsed by parseOCROutput).
    const formatted = formatExtractionAsText(extraction);
    expect(formatted).toContain('10:04 - Morning task');
    expect(formatted).toContain('11:30 - Review notes');
    expect(formatted).toContain('9th June');
  });
});
