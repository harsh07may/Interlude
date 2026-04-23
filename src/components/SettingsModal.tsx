import { useState } from 'react';
import type { OCRConfig } from '../types';
import { testBackendConnection } from '../lib/backendOcr';

interface SettingsModalProps {
  config: OCRConfig;
  onSave: (config: OCRConfig) => void;
  onCancel: () => void;
}

export function SettingsModal({ config, onSave, onCancel }: SettingsModalProps) {
  const [method, setMethod] = useState<'client-side' | 'backend-api'>(config.method);
  const [backendUrl, setBackendUrl] = useState(config.backendUrl || '');
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'failed'>('idle');

  const handleSave = () => {
    const newConfig: OCRConfig = {
      method,
      backendUrl: method === 'backend-api' ? backendUrl : undefined,
    };
    onSave(newConfig);
  };

  const handleTestConnection = async () => {
    if (!backendUrl.trim()) {
      setConnectionStatus('failed');
      return;
    }

    setTestingConnection(true);
    const success = await testBackendConnection(backendUrl);
    setConnectionStatus(success ? 'success' : 'failed');
    setTestingConnection(false);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content settings-modal" onClick={e => e.stopPropagation()}>
        <h2>OCR Settings</h2>

        <div className="settings-group">
          <label className="radio-group">
            <input
              type="radio"
              name="ocr-method"
              value="client-side"
              checked={method === 'client-side'}
              onChange={() => {
                setMethod('client-side');
                setConnectionStatus('idle');
              }}
            />
            <span className="radio-label">
              <strong>Client-Side OCR</strong>
              <small>Faster, runs in your browser (no server needed)</small>
            </span>
          </label>

          <label className="radio-group">
            <input
              type="radio"
              name="ocr-method"
              value="backend-api"
              checked={method === 'backend-api'}
              onChange={() => {
                setMethod('backend-api');
                setConnectionStatus('idle');
              }}
            />
            <span className="radio-label">
              <strong>Backend API</strong>
              <small>Custom endpoint (local GPU or cloud service)</small>
            </span>
          </label>
        </div>

        {method === 'backend-api' && (
          <div className="settings-group backend-config">
            <label htmlFor="backend-url">Backend API URL:</label>
            <input
              id="backend-url"
              type="url"
              placeholder="http://localhost:8000/ocr"
              value={backendUrl}
              onChange={e => {
                setBackendUrl(e.target.value);
                setConnectionStatus('idle');
              }}
              className="input-field"
            />

            <button
              onClick={handleTestConnection}
              disabled={testingConnection || !backendUrl.trim()}
              className="btn btn-secondary"
            >
              {testingConnection ? 'Testing...' : 'Verify Connection'}
            </button>

            {connectionStatus === 'success' && (
              <p className="status-success">✓ Connection successful</p>
            )}
            {connectionStatus === 'failed' && (
              <p className="status-error">✗ Cannot connect to backend</p>
            )}
          </div>
        )}

        <div className="modal-actions">
          <button onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} className="btn btn-primary">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
