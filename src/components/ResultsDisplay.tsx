import { useState } from 'react';
import type { JournalEntry, OCRExtraction } from '../types';
import { copyExtractionToClipboard } from '../lib/utils';

interface ResultsDisplayProps {
  extraction: OCRExtraction;
  initialTitle?: string;
  initialTags?: string[];
  saveLabel?: string;
  onScanAnother: () => void;
  onDone: () => void;
  onSave?: (extraction: OCRExtraction, title: string, tags: string[]) => void;
}

function createEntryId() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function withEntryIds(extraction: OCRExtraction): OCRExtraction {
  return {
    ...extraction,
    entries: extraction.entries.map(entry => ({ ...entry, id: entry.id ?? createEntryId() })),
  };
}

export function ResultsDisplay({
  extraction,
  initialTitle,
  initialTags = [],
  saveLabel = 'Save to Library',
  onScanAnother,
  onDone,
  onSave,
}: ResultsDisplayProps) {
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftExtraction, setDraftExtraction] = useState(() => withEntryIds(extraction));
  const [title, setTitle] = useState(initialTitle ?? extraction.date ?? 'Untitled page');
  const [tags, setTags] = useState(initialTags.join(', '));

  const handleCopy = async () => {
    try {
      await copyExtractionToClipboard(draftExtraction);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const updateEntry = (entryId: string, updates: Partial<JournalEntry>) => {
    setDraftExtraction(current => ({
      ...current,
      entries: current.entries.map(entry =>
        entry.id === entryId ? { ...entry, ...updates } : entry
      ),
    }));
  };

  const addEntry = () => {
    setDraftExtraction(current => ({
      ...current,
      entries: [...current.entries, { id: createEntryId(), timestamp: '', text: '' }],
    }));
    setIsEditing(true);
  };

  const removeEntry = (entryId: string) => {
    setDraftExtraction(current => ({
      ...current,
      entries: current.entries.filter(entry => entry.id !== entryId),
    }));
  };

  const parsedTags = tags
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean);

  const handleSave = () => {
    onSave?.(draftExtraction, title.trim() || draftExtraction.date || 'Untitled page', parsedTags);
    setIsEditing(false);
  };

  return (
    <div className="results-container">
      <div className="results-header">
        <div>
          <span className="eyebrow">Review</span>
          {isEditing ? (
            <input
              className="title-input"
              value={title}
              onChange={event => setTitle(event.target.value)}
              aria-label="Page title"
            />
          ) : (
            <h3 className="results-title">{title}</h3>
          )}
          {draftExtraction.date && <p className="results-date">{draftExtraction.date}</p>}
        </div>
        <button onClick={() => setIsEditing(!isEditing)} className="btn btn-secondary">
          <EditIcon />
          {isEditing ? 'Preview' : 'Edit'}
        </button>
      </div>

      {isEditing && (
        <div className="metadata-editor">
          <label htmlFor="result-date">Date</label>
          <input
            id="result-date"
            className="input-field"
            value={draftExtraction.date}
            onChange={event =>
              setDraftExtraction(current => ({ ...current, date: event.target.value }))
            }
          />
          <label htmlFor="result-tags">Tags</label>
          <input
            id="result-tags"
            className="input-field"
            placeholder="work, meeting, draft"
            value={tags}
            onChange={event => setTags(event.target.value)}
          />
        </div>
      )}

      <div className="results-entries">
        {draftExtraction.entries.length > 0 ? (
          draftExtraction.entries.map(entry =>
            isEditing ? (
              <div key={entry.id} className="journal-entry-editor">
                <input
                  className="input-field timestamp-input"
                  value={entry.timestamp}
                  onChange={event => updateEntry(entry.id!, { timestamp: event.target.value })}
                  aria-label="Entry timestamp"
                  placeholder="10:04"
                />
                <textarea
                  className="input-field entry-textarea"
                  value={entry.text}
                  onChange={event => updateEntry(entry.id!, { text: event.target.value })}
                  aria-label="Entry text"
                  rows={3}
                />
                <button
                  onClick={() => removeEntry(entry.id!)}
                  className="icon-button remove-entry"
                  aria-label="Remove entry"
                >
                  <TrashIcon />
                </button>
              </div>
            ) : (
              <div key={entry.id} className="journal-entry">
                <div className="entry-timestamp">{entry.timestamp}</div>
                <div className="entry-divider"></div>
                <div className="entry-text">{entry.text}</div>
              </div>
            )
          )
        ) : (
          <p className="no-entries">No entries found. Please try another image.</p>
        )}
      </div>

      <div className="results-actions">
        {isEditing && (
          <button onClick={addEntry} className="btn btn-secondary">
            <PlusIcon />
            Add Entry
          </button>
        )}
        {onSave && (
          <button onClick={handleSave} className="btn btn-primary">
            <SaveIcon />
            {saveLabel}
          </button>
        )}
        <button
          onClick={handleCopy}
          className={`btn btn-primary ${copyFeedback ? 'copied' : ''}`}
        >
          {copyFeedback ? <CheckIcon /> : <CopyIcon />}
          {copyFeedback ? 'Copied' : 'Copy Results'}
        </button>
        <button onClick={onScanAnother} className="btn btn-secondary">
          <ScanIcon />
          Scan Another Page
        </button>
        <button onClick={onDone} className="btn btn-secondary">
          Done
        </button>
      </div>
    </div>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
      <path d="M17 21v-8H7v8" />
      <path d="M7 3v5h8" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6 18 20H6L5 6" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 8h11v11H8z" />
      <path d="M5 16H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m20 6-11 11-5-5" />
    </svg>
  );
}

function ScanIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3H5a2 2 0 0 0-2 2v2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <path d="M7 12h10" />
    </svg>
  );
}
