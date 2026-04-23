import React from 'react';

interface DashboardProps {
  onDigitizeClick: () => void;
  onSettingsClick: () => void;
}

export function Dashboard({ onDigitizeClick, onSettingsClick }: DashboardProps) {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Journal Digitizer</h1>
        <button className="settings-button" onClick={onSettingsClick} title="Settings">
          ⚙️
        </button>
      </header>

      <main className="dashboard-main">
        <button onClick={onDigitizeClick} className="btn btn-large btn-primary">
          Digitize Journal Page
        </button>
      </main>

      <footer className="dashboard-footer">
        <p>Capture your handwritten journal pages and extract text with OCR</p>
      </footer>
    </div>
  );
}
