// Shim for PaddleOCR — replace with the real package when available.
// Until then, initializePaddleOCR() catches this throw and sets ocrInitFailed=true in App.tsx.
export class PaddleOCR {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async ocr(_imageDataUrl: string): Promise<never> {
    throw new Error('PaddleOCR package not installed. Use Backend API mode instead.');
  }
}
