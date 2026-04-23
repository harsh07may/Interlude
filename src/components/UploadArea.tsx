import { useRef, useMemo, useState } from 'react';
import type { DragEvent } from 'react';
import { isMobileDevice } from '../lib/utils';
import { ACCEPTED_MIME_TYPES } from '../constants';
import { CameraIcon, FolderIcon, UploadIcon } from './icons';

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

  // Derive the accept string from the shared ACCEPTED_MIME_TYPES constant.
  const acceptAttr = ACCEPTED_MIME_TYPES.join(',');

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
        accept={acceptAttr}
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
