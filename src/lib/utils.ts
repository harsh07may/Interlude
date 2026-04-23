import type { OCRError, OCRExtraction, ScannedPage } from "../types";
import { formatExtractionAsText } from "./ocrParser";

async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }
}

export async function copyExtractionToClipboard(
  extraction: OCRExtraction,
): Promise<void> {
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
    "text/markdown",
  );
}

export function downloadAllPagesAsJson(pages: ScannedPage[]) {
  downloadFile(
    "journal-scans.json",
    JSON.stringify(pages, null, 2),
    "application/json",
  );
}

export function formatPageAsMarkdown(page: ScannedPage): string {
  const title = page.title.trim();
  const date = page.extraction.date.trim();
  const titleIsDate = title.toLowerCase() === date.toLowerCase();
  const lines = [
    `# ${title}`,
    "",
    date && !titleIsDate ? `Date: ${date}` : "",
    page.tags.length ? `Tags: ${page.tags.join(", ")}` : "",
    "",
    formatExtractionAsText(page.extraction),
  ];

  return (
    lines
      .filter((line, index) => line || lines[index - 1])
      .join("\n")
      .trim() + "\n"
  );
}

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
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
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "journal-page"
  );
}

export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
}

export function getUploadError(file: File): OCRError | null {
  const validFormats = ["image/jpeg", "image/png", "application/pdf"];
  if (!validFormats.includes(file.type)) {
    return {
      code: "format-unsupported",
      message: "Please upload JPG, PNG, or PDF.",
    };
  }

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      code: "file-too-large",
      message: "Image is too large. Please use a smaller file.",
    };
  }

  return null;
}
