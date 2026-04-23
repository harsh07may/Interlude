import { describe, it, expect } from 'vitest';
import { getUploadError, isValidBackendUrl, formatPageAsMarkdown } from '../lib/utils';
import { MAX_UPLOAD_BYTES, ACCEPTED_MIME_TYPES } from '../constants';
import type { ScannedPage } from '../types';

// ─── getUploadError ────────────────────────────────────────────────────────────

describe('getUploadError', () => {
  function makeFile(name: string, type: string, sizeBytes = 1024): File {
    return new File(['x'.repeat(sizeBytes)], name, { type });
  }

  it.each(ACCEPTED_MIME_TYPES)('returns null for accepted type: %s', (mime) => {
    expect(getUploadError(makeFile('scan', mime))).toBeNull();
  });

  it('returns format-unsupported for an unrecognised type', () => {
    const error = getUploadError(makeFile('photo.gif', 'image/gif'));
    expect(error?.code).toBe('format-unsupported');
  });

  it('returns format-unsupported for an empty type string', () => {
    const error = getUploadError(makeFile('file', ''));
    expect(error?.code).toBe('format-unsupported');
  });

  it('returns null for a file exactly at the size limit', () => {
    expect(getUploadError(makeFile('scan.jpg', 'image/jpeg', MAX_UPLOAD_BYTES))).toBeNull();
  });

  it('returns file-too-large for a file one byte over the limit', () => {
    const error = getUploadError(makeFile('scan.jpg', 'image/jpeg', MAX_UPLOAD_BYTES + 1));
    expect(error?.code).toBe('file-too-large');
  });

  it('error message mentions the allowed formats', () => {
    const error = getUploadError(makeFile('doc.gif', 'image/gif'));
    expect(error?.message).toMatch(/JPG|PNG|PDF/i);
  });
});

// ─── isValidBackendUrl ─────────────────────────────────────────────────────────

describe('isValidBackendUrl', () => {
  it('accepts http URLs', () => {
    expect(isValidBackendUrl('http://localhost:8000/ocr')).toBe(true);
  });

  it('accepts https URLs', () => {
    expect(isValidBackendUrl('https://api.example.com/ocr')).toBe(true);
  });

  it('rejects an empty string', () => {
    expect(isValidBackendUrl('')).toBe(false);
  });

  it('rejects a whitespace-only string', () => {
    expect(isValidBackendUrl('   ')).toBe(false);
  });

  it('rejects non-http protocols', () => {
    expect(isValidBackendUrl('ftp://example.com')).toBe(false);
    expect(isValidBackendUrl('file:///etc/passwd')).toBe(false);
  });

  it('rejects malformed strings that are not URLs', () => {
    expect(isValidBackendUrl('not-a-url')).toBe(false);
    expect(isValidBackendUrl('localhost:8000')).toBe(false);
  });
});

// ─── formatPageAsMarkdown ──────────────────────────────────────────────────────

describe('formatPageAsMarkdown', () => {
  function makePage(overrides: Partial<ScannedPage> = {}): ScannedPage {
    return {
      id: 'test-id',
      title: 'My Journal Page',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      extraction: {
        date: '9th June',
        entries: [{ id: '1', timestamp: '10:04', text: 'Morning task' }],
        rawText: '',
        confidence: 0.85,
      },
      ...overrides,
    };
  }

  it('starts with the page title as an h1', () => {
    const md = formatPageAsMarkdown(makePage({ title: 'My Page' }));
    expect(md.startsWith('# My Page')).toBe(true);
  });

  it('includes a date line when it differs from the title', () => {
    const md = formatPageAsMarkdown(makePage({ title: 'My Journal Page' }));
    expect(md).toContain('Date: 9th June');
  });

  it('omits the date line when title and date are the same (case-insensitive)', () => {
    const md = formatPageAsMarkdown(
      makePage({ title: '9th June', extraction: { date: '9th June', entries: [], rawText: '', confidence: 0.85 } })
    );
    expect(md).not.toContain('Date:');
  });

  it('includes a tags line when tags are present', () => {
    const md = formatPageAsMarkdown(makePage({ tags: ['work', 'writing'] }));
    expect(md).toContain('Tags: work, writing');
  });

  it('omits the tags line when there are no tags', () => {
    const md = formatPageAsMarkdown(makePage({ tags: [] }));
    expect(md).not.toContain('Tags:');
  });

  it('includes entry text in the output', () => {
    const md = formatPageAsMarkdown(makePage());
    expect(md).toContain('10:04 - Morning task');
  });

  it('does not contain consecutive blank lines', () => {
    const md = formatPageAsMarkdown(makePage({ tags: [] }));
    expect(md).not.toMatch(/\n{3,}/);
  });

  it('always ends with a single newline', () => {
    const md = formatPageAsMarkdown(makePage());
    expect(md.endsWith('\n')).toBe(true);
    expect(md.endsWith('\n\n')).toBe(false);
  });
});
