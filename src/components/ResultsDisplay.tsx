import { useState } from 'react';
import type { JournalEntry, OCRExtraction } from '../types';
import { copyExtractionToClipboard } from '../lib/utils';
import { createId } from '../lib/utils';
import { COPY_FEEDBACK_MS, DEFAULT_PAGE_TITLE } from '../constants';
import {
  CheckIcon,
  CloseIcon,
  CopyIcon,
  EditIcon,
  PlusIcon,
  SaveIcon,
  ScanIcon,
  TrashIcon,
} from './icons';

interface ResultsDisplayProps {
  extraction: OCRExtraction;
  initialTitle?: string;
  initialTags?: string[];
  saveLabel?: string;
  onScanAnother: () => void;
  onDone: () => void;
  onSave?: (extraction: OCRExtraction, title: string, tags: string[]) => void;
}

function withEntryIds(extraction: OCRExtraction): OCRExtraction {
  return {
    ...extraction,
    entries: extraction.entries.map(entry => ({ ...entry, id: entry.id ?? createId() })),
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
  const [title, setTitle] = useState(initialTitle ?? extraction.date ?? DEFAULT_PAGE_TITLE);
  const [tags, setTags] = useState(initialTags.join(', '));

  const handleCopy = async () => {
    try {
      await copyExtractionToClipboard(draftExtraction);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), COPY_FEEDBACK_MS);
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
      entries: [...current.entries, { id: createId(), timestamp: '', text: '' }],
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
    onSave?.(draftExtraction, title.trim() || draftExtraction.date || DEFAULT_PAGE_TITLE, parsedTags);
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
        <div className="results-header-actions">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="icon-button"
            title={isEditing ? 'Preview' : 'Edit'}
            aria-label={isEditing ? 'Preview entries' : 'Edit entries'}
          >
            <EditIcon />
          </button>
          <button onClick={onDone} className="icon-button" aria-label="Close">
            <CloseIcon />
          </button>
        </div>
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

      {isEditing && (
        <button onClick={addEntry} className="btn btn-secondary add-entry-btn">
          <PlusIcon />
          Add Entry
        </button>
      )}

      <div className="results-actions">
        <div className="results-main-actions">
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
        </div>
        <button onClick={onScanAnother} className="btn btn-secondary">
          <ScanIcon />
          Scan Another Page
        </button>
      </div>
    </div>
  );
}
