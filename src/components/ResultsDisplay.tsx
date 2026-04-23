import React from 'react';
import { OCRExtraction } from '../types';
import { copyExtractionToClipboard } from '../lib/utils';

interface ResultsDisplayProps {
  extraction: OCRExtraction;
  onScanAnother: () => void;
  onDone: () => void;
}

export function ResultsDisplay({ extraction, onScanAnother, onDone }: ResultsDisplayProps) {
  const [copyFeedback, setCopyFeedback] = React.useState(false);

  const handleCopy = async () => {
    try {
      await copyExtractionToClipboard(extraction);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="results-container">
      <div className="results-header">
        {extraction.date && (
          <h3 className="results-date">{extraction.date}</h3>
        )}
      </div>

      <div className="results-entries">
        {extraction.entries.length > 0 ? (
          extraction.entries.map((entry, idx) => (
            <div key={idx} className="journal-entry">
              <div className="entry-timestamp">{entry.timestamp}</div>
              <div className="entry-divider"></div>
              <div className="entry-text">{entry.text}</div>
            </div>
          ))
        ) : (
          <p className="no-entries">No entries found. Please try another image.</p>
        )}
      </div>

      <div className="results-actions">
        <button
          onClick={handleCopy}
          className={`btn btn-primary ${copyFeedback ? 'copied' : ''}`}
        >
          {copyFeedback ? '✓ Copied!' : 'Copy Results'}
        </button>

        <button onClick={onScanAnother} className="btn btn-secondary">
          Scan Another Page
        </button>

        <button onClick={onDone} className="btn btn-secondary">
          Done
        </button>
      </div>
    </div>
  );
}
