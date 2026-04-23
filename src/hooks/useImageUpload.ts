import { useState } from 'react';
import type { OCRError } from '../types';
import { validateImageFile } from '../lib/utils';

export function useImageUpload() {
  const [image, setImageState] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Returns the error directly so callers don't read stale React state after await
  const handleImageUpload = async (file: File): Promise<OCRError | null> => {
    setIsLoading(true);

    try {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setImageState(null);
        setPreview('');
        return {
          code: 'format-unsupported',
          message: validation.error ?? 'Invalid file',
        } satisfies OCRError;
      }

      const previewDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setImageState(file);
      setPreview(previewDataUrl);
      return null;
    } catch {
      setImageState(null);
      setPreview('');
      return {
        code: 'ocr-failed',
        message: 'Failed to read image file.',
      } satisfies OCRError;
    } finally {
      setIsLoading(false);
    }
  };

  const setImage = (file: File, dataUrl: string) => {
    setImageState(file);
    setPreview(dataUrl);
  };

  const clearImage = () => {
    setImageState(null);
    setPreview('');
  };

  return { image, preview, isLoading, handleImageUpload, setImage, clearImage };
}
