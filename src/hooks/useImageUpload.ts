import { useState } from 'react';
import type { OCRError } from '../types';
import { validateImageFile } from '../lib/utils';

export function useImageUpload() {
  const [image, setImageState] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<OCRError | null>(null);

  const handleImageUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        throw {
          code: 'format-unsupported',
          message: validation.error || 'Invalid file',
        } as OCRError;
      }

      const reader = new FileReader();
      const previewPromise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const previewDataUrl = await previewPromise;

      setImageState(file);
      setPreview(previewDataUrl);
    } catch (err) {
      const error = err as OCRError;
      setError(error);
      setImageState(null);
      setPreview('');
    } finally {
      setIsLoading(false);
    }
  };

  const setImage = (file: File, dataUrl: string) => {
    setImageState(file);
    setPreview(dataUrl);
    setError(null);
  };

  const clearImage = () => {
    setImageState(null);
    setPreview('');
    setError(null);
  };

  return {
    image,
    preview,
    isLoading,
    error,
    handleImageUpload,
    setImage,
    clearImage,
  };
}
