
interface DashboardProps {
  onDigitizeClick: () => void;
  onLibraryClick: () => void;
  onSettingsClick: () => void;
}

export function Dashboard({
  onDigitizeClick,
  onLibraryClick,
  onSettingsClick,
}: DashboardProps) {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="brand-mark" aria-hidden="true">
          <PenIcon />
        </div>
        <div className="brand-copy">
          <span className="eyebrow">Interlude</span>
          <h1>Journal Digitizer</h1>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={onLibraryClick}>
            <BookIcon />
            Library
          </button>
          <button className="icon-button" onClick={onSettingsClick} title="Settings" aria-label="Open OCR settings">
            <SettingsIcon />
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="hero-panel" aria-labelledby="hero-title">
          <div className="hero-copy">
            <span className="eyebrow">Handwriting to structured entries</span>
            <h2 id="hero-title">Turn today’s journal page into clean, copyable text.</h2>
            <p>
              Capture a page, extract the date and timestamps, then keep the entries moving with a tidy review screen.
            </p>
            <div className="hero-actions">
              <button onClick={onDigitizeClick} className="btn btn-large btn-primary">
                <ScanIcon />
                Digitize Page
              </button>
              <button onClick={onSettingsClick} className="btn btn-large btn-secondary">
                <SettingsIcon />
                OCR Settings
              </button>
              <button onClick={onLibraryClick} className="btn btn-large btn-secondary">
                <BookIcon />
                View Library
              </button>
            </div>
          </div>

          <div className="journal-preview" aria-hidden="true">
            <div className="preview-date">9TH JUNE '26, MONDAY</div>
            <div className="preview-entry">
              <span>10:04</span>
              <p>Going to finish the first draft of the mindful productivity article.</p>
            </div>
            <div className="preview-entry">
              <span>10:46</span>
              <p>I fell into a Twitter blackhole again. Back to work.</p>
            </div>
            <div className="preview-entry">
              <span>11:49</span>
              <p>Reviewed agenda and docs. Need to call Anna after the meeting.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="dashboard-footer">
        <span>Gemini OCR</span>
        <span>Local settings</span>
        <span>JPG, PNG, PDF</span>
      </footer>
    </div>
  );
}

function PenIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
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

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.05.05a2 2 0 1 1-2.83 2.83l-.05-.05a1.8 1.8 0 0 0-1.98-.36 1.8 1.8 0 0 0-1.1 1.65V21a2 2 0 1 1-4 0v-.08A1.8 1.8 0 0 0 8.75 19.3a1.8 1.8 0 0 0-1.98.36l-.05.05a2 2 0 1 1-2.83-2.83l.05-.05A1.8 1.8 0 0 0 4.3 14.85a1.8 1.8 0 0 0-1.65-1.1H2.6a2 2 0 1 1 0-4h.08A1.8 1.8 0 0 0 4.3 8.65a1.8 1.8 0 0 0-.36-1.98l-.05-.05a2 2 0 1 1 2.83-2.83l.05.05a1.8 1.8 0 0 0 1.98.36A1.8 1.8 0 0 0 9.85 2.6V2.5a2 2 0 1 1 4 0v.08a1.8 1.8 0 0 0 1.1 1.65 1.8 1.8 0 0 0 1.98-.36l.05-.05a2 2 0 1 1 2.83 2.83l-.05.05a1.8 1.8 0 0 0-.36 1.98 1.8 1.8 0 0 0 1.65 1.1h.08a2 2 0 1 1 0 4h-.08A1.8 1.8 0 0 0 19.4 15Z" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5Z" />
    </svg>
  );
}
