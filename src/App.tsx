import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOCRConfig } from './hooks/useOCRConfig';
import { useScannedPages } from './hooks/useScannedPages';
import { Dashboard } from './components/Dashboard';
import { DigitizeModal } from './components/DigitizeModal';
import { LibraryPage } from './components/LibraryPage';
import { SettingsModal } from './components/SettingsModal';
import type { OCRConfig, OCRExtraction } from './types';
import { ROUTE_HOME, ROUTE_LIBRARY } from './constants';
import './App.css';

function App() {
  const ocrConfig = useOCRConfig();
  const scannedPages = useScannedPages();
  const [showDigitizeModal, setShowDigitizeModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleSettingsSave = (newConfig: OCRConfig) => {
    ocrConfig.setConfig(newConfig);
    setShowSettingsModal(false);
  };

  const handleSaveScan = (extraction: OCRExtraction, title: string, tags: string[]) => {
    scannedPages.addPage(extraction, title, tags);
    setShowDigitizeModal(false);
    navigate(ROUTE_LIBRARY);
  };

  return (
    <div className="app">
      {pathname === ROUTE_LIBRARY ? (
        <LibraryPage
          pages={scannedPages.pages}
          onBackHome={() => navigate(ROUTE_HOME)}
          onDigitizeClick={() => setShowDigitizeModal(true)}
          onSettingsClick={() => setShowSettingsModal(true)}
          onUpdatePage={scannedPages.updatePage}
          onDeletePage={scannedPages.deletePage}
        />
      ) : (
        <Dashboard
          onDigitizeClick={() => setShowDigitizeModal(true)}
          onLibraryClick={() => navigate(ROUTE_LIBRARY)}
          onSettingsClick={() => setShowSettingsModal(true)}
        />
      )}

      <DigitizeModal
        isOpen={showDigitizeModal}
        ocrConfig={ocrConfig.config}
        onSaveScan={handleSaveScan}
        onClose={() => setShowDigitizeModal(false)}
      />

      {showSettingsModal && (
        <SettingsModal
          config={ocrConfig.config}
          onSave={handleSettingsSave}
          onCancel={() => setShowSettingsModal(false)}
        />
      )}
    </div>
  );
}

export default App;
