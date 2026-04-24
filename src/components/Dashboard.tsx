import { BookIcon, PenIcon, ScanIcon, SettingsIcon } from './icons';

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
            <span className="eyebrow">Your handwriting, finally searchable</span>
            <h2 id="hero-title">Ink it,<br />sync it !</h2>
            <p>
              Your handwriting deserves a search bar. Snap a page, get clean text back.
            </p>
            <div className="hero-actions">
              <button onClick={onDigitizeClick} className="btn btn-large btn-primary">
                <ScanIcon />
                Digitize Page
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
