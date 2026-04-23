import { useState } from 'react';
import type { OCRExtraction, OCRError, OCRConfig } from '../types';
import { runGeminiOCR } from '../lib/geminiOcr';
import { runBackendOCR } from '../lib/backendOcr';
import { getUploadError } from '../lib/utils';
import { UploadArea } from './UploadArea';
import { ResultsDisplay } from './ResultsDisplay';
import { AlertIcon, CloseIcon } from './icons';

interface DigitizeModalProps {
  isOpen: boolean;
  ocrConfig: OCRConfig;
  onSaveScan: (extraction: OCRExtraction, title: string, tags: string[]) => void;
  onClose: () => void;
}

type ModalStep = 'upload' | 'results' | 'error';

export function DigitizeModal({ isOpen, ocrConfig, onSaveScan, onClose }: DigitizeModalProps) {
  const [step, setStep] = useState<ModalStep>('upload');
  const [extraction, setExtraction] = useState<OCRExtraction | null>(null);
  const [error, setError] = useState<OCRError | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageSelected = async (file: File) => {
    setError(null);

    const uploadError = getUploadError(file);
    if (uploadError) {
      setError(uploadError);
      setStep('error');
      return;
    }

    setIsProcessing(true);
    try {
      const result =
        ocrConfig.method === 'backend-api' && ocrConfig.backendUrl
          ? await runBackendOCR(file, ocrConfig.backendUrl)
          : await runGeminiOCR(file, ocrConfig.geminiApiKey ?? '', ocrConfig.geminiModel);

      setExtraction(result);
      setStep('results');
    } catch (err) {
      setError(err as OCRError);
      setStep('error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Resets all transient state so the modal is clean for the next scan.
  const handleScanAnother = () => {
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
        {step !== 'results' && (
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        )}

        {step === 'upload' && (
          <>
            <h2 id="digitize-title">Digitize Journal Page</h2>
            <UploadArea
              onImageSelected={handleImageSelected}
              isLoading={isProcessing}
            />
          </>
        )}

        {step === 'results' && extraction && (
          <ResultsDisplay
            extraction={extraction}
            onScanAnother={handleScanAnother}
            onDone={handleDone}
            onSave={onSaveScan}
          />
        )}

        {step === 'error' && error && (
          <div className="error-state">
            <div className="error-icon" aria-hidden="true">
              <AlertIcon />
            </div>
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
