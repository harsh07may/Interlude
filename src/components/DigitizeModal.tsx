import { useState } from 'react';
import type { OCRExtraction, OCRError, OCRConfig } from '../types';
import { runGeminiOCR } from '../lib/geminiOcr';
import { runBackendOCR } from '../lib/backendOcr';
import { getUploadError } from '../lib/utils';
import { UploadArea } from './UploadArea';
import { ResultsDisplay } from './ResultsDisplay';

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
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>

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

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="m10.3 4.1-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-2.9l-8-14a2 2 0 0 0-3.4 0Z" />
    </svg>
  );
}
