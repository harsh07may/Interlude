import type { OCRError, OCRExtraction, ScannedPage } from '../types';
import { formatExtractionAsText } from './ocrParser';
import { ACCEPTED_MIME_TYPES, MAX_UPLOAD_BYTES } from '../constants';

/** Generates a collision-resistant ID. Uses `crypto.randomUUID` when available. */
export function createId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// Cloud metadata and link-local ranges that must never be reachable via user-supplied URLs.
// Covers AWS/GCP/Azure IMDS (169.254.169.254), CGNAT (100.64/10), and IPv6 equivalents.
const BLOCKED_IP_PREFIXES = [
  '169.254.', // IPv4 link-local / cloud metadata (AWS, GCP, Azure IMDS)
  '100.64.',  // CGNAT range — used by some cloud providers for internal routing
  'fe80:',    // IPv6 link-local
  'fd',       // IPv6 ULA (fd00::/8 — private unicast)
];

/**
 * Returns `true` if `url` is a non-empty http(s) URL that does not point at
 * cloud metadata / link-local ranges. Localhost and private LAN addresses are
 * allowed because they are the expected target for a local OCR backend.
 */
export function isValidBackendUrl(url: string): boolean {
  if (!url.trim()) return false;
  try {
    const { protocol, hostname } = new URL(url);
    if (protocol !== 'http:' && protocol !== 'https:') return false;
    const lower = hostname.toLowerCase();
    return !BLOCKED_IP_PREFIXES.some(prefix => lower.startsWith(prefix));
  } catch {
    return false;
  }
}

async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

export async function copyExtractionToClipboard(extraction: OCRExtraction): Promise<void> {
  const text = formatExtractionAsText(extraction);
  await copyToClipboard(text);
}

export async function copyPageToClipboard(page: ScannedPage): Promise<void> {
  await copyToClipboard(formatPageAsMarkdown(page));
}

export function downloadPageAsText(page: ScannedPage) {
  downloadFile(
    `${createFileName(page.title)}.md`,
    formatPageAsMarkdown(page),
    'text/markdown',
  );
}

export function downloadAllPagesAsJson(pages: ScannedPage[]) {
  downloadFile('journal-scans.json', JSON.stringify(pages, null, 2), 'application/json');
}

export function formatPageAsMarkdown(page: ScannedPage): string {
  const title = page.title.trim();
  const date = page.extraction.date.trim();
  const titleIsDate = title.toLowerCase() === date.toLowerCase();
  const lines = [
    `# ${title}`,
    '',
    date && !titleIsDate ? `Date: ${date}` : '',
    page.tags.length ? `Tags: ${page.tags.join(', ')}` : '',
    '',
    formatExtractionAsText(page.extraction),
  ];

  // Keep a blank line only when the preceding line was non-empty (prevents consecutive blanks).
  return (
    lines
      .filter((line, index) => line || lines[index - 1])
      .join('\n')
      .trim() + '\n'
  );
}

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function createFileName(title: string) {
  return (
    title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'journal-page'
  );
}

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
}

export function getUploadError(file: File): OCRError | null {
  if (!(ACCEPTED_MIME_TYPES as readonly string[]).includes(file.type)) {
    return {
      code: 'format-unsupported',
      message: 'Please upload JPG, PNG, or PDF.',
    };
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      code: 'file-too-large',
      message: 'Image is too large. Please use a smaller file.',
    };
  }

  return null;
}
