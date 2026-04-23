import { useState } from 'react';
import type { OCRConfig } from '../types';
import { testBackendConnection } from '../lib/backendOcr';
import { GEMINI_DEFAULT_MODEL } from '../lib/geminiOcr';

interface SettingsModalProps {
  config: OCRConfig;
  onSave: (config: OCRConfig) => void;
  onCancel: () => void;
}

export function SettingsModal({ config, onSave, onCancel }: SettingsModalProps) {
  const [method, setMethod] = useState<'gemini' | 'backend-api'>(config.method);
  const [geminiApiKey, setGeminiApiKey] = useState(config.geminiApiKey ?? '');
  const [geminiModel, setGeminiModel] = useState(config.geminiModel ?? GEMINI_DEFAULT_MODEL);
  const [backendUrl, setBackendUrl] = useState(config.backendUrl ?? '');
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'failed'>('idle');

  const handleSave = () => {
    onSave({
      method,
      geminiApiKey: method === 'gemini' ? geminiApiKey : undefined,
      geminiModel: method === 'gemini' ? geminiModel : undefined,
      backendUrl: method === 'backend-api' ? backendUrl : undefined,
    });
  };

  const handleTestConnection = async () => {
    if (!backendUrl.trim()) { setConnectionStatus('failed'); return; }
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
              value="gemini"
              checked={method === 'gemini'}
              onChange={() => { setMethod('gemini'); setConnectionStatus('idle'); }}
            />
            <span className="radio-label">
              <strong>Gemini AI</strong>
              <small>Best accuracy — uses your Google AI Studio API key</small>
            </span>
          </label>

          <label className="radio-group">
            <input
              type="radio"
              name="ocr-method"
              value="backend-api"
              checked={method === 'backend-api'}
              onChange={() => { setMethod('backend-api'); setConnectionStatus('idle'); }}
            />
            <span className="radio-label">
              <strong>Backend API</strong>
              <small>Custom OCR endpoint (local server or cloud)</small>
            </span>
          </label>
        </div>

        {method === 'gemini' && (
          <div className="settings-group backend-config">
            <label htmlFor="gemini-key">
              Gemini API Key{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.8rem' }}
              >
                Get one free →
              </a>
            </label>
            <input
              id="gemini-key"
              type="password"
              placeholder="AIza..."
              value={geminiApiKey}
              onChange={e => setGeminiApiKey(e.target.value)}
              className="input-field"
            />
            <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '-0.5rem' }}>
              Stored locally in your browser. Never sent anywhere except Google's API.
            </p>
            <label htmlFor="gemini-model" style={{ marginTop: '0.75rem', display: 'block' }}>
              Model{' '}
              <a
                href="https://ai.google.dev/gemini-api/docs/models"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.8rem' }}
              >
                See available models →
              </a>
            </label>
            <input
              id="gemini-model"
              type="text"
              value={geminiModel}
              onChange={e => setGeminiModel(e.target.value)}
              className="input-field"
            />
          </div>
        )}

        {method === 'backend-api' && (
          <div className="settings-group backend-config">
            <label htmlFor="backend-url">Backend API URL:</label>
            <input
              id="backend-url"
              type="url"
              placeholder="http://localhost:8000/ocr"
              value={backendUrl}
              onChange={e => { setBackendUrl(e.target.value); setConnectionStatus('idle'); }}
              className="input-field"
            />
            <button
              onClick={handleTestConnection}
              disabled={testingConnection || !backendUrl.trim()}
              className="btn btn-secondary"
            >
              {testingConnection ? 'Testing...' : 'Verify Connection'}
            </button>
            {connectionStatus === 'success' && <p className="status-success">✓ Connection successful</p>}
            {connectionStatus === 'failed' && <p className="status-error">✗ Cannot connect to backend</p>}
          </div>
        )}

        <div className="modal-actions">
          <button onClick={onCancel} className="btn btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn btn-primary">Save Settings</button>
        </div>
      </div>
    </div>
  );
}
