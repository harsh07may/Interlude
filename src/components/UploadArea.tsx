import { useRef, useMemo, useState } from 'react';
import type { DragEvent } from 'react';
import { isMobileDevice } from '../lib/utils';

interface UploadAreaProps {
  onImageSelected: (file: File) => Promise<void>;
  isLoading: boolean;
}

export function UploadArea({ onImageSelected, isLoading }: UploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const isMobile = useMemo(() => isMobileDevice(), []);

  const handleFileChange = async (file: File | null) => {
    if (file) await onImageSelected(file);
  };

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFileChange(files[0]);
  };

  return (
    <div className="upload-area-container">
      <div
        className={`upload-area ${isDragActive ? 'drag-active' : ''} ${isLoading ? 'loading' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
      >
        {isLoading ? (
          <>
            <div className="spinner"></div>
            <p className="upload-title">Reading your page</p>
            <p className="upload-subtitle">Gemini is transcribing the image and finding entries.</p>
          </>
        ) : (
          <>
            <div className="upload-icon" aria-hidden="true">
              <UploadIcon />
            </div>
            <p className="upload-title">Upload Journal Page</p>
            <p className="upload-subtitle">Drop a scan here, or choose a file from your device.</p>

            <div className="upload-actions">
              {isMobile && (
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="btn btn-primary"
                >
                  <CameraIcon />
                  Take Photo
                </button>
              )}
              <button onClick={() => fileInputRef.current?.click()} className="btn btn-primary">
                <FolderIcon />
                Choose File
              </button>
            </div>

            <p className="upload-formats">Supports JPG, PNG, PDF (max 10MB)</p>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,application/pdf"
        style={{ display: 'none' }}
        onChange={e => handleFileChange(e.target.files?.[0] ?? null)}
      />

      {isMobile && (
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={e => handleFileChange(e.target.files?.[0] ?? null)}
        />
      )}
    </div>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M5 20h14" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14.5 4 16 7h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l1.5-3Z" />
      <path d="M12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    </svg>
  );
}
