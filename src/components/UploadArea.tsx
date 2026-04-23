import React, { useRef } from 'react';
import { isMobileDevice } from '../lib/utils';

interface UploadAreaProps {
  onImageSelected: (file: File) => Promise<void>;
  isLoading: boolean;
}

export function UploadArea({ onImageSelected, isLoading }: UploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = React.useState(false);

  const handleFileChange = async (file: File | null) => {
    if (file) {
      await onImageSelected(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileChange(files[0]);
    }
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
            <p>Processing image...</p>
          </>
        ) : (
          <>
            <div className="upload-icon">📷</div>
            <p className="upload-title">Upload Journal Page</p>
            <p className="upload-subtitle">Drag and drop your image here</p>

            <div className="upload-actions">
              {isMobileDevice() && (
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="btn btn-primary"
                >
                  📱 Take Photo
                </button>
              )}

              <button onClick={() => fileInputRef.current?.click()} className="btn btn-primary">
                📁 Choose File
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
        onChange={e => handleFileChange(e.target.files?.[0] || null)}
      />

      {isMobileDevice() && (
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={e => handleFileChange(e.target.files?.[0] || null)}
        />
      )}
    </div>
  );
}
