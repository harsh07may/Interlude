import { useMemo, useState } from 'react';
import type { OCRExtraction, ScannedPage } from '../types';
import {
  copyPageToClipboard,
  downloadAllPagesAsJson,
  downloadPageAsText,
  formatPageAsMarkdown,
} from '../lib/utils';
import { ResultsDisplay } from './ResultsDisplay';
import {
  BookIcon,
  CopyIcon,
  DownloadIcon,
  PenIcon,
  ScanIcon,
  SearchIcon,
  SettingsIcon,
  TrashIcon,
} from './icons';

interface LibraryPageProps {
  pages: ScannedPage[];
  onBackHome: () => void;
  onDigitizeClick: () => void;
  onSettingsClick: () => void;
  onUpdatePage: (pageId: string, updates: Pick<ScannedPage, 'title' | 'tags' | 'extraction'>) => void;
  onDeletePage: (pageId: string) => void;
}

export function LibraryPage({
  pages,
  onBackHome,
  onDigitizeClick,
  onSettingsClick,
  onUpdatePage,
  onDeletePage,
}: LibraryPageProps) {
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [selectedPage, setSelectedPage] = useState<ScannedPage | null>(null);

  const tags = useMemo(
    () => Array.from(new Set(pages.flatMap(page => page.tags))).sort(),
    [pages]
  );

  const filteredPages = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return pages.filter(page => {
      const matchesTag = !activeTag || page.tags.includes(activeTag);
      const haystack = formatPageAsMarkdown(page).toLowerCase();
      return matchesTag && (!needle || haystack.includes(needle));
    });
  }, [activeTag, pages, query]);

  const totalEntries = pages.reduce((count, page) => count + page.extraction.entries.length, 0);

  const handleUpdateSelected = (extraction: OCRExtraction, title: string, tags: string[]) => {
    if (!selectedPage) return;
    onUpdatePage(selectedPage.id, { extraction, title, tags });
    // Update local state immediately so the modal reflects the change
    // without waiting for the parent re-render from the store update.
    setSelectedPage({ ...selectedPage, extraction, title, tags, updatedAt: new Date().toISOString() });
  };

  return (
    <div className="dashboard library-page">
      <header className="dashboard-header">
        <button className="brand-button" onClick={onBackHome}>
          <span className="brand-mark" aria-hidden="true">
            <PenIcon />
          </span>
          <span className="brand-copy">
            <span className="eyebrow">Interlude</span>
            <span className="brand-title">Journal Digitizer</span>
          </span>
        </button>
        <div className="header-actions">
          <button className="icon-button" onClick={onDigitizeClick} title="New Scan" aria-label="Start a new scan">
            <ScanIcon />
          </button>
          <button className="icon-button" onClick={onSettingsClick} title="Settings" aria-label="Open OCR settings">
            <SettingsIcon />
          </button>
        </div>
      </header>

      <main className="dashboard-main library-main">
        <div className="stats-grid" aria-label="Journal library statistics">
          <div>
            <strong>{pages.length}</strong>
            <span>Pages</span>
          </div>
          <div>
            <strong>{totalEntries}</strong>
            <span>Entries</span>
          </div>
          <div>
            <strong>{tags.length}</strong>
            <span>Tags</span>
          </div>
        </div>

        <section className="library-section" aria-labelledby="library-title">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Library</span>
              <h1 id="library-title">Scanned Pages</h1>
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => downloadAllPagesAsJson(pages)}
              disabled={pages.length === 0}
            >
              <DownloadIcon />
              Export JSON
            </button>
          </div>

          <div className="library-tools">
            <label className="search-field">
              <SearchIcon />
              <input
                type="search"
                placeholder="Search titles, tags, or entry text"
                value={query}
                onChange={event => setQuery(event.target.value)}
              />
            </label>
            <div className="tag-filters" aria-label="Filter by tag">
              <button
                className={!activeTag ? 'tag-chip active' : 'tag-chip'}
                onClick={() => setActiveTag('')}
              >
                All
              </button>
              {tags.map(tag => (
                <button
                  key={tag}
                  className={activeTag === tag ? 'tag-chip active' : 'tag-chip'}
                  onClick={() => setActiveTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {filteredPages.length > 0 ? (
            <div className="page-grid">
              {filteredPages.map(page => (
                <article className="page-card" key={page.id}>
                  <button className="page-card-main" onClick={() => setSelectedPage(page)}>
                    <span className="page-date">{page.extraction.date || 'No date'}</span>
                    <h2>{page.title}</h2>
                    <p>{page.extraction.entries[0]?.text || 'No entries on this page yet.'}</p>
                  </button>
                  <div className="page-meta">
                    <span>{page.extraction.entries.length} entries</span>
                    <span>{formatShortDate(page.updatedAt)}</span>
                  </div>
                  {page.tags.length > 0 && (
                    <div className="page-tags">
                      {page.tags.map(tag => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  )}
                  <div className="page-actions">
                    <button onClick={() => copyPageToClipboard(page)} className="icon-button" aria-label="Copy page">
                      <CopyIcon />
                    </button>
                    <button onClick={() => downloadPageAsText(page)} className="icon-button" aria-label="Export page">
                      <DownloadIcon />
                    </button>
                    <button
                      onClick={() => onDeletePage(page.id)}
                      className="icon-button danger-button"
                      aria-label="Delete page"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-library">
              <BookIcon />
              <h2>{pages.length ? 'No matching pages' : 'No scans saved yet'}</h2>
              <p>{pages.length ? 'Try another search or tag filter.' : 'Digitize a page and save it to build your archive.'}</p>
              <button onClick={onDigitizeClick} className="btn btn-primary">
                <ScanIcon />
                Digitize Page
              </button>
            </div>
          )}
        </section>
      </main>

      {selectedPage && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="page-detail-title"
          onClick={() => setSelectedPage(null)}
        >
          <div className="modal-content page-detail-modal" onClick={event => event.stopPropagation()}>
            <ResultsDisplay
              extraction={selectedPage.extraction}
              initialTitle={selectedPage.title}
              initialTags={selectedPage.tags}
              saveLabel="Update Page"
              onSave={handleUpdateSelected}
              onScanAnother={() => {
                setSelectedPage(null);
                onDigitizeClick();
              }}
              onDone={() => setSelectedPage(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(value));
}
