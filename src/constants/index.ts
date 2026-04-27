// ─── Storage ──────────────────────────────────────────────────────────────────

export const STORAGE_KEY_OCR_CONFIG = 'journal-digitizer-ocr-config';
export const SESSION_KEY_GEMINI_API_KEY = 'journal-digitizer-gemini-key';
export const STORAGE_KEY_PAGES = 'journal-digitizer-scanned-pages';

// ─── Routes ───────────────────────────────────────────────────────────────────

// Strip the trailing slash so we can append route segments cleanly.
// import.meta.env.BASE_URL is '/' in dev and '/Interlude/' in production.
const _base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const ROUTE_HOME = _base + '/';
export const ROUTE_LIBRARY = _base + '/library';

// ─── Gemini API ───────────────────────────────────────────────────────────────

export const GEMINI_API_BASE_URL =
  'https://generativelanguage.googleapis.com/v1beta/models';

export const GEMINI_DEFAULT_MODEL = 'gemini-2.5-flash';

/** Models known to be quota-blocked or deprecated — fall back to the default. */
export const QUOTA_BLOCKED_MODELS = new Set([
  'gemini-3.1-pro',
  'gemini-3.1-pro-preview',
]);

// ─── File Upload ──────────────────────────────────────────────────────────────

export const ACCEPTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
] as const;

/** 10 MB */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

// ─── OCR ──────────────────────────────────────────────────────────────────────

/** Placeholder confidence value returned by the parser (not computed per-image). */
export const DEFAULT_OCR_CONFIDENCE = 0.85;

// ─── UI ───────────────────────────────────────────────────────────────────────

/** Duration (ms) the "Copied!" feedback badge is shown. */
export const COPY_FEEDBACK_MS = 2000;

export const DEFAULT_PAGE_TITLE = 'Untitled page';
