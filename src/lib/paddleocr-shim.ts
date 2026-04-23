// Shim for PaddleOCR — replace with the real package when available.
// Throws in the constructor so initializePaddleOCR() catches it and sets ocrInitFailed=true.
export class PaddleOCR {
  constructor() {
    throw new Error('PaddleOCR package not installed. Use Backend API mode instead.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async ocr(_imageDataUrl: string): Promise<never> {
    throw new Error('PaddleOCR package not installed.');
  }
}
