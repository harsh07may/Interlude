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
  onClose: () => void;
}

type ModalStep = 'upload' | 'results' | 'error';

export function DigitizeModal({ isOpen, ocrConfig, onClose }: DigitizeModalProps) {
  const [step, setStep] = useState<ModalStep>('upload');
  const [extraction, setExtraction] = useState<OCRExtraction | null>(null);
  const [error, setError] = useState<OCRError | null>(null);
  const imageUpload = useImageUpload();

  const handleImageSelected = async (file: File) => {
    setError(null);

    try {
      await imageUpload.handleImageUpload(file);

      if (imageUpload.error) {
        setError(imageUpload.error);
        setStep('error');
        return;
      }

      let result: OCRExtraction;

      if (ocrConfig.method === 'backend-api' && ocrConfig.backendUrl) {
        result = await runBackendOCR(file, ocrConfig.backendUrl);
      } else {
        result = await runClientSideOCR(file);
      }

      setExtraction(result);
      setStep('results');
    } catch (err) {
      const ocrError = err as OCRError;
      setError(ocrError);
      setStep('error');
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content digitize-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        {step === 'upload' && (
          <>
            <h2>Digitize Journal Page</h2>
            <UploadArea
              onImageSelected={handleImageSelected}
              isLoading={imageUpload.isLoading}
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
