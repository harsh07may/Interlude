import { useState } from 'react';
import type { OCRExtraction, OCRError, OCRConfig } from '../types';
import { useImageUpload } from '../hooks/useImageUpload';
import { runClientSideOCR } from '../lib/paddleocr';
import { runBackendOCR } from '../lib/backendOcr';
import { UploadArea } from './UploadArea';
import { ResultsDisplay } from './ResultsDisplay';

interface DigitizeModalProps {
  isOpen: boolean;
  ocrConfig: OCRConfig;
  ocrInitFailed: boolean;
  onClose: () => void;
}

type ModalStep = 'upload' | 'results' | 'error';

export function DigitizeModal({ isOpen, ocrConfig, ocrInitFailed, onClose }: DigitizeModalProps) {
  const [step, setStep] = useState<ModalStep>('upload');
  const [extraction, setExtraction] = useState<OCRExtraction | null>(null);
  const [error, setError] = useState<OCRError | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const imageUpload = useImageUpload();

  const handleImageSelected = async (file: File) => {
    setError(null);

    // handleImageUpload returns the error directly — avoids reading stale React state after await
    const uploadError = await imageUpload.handleImageUpload(file);
    if (uploadError) {
      setError(uploadError);
      setStep('error');
      return;
    }

    if (ocrConfig.method === 'client-side' && ocrInitFailed) {
      setError({
        code: 'ocr-failed',
        message: 'Client-side OCR failed to initialise. Switch to Backend API in Settings.',
      });
      setStep('error');
      return;
    }

    setIsProcessing(true);
    try {
      const result =
        ocrConfig.method === 'backend-api' && ocrConfig.backendUrl
          ? await runBackendOCR(file, ocrConfig.backendUrl)
          : await runClientSideOCR(file);

      setExtraction(result);
      setStep('results');
    } catch (err) {
      setError(err as OCRError);
      setStep('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScanAnother = () => {
    imageUpload.clearImage();
    setExtraction(null);
    setError(null);
    setStep('upload');
  };

  const handleDone = () => {
    handleScanAnother();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="digitize-title"
    >
      <div className="modal-content digitize-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        {step === 'upload' && (
          <>
            <h2 id="digitize-title">Digitize Journal Page</h2>
            {ocrInitFailed && ocrConfig.method === 'client-side' && (
              <p className="status-error" style={{ marginBottom: '1rem' }}>
                ⚠ Client-side OCR unavailable. Configure a Backend API in Settings.
              </p>
            )}
            <UploadArea
              onImageSelected={handleImageSelected}
              isLoading={imageUpload.isLoading || isProcessing}
            />
          </>
        )}

        {step === 'results' && extraction && (
          <ResultsDisplay
            extraction={extraction}
            onScanAnother={handleScanAnother}
            onDone={handleDone}
          />
        )}

        {step === 'error' && error && (
          <div className="error-state">
            <h3>Error</h3>
            <p className="error-message">{error.message}</p>
            <button onClick={handleScanAnother} className="btn btn-primary">
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
